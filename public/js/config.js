// Configuración del tablero. Es el único archivo que hace falta tocar para
// cambiar textos, personas o las tareas iniciales.
// Lo usan el navegador y la función de Netlify (que lo importa al desplegar).

export const PROJECT = {
  title: "Proyecto LLM on premise",
  subtitle: "Presentación CYTMA 2027 A",
  deadline: "2026-11-15",            // cierre de SIGEVA (inclusive)
  deadlineName: "el cierre de SIGEVA",
  deadlineNote: "Sin prórroga.",
  timeZone: "America/Argentina/Buenos_Aires",
  notice:
    "Jorge está de viaje. Los pasos marcados con ✱ son de SIGEVA y se hacen online: " +
    "se le pide hacerlos a distancia. Si no puede, se resuelve con Natalia el martes 10/11. " +
    "Su firma en la nota de compromiso la coordina Damián aparte.",
};

export const PEOPLE = [
  { id: "jorge",   name: "Jorge",   role: "Director" },
  { id: "pablo",   name: "Pablo",   role: "Codirector" },
  { id: "claudio", name: "Claudio", role: "Investigador" },
  { id: "damian",  name: "Damián",  role: "Investigador" },
];

export const HOLIDAYS = {
  "2026-11-09": "Feriado",
};

export const STATUSES = [
  { id: "pendiente", label: "Pendiente" },
  { id: "en_curso",  label: "En curso" },
  { id: "hecha",     label: "Hecha" },
];

const ALL = ["jorge", "pablo", "claudio", "damian"];

// start/end: "AAAA-MM-DD". end solo para tareas que abarcan varios días.
// start null = sin fecha fija (después del envío).
// director: true = paso del director en SIGEVA (✱).
export const SEED_TASKS = [
  {
    id: "t01", start: "2026-11-06",
    title: "Responder el mail de Natalia",
    detail: "Con copia al equipo y a Jorge: equipo, convocatoria, carga en el SPI el martes y pedido de soporte.",
    owners: ["damian"],
  },
  {
    id: "t02", start: "2026-11-07",
    title: "Confirmar que nadie participa ya en dos proyectos",
    detail: "Es el máximo permitido. Confirmarlo por el grupo.",
    owners: ALL,
  },
  {
    id: "t03", start: "2026-11-08",
    title: "Actualizar el CV en SIGEVA UNLaM y adjuntar el archivo del CV",
    detail: "En unlam.sigeva.gob.ar. No se actualiza solo; si no tenés usuario, hay que crearlo.",
    owners: ALL,
  },
  {
    id: "t04", start: "2026-11-08",
    title: "Pasar las horas semanales de dedicación",
    detail: "Cada uno le pasa a Damián cuántas horas semanales le va a dedicar al proyecto.",
    owners: ALL,
  },
  {
    id: "t05", start: "2026-11-08", director: true,
    title: "Registrar el proyecto en SIGEVA y compartir el código del trámite",
    detail: "Si Jorge no puede, pasa al martes 10/11.",
    owners: ["jorge"],
  },
  {
    id: "t06", start: "2026-11-08",
    title: "Borrador del presupuesto y de los textos de la carátula",
    detail: "",
    owners: ["damian"],
  },
  {
    id: "t07", start: "2026-11-09",
    title: "Vincularse al proyecto con el código del trámite",
    detail: "Apenas esté el código: rol \"Usuario banco de datos de actividades CyT\" > Trámite > Participación en una convocatoria.",
    owners: ["pablo", "claudio", "damian"],
  },
  {
    id: "t08", start: "2026-11-09",
    title: "Revisar el FPI-002",
    detail: "Damián lo manda al mediodía para revisar; a la noche queda cerrado. Revisamos todos.",
    owners: ALL,
  },
  {
    id: "t09", start: "2026-11-10", director: true,
    title: "Subir el FPI-002 y la documentación al SPI",
    detail: "A primera hora, si Natalia ya creó el usuario. Lo sube Jorge o Damián, según indique Natalia.",
    owners: ["jorge", "damian"],
  },
  {
    id: "t10", start: "2026-11-10",
    title: "Llamar a Natalia",
    detail: "Confirmar que llegan a revisar, cómo se resuelven los pasos del director y en qué rubro va Colab.",
    owners: ["damian"],
  },
  {
    id: "t11", start: "2026-11-10", director: true,
    title: "Asignar roles y horas en SIGEVA",
    detail: "",
    owners: ["jorge"],
  },
  {
    id: "t12", start: "2026-11-10", end: "2026-11-13",
    title: "Resolver las correcciones de la Secretaría en menos de 24 h",
    detail: "Damián las resuelve consultando con el equipo.",
    owners: ["damian"],
  },
  {
    id: "t13", start: "2026-11-12",
    title: "Nota de compromiso firmada a mano por los cuatro y escaneada",
    detail: "Coordina Damián.",
    owners: ALL,
  },
  {
    id: "t14", start: "2026-11-12", director: true,
    title: "Completar SIGEVA",
    detail: "Carátula, institución (UNLaM al 100 %), presupuesto y adjuntos. Jorge, con el apoyo de Damián.",
    owners: ["jorge", "damian"],
  },
  {
    id: "t15", start: "2026-11-13", director: true,
    title: "Enviar la presentación en SIGEVA",
    detail: "Solo con el OK de la Secretaría. Mejor no dejarlo para el fin de semana.",
    owners: ["jorge"],
  },
  {
    id: "t16", start: null, director: true,
    title: "Entregar en la Secretaría el PDF impreso y la nota de compromiso",
    detail: "Ambos con firmas originales. Los entrega Jorge o Damián.",
    owners: ["jorge", "damian"],
  },
];
