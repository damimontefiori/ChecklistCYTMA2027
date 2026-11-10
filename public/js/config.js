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
    "Cambio de roles (8/11): Pablo es el director y Damián el codirector. " +
    "Los pasos marcados con ✱ los hace Pablo en SIGEVA con su usuario.",
};

export const PEOPLE = [
  { id: "pablo",   name: "Pablo",   role: "Director" },
  { id: "damian",  name: "Damián",  role: "Codirector" },
  { id: "claudio", name: "Claudio", role: "Investigador" },
];

export const HOLIDAYS = {
  "2026-11-09": "Feriado",
};

export const STATUSES = [
  { id: "pendiente", label: "Pendiente" },
  { id: "en_curso",  label: "En curso" },
  { id: "hecha",     label: "Hecha" },
];

const ALL = ["pablo", "damian", "claudio"];

// start/end: "AAAA-MM-DD". end solo para tareas que abarcan varios días.
// start null = sin fecha fija (después del envío).
// director: true = paso del director en SIGEVA (✱).
// Estas tareas se cargan solo la primera vez. Si la app ya estaba desplegada,
// los cambios a las tareas existentes van como migración en netlify/migrations/.
export const SEED_TASKS = [
  {
    id: "t01", start: "2026-11-06", status: "hecha",
    title: "Responder el mail de Natalia",
    detail: "Con copia al equipo y a Jorge: equipo, convocatoria, carga en el SPI el martes y pedido de soporte.",
    owners: ["damian"],
  },
  {
    id: "t02", start: "2026-11-07", status: "hecha",
    title: "Confirmar que nadie participa ya en dos proyectos",
    detail: "Es el máximo permitido. Confirmado por el grupo el 7/11.",
    owners: ALL,
  },
  {
    id: "t03", start: "2026-11-08", status: "en_curso",
    title: "Actualizar el CV en SIGEVA UNLaM y adjuntar el archivo del CV",
    detail: "En unlam.sigeva.gob.ar. No se actualiza solo; si no tenés usuario, hay que crearlo.",
    owners: ALL,
  },
  {
    id: "t04", start: "2026-11-08", status: "en_curso",
    title: "Pasar las horas semanales de dedicación",
    detail: "Propuesta: Pablo 4, Damián 10 y Claudio 10. Falta que cada uno la confirme.",
    owners: ALL,
  },
  {
    id: "t05", start: "2026-11-08", director: true, status: "hecha",
    title: "Registrar el proyecto en SIGEVA",
    detail: "Pablo lo registró con su usuario el 8/11 y empezó a cargar la carátula.",
    owners: ["pablo"],
  },
  {
    id: "t06", start: "2026-11-08", status: "hecha",
    title: "Borrador del presupuesto y de los textos de la carátula",
    detail: "Textos de la carátula listos, con el resumen en inglés. Presupuesto estimado en el FPI-002.",
    owners: ["damian"],
  },
  {
    id: "t07", start: "2026-11-09",
    title: "Compartir el código del trámite y vincularse al proyecto",
    detail: "Pablo pasa el código. Damián y Claudio se vinculan: rol \"Usuario banco de datos de actividades CyT\" > Trámite > Participación en una convocatoria.",
    owners: ALL,
  },
  {
    id: "t08", start: "2026-11-09", status: "en_curso",
    title: "Actualizar y revisar el FPI-002",
    detail: "Borrador v2 listo. Falta poner a Pablo como director y a Damián como codirector, sacar a Jorge de la tabla de horas y de la nota de compromiso, y que el equipo lo revise.",
    owners: ALL,
  },
  {
    id: "t09", start: "2026-11-10", director: true,
    title: "Subir el FPI-002 y la documentación al SPI",
    detail: "A primera hora, si Natalia ya creó el usuario del SPI para Pablo. Lo sube Pablo o Damián, según indique Natalia.",
    owners: ["pablo", "damian"],
  },
  {
    id: "t10", start: "2026-11-10",
    title: "Llamar a Natalia y avisarle el cambio de director",
    detail: "Interno 8762. Avisar que el director es Pablo (el usuario del SPI se crea para el director) y que Damián es codirector. Confirmar que llegan a revisar, si Damián puede cargar en el SPI y en qué rubro va Colab.",
    owners: ["damian"],
  },
  {
    id: "t11", start: "2026-11-10", director: true,
    title: "Asignar roles y horas en SIGEVA",
    detail: "Pablo director, Damián codirector y Claudio investigador, cada uno con sus horas.",
    owners: ["pablo"],
  },
  {
    id: "t12", start: "2026-11-10", end: "2026-11-13",
    title: "Resolver las correcciones de la Secretaría en menos de 24 h",
    detail: "Damián las resuelve consultando con el equipo.",
    owners: ["damian"],
  },
  {
    id: "t13", start: "2026-11-12",
    title: "Nota de compromiso firmada a mano por los tres y escaneada",
    detail: "Firman Pablo, Damián y Claudio. Coordina Damián.",
    owners: ALL,
  },
  {
    id: "t14", start: "2026-11-12", director: true,
    title: "Completar SIGEVA",
    detail: "Carátula, institución (UNLaM al 100 %), presupuesto y adjuntos. Pablo, con el apoyo de Damián.",
    owners: ["pablo", "damian"],
  },
  {
    id: "t15", start: "2026-11-13", director: true,
    title: "Enviar la presentación en SIGEVA",
    detail: "Solo con el OK de la Secretaría. Mejor no dejarlo para el fin de semana.",
    owners: ["pablo"],
  },
  {
    id: "t16", start: null, director: true,
    title: "Entregar en la Secretaría el PDF impreso y la nota de compromiso",
    detail: "Ambos con firmas originales. Los entrega Pablo o Damián.",
    owners: ["pablo", "damian"],
  },
];
