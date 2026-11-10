// Migración del 10/11/2026: FPI-002 v5 y nota de compromiso subidos al SPI
// por Pablo, horas definidas (4, 4 y 6), fechas reacomodadas para lo que falta
// en SIGEVA y nueva tarea para confirmar el rubro de Colab.
import { SEED_V2 } from "./seed-2026-11-09.mjs";
import { SEED_V3 as SEED_TASKS } from "./seed-2026-11-10.mjs";
import { migrateBetween } from "./apply.mjs";

export const id = "2026-11-10-avance";

export const migrateTask = (raw, now) => migrateBetween(raw, SEED_V2, SEED_TASKS, now);

// Tareas nuevas que se crean si todavía no existen.
export const newTasks = SEED_TASKS.filter((t) => t.id === "t17").map((t, i) => ({ ...t, order: 16 + i }));
