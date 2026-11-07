// Lógica compartida entre el navegador y la función de Netlify:
// normaliza tareas y aplica operaciones (crear, actualizar, borrar).
import { PEOPLE, STATUSES, SEED_TASKS } from "./config.js";

const PEOPLE_IDS = PEOPLE.map((p) => p.id);
const STATUS_IDS = STATUSES.map((s) => s.id);
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const ID_RE = /^[A-Za-z0-9_-]{1,40}$/;

export const LIMITS = { title: 200, detail: 1200, tasks: 200 };

export class OpError extends Error {
  constructor(message, status = 400) {
    super(message);
    this.status = status;
  }
}

function cleanTitle(v) {
  return typeof v === "string" ? v.replace(/\s+/g, " ").trim().slice(0, LIMITS.title) : "";
}

function cleanDetail(v) {
  return typeof v === "string" ? v.replace(/\r\n?/g, "\n").trim().slice(0, LIMITS.detail) : "";
}

function cleanDate(v) {
  if (typeof v !== "string" || !DATE_RE.test(v)) return null;
  const [y, m, d] = v.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  return dt.getUTCFullYear() === y && dt.getUTCMonth() === m - 1 && dt.getUTCDate() === d ? v : null;
}

function cleanOwners(v) {
  const set = new Set(Array.isArray(v) ? v : []);
  return PEOPLE_IDS.filter((id) => set.has(id));
}

export function cleanPerson(v) {
  return PEOPLE_IDS.includes(v) ? v : null;
}

export function newId() {
  return "t" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

export function normalizeTask(t) {
  const start = cleanDate(t.start);
  let end = start ? cleanDate(t.end) : null;
  if (end && end <= start) end = null;
  return {
    id: typeof t.id === "string" && ID_RE.test(t.id) ? t.id : newId(),
    title: cleanTitle(t.title) || "Tarea sin título",
    detail: cleanDetail(t.detail),
    owners: cleanOwners(t.owners),
    start,
    end,
    director: Boolean(t.director),
    status: STATUS_IDS.includes(t.status) ? t.status : "pendiente",
    order: Number.isFinite(t.order) ? t.order : 0,
    updatedAt: typeof t.updatedAt === "string" ? t.updatedAt : null,
    updatedBy: cleanPerson(t.updatedBy),
  };
}

export function initialState() {
  return {
    rev: 0,
    updatedAt: null,
    tasks: SEED_TASKS.map((t, i) => normalizeTask({ ...t, order: i })),
  };
}

export function sortTasks(tasks) {
  return [...tasks].sort((a, b) => {
    if (a.start !== b.start) {
      if (!a.start) return 1;
      if (!b.start) return -1;
      return a.start < b.start ? -1 : 1;
    }
    if ((a.end || "") !== (b.end || "")) return (a.end || "") < (b.end || "") ? -1 : 1;
    return a.order - b.order;
  });
}

const EDITABLE = ["title", "detail", "owners", "start", "end", "director", "status"];

// Devuelve un estado nuevo; no modifica el recibido.
export function applyOp(state, op, { now = new Date().toISOString() } = {}) {
  if (!op || typeof op !== "object") throw new OpError("Operación inválida");
  const by = cleanPerson(op.by);
  const tasks = Array.isArray(state?.tasks) ? state.tasks : [];
  let next;

  if (op.type === "update") {
    const current = tasks.find((t) => t.id === op.id);
    if (!current) throw new OpError("La tarea ya no existe. Se actualizó la lista.", 404);
    const patch = op.patch && typeof op.patch === "object" ? op.patch : {};
    const merged = { ...current };
    for (const key of EDITABLE) if (key in patch) merged[key] = patch[key];
    if ("title" in patch && !cleanTitle(patch.title)) throw new OpError("La tarea necesita un nombre.");
    if ("status" in patch && !STATUS_IDS.includes(patch.status)) throw new OpError("Estado desconocido.");
    const updated = normalizeTask({ ...merged, id: current.id, updatedAt: now, updatedBy: by });
    next = tasks.map((t) => (t.id === current.id ? updated : t));
  } else if (op.type === "create") {
    const input = op.task && typeof op.task === "object" ? op.task : {};
    if (!cleanTitle(input.title)) throw new OpError("La tarea necesita un nombre.");
    if (tasks.length >= LIMITS.tasks) throw new OpError("Se alcanzó el máximo de tareas.");
    const maxOrder = tasks.reduce((m, t) => Math.max(m, t.order || 0), 0);
    const id = typeof input.id === "string" && ID_RE.test(input.id) && !tasks.some((t) => t.id === input.id)
      ? input.id
      : newId();
    const created = normalizeTask({
      ...input,
      id,
      order: Number.isFinite(input.order) ? input.order : maxOrder + 1,
      updatedAt: now,
      updatedBy: by,
    });
    next = [...tasks, created];
  } else if (op.type === "delete") {
    next = tasks.filter((t) => t.id !== op.id);
  } else {
    throw new OpError("Operación desconocida");
  }

  return { rev: (state?.rev || 0) + 1, updatedAt: now, tasks: next };
}
