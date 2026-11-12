// Migración del 10/11/2026 (16:15): la entrega en papel se consulta a Natalia
// junto con el rubro de Colab; Investigación no atiende sábados ni domingos.
import { SEED_V5 } from "./seed-2026-11-10c.mjs";
import { SEED_V6 as SEED_TASKS } from "./seed-2026-11-10d.mjs";
import { migrateBetween } from "./apply.mjs";

export const id = "2026-11-10-papel";

const IDS = ["t16", "t17"];
const only = (list) => list.filter((t) => IDS.includes(t.id));

export const migrateTask = (raw, now) => migrateBetween(raw, only(SEED_V5), only(SEED_TASKS), now);
