// Lógica común de las migraciones: lleva una tarea guardada desde una versión
// de la lista (original) a otra (target) sin pisar lo que el equipo editó.
// - Un campo se actualiza solo si todavía tiene el valor de la versión original.
// - El estado solo avanza (Pendiente → En curso → Hecha).
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
export function migrateBetween(raw, originalList, targetList, now, { replaceJorge = false } = {}) {
  const original = originalList.find((t) => t.id === raw.id);
  const target = targetList.find((t) => t.id === raw.id);
  const task = { ...raw };
  let changed = false;

  if (replaceJorge && value(raw, "owners").includes("jorge")) {
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
    if (target.status && RANK[target.status] > (RANK[raw.status] ?? 0)) {
      task.status = target.status;
      changed = true;
    }
  }

  if (!changed) return null;
  task.updatedAt = now;
  task.updatedBy = "damian";
  return task;
}
