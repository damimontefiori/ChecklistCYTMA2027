// Migración del 10/11/2026 (15:50): vinculación y asignación de roles y horas
// hechas el 9/11, y lista de lo que falta para completar SIGEVA.
import { SEED_V4 } from "./seed-2026-11-10b.mjs";
import { SEED_V5 as SEED_TASKS } from "./seed-2026-11-10c.mjs";
import { migrateBetween } from "./apply.mjs";

export const id = "2026-11-10-sigeva";

const IDS = ["t07", "t11", "t14"];
const only = (list) => list.filter((t) => IDS.includes(t.id));

export const migrateTask = (raw, now) => migrateBetween(raw, only(SEED_V4), only(SEED_TASKS), now);
