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
  notice: "",
};

export const PEOPLE = [
  { id: "pablo",   name: "Pablo",   role: "Director" },
  { id: "damian",  name: "Damián",  role: "Codirector" },
  { id: "claudio", name: "Claudio", role: "Investigador" },
];

export const HOLIDAYS = {
  "2026-11-09": "Feriado",
  "2026-11-11": "Feriado en PBA",
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
    id: "t03", start: "2026-11-10", status: "en_curso",
    title: "Actualizar el CV en SIGEVA UNLaM y adjuntar el archivo del CV",
    detail: "Cada uno en su usuario: Otros antecedentes > Currículum. El PDF sale de Principal > Imprimir currículum > Imprimir CV (pdf); ese mismo archivo se lo pasan a Pablo para el SPI.",
    owners: ALL,
  },
  {
    id: "t04", start: "2026-11-08", status: "hecha",
    title: "Definir las horas semanales de dedicación",
    detail: "Quedaron en el FPI-002 v5: Pablo 4, Damián 4 y Claudio 6.",
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
    detail: "Textos de la carátula listos, con el resumen en inglés. Presupuesto en el FPI-002 v5.",
    owners: ["damian"],
  },
  {
    id: "t08", start: "2026-11-09", status: "hecha",
    title: "Cerrar y revisar el FPI-002",
    detail: "Versión final v5: Pablo director, Damián codirector y Claudio investigador. Presupuesto de $ 1.148.000 ($ 574.000 por año), debajo del tope de $ 1.500.000.",
    owners: ALL,
  },
  {
    id: "t09", start: "2026-11-10", director: true, status: "hecha",
    title: "Subir el FPI-002 y la nota de compromiso al SPI",
    detail: "Pablo los subió el 10/11. Desde el SPI le llegan a Natalia para que los revise y nos confirme.",
    owners: ["pablo"],
  },
  {
    id: "t13", start: "2026-11-10", status: "hecha",
    title: "Nota de compromiso firmada a mano por los tres",
    detail: "Firmada por Pablo, Damián y Claudio. Pablo la subió al SPI el 10/11.",
    owners: ALL,
  },
  {
    id: "t10", start: "2026-11-10", status: "hecha",
    title: "Avisarle a Natalia el cambio de director",
    detail: "Natalia ya trabaja con Pablo como director: el usuario del SPI quedó a su nombre.",
    owners: ["damian"],
  },
  {
    id: "t12", start: "2026-11-10", end: "2026-11-14",
    title: "Resolver las correcciones de la Secretaría en menos de 24 h",
    detail: "Natalia revisa lo que se subió al SPI. El jue 12/11 no respondió por el paro no docente. Damián resuelve lo que pida, consultando con el equipo.",
    owners: ["damian"],
  },
  {
    id: "t07", start: "2026-11-09", status: "hecha",
    title: "Compartir el código del trámite y vincularse al proyecto",
    detail: "Pablo pasó el código y Damián y Claudio se vincularon el 9/11.",
    owners: ALL,
  },
  {
    id: "t11", start: "2026-11-09", director: true, status: "hecha",
    title: "Asignar roles y horas en SIGEVA",
    detail: "Pablo lo hizo el 9/11: él 4 h, Damián 4 h y Claudio 6 h, igual que el FPI-002.",
    owners: ["pablo"],
  },
  {
    id: "t17", start: "2026-11-13", status: "en_curso",
    title: "Llamar a Natalia: revisión, rubro de Colab y entrega en papel",
    detail: "El jue 12/11 no atendió por el paro no docente; llamar el viernes temprano (interno 8762).\n1) Si recibió bien el FPI-002 y la nota de compromiso por el SPI, si tiene observaciones o si Pablo ya puede presionar «Enviar presentación».\n2) Si Colab va en servicios de terceros (g) o en licencias (b), y los aranceles de CACIC y JAIIO. Si cambia algo, Pablo vuelve a subir el FPI-002 al SPI y se cargan los mismos montos en SIGEVA.\n3) Entrega en papel: Claudio averiguó que alcanzaría con el PDF impreso con las firmas escaneadas. Confirmarlo, y que se pueda entregar después del 15/11, porque ese cierre sería solo para SPI y SIGEVA.",
    owners: ["damian"],
  },
  {
    id: "t14", start: "2026-11-13", director: true,
    title: "Completar SIGEVA",
    detail: "La carátula ya está. Falta:\n1) Instituciones relacionadas: solo UNLaM, ejecuta y financia al 100 %. Tiene que quedar en «Ok».\n2) Recursos financieros, en cada año: g) Servicios de terceros $ 434.000 y f) Difusión $ 140.000; el resto en $ 0. Total $ 574.000 por año, igual que el FPI-002. Si Natalia indica otro rubro para Colab, se ajusta.\n3) Adjuntos: el FPI-002 revisado por Natalia, con las correcciones, y la nota de compromiso firmada por los tres.\nDespués, bajar el PDF «Presentación» para revisar que coincida con el FPI-002.",
    owners: ["pablo"],
  },
  {
    id: "t15", start: "2026-11-13", end: "2026-11-15", director: true,
    title: "Presionar \"Enviar presentación\" en SIGEVA",
    detail: "Solo cuando Natalia confirme. Bloquea el proyecto. SIGEVA cierra el dom 15/11 sin prórroga: mejor el viernes, apenas llegue el OK.",
    owners: ["pablo"],
  },
  {
    id: "t16", start: null, director: true,
    title: "Entregar en la Secretaría el PDF impreso y la nota de compromiso",
    detail: "Después de «Enviar presentación». Claudio averiguó que alcanzaría con el PDF impreso con las firmas escaneadas, y creemos que puede ser después del 15/11 (ese cierre es para SPI y SIGEVA). Se confirma con Natalia en la llamada del viernes. Investigación no atiende sábados ni domingos. Lo entregan Pablo o Damián.",
    owners: ["pablo", "damian"],
  },
];
