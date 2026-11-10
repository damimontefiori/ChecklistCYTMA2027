// Migración del 9/11/2026: cambio de roles (Pablo director, Damián codirector,
// Jorge fuera del equipo) y avance conocido a esa fecha. Donde figuraba Jorge
// como responsable pasa a figurar Pablo.
import { SEED_V1 } from "./seed-2026-11-06.mjs";
import { SEED_V2 } from "./seed-2026-11-09.mjs";
import { migrateBetween } from "./apply.mjs";

export const id = "2026-11-09-roles";

export const migrateTask = (raw, now) => migrateBetween(raw, SEED_V1, SEED_V2, now, { replaceJorge: true });
