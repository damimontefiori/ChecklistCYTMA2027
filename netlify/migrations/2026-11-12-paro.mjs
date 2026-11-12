// Migración del 12/11/2026: paro no docente, Natalia no atendió. La llamada pasa
// al viernes 13/11 y suma preguntar por la revisión del SPI; se corren las
// fechas de lo que depende de su respuesta y se anota lo que averiguó Claudio
// sobre la entrega en papel.
import { SEED_V6 } from "./seed-2026-11-10d.mjs";
import { SEED_TASKS } from "../../public/js/config.js";
import { migrateBetween } from "./apply.mjs";

export const id = "2026-11-12-paro";

const IDS = ["t12", "t14", "t15", "t16", "t17"];
const only = (list) => list.filter((t) => IDS.includes(t.id));

export const migrateTask = (raw, now) => migrateBetween(raw, only(SEED_V6), only(SEED_TASKS), now);
