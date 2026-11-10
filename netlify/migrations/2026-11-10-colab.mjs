// Migración del 10/11/2026 (tarde): la consulta del rubro de Colab pasa a
// miércoles 11 o jueves 12/11, porque el miércoles es feriado en PBA.
import { SEED_V3 } from "./seed-2026-11-10.mjs";
import { SEED_V4 as SEED_TASKS } from "./seed-2026-11-10b.mjs";
import { migrateBetween } from "./apply.mjs";

export const id = "2026-11-10-colab";

const only = (list) => list.filter((t) => t.id === "t17");

export const migrateTask = (raw, now) => migrateBetween(raw, only(SEED_V3), only(SEED_TASKS), now);
