// Copia congelada de las tareas tal como quedaron el 10/11/2026 (15:30).
// La usan las migraciones. No modificar.

const ALL = ["pablo", "damian", "claudio"];

// start/end: "AAAA-MM-DD". end solo para tareas que abarcan varios días.
// start null = sin fecha fija (después del envío).
// director: true = paso del director en SIGEVA (✱).
// Estas tareas se cargan solo la primera vez. Si la app ya estaba desplegada,
// los cambios a las tareas existentes van como migración en netlify/migrations/.
export const SEED_V4 = [
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
    id: "t12", start: "2026-11-10", end: "2026-11-13",
    title: "Resolver las correcciones de la Secretaría en menos de 24 h",
    detail: "Natalia revisa lo que se subió al SPI. Damián resuelve lo que pida, consultando con el equipo.",
    owners: ["damian"],
  },
  {
    id: "t07", start: "2026-11-11",
    title: "Compartir el código del trámite y vincularse al proyecto",
    detail: "Pablo pasa el código. Damián y Claudio se vinculan: rol \"Usuario banco de datos de actividades CyT\" > Trámite > Participación en una convocatoria.",
    owners: ALL,
  },
  {
    id: "t11", start: "2026-11-11", director: true,
    title: "Asignar roles y horas en SIGEVA",
    detail: "Después de que se vinculen. Damián codirector (4 h) y Claudio investigador (6 h); Pablo, director, 4 h. Las mismas horas que el FPI-002.",
    owners: ["pablo"],
  },
  {
    id: "t17", start: "2026-11-11", end: "2026-11-12",
    title: "Confirmar con la Secretaría el rubro de Colab",
    detail: "La pregunta del mail del 6/11 quedó sin respuesta. Si Colab va en servicios de terceros (g) o en licencias (b), y los aranceles de CACIC y JAIIO. El miércoles es feriado en PBA y Natalia puede no estar: si no responde, el jueves. Si cambia algo, Pablo vuelve a subir el FPI-002 al SPI y se cargan los mismos montos en SIGEVA.",
    owners: ["damian"],
  },
  {
    id: "t14", start: "2026-11-12", director: true,
    title: "Completar SIGEVA",
    detail: "Carátula, institución (UNLaM al 100 %), recursos financieros con los mismos montos por rubro y año que el FPI-002 ($ 574.000 por año) y adjuntos. Pablo, con el apoyo de Damián.",
    owners: ["pablo", "damian"],
  },
  {
    id: "t15", start: "2026-11-13", director: true,
    title: "Presionar \"Enviar presentación\" en SIGEVA",
    detail: "Solo cuando Natalia confirme por correo. Bloquea el proyecto. SIGEVA cierra el dom 15/11: mejor no dejarlo para el fin de semana.",
    owners: ["pablo"],
  },
  {
    id: "t16", start: null, director: true,
    title: "Entregar en la Secretaría el PDF impreso y la nota de compromiso",
    detail: "Después del envío. Ambos con firmas originales. Los entrega Pablo o Damián.",
    owners: ["pablo", "damian"],
  },
];
