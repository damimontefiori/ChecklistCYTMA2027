// Migración única del 9/11/2026: cambio de roles (Pablo director, Damián
// codirector, Jorge fuera del equipo) y estado de avance conocido a esa fecha.
//
// Reglas, para no pisar lo que el equipo ya cambió desde la app:
// - Un campo (título, detalle, responsables, fechas, ✱) se actualiza solo si
//   todavía tiene el valor original del 6/11.
// - El estado solo avanza (Pendiente → En curso → Hecha), nunca retrocede.
// - Donde figuraba Jorge como responsable pasa a figurar Pablo.
// - No se recrean tareas que el equipo haya borrado.
import { SEED_V1 } from "./seed-2026-11-06.mjs";
import { SEED_TASKS } from "../../public/js/config.js";

export const id = "2026-11-09-roles";

const FIELDS = ["title", "detail", "owners", "start", "end", "director"];
const RANK = { pendiente: 0, en_curso: 1, hecha: 2 };

function value(task, field) {
  if (field === "end") return task.end ?? null;
  if (field === "start") return task.start ?? null;
  if (field === "director") return Boolean(task.director);
  if (field === "detail") return task.detail ?? "";
  if (field === "owners") return Array.isArray(task.owners) ? task.owners : [];
  return task[field];
}

function same(a, b) {
  if (Array.isArray(a) || Array.isArray(b)) {
    return JSON.stringify([...(a || [])].sort()) === JSON.stringify([...(b || [])].sort());
  }
  return a === b;
}

// Devuelve la tarea modificada, o null si no hay nada que cambiar.
export function migrateTask(raw, now) {
  const original = SEED_V1.find((t) => t.id === raw.id);
  const target = SEED_TASKS.find((t) => t.id === raw.id);
  const task = { ...raw };
  let changed = false;

  if (value(raw, "owners").includes("jorge")) {
    task.owners = [...new Set(value(raw, "owners").map((o) => (o === "jorge" ? "pablo" : o)))];
    changed = true;
  }

  if (original && target) {
    for (const field of FIELDS) {
      const untouched = same(value(raw, field), value(original, field));
      if (untouched && !same(value(task, field), value(target, field))) {
        task[field] = value(target, field);
        changed = true;
      }
    }
    const current = RANK[raw.status] ?? 0;
    if (target.status && RANK[target.status] > current) {
      task.status = target.status;
      changed = true;
    }
  }

  if (!changed) return null;
  task.updatedAt = now;
  task.updatedBy = "damian";
  return task;
}
