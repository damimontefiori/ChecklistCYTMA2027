// API del tablero: GET devuelve las tareas, POST aplica una operación.
// Guarda en Netlify Blobs (sin configuración ni claves), una entrada por tarea:
// dos personas que actualizan tareas distintas al mismo tiempo no se pisan.
import { getStore } from "@netlify/blobs";
import { applyOp, initialState, normalizeTask, sortTasks, OpError } from "../../public/js/core.js";
import * as rolesNov9 from "../migrations/2026-11-09-roles.mjs";
import * as avanceNov10 from "../migrations/2026-11-10-avance.mjs";
import * as colabNov10 from "../migrations/2026-11-10-colab.mjs";
import * as sigevaNov10 from "../migrations/2026-11-10-sigeva.mjs";

const STORE = "tablero-cytma-2027";
const PREFIX = "task/";
const META = "meta";
const MAX_BODY = 20_000;

// Cambios a tareas ya guardadas. Cada una corre una sola vez y queda marcada.
const MIGRATIONS = [rolesNov9, avanceNov10, colabNov10, sigevaNov10];

const json = (data, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
    },
  });

function signature(tasks) {
  const s = JSON.stringify(tasks);
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0;
  return (h >>> 0).toString(36);
}

function toState(tasks) {
  const sorted = sortTasks(tasks);
  const updatedAt = sorted.reduce((m, t) => (t.updatedAt && t.updatedAt > m ? t.updatedAt : m), "") || null;
  return { rev: signature(sorted), updatedAt, tasks: sorted };
}

async function seedIfNeeded(store) {
  const meta = await store.get(META, { type: "json" });
  if (meta) return;
  // Primera vez: se cargan las tareas del plan.
  const seed = initialState().tasks;
  await Promise.all(seed.map((t) => store.setJSON(PREFIX + t.id, t, { onlyIfNew: true })));
  await store.setJSON(META, { seededAt: new Date().toISOString() });
}

async function migrateIfNeeded(store) {
  for (const migration of MIGRATIONS) {
    const marker = `migration/${migration.id}`;
    if (await store.get(marker, { type: "json" })) continue;
    const now = new Date().toISOString();
    const { blobs } = await store.list({ prefix: PREFIX });
    let changed = 0;
    await Promise.all(blobs.map(async (b) => {
      const raw = await store.get(b.key, { type: "json" });
      if (!raw || typeof raw.id !== "string") return;
      const next = migration.migrateTask(raw, now);
      if (next) {
        await store.setJSON(b.key, normalizeTask(next));
        changed++;
      }
    }));
    for (const t of migration.newTasks || []) {
      const task = normalizeTask({ ...t, updatedAt: now, updatedBy: "damian" });
      await store.setJSON(PREFIX + task.id, task, { onlyIfNew: true });
    }
    await store.setJSON(marker, { appliedAt: now, changed });
  }
}

async function loadTasks(store) {
  await seedIfNeeded(store);
  await migrateIfNeeded(store);
  const { blobs } = await store.list({ prefix: PREFIX });
  const tasks = await Promise.all(blobs.map((b) => store.get(b.key, { type: "json" })));
  return tasks.filter((t) => t && typeof t.id === "string").map(normalizeTask);
}

export default async (req) => {
  const store = getStore({ name: STORE, consistency: "strong" });

  if (req.method === "GET") {
    return json(toState(await loadTasks(store)));
  }

  if (req.method !== "POST") return json({ error: "Método no permitido." }, 405);

  const raw = await req.text();
  if (raw.length > MAX_BODY) return json({ error: "La solicitud es demasiado grande." }, 413);
  let op;
  try {
    op = JSON.parse(raw);
  } catch {
    return json({ error: "La solicitud no es JSON válido." }, 400);
  }

  if ((op?.type === "update" || op?.type === "delete") && !/^[A-Za-z0-9_-]{1,40}$/.test(op.id || "")) {
    return json({ error: "Identificador de tarea inválido." }, 400);
  }

  let tasks = await loadTasks(store);
  const now = new Date().toISOString();

  try {
    if (op.type === "update") {
      const fresh = await store.get(PREFIX + op.id, { type: "json" });
      const current = fresh ? [fresh] : [];
      const updated = applyOp({ tasks: current }, op, { now }).tasks[0];
      await store.setJSON(PREFIX + updated.id, updated);
      tasks = tasks.filter((t) => t.id !== updated.id).concat(updated);
    } else if (op.type === "create") {
      const next = applyOp({ tasks }, op, { now }).tasks;
      const created = next[next.length - 1];
      await store.setJSON(PREFIX + created.id, created);
      tasks = tasks.filter((t) => t.id !== created.id).concat(created);
    } else if (op.type === "delete") {
      if (typeof op.id === "string") await store.delete(PREFIX + op.id);
      tasks = tasks.filter((t) => t.id !== op.id);
    } else {
      throw new OpError("Operación desconocida");
    }
  } catch (err) {
    if (err instanceof OpError) return json({ error: err.message, state: toState(tasks) }, err.status);
    throw err;
  }

  return json(toState(tasks));
};

export const config = { path: "/api/tasks" };
