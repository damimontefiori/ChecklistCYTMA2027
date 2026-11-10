import { PROJECT, PEOPLE, HOLIDAYS, STATUSES } from "./config.js";
import { applyOp, initialState, normalizeTask, sortTasks, cleanPerson } from "./core.js";

const API = "/api/tasks";
const POLL_MS = 15000;
const LS = {
  me: "tablero.me",
  cache: "tablero.cache",
  local: "tablero.local",
  notice: "tablero.notice",
  hint: "tablero.hint",
  skipWho: "tablero.skipwho",
};

const ls = {
  get(k) { try { return localStorage.getItem(k); } catch { return null; } },
  set(k, v) { try { localStorage.setItem(k, v); } catch { /* sin almacenamiento */ } },
  del(k) { try { localStorage.removeItem(k); } catch { /* sin almacenamiento */ } },
  json(k) { try { return JSON.parse(localStorage.getItem(k)); } catch { return null; } },
};

const $ = (s, root = document) => root.querySelector(s);
const esc = (s) =>
  String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

const PERSON = Object.fromEntries(PEOPLE.map((p) => [p.id, p]));
const STATUS_LABEL = Object.fromEntries(STATUSES.map((s) => [s.id, s.label]));

let state = validState(ls.json(LS.cache));
let mode = "remote";             // "remote" | "local"
let pending = 0;
let lastSync = null;
let offline = false;
let loadError = false;
let me = cleanPerson(ls.get(LS.me));
let skipWho = ls.get(LS.skipWho) === "1";
const filters = { person: "all", status: "all" };
const collapsedOverride = new Map();
let flashId = null;

// Valida y normaliza (descarta responsables que ya no están en el equipo).
function validState(s) {
  return s && Array.isArray(s.tasks) ? { ...s, tasks: s.tasks.map(normalizeTask) } : null;
}

/* ---------- Fechas ---------- */
const WD = ["dom", "lun", "mar", "mié", "jue", "vie", "sáb"];
const dateOf = (s) => { const [y, m, d] = s.split("-").map(Number); return new Date(Date.UTC(y, m - 1, d)); };
const isoOf = (dt) => dt.toISOString().slice(0, 10);
const addDays = (s, n) => { const x = dateOf(s); x.setUTCDate(x.getUTCDate() + n); return isoOf(x); };
const diffDays = (a, b) => Math.round((dateOf(b) - dateOf(a)) / 864e5);
const wd = (s) => WD[dateOf(s).getUTCDay()];
const dm = (s) => { const x = dateOf(s); return `${x.getUTCDate()}/${x.getUTCMonth() + 1}`; };
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

function todayISO() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: PROJECT.timeZone, year: "numeric", month: "2-digit", day: "2-digit",
  }).format(new Date());
}

function groupLabel(start, end) {
  if (!start) return "Después del envío";
  if (end) return `${cap(wd(start))} ${dateOf(start).getUTCDate()} a ${wd(end)} ${dm(end)}`;
  return `${cap(wd(start))} ${dm(start)}`;
}

function whenText(t) {
  if (!t.start) return "Sin fecha fija: después del envío";
  if (t.end) return `Del ${wd(t.start)} ${dm(t.start)} al ${wd(t.end)} ${dm(t.end)}`;
  const holiday = HOLIDAYS[t.start] ? ` (${HOLIDAYS[t.start].toLowerCase()})` : "";
  return `${cap(wd(t.start))} ${dm(t.start)}${holiday}`;
}

function ago(isoStr) {
  const s = (Date.now() - new Date(isoStr).getTime()) / 1000;
  if (!Number.isFinite(s) || s < 45) return "recién";
  if (s < 3600) return `hace ${Math.max(1, Math.round(s / 60))} min`;
  if (s < 86400) return `hace ${Math.round(s / 3600)} h`;
  const days = Math.round(s / 86400);
  return days === 1 ? "ayer" : `hace ${days} días`;
}

const lastDay = (t) => t.end || t.start;
const isLate = (t, today) => t.status !== "hecha" && Boolean(t.start) && lastDay(t) < today;
const covers = (t, day) => Boolean(t.start) && t.start <= day && day <= lastDay(t);

/* ---------- Íconos ---------- */
const ICON = {
  pendiente: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8.5" fill="none" stroke="currentColor" stroke-width="2.2"/></svg>',
  en_curso: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8.5" fill="none" stroke="currentColor" stroke-width="2.2"/><path d="M12 3.5a8.5 8.5 0 0 1 0 17z" fill="currentColor"/></svg>',
  hecha: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9.6" fill="currentColor"/><path d="M7.8 12.3l2.8 2.8 5.6-5.8" fill="none" stroke="#fff" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  edit: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 20h4L19 9l-4-4L4 16z"/><path d="M13.5 6.5l4 4"/></svg>',
  trash: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/></svg>',
  chev: '<svg class="chev" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>',
};

/* ---------- Filtros ---------- */
const inPersonScope = (t) => filters.person === "all" || t.owners.includes(filters.person);

function matches(t, today) {
  if (!inPersonScope(t)) return false;
  if (filters.status === "atrasada") return isLate(t, today);
  if (filters.status !== "all") return t.status === filters.status;
  return true;
}

/* ---------- Render ---------- */
function render() {
  const today = todayISO();
  renderCountdown(today);
  renderMe();
  renderIdentify();
  renderNotice();
  renderFilters();
  if (!state) {
    renderLoading();
    renderSync();
    return;
  }
  const tasks = sortTasks(state.tasks);
  renderStrip(tasks, today);
  renderSummary(tasks, today);
  renderGroups(tasks, today);
  renderSync();
}

function renderStrip(tasks, today) {
  const scoped = tasks.filter(inPersonScope);
  const dated = tasks.filter((t) => t.start).map((t) => t.start).sort();
  let first = dated[0] && dated[0] < today ? dated[0] : today;
  if (first > PROJECT.deadline) first = PROJECT.deadline;
  if (diffDays(first, PROJECT.deadline) > 13) first = addDays(PROJECT.deadline, -13);

  const cells = [];
  for (let day = first; day <= PROJECT.deadline; day = addDays(day, 1)) {
    const dayTasks = scoped.filter((t) => covers(t, day));
    const isDeadline = day === PROJECT.deadline;
    const cls = ["day"];
    if (day < today) cls.push("is-past");
    if (day === today) cls.push("is-today");
    if (isDeadline) cls.push("is-deadline");
    const done = dayTasks.filter((t) => t.status === "hecha").length;
    const segs = dayTasks.slice(0, 6).map((t) => `<i class="s-${isLate(t, today) ? "late" : t.status}"></i>`).join("");
    const holiday = HOLIDAYS[day] ? `, ${HOLIDAYS[day].toLowerCase()}` : "";
    const label = `${wd(day)} ${dm(day)}${holiday}${isDeadline ? ", " + PROJECT.deadlineName : ""}: ` +
      (dayTasks.length ? `${done} de ${dayTasks.length} hechas` : "sin tareas");
    const foot = isDeadline
      ? '<span class="day-flag">Cierre</span>'
      : `<span class="day-bar${dayTasks.length ? "" : " is-empty"}">${segs || "<i></i>"}</span>`;
    cells.push(
      `<button type="button" class="${cls.join(" ")}" data-day="${day}" aria-label="${esc(label)}"${day === today ? ' aria-current="date"' : ""}>` +
      `<span class="day-wd">${wd(day)}</span><span class="day-num">${dateOf(day).getUTCDate()}</span>${foot}</button>`
    );
  }
  $("#strip").innerHTML = cells.join("");
}

function renderCountdown(today) {
  const n = diffDays(today, PROJECT.deadline);
  const when = `${wd(PROJECT.deadline)} ${dm(PROJECT.deadline)}`;
  let html;
  if (n > 1) html = `<strong>Faltan ${n} días</strong> para ${esc(PROJECT.deadlineName)}, el ${when}. ${esc(PROJECT.deadlineNote)}`;
  else if (n === 1) html = `<strong>Mañana es ${esc(PROJECT.deadlineName)}</strong> (${when}). ${esc(PROJECT.deadlineNote)}`;
  else if (n === 0) html = `<strong>Hoy es ${esc(PROJECT.deadlineName)}.</strong> ${esc(PROJECT.deadlineNote)}`;
  else html = `${cap(esc(PROJECT.deadlineName))} fue el ${when}.`;
  $("#countdown").innerHTML = html;
}

function renderSummary(tasks, today) {
  const scoped = tasks.filter(inPersonScope);
  const count = (s) => scoped.filter((t) => t.status === s).length;
  const done = count("hecha");
  const late = scoped.filter((t) => isLate(t, today)).length;
  const who = filters.person === "all" ? "" : `${PERSON[filters.person].name}: `;
  $("#progress-text").textContent = `${who}${done} de ${scoped.length} tareas hechas`;
  $("#progress-bar").style.width = scoped.length ? `${(done / scoped.length) * 100}%` : "0";

  const items = [
    ["pendiente", count("pendiente"), "Pendientes"],
    ["en_curso", count("en_curso"), "En curso"],
    ["hecha", done, "Hechas"],
  ];
  if (late > 0 || filters.status === "atrasada") items.push(["atrasada", late, late === 1 ? "Atrasada" : "Atrasadas"]);
  const box = $("#counters");
  box.classList.toggle("has-late", items.length === 4);
  box.innerHTML = items
    .map(([id, n, label]) =>
      `<button type="button" class="counter" data-s="${id}" aria-pressed="${filters.status === id}"><b>${n}</b><span>${label}</span></button>`)
    .join("");
}

function renderFilters() {
  const chips = [{ id: "all", name: "Todos" }, ...PEOPLE];
  $("#filters").innerHTML = chips
    .map((p) =>
      `<button type="button" class="chip" data-person="${p.id}" aria-pressed="${filters.person === p.id}">${esc(p.name)}` +
      `${p.id === me ? '<span class="me-dot" title="Vos"></span>' : ""}</button>`)
    .join("");
}

function ownersHtml(t) {
  const owners = t.owners.filter((id) => PERSON[id]);
  if (owners.length === PEOPLE.length) return `<span class="who${me ? " is-me" : ""}">Todos</span>`;
  return owners.map((id) => `<span class="who${id === me ? " is-me" : ""}">${esc(PERSON[id].name)}</span>`).join("");
}

function metaHtml(t, today) {
  return ownersHtml(t) +
    (t.director ? '<span class="tag-dir">✱ Director</span>' : "") +
    (isLate(t, today) ? '<span class="tag-late">Atrasada</span>' : "");
}

function renderGroups(tasks, today) {
  const visible = tasks.filter((t) => matches(t, today));
  const box = $("#groups");
  if (!visible.length) {
    box.innerHTML = `<div class="empty"><p>No hay tareas con este filtro.</p>
      <button type="button" class="btn-secondary" data-act="clear-filters">Ver todas las tareas</button></div>`;
    return;
  }

  const groups = [];
  for (const t of visible) {
    const key = `${t.start || "~"}|${t.end || ""}`;
    let g = groups.find((x) => x.key === key);
    if (!g) groups.push((g = { key, start: t.start, end: t.end, tasks: [] }));
    g.tasks.push(t);
  }

  box.innerHTML = groups.map((g) => {
    const last = g.end || g.start;
    const isPast = Boolean(g.start) && last < today;
    const isToday = Boolean(g.start) && g.start <= today && today <= last;
    const scopeTasks = tasks.filter((t) => inPersonScope(t) && `${t.start || "~"}|${t.end || ""}` === g.key);
    const allDone = scopeTasks.every((t) => t.status === "hecha");
    const autoCollapsed = filters.status === "all" && isPast && allDone;
    const collapsed = collapsedOverride.has(g.key) ? collapsedOverride.get(g.key) : autoCollapsed;
    const done = g.tasks.filter((t) => t.status === "hecha").length;
    const late = g.tasks.filter((t) => isLate(t, today)).length;
    const groupStatus = done === g.tasks.length ? "hecha"
      : done > 0 || g.tasks.some((t) => t.status === "en_curso") ? "en_curso" : "pendiente";
    const groupStatusLabel = { hecha: "Completo", en_curso: "En curso", pendiente: "Pendiente" }[groupStatus];
    const collapsedPill = collapsed
      ? `<span class="pill group-pill" data-s="${groupStatus}">${ICON[groupStatus]}${groupStatusLabel}</span>`
      : "";
    const badges =
      (isToday ? '<span class="badge badge-today">Hoy</span>' : "") +
      (g.start && HOLIDAYS[g.start] ? `<span class="badge badge-holiday">${esc(HOLIDAYS[g.start])}</span>` : "") +
      (late ? `<span class="badge badge-late">${late} ${late === 1 ? "atrasada" : "atrasadas"}</span>` : "");

    const rows = g.tasks.map((t) => {
      const late = isLate(t, today);
      return `<li class="task${late ? " is-late" : ""}${t.id === flashId ? " flash" : ""}" data-s="${t.status}">
        <button type="button" class="task-btn" data-id="${esc(t.id)}">
          <span class="rail" aria-hidden="true"></span>
          <span class="task-body">
            <span class="task-title">${esc(t.title)}</span>
            ${t.detail ? `<span class="task-detail">${esc(t.detail)}</span>` : ""}
            <span class="task-meta">${metaHtml(t, today)}</span>
          </span>
          <span class="pill" data-s="${t.status}">${ICON[t.status]}${STATUS_LABEL[t.status]}</span>
        </button>
      </li>`;
    }).join("");

    return `<section class="group${collapsed ? " is-collapsed" : ""}${isPast ? " is-past" : ""}"
        data-key="${esc(g.key)}" data-start="${g.start || ""}" data-end="${last || ""}">
      <button type="button" class="group-head" aria-expanded="${!collapsed}">
        ${ICON.chev}<span class="group-title">${esc(groupLabel(g.start, g.end))}</span>${badges}
        ${collapsedPill}<span class="group-count">${done}/${g.tasks.length}</span>
      </button>
      <ul class="task-list">${rows}</ul>
    </section>`;
  }).join("");
  flashId = null;
}

function renderLoading() {
  $("#strip").innerHTML = "";
  $("#counters").innerHTML = "";
  $("#progress-text").textContent = loadError ? "" : "Cargando tareas…";
  $("#groups").innerHTML = loadError
    ? `<div class="empty"><p>No se pudieron cargar las tareas. Revisá la conexión.</p>
       <button type="button" class="btn-secondary" data-act="retry">Reintentar</button></div>`
    : "";
}

function renderSync() {
  const el = $("#sync");
  el.classList.remove("is-warn");
  if (mode === "local") {
    el.textContent = "Modo local: se guarda solo en este dispositivo";
    el.classList.add("is-warn");
  } else if (pending > 0) {
    el.textContent = "Guardando…";
  } else if (offline) {
    el.textContent = "Sin conexión";
    el.classList.add("is-warn");
  } else {
    el.textContent = lastSync ? `Actualizado ${ago(lastSync)}` : "";
  }
}

function renderMe() {
  const btn = $("#me-btn");
  btn.textContent = me ? PERSON[me].name.charAt(0) : "?";
  btn.classList.toggle("is-set", Boolean(me));
  btn.setAttribute("aria-label", me ? `Sos ${PERSON[me].name}. Cambiar` : "Elegir quién sos");
}

function whoGrid() {
  return `<div class="who-grid" style="grid-template-columns: repeat(${PEOPLE.length}, minmax(0, 1fr))">${PEOPLE.map((p) =>
    `<button type="button" class="who-btn" data-who="${p.id}" aria-pressed="${p.id === me}"><b>${esc(p.name)}</b><span>${esc(p.role)}</span></button>`
  ).join("")}</div>`;
}

function renderIdentify() {
  const el = $("#identify");
  if (me || skipWho) { el.hidden = true; return; }
  el.hidden = false;
  el.innerHTML = `<h2>¿Quién sos?</h2>
    <p>Así queda registrado quién actualiza cada tarea. Se guarda solo en este teléfono.</p>
    ${whoGrid()}
    <button type="button" class="link-btn" data-who="skip">Ahora no</button>`;
}

function renderNotice() {
  const el = $("#notice");
  if (!PROJECT.notice || ls.get(LS.notice) === PROJECT.notice) { el.hidden = true; return; }
  el.hidden = false;
  el.innerHTML = `<span class="notice-star" aria-hidden="true">✱</span><p>${esc(PROJECT.notice)}</p>
    <button type="button" data-act="dismiss-notice">Entendido</button>`;
}

/* ---------- Hoja inferior ---------- */
const sheet = $("#sheet");
const sheetBody = $("#sheet-body");
const backdrop = $("#backdrop");
let sheetOpen = false;
let lastFocus = null;
let hideTimer = null;

function openSheet(html, onClick) {
  sheetBody.innerHTML = html;
  sheetBody.onclick = onClick || null;
  sheetBody.scrollTop = 0;
  if (!sheetOpen) {
    clearTimeout(hideTimer);
    lastFocus = document.activeElement;
    sheet.hidden = false;
    backdrop.hidden = false;
    void sheet.offsetHeight;
    sheet.classList.add("is-open");
    backdrop.classList.add("is-open");
    document.body.style.overflow = "hidden";
    document.body.classList.add("sheet-is-open");
    history.pushState({ sheet: true }, "");
    sheetOpen = true;
  }
  const title = sheetBody.querySelector("h2");
  if (title) { title.tabIndex = -1; title.focus({ preventScroll: true }); }
}

function hideSheet() {
  if (!sheetOpen) return;
  sheetOpen = false;
  sheet.classList.remove("is-open");
  backdrop.classList.remove("is-open");
  document.body.style.overflow = "";
  document.body.classList.remove("sheet-is-open");
  hideTimer = setTimeout(() => { sheet.hidden = true; backdrop.hidden = true; sheetBody.innerHTML = ""; }, 260);
  if (lastFocus && document.contains(lastFocus)) lastFocus.focus({ preventScroll: true });
}

function closeSheet() {
  if (!sheetOpen) return;
  if (history.state && history.state.sheet) history.back();
  else hideSheet();
}

window.addEventListener("popstate", () => { if (sheetOpen) hideSheet(); });
backdrop.addEventListener("click", closeSheet);
document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeSheet(); });

/* ---------- Detalle de tarea ---------- */
function openTask(id, { confirmDelete = false } = {}) {
  const t = state?.tasks.find((x) => x.id === id);
  if (!t) return;
  const today = todayISO();
  const updated = t.updatedAt
    ? `<p class="updated">Última actualización: ${PERSON[t.updatedBy] ? esc(PERSON[t.updatedBy].name) + ", " : ""}${ago(t.updatedAt)}.</p>`
    : "";
  const confirm = confirmDelete
    ? `<div class="confirm"><p>¿Borrar esta tarea para todo el equipo?</p>
        <div class="sheet-actions" style="margin-top:0">
          <button type="button" class="btn" data-act="cancel-delete">Cancelar</button>
          <button type="button" class="btn btn-danger-solid" data-act="delete">Borrar</button>
        </div></div>`
    : `<div class="sheet-actions">
        <button type="button" class="btn" data-act="edit">${ICON.edit}Editar</button>
        <button type="button" class="btn btn-danger" data-act="ask-delete">${ICON.trash}Borrar</button>
      </div>`;

  openSheet(
    `<h2 id="sheet-title">${esc(t.title)}</h2>
    <p class="sheet-when">${esc(whenText(t))}</p>
    ${t.detail ? `<p class="sheet-detail">${esc(t.detail)}</p>` : ""}
    <div class="task-meta">${metaHtml(t, today)}</div>
    <p class="sheet-label">Estado</p>
    <div class="status-choices">${STATUSES.map((s) =>
      `<button type="button" class="status-choice" data-s="${s.id}" data-act="status" aria-pressed="${t.status === s.id}">${ICON[s.id]}<span>${s.label}</span></button>`
    ).join("")}</div>
    ${updated}
    ${confirm}`,
    async (e) => {
      const btn = e.target.closest("[data-act]");
      if (!btn) return;
      const act = btn.dataset.act;
      if (act === "status") {
        const status = btn.dataset.s;
        closeSheet();
        if (status === t.status) return;
        flashId = t.id;
        markHintSeen();
        const ok = await mutate({ type: "update", id: t.id, patch: { status } });
        if (ok) toast(`Marcada como ${STATUS_LABEL[status].toLowerCase()}`);
      } else if (act === "edit") {
        openForm(t);
      } else if (act === "ask-delete") {
        openTask(t.id, { confirmDelete: true });
      } else if (act === "cancel-delete") {
        openTask(t.id);
      } else if (act === "delete") {
        closeSheet();
        const copy = { ...t };
        const ok = await mutate({ type: "delete", id: t.id });
        if (ok) {
          toast("Tarea borrada", {
            label: "Deshacer",
            run: async () => {
              flashId = copy.id;
              if (await mutate({ type: "create", task: copy })) toast("Tarea restaurada");
            },
          });
        }
      }
    }
  );
}

/* ---------- Formulario (editar / agregar) ---------- */
function openForm(task) {
  const isNew = !task;
  const t = task || { title: "", detail: "", owners: me ? [me] : [], start: todayISO(), end: null, director: false };
  const noDate = !t.start;

  openSheet(
    `<h2 id="sheet-title">${isNew ? "Nueva tarea" : "Editar tarea"}</h2>
    <form class="form" novalidate>
      <div class="field">
        <label for="f-title">Tarea</label>
        <textarea id="f-title" class="title-input" name="title" rows="2" maxlength="200" autocomplete="off">${esc(t.title)}</textarea>
      </div>
      <div class="field">
        <label for="f-detail">Detalle (opcional)</label>
        <textarea id="f-detail" name="detail" maxlength="1200">${esc(t.detail)}</textarea>
      </div>
      <div class="field">
        <span class="label" id="owners-label">Responsables</span>
        <div class="owner-toggles" role="group" aria-labelledby="owners-label">${PEOPLE.map((p) =>
          `<button type="button" class="chip" data-owner="${p.id}" aria-pressed="${t.owners.includes(p.id)}">${esc(p.name)}</button>`
        ).join("")}</div>
      </div>
      <div class="row-2">
        <div class="field">
          <label for="f-start">Fecha</label>
          <input id="f-start" type="date" name="start" value="${t.start || ""}"${noDate ? " disabled" : ""}>
        </div>
        <div class="field">
          <label for="f-end">Hasta (opcional)</label>
          <input id="f-end" type="date" name="end" value="${t.end || ""}"${noDate ? " disabled" : ""}>
        </div>
      </div>
      <label class="check"><input type="checkbox" name="nodate"${noDate ? " checked" : ""}> Sin fecha fija (después del envío)</label>
      <label class="check"><input type="checkbox" name="director"${t.director ? " checked" : ""}> Paso del director en SIGEVA (✱)</label>
      <p class="form-error" role="alert" hidden></p>
      <div class="sheet-actions">
        <button type="button" class="btn" data-act="cancel">Cancelar</button>
        <button type="submit" class="btn btn-primary">${isNew ? "Agregar tarea" : "Guardar cambios"}</button>
      </div>
    </form>`,
    (e) => {
      const owner = e.target.closest("[data-owner]");
      if (owner) owner.setAttribute("aria-pressed", owner.getAttribute("aria-pressed") !== "true");
      if (e.target.closest('[data-act="cancel"]')) {
        if (isNew) closeSheet();
        else openTask(task.id);
      }
    }
  );

  const form = sheetBody.querySelector("form");
  const startEl = form.elements.start;
  const endEl = form.elements.end;
  form.elements.nodate.addEventListener("change", (e) => {
    startEl.disabled = endEl.disabled = e.target.checked;
    if (!e.target.checked && !startEl.value) startEl.value = todayISO();
  });
  form.elements.title.addEventListener("keydown", (e) => {
    if (e.key === "Enter") { e.preventDefault(); form.requestSubmit(); }
  });
  if (isNew) form.elements.title.focus();

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const errorEl = form.querySelector(".form-error");
    const fail = (msg) => { errorEl.textContent = msg; errorEl.hidden = false; };
    const title = form.elements.title.value.trim();
    const noDateNow = form.elements.nodate.checked;
    const start = noDateNow ? null : startEl.value || null;
    let end = noDateNow ? null : endEl.value || null;
    if (!title) return fail("Escribí el nombre de la tarea.");
    if (!noDateNow && !start) return fail("Elegí una fecha o marcá «Sin fecha fija».");
    if (end && end < start) return fail("La fecha «Hasta» tiene que ser igual o posterior a la fecha de inicio.");
    if (end === start) end = null;
    const data = {
      title,
      detail: form.elements.detail.value,
      owners: [...form.querySelectorAll('[data-owner][aria-pressed="true"]')].map((b) => b.dataset.owner),
      start,
      end,
      director: form.elements.director.checked,
    };
    closeSheet();
    if (isNew) {
      const ok = await mutate({ type: "create", task: data });
      if (ok) {
        flashId = state.tasks[state.tasks.length - 1]?.id;
        render();
        toast("Tarea agregada");
      }
    } else {
      flashId = task.id;
      const ok = await mutate({ type: "update", id: task.id, patch: data });
      if (ok) toast("Cambios guardados");
    }
  });
}

/* ---------- Quién sos ---------- */
function setMe(id) {
  me = cleanPerson(id);
  if (me) ls.set(LS.me, me);
  else ls.del(LS.me);
  render();
}

function openWho() {
  openSheet(
    `<h2 id="sheet-title">¿Quién sos?</h2>
    <p class="sheet-when">Así queda registrado quién actualiza cada tarea. Se guarda solo en este teléfono.</p>
    <div style="margin-top:14px">${whoGrid()}</div>
    ${me ? '<button type="button" class="link-btn" data-who="none">No decir quién soy</button>' : ""}`,
    (e) => {
      const b = e.target.closest("[data-who]");
      if (!b) return;
      setMe(b.dataset.who === "none" ? null : b.dataset.who);
      closeSheet();
    }
  );
}

/* ---------- Datos ---------- */
function enterLocalMode() {
  mode = "local";
  state = validState(ls.json(LS.local)) || initialState();
  loadError = false;
  render();
}

async function fetchState({ initial = false } = {}) {
  if (mode === "local") return;
  try {
    const res = await fetch(API, { headers: { accept: "application/json" }, cache: "no-store" });
    const type = res.headers.get("content-type") || "";
    if (!type.includes("application/json")) {
      if (initial) return enterLocalMode();
      throw new Error(`HTTP ${res.status}`);
    }
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = validState(await res.json());
    if (!data) throw new Error("Respuesta inválida");
    offline = false;
    loadError = false;
    lastSync = new Date().toISOString();
    if (pending > 0) return renderSync();
    const changed = !state || data.rev !== state.rev || data.updatedAt !== state.updatedAt;
    state = data;
    ls.set(LS.cache, JSON.stringify(data));
    if (changed) render();
    else renderSync();
  } catch (err) {
    if (initial && location.protocol === "file:") return enterLocalMode();
    offline = true;
    if (!state) loadError = true;
    render();
  }
}

async function mutate(op) {
  const before = state;
  const body = { ...op, by: me };
  try {
    state = applyOp(state, body, { now: new Date().toISOString() });
  } catch (err) {
    toast(err.message);
    return false;
  }
  render();

  if (mode === "local") {
    ls.set(LS.local, JSON.stringify(state));
    return true;
  }

  pending++;
  renderSync();
  let res = null;
  let data = null;
  try {
    res = await fetch(API, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });
    data = await res.json().catch(() => null);
  } catch {
    res = null; // sin conexión
  } finally {
    pending = Math.max(0, pending - 1);
  }

  if (res && res.ok && validState(data)) {
    offline = false;
    lastSync = new Date().toISOString();
    if (pending === 0) {
      state = data;
      ls.set(LS.cache, JSON.stringify(data));
      render();
    } else {
      renderSync();
    }
    return true;
  }

  // Falló: se vuelve a la versión del servidor (si vino) o a la anterior.
  if (pending === 0) state = validState(data?.state) || before;
  if (!res) offline = true;
  toast(res
    ? `No se pudo guardar: ${data?.error || `error ${res.status}`}`
    : "No se pudo guardar: sin conexión. Probá de nuevo.");
  render();
  fetchState();
  return false;
}

/* ---------- Aviso emergente ---------- */
const toastEl = $("#toast");
let toastTimer = null;

function toast(msg, action) {
  toastEl.innerHTML = `<span>${esc(msg)}</span>${action ? `<button type="button">${esc(action.label)}</button>` : ""}`;
  toastEl.hidden = false;
  void toastEl.offsetHeight;
  toastEl.classList.add("is-open");
  if (action) toastEl.querySelector("button").onclick = () => { hideToast(); action.run(); };
  clearTimeout(toastTimer);
  toastTimer = setTimeout(hideToast, action ? 6000 : 2800);
}

function hideToast() {
  toastEl.classList.remove("is-open");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { toastEl.hidden = true; }, 220);
}

function markHintSeen() {
  ls.set(LS.hint, "1");
  $("#hint").hidden = true;
}

/* ---------- Eventos ---------- */
function scrollToDay(day) {
  const groups = [...document.querySelectorAll(".group[data-start]")];
  const g = groups.find((el) => el.dataset.start && el.dataset.start <= day && day <= el.dataset.end);
  if (!g) {
    toast(day === PROJECT.deadline ? "Ese día cierra SIGEVA: no hay tareas planificadas" : "No hay tareas ese día con este filtro");
    return;
  }
  if (g.classList.contains("is-collapsed")) {
    collapsedOverride.set(g.dataset.key, false);
    render();
  }
  const target = document.querySelector(`.group[data-key="${CSS.escape(g.dataset.key)}"]`);
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  target?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
}

function bindEvents() {
  $("#strip").addEventListener("click", (e) => {
    const b = e.target.closest("[data-day]");
    if (b) scrollToDay(b.dataset.day);
  });

  $("#counters").addEventListener("click", (e) => {
    const b = e.target.closest("[data-s]");
    if (!b) return;
    filters.status = filters.status === b.dataset.s ? "all" : b.dataset.s;
    render();
  });

  $("#filters").addEventListener("click", (e) => {
    const b = e.target.closest("[data-person]");
    if (!b) return;
    filters.person = b.dataset.person;
    render();
  });

  $("#groups").addEventListener("click", (e) => {
    const taskBtn = e.target.closest(".task-btn");
    if (taskBtn) return openTask(taskBtn.dataset.id);
    const head = e.target.closest(".group-head");
    if (head) {
      const g = head.closest(".group");
      collapsedOverride.set(g.dataset.key, !g.classList.contains("is-collapsed"));
      return render();
    }
    const act = e.target.closest("[data-act]")?.dataset.act;
    if (act === "clear-filters") { filters.person = "all"; filters.status = "all"; render(); }
    if (act === "retry") { loadError = false; render(); fetchState({ initial: true }); }
  });

  $("#identify").addEventListener("click", (e) => {
    const b = e.target.closest("[data-who]");
    if (!b) return;
    if (b.dataset.who === "skip") {
      skipWho = true;
      ls.set(LS.skipWho, "1");
      render();
    } else {
      setMe(b.dataset.who);
    }
  });

  $("#notice").addEventListener("click", (e) => {
    if (e.target.closest('[data-act="dismiss-notice"]')) {
      ls.set(LS.notice, PROJECT.notice);
      renderNotice();
    }
  });

  $("#me-btn").addEventListener("click", openWho);
  $("#add-btn").addEventListener("click", () => openForm(null));

  $("#share-btn").addEventListener("click", async () => {
    const url = location.origin + location.pathname;
    const text = `${PROJECT.title} (${PROJECT.subtitle}): tareas y estados`;
    if (navigator.share) {
      try { await navigator.share({ title: PROJECT.title, text, url }); } catch { /* cancelado */ }
      return;
    }
    try {
      await navigator.clipboard.writeText(url);
      toast("Link copiado");
    } catch {
      window.open(`https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`, "_blank", "noopener");
    }
  });

  const filtersEl = $("#filters");
  const fab = $("#add-btn");
  let fabTimer = null;
  const onScroll = () => {
    filtersEl.classList.toggle("is-stuck", filtersEl.getBoundingClientRect().top <= 0.5);
    // El botón muestra solo "+" en reposo y se amplía mientras se hace scroll.
    fab.classList.add("is-extended");
    clearTimeout(fabTimer);
    fabTimer = setTimeout(() => fab.classList.remove("is-extended"), 1200);
  };
  window.addEventListener("scroll", onScroll, { passive: true });

  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") fetchState();
  });
  window.addEventListener("online", () => fetchState());
  setInterval(() => {
    if (document.visibilityState === "visible") fetchState();
    else renderSync();
  }, POLL_MS);
}

/* ---------- Inicio ---------- */
document.title = `Tareas: ${PROJECT.title} (${PROJECT.subtitle.replace(/^Presentación /, "")})`;
$("#project-title").textContent = PROJECT.title;
$("#project-subtitle").textContent = PROJECT.subtitle;
$("#hint").hidden = ls.get(LS.hint) === "1";
bindEvents();
render();
fetchState({ initial: true });
