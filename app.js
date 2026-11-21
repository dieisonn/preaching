'use strict';
/* Assistente do Ministério — PWA pessoal */

// ---------- utilidades ----------
const $ = (s, r = document) => r.querySelector(s);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const pad = n => String(n).padStart(2, '0');
const ymd = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const today = () => ymd(new Date());
const parseYmd = s => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
const monthKey = s => s.slice(0, 7);
const MESES = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
const MES_CURTO = ['jan.', 'fev.', 'mar.', 'abr.', 'mai.', 'jun.', 'jul.', 'ago.', 'set.', 'out.', 'nov.', 'dez.'];
const DIAS = ['dom.', 'seg.', 'ter.', 'qua.', 'qui.', 'sex.', 'sáb.'];
const monthLabel = k => { const [y, m] = k.split('-').map(Number); return `${MESES[m - 1]} ${y}`; };
const addMonths = (k, n) => { const [y, m] = k.split('-').map(Number); const d = new Date(y, m - 1 + n, 1); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}`; };
const serviceYearOf = k => { const [y, m] = k.split('-').map(Number); return m >= 9 ? y + 1 : y; };
const fmtDur = min => { min = Math.round(min); const h = Math.floor(min / 60), m = min % 60; return m ? `${h}:${pad(m)}h` : `${h}h`; };
const fmtNum = n => (Math.round(n * 100) / 100).toString().replace('.', ',');
const hoursOf = min => min / 60;
const fmtDateLong = s => { const d = parseYmd(s); return `${DIAS[d.getDay()]} ${d.getDate()} de ${MES_CURTO[d.getMonth()]} de ${d.getFullYear()}`; };
const uuid = () => (crypto.randomUUID ? crypto.randomUUID() : 'id-' + Date.now() + Math.random().toString(16).slice(2));

const ICON = {
  menu: '<svg viewBox="0 0 24 24"><path d="M3 6h18v2H3zm0 5h18v2H3zm0 5h18v2H3z"/></svg>',
  back: '<svg viewBox="0 0 24 24"><path d="M20 11H7.8l5.6-5.6L12 4l-8 8 8 8 1.4-1.4L7.8 13H20z"/></svg>',
  more: '<svg viewBox="0 0 24 24"><path d="M12 8a2 2 0 100-4 2 2 0 000 4zm0 2a2 2 0 100 4 2 2 0 000-4zm0 6a2 2 0 100 4 2 2 0 000-4z"/></svg>',
  search: '<svg viewBox="0 0 24 24"><path d="M15.5 14h-.8l-.3-.3A6.5 6.5 0 109.5 16a6.5 6.5 0 004.2-1.6l.3.3v.8l5 5 1.5-1.5zm-6 0a4.5 4.5 0 110-9 4.5 4.5 0 010 9z"/></svg>',
  sync: '<svg viewBox="0 0 24 24"><path d="M12 4V1L8 5l4 4V6a6 6 0 016 6c0 1-.25 1.97-.7 2.8l1.46 1.46A8 8 0 0012 4zm0 14a6 6 0 01-6-6c0-1 .25-1.97.7-2.8L5.24 7.74A8 8 0 0012 20v3l4-4-4-4z"/></svg>',
  play: '<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>',
  pause: '<svg viewBox="0 0 24 24"><path d="M6 5h4v14H6zm8 0h4v14h-4z"/></svg>',
  stop: '<svg viewBox="0 0 24 24"><path d="M6 6h12v12H6z"/></svg>',
  home: '<svg viewBox="0 0 24 24"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>',
  chart: '<svg viewBox="0 0 24 24"><path d="M3.5 18.5l6-6 4 4L22 6.9 20.6 5.5l-7.1 7.1-4-4L2 16z"/></svg>',
  people: '<svg viewBox="0 0 24 24"><path d="M16 11a3 3 0 100-6 3 3 0 000 6zm-8 0a3 3 0 100-6 3 3 0 000 6zm0 2c-2.3 0-7 1.2-7 3.5V19h14v-2.5C15 14.2 10.3 13 8 13zm8 0c-.3 0-.6 0-1 .1 1.2.8 2 2 2 3.4V19h6v-2.5c0-2.3-4.700-3.500-7-3.500z"/></svg>',
  map: '<svg viewBox="0 0 24 24"><path d="M20.5 3l-.2.1L15 5.1 9 3 3.4 4.9a.5.5 0 00-.4.5v15.100a.5.5 0 00.5.5l.2-.1L9 18.900l6 2.100 5.600-1.900a.5.5 0 00.4-.5V3.500a.5.5 0 00-.5-.5zM15 19l-6-2.100V5l6 2.100z"/></svg>',
  cal: '<svg viewBox="0 0 24 24"><path d="M19 4h-1V2h-2v2H8V2H6v2H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V6a2 2 0 00-2-2zm0 16H5V10h14zM7 12h5v5H7z"/></svg>',
  help: '<svg viewBox="0 0 24 24"><path d="M11 18h2v-2h-2zm1-16a10 10 0 100 20 10 10 0 000-20zm0 18a8 8 0 110-16 8 8 0 010 16zm0-14a4 4 0 00-4 4h2a2 2 0 114 0c0 2-3 1.750-3 5h2c0-2.250 3-2.500 3-5a4 4 0 00-4-4z"/></svg>',
  cloud: '<svg viewBox="0 0 24 24"><path d="M19.4 10a7.500 7.500 0 00-14.400 2A5.500 5.500 0 006 23h13a4.500 4.500 0 00.4-9zM19 21H6a3.500 3.500 0 010-7h.5l.5-.1.2-.5A5.500 5.500 0 0118 11l.3 1.500H19a2.500 2.500 0 010 5z" transform="translate(0 -3)"/></svg>',
  gear: '<svg viewBox="0 0 24 24"><path d="M19.400 13a7.800 7.800 0 000-2l2.100-1.600-2-3.500-2.500 1a7.300 7.300 0 00-1.700-1L15 3.200h-4l-.4 2.700a7.300 7.300 0 00-1.700 1l-2.500-1-2 3.500L6.600 11a7.800 7.800 0 000 2l-2.100 1.600 2 3.500 2.500-1c.5.400 1.100.7 1.700 1l.4 2.700h4l.4-2.700c.6-.3 1.200-.6 1.700-1l2.500 1 2-3.500zM12 15.500a3.500 3.500 0 110-7 3.500 3.500 0 010 7z"/></svg>',
  logout: '<svg viewBox="0 0 24 24"><path d="M17 7l-1.400 1.400L18.200 11H8v2h10.200l-2.600 2.600L17 17l5-5zM4 5h8V3H4a2 2 0 00-2 2v14a2 2 0 002 2h8v-2H4z"/></svg>',
  user: '<svg viewBox="0 0 24 24"><path d="M12 12a4 4 0 100-8 4 4 0 000 8zm0 2c-2.700 0-8 1.300-8 4v2h16v-2c0-2.700-5.300-4-8-4z"/></svg>',
  share: '<svg viewBox="0 0 24 24"><path d="M18 16.1c-.8 0-1.5.3-2 .8l-7.1-4.2c.1-.2.1-.5.1-.7s0-.5-.1-.7L16 7.2c.5.5 1.2.8 2 .8a3 3 0 10-3-3c0 .2 0 .5.1.7L8 9.8A3 3 0 106 9a3 3 0 000 6c.8 0 1.5-.3 2-.8l7.1 4.2c-.1.2-.1.4-.1.6a2.9 2.9 0 102.900-2.900z"/></svg>',
  book: '<svg viewBox="0 0 24 24"><path d="M21 5c-1.100-.4-2.300-.5-3.500-.5-1.900 0-4.100.4-5.500 1.500-1.400-1.100-3.600-1.500-5.500-1.500S2.500 4.900 1 6v14.600c0 .3.300.5.500.5.100 0 .2 0 .3-.1 1.100-.7 3-1.300 4.700-1.300 1.900 0 4.100.4 5.500 1.500 1.300-.9 3.800-1.500 5.500-1.500 1.700 0 3.600.6 4.700 1.300.1.100.2.100.3.100.3 0 .5-.2.5-.5V6c-.6-.4-1.200-.7-2-1z"/></svg>',
};

// ---------- Supabase ----------
const CFG = window.APP_CONFIG || {};
const CONFIGURED = CFG.SUPABASE_URL && !/COLE_AQUI/.test(CFG.SUPABASE_URL) && CFG.SUPABASE_ANON_KEY && !/COLE_AQUI/.test(CFG.SUPABASE_ANON_KEY);
const sb = CONFIGURED ? window.supabase.createClient(CFG.SUPABASE_URL, CFG.SUPABASE_ANON_KEY, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true, flowType: 'implicit' } }) : null;
const S = { token: null, user: null, time: [], report: [], person: [], visit: [], territory: [], plan: [], settings: {} };
const KINDS = ['time', 'report', 'person', 'visit', 'territory', 'plan'];
const must = ({ data, error }) => { if (error) throw new Error(traduz(error.message)); return data; };
function traduz(m) {
  const t = { 'Invalid login credentials': 'E-mail ou senha incorretos', 'User already registered': 'Este e-mail já tem conta', 'Email not confirmed': 'Confirme o e-mail (veja sua caixa de entrada)',
    'Failed to fetch': 'Sem conexão com a internet', 'New password should be different': 'A nova senha precisa ser diferente da atual', 'same_password': 'A nova senha precisa ser diferente da atual', 'not authenticated': 'Faça login novamente' };
  for (const k in t) if (String(m).includes(k)) return t[k];
  if (/Password should be at least/i.test(m)) return 'A senha precisa de pelo menos 6 caracteres';
  if (/rate limit/i.test(m)) return 'Muitas tentativas. Aguarde um pouco.';
  return m;
}
const rowToObj = r => ({ ...r.data, id: r.id });
const stripId = o => { const { id, ...rest } = o; return rest; };

async function loadAll() {
  const [st, rec] = await Promise.all([sb.from('settings').select('data').maybeSingle(), sb.from('records').select('id,kind,data').limit(50000)]);
  S.settings = must(st)?.data || {};
  const rows = must(rec);
  KINDS.forEach(k => { S[k] = rows.filter(r => r.kind === k).map(rowToObj); });
}
async function save(kind, obj) {
  const id = obj.id || uuid();
  must(await sb.from('records').upsert({ id, user_id: S.user.id, kind, data: stripId(obj), updated_at: new Date().toISOString() }));
  const saved = { ...obj, id };
  S[kind] = obj.id ? S[kind].map(x => (x.id === id ? saved : x)) : [...S[kind], saved];
  return saved;
}
async function remove(kind, id) {
  must(await sb.from('records').delete().eq('id', id));
  S[kind] = S[kind].filter(x => x.id !== id);
  if (kind === 'person') {
    must(await sb.from('records').delete().eq('kind', 'visit').eq('data->>personId', id));
    S.visit = S.visit.filter(v => v.personId !== id);
  }
}
async function saveSettings(patch) {
  const next = { ...S.settings, ...patch };
  must(await sb.from('settings').upsert({ user_id: S.user.id, data: next }));
  S.settings = next;
}
async function exportAll() {
  const out = { version: 1, exported_at: new Date().toISOString(), settings: S.settings };
  KINDS.forEach(k => { out[k] = S[k]; });
  return out;
}
async function importAll(b) {
  must(await sb.from('records').delete().eq('user_id', S.user.id));
  const rows = [];
  KINDS.forEach(k => (Array.isArray(b[k]) ? b[k] : []).forEach(r => rows.push({ id: /^[0-9a-f-]{36}$/i.test(r.id || '') ? r.id : uuid(), user_id: S.user.id, kind: k, data: stripId(r) })));
  for (let i = 0; i < rows.length; i += 500) must(await sb.from('records').upsert(rows.slice(i, i + 500)));
  if (b.settings) await saveSettings(b.settings);
}
function sessionUser(session) { const u = session.user; return { id: u.id, username: u.email, name: u.user_metadata?.name || u.email }; }

function toast(msg) { const t = $('#toast'); t.textContent = msg; t.classList.add('show'); clearTimeout(toast.t); toast.t = setTimeout(() => t.classList.remove('show'), 2400); }
async function guard(fn) { try { await fn(); } catch (e) { toast(e.message || 'Erro'); } }

// ---------- diálogos ----------
function field(f) {
  const v = f.value ?? '';
  if (f.type === 'check') return `<label class="ck"><input type="checkbox" name="${f.name}" ${v ? 'checked' : ''}> ${esc(f.label)}</label>`;
  let input;
  if (f.type === 'select') input = `<select name="${f.name}">${f.options.map(([val, lab]) => `<option value="${esc(val)}" ${String(val) === String(v) ? 'selected' : ''}>${esc(lab)}</option>`).join('')}</select>`;
  else if (f.type === 'textarea') input = `<textarea name="${f.name}" rows="3">${esc(v)}</textarea>`;
  else input = `<input type="${f.type || 'text'}" name="${f.name}" value="${esc(v)}" ${f.min != null ? `min="${f.min}"` : ''} ${f.max != null ? `max="${f.max}"` : ''} ${f.step ? `step="${f.step}"` : ''} ${f.required ? 'required' : ''} ${f.auto ? `autocomplete="${f.auto}"` : ''}>`;
  return `<label class="f">${esc(f.label)}</label>${input}`;
}
function dialog({ title, fields = [], html = '', ok = 'Salvar', extra = [], onSubmit }) {
  return new Promise(resolve => {
    const dlg = document.createElement('dialog');
    dlg.innerHTML = `<form method="dialog"><h3>${esc(title)}</h3>${html}${fields.map(field).join('')}<div class="actions">
      ${extra.map((e, i) => `<button type="button" class="btn flat ${e.danger ? 'danger-t' : ''}" data-x="${i}">${esc(e.label)}</button>`).join('')}
      <span style="flex:1"></span><button type="button" class="btn flat" data-cancel>Cancelar</button><button class="btn flat" value="ok">${esc(ok)}</button></div></form>`;
    document.body.appendChild(dlg);
    const close = v => { dlg.close(); dlg.remove(); resolve(v); };
    dlg.addEventListener('cancel', () => close(null));
    $('[data-cancel]', dlg).onclick = () => close(null);
    dlg.querySelectorAll('[data-x]').forEach(b => { b.onclick = async () => { const r = await extra[b.dataset.x].run(); if (r !== false) close(null); }; });
    $('form', dlg).onsubmit = async e => {
      e.preventDefault();
      const fd = new FormData(e.target), vals = {};
      fields.forEach(f => { vals[f.name] = f.type === 'check' ? fd.get(f.name) === 'on' : fd.get(f.name); });
      try { if (onSubmit) await onSubmit(vals, dlg); close(vals); } catch (err) { toast(err.message); }
    };
    dlg.showModal();
    const first = dlg.querySelector('input:not([type=checkbox]),textarea'); if (first && !first.value) first.focus();
  });
}
const confirmDlg = (title, text, ok = 'Apagar') => dialog({ title, html: `<p class="sub">${esc(text)}</p>`, ok });

// ---------- cálculos ----------
function profileGoal(p) { return p === 'regular' ? 50 : p === 'auxiliar' ? 30 : p === 'auxiliar15' ? 15 : 0; }
const PROFILES = [['regular', 'Pioneiro Regular'], ['auxiliar', 'Pioneiro Auxiliar (30h)'], ['auxiliar15', 'Pioneiro Auxiliar (15h)'], ['publicador', 'Publicador']];
const profileName = p => (PROFILES.find(x => x[0] === p) || PROFILES[0])[1].replace(/ \(.*\)/, '');
const profile = () => S.settings.profile || 'regular';
const goalFor = mk => (S.settings.goals && S.settings.goals[mk] != null ? Number(S.settings.goals[mk]) : profileGoal(profile()));

function monthStats(mk) {
  const t = S.time.filter(x => monthKey(x.date) === mk);
  const ldc = t.filter(x => x.ldc).reduce((a, x) => a + Number(x.minutes), 0);
  const min = t.filter(x => !x.ldc).reduce((a, x) => a + Number(x.minutes), 0);
  const rep = S.report.find(r => r.month === mk) || {};
  const visits = S.visit.filter(v => monthKey(v.date) === mk);
  const has = k => visits.filter(v => (v.kinds || []).includes(k)).length;
  return { ministry: min, ldc, total: min + ldc, studies: Number(rep.studies || 0), visits: visits.length, revisitas: has('revisita'), estudos: has('estudo'), videos: has('video'), rep };
}
function monthPlanned(mk) { return S.plan.filter(x => monthKey(x.date) === mk).reduce((a, x) => a + Number(x.minutes), 0); }

// ---------- timer ----------
const timer = {
  get st() { try { return JSON.parse(localStorage.getItem('timer')) || { acc: 0, start: null }; } catch { return { acc: 0, start: null }; } },
  set st(v) { localStorage.setItem('timer', JSON.stringify(v)); },
  elapsed() { const s = this.st; return s.acc + (s.start ? Date.now() - s.start : 0); },
  running() { return !!this.st.start; },
  toggle() { const s = this.st; if (s.start) { s.acc += Date.now() - s.start; s.start = null; } else s.start = Date.now(); this.st = s; },
  reset() { this.st = { acc: 0, start: null }; },
};
const fmtClock = ms => { const t = Math.floor(ms / 1000), h = Math.floor(t / 3600), m = Math.floor(t / 60) % 60, sec = t % 60; return h ? `${h}:${pad(m)}:${pad(sec)}` : `${m}:${pad(sec)}`; };
let tickInterval;

// ---------- layout ----------
let drawerOpen = false, menuOpen = null;
const TABS = [['home', 'Início', ICON.home], ['report', 'Relatório', ICON.chart], ['people', 'Interessados', ICON.people], ['territory', 'Território', ICON.map], ['agenda', 'Agenda', ICON.cal]];
const route = () => { const h = location.hash.replace(/^#\/?/, '') || 'home'; const [name, ...rest] = h.split('/'); return { name, arg: rest.join('/') }; };
const go = h => { location.hash = '#/' + h; };

function shell({ title, left = 'menu', right = '', body, fab = '', tabs = true, titleHtml }) {
  const r = route();
  const active = r.name === 'chart' ? 'report' : r.name === 'person' ? 'people' : r.name;
  return `<header class="bar">
    <button class="ib" data-act="${left === 'menu' ? 'drawer' : 'back'}" aria-label="${left === 'menu' ? 'Menu' : 'Voltar'}">${left === 'menu' ? ICON.menu : ICON.back}</button>
    <div class="hdr-wrap" style="flex:1;min-width:0">${titleHtml || `<h1>${esc(title)}</h1>`}</div>${right}</header>
    <main id="main">${body}</main>${fab}
    ${tabs ? `<nav class="tabs">${TABS.map(([k, l, i]) => `<a href="#/${k}" class="${active === k ? 'on' : ''}">${i}${l}</a>`).join('')}</nav>` : ''}`;
}
function drawerHtml() {
  const name = S.user?.name || S.user?.username || '';
  return `<div class="scrim" data-act="drawer-close"></div><aside class="drawer">
    <div class="head"><div class="avatar">${esc(name.charAt(0).toUpperCase())}</div><div><div style="font-size:17px">${esc(name)}</div><div style="font-size:13px;opacity:.9">${esc(profileName(profile()))}</div></div></div>
    <a data-go="help">${ICON.help}Ajuda</a>
    <a data-go="backup">${ICON.cloud}Cópia de Segurança</a>
    <a data-go="settings">${ICON.gear}Configurações</a><hr>
    <a data-act="logout">${ICON.logout}Sair</a>
    <button class="btn" data-act="add-report">Adicionar ao relatório</button></aside>`;
}

// ---------- telas ----------
function viewHome() {
  const mk = monthKey(today()), st = monthStats(mk), goal = goalFor(mk);
  const left = Math.max(0, goal - hoursOf(st.total));
  const showTimer = S.settings.timer !== false;
  const dl = new Date(); const daysLeft = new Date(dl.getFullYear(), dl.getMonth() + 1, 0).getDate() - dl.getDate() + 1;
  const nextVisits = S.person.length;
  return shell({
    title: 'Assistente do Ministério', right: `<button class="ib" data-act="go-people-search">${ICON.search}</button><button class="ib" data-act="reload">${ICON.sync}</button>`,
    body: `
    ${showTimer ? `<div class="card"><h2>Cronômetro de serviço</h2><div class="timer">
      <button class="circ" data-act="timer-toggle" id="tbtn">${timer.running() ? ICON.pause : ICON.play}</button><span class="t" id="tclock">${fmtClock(timer.elapsed())}</span>
      <button class="circ" data-act="timer-stop">${ICON.stop}</button></div></div>` : ''}
    <div class="card"><h2>Estatísticas da pregação</h2><div style="display:flex;justify-content:space-between;align-items:center"><span class="sub">${monthLabel(mk)}</span><span class="big">${st.visits} visita${st.visits === 1 ? '' : 's'}</span></div>
      <div class="stats4"><div>${ICON.people}<b>${st.revisitas}</b><span class="sub">revisitas</span></div><div>${ICON.book}<b>${st.estudos}</b><span class="sub">estudos</span></div><div>${ICON.chart}<b>${st.videos}</b><span class="sub">vídeos</span></div><div>${ICON.user}<b>${nextVisits}</b><span class="sub">interessados</span></div></div></div>
    <div class="card"><h2>Relatório do mês atual<span class="sub">${monthLabel(mk)}</span></h2>
      <div class="row"><span>Horas</span><span class="v">${fmtDur(st.ministry)}</span></div>
      <div class="row"><span>Horas no LDC</span><span class="v">${fmtDur(st.ldc)}</span></div>
      <div class="row"><span>Estudos</span><span class="v">${st.studies}</span></div>
      <div class="sub" style="margin-top:6px">Perfil: ${esc(profileName(profile()))}</div></div>
    ${goal ? `<div class="card"><h2>Alvo de horas mensal</h2><div class="row"><span class="sub">Para atingir o alvo de ${goal} horas este mês.</span><span class="big">${fmtNum(left)}h</span></div>
      <div class="sub">${left > 0 ? `Cerca de ${fmtNum(left / daysLeft)}h por dia nos ${daysLeft} dias restantes.` : 'Alvo atingido! 🎉'}</div></div>` : ''}
    <div class="card"><h2>Sugestões</h2><a class="sub" href="#/backup" style="text-decoration:none"><b style="color:var(--blue)">Fazer uma cópia de segurança</b><br>Exporte seus dados para mantê-los a salvo.</a></div>`,
    fab: `<button class="fab" data-act="add-time" aria-label="Adicionar horas">+</button>`,
  });
}

let reportTab = 'month', reportMonth = monthKey(today());
function viewReport() {
  const tabs = `<div class="tabs3">${[['list', 'Lista de serviço'], ['month', 'Mês'], ['year', 'Ano de serviço']].map(([k, l]) => `<button data-act="rtab" data-v="${k}" class="${reportTab === k ? 'on' : ''}">${l}</button>`).join('')}</div>`;
  const nav = `<div class="monthnav"><button data-act="mprev">‹</button><b>${monthLabel(reportMonth).split(' ')[0]}</b><button data-act="mnext">›</button></div>`;
  let body = '';
  if (reportTab === 'month') {
    const st = monthStats(reportMonth), goal = goalFor(reportMonth), left = Math.max(0, goal - hoursOf(st.total));
    const isCur = reportMonth === monthKey(today());
    const days = isCur ? new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate() - new Date().getDate() + 1 : new Date(+reportMonth.slice(0, 4), +reportMonth.slice(5), 0).getDate();
    const perDay = goal && left > 0 ? left / Math.max(days, 1) : 0;
    body = `${nav}<div class="sec">Ministério</div>
      <div class="row"><span>Total de horas</span><span class="v">${fmtDur(st.total)}</span></div>
      <div class="row sub" style="padding-left:12px"><span>Horas no ministério</span><span class="v">${fmtDur(st.ministry)}</span></div>
      <div class="row sub" style="padding-left:12px"><span>Horas no LDC</span><span class="v">${fmtDur(st.ldc)}</span></div>
      <div class="row"><span>Estudos Individuais <button class="pen" data-act="edit-studies">✎</button></span><span class="v">${st.studies}</span></div>
      <div class="sec">Objetivo do mês <button class="pen" data-act="edit-goal">✎</button></div>
      <div class="row"><span>Horas</span><span class="v">${goal}</span></div>
      <div class="row"><span>Horas que faltam fazer</span><span class="v">${fmtNum(left)}</span></div>
      <div class="row"><span>Horas restantes por dia</span><span class="v ${perDay > 3 ? 'red' : ''}">${fmtNum(perDay)}</span></div>
      <div class="sec">Perfil <button class="pen" data-act="edit-profile">✎</button></div><div>${esc(profileName(profile()))}</div>
      <div style="margin-top:20px"><button class="btn full" data-act="share">Compartilhar relatório</button></div>`;
  } else if (reportTab === 'list') {
    const items = S.time.filter(x => monthKey(x.date) === reportMonth).sort((a, b) => b.date.localeCompare(a.date));
    body = `${nav}${items.length ? `<div class="card list">${items.map(x => `<div class="item" data-act="edit-time" data-id="${x.id}"><div class="mid"><div class="nm"><span>${fmtDateLong(x.date)}</span><span>${fmtDur(x.minutes)}</span></div>
      <div class="nt">${x.ldc ? '<span class="tag">LDC</span>' : ''}${esc(x.note || '')}</div></div></div>`).join('')}</div>` : '<div class="empty">Nenhum registro neste mês.<br>Toque em + para adicionar horas.</div>'}`;
  } else {
    const sy = serviceYearOf(reportMonth), months = Array.from({ length: 12 }, (_, i) => addMonths(`${sy - 1}-09`, i));
    let tot = 0, ld = 0, stu = 0;
    const rows = months.map(mk => { const s = monthStats(mk); tot += s.total; ld += s.ldc; stu += s.studies;
      return `<div class="row"><span style="text-transform:capitalize">${MESES[+mk.slice(5) - 1]}</span><span class="v">${fmtDur(s.total)}${s.studies ? ` · ${s.studies} est.` : ''}</span></div>`; }).join('');
    body = `<div class="monthnav"><button data-act="yprev">‹</button><b>Ano de serviço ${sy}</b><button data-act="ynext">›</button></div>
      <div class="card">${rows}<div class="row" style="border-top:1px solid var(--line);font-weight:700"><span>Total</span><span class="v">${fmtDur(tot)}</span></div>
      <div class="row sub"><span>Horas no LDC</span><span class="v">${fmtDur(ld)}</span></div><div class="row sub"><span>Estudos individuais</span><span class="v">${stu}</span></div></div>`;
  }
  return shell({
    title: monthLabel(reportMonth), right: `<button class="ib" data-act="share">${ICON.share}</button>
      <button class="ib" data-act="report-menu">${ICON.more}</button>`,
    body: tabs + body, fab: reportTab === 'list' ? `<button class="fab" data-act="add-time">+</button>` : '',
  });
}

const PALETTE = ['#2a9d8f', '#e0245e', '#f0b429', '#1e7bff', '#5b4bb5', '#c2457a', '#4ab59a', '#00798c', '#e8508e', '#8e6c3a', '#7a7a7a', '#3d5a80'];
let chartMetric = 'hours', chartYears = null, chartMenu = null;
const METRICS = [['hours', 'Horas no ministério'], ['videos', 'Vídeos mostrados'], ['revisitas', 'Revisitas'], ['estudos', 'Estudos']];
function metricValue(mk) {
  const s = monthStats(mk);
  return chartMetric === 'hours' ? hoursOf(s.ministry) : chartMetric === 'videos' ? s.videos : chartMetric === 'revisitas' ? s.revisitas : s.estudos;
}
function viewChart() {
  const years = new Set();
  [...S.time, ...S.visit].forEach(x => years.add(serviceYearOf(monthKey(x.date))));
  years.add(serviceYearOf(monthKey(today())));
  const all = [...years].sort();
  if (!chartYears) chartYears = new Set(all.slice(-4));
  const sel = all.filter(y => chartYears.has(y));
  const series = sel.map(y => ({ y, vals: Array.from({ length: 12 }, (_, i) => metricValue(addMonths(`${y - 1}-09`, i))) }));
  const max = Math.max(10, ...series.flatMap(s => s.vals));
  const nice = Math.ceil(max / 30) * 30 || 30;
  const W = 340, H = 230, L = 34, T = 12, B = 22, R = 8, pw = W - L - R, ph = H - T - B;
  const X = i => L + (pw * i) / 11, Y = v => T + ph - (ph * v) / nice;
  let svg = `<svg viewBox="0 0 ${W} ${H}">`;
  for (let g = 0; g <= 3; g++) { const v = (nice * g) / 3; svg += `<line x1="${L}" x2="${W - R}" y1="${Y(v)}" y2="${Y(v)}" stroke="#ddd"/><text x="${L - 4}" y="${Y(v) + 3}" font-size="9" text-anchor="end" fill="#777">${Math.round(v)}</text>`; }
  ['set.', 'out.', 'nov.', 'dez.', 'jan.', 'fev.', 'mar.', 'abr.', 'mai.', 'jun.', 'jul.', 'ago.'].forEach((m, i) => { if (i % 2 === 0) svg += `<text x="${X(i)}" y="${H - 6}" font-size="9" text-anchor="middle" fill="#777">${m}</text>`; });
  series.forEach(s => {
    const c = PALETTE[all.indexOf(s.y) % PALETTE.length], pts = s.vals.map((v, i) => `${X(i)},${Y(v)}`).join(' ');
    svg += `<polygon points="${X(0)},${Y(0)} ${pts} ${X(11)},${Y(0)}" fill="${c}" opacity=".12"/><polyline points="${pts}" fill="none" stroke="${c}" stroke-width="2" stroke-linejoin="round"/>`;
    s.vals.forEach((v, i) => { svg += `<circle cx="${X(i)}" cy="${Y(v)}" r="2.6" fill="#fff" stroke="${c}" stroke-width="1.5"/>`; });
  });
  svg += '</svg>';
  const legend = sel.map(y => `<span><i style="background:${PALETTE[all.indexOf(y) % PALETTE.length]}"></i>${y}</span>`).join('');
  const best = ([k, label]) => {
    const save = chartMetric; chartMetric = k; let b = { v: 0, mk: null };
    const mks = new Set([...S.time, ...S.visit].map(x => monthKey(x.date)));
    mks.forEach(mk => { const v = metricValue(mk); if (v > b.v) b = { v, mk }; });
    chartMetric = save;
    const [yy, mm] = (b.mk || '0-0').split('-');
    return `<div class="row"><span>${label}</span><span class="v">${b.mk ? `${fmtNum(b.v)} (${MES_CURTO[+mm - 1]} ${yy})` : '—'}</span></div>`;
  };
  const titleHtml = `<h1 data-act="chart-metric-menu" style="cursor:pointer">${esc(METRICS.find(m => m[0] === chartMetric)[1])} ▾</h1>
    ${chartMenu === 'metric' ? `<div class="drop" style="left:0;right:auto">${METRICS.map(([k, l]) => `<a data-act="chart-metric" data-v="${k}">${l}</a>`).join('')}</div>` : ''}`;
  return shell({
    left: 'back', titleHtml, tabs: true,
    right: `<button class="ib" data-act="chart-years-menu">${ICON.more}</button>${chartMenu === 'years' ? `<div class="drop" style="top:56px">${all.map(y => `<label>${y}<input type="checkbox" data-act="chart-year" data-v="${y}" ${chartYears.has(y) ? 'checked' : ''}></label>`).join('')}</div>` : ''}`,
    body: `<div class="card chartbox">${svg}<div class="legend">${legend}</div></div><div class="sec">Melhores Meses</div><div class="card">${METRICS.map(best).join('')}</div>`,
  });
}

let peopleQuery = '', peopleSearchOpen = false;
function personVisits(id) { return S.visit.filter(v => v.personId === id).sort((a, b) => b.date.localeCompare(a.date)); }
const personColor = id => PALETTE[[...id].reduce((a, c) => a + c.charCodeAt(0), 0) % PALETTE.length];
function viewPeople() {
  const q = peopleQuery.toLowerCase();
  let list = S.person.map(p => ({ ...p, last: (personVisits(p.id)[0] || {}).date || p.created || '', n: personVisits(p.id).length }));
  if (q) list = list.filter(p => [p.name, p.address, p.bairro, p.notes, p.phone].join(' ').toLowerCase().includes(q));
  const groups = {};
  list.forEach(p => { (groups[p.bairro || 'Sem bairro'] ||= []).push(p); });
  const names = Object.keys(groups).sort((a, b) => a.localeCompare(b));
  const body = `${peopleSearchOpen ? `<div class="searchbar"><input type="search" id="pq" placeholder="Buscar nome, endereço, bairro…" value="${esc(peopleQuery)}"></div>` : ''}
    ${names.length ? names.map(n => `<div class="group">${esc(n)}</div><div class="list">${groups[n].sort((a, b) => b.last.localeCompare(a.last)).map(p => `
      <div class="item" data-act="open-person" data-id="${p.id}"><div class="avatar" style="background:${personColor(p.id)}">${esc((p.name || '?')[0].toUpperCase())}${p.n ? `<i>${p.n}</i>` : ''}</div>
      <div class="mid"><div class="nm"><span>${esc(p.name)}</span><small>${p.last ? esc(fmtDateLong(p.last)) : ''}</small></div><div class="ad">${esc(p.address || '')}</div><div class="nt">${esc(p.notes || '')}</div></div></div>`).join('')}</div>`).join('')
      : '<div class="empty">Nenhum interessado ainda.<br>Toque no botão + para adicionar.</div>'}`;
  return shell({ title: 'Interessados', right: `<button class="ib" data-act="people-search">${ICON.search}</button><button class="ib" data-act="add-person">${ICON.user}</button>`, body });
}
function mapLink(addr) {
  const q = encodeURIComponent(addr);
  return S.settings.osm ? `https://www.openstreetmap.org/search?query=${q}` : `https://www.google.com/maps/search/?api=1&query=${q}`;
}
const VISIT_KINDS = [['revisita', 'Revisita'], ['estudo', 'Estudo bíblico'], ['video', 'Vídeo mostrado'], ['primeira', 'Primeira visita'], ['ausente', 'Não estava']];
function viewPerson(id) {
  const p = S.person.find(x => x.id === id);
  if (!p) return viewPeople();
  const vs = personVisits(id);
  return shell({
    left: 'back', title: p.name, right: `<button class="ib" data-act="edit-person" data-id="${id}">✎</button>`, tabs: true,
    body: `<div class="card"><div class="row"><span class="sub">Endereço</span></div><div>${esc(p.address || '—')}${p.bairro ? ` <span class="tag">${esc(p.bairro)}</span>` : ''}</div>
      ${p.address ? `<p><a href="${mapLink((p.address || '') + ' ' + (p.bairro || ''))}" target="_blank" rel="noopener" style="color:var(--pink-d)">Abrir no mapa</a></p>` : ''}
      ${p.phone ? `<div class="row"><span class="sub">Telefone</span></div><div><a href="tel:${esc(p.phone)}" style="color:var(--pink-d)">${esc(p.phone)}</a></div>` : ''}
      ${p.notes ? `<div class="row"><span class="sub">Anotações</span></div><div style="white-space:pre-wrap">${esc(p.notes)}</div>` : ''}</div>
      <div class="sec">Visitas (${vs.length})</div>
      ${vs.length ? `<div class="card list">${vs.map(v => `<div class="item" data-act="edit-visit" data-id="${v.id}"><div class="mid"><div class="nm"><span>${fmtDateLong(v.date)}</span></div><div class="nt">${(v.kinds || []).map(k => `<span class="tag">${esc((VISIT_KINDS.find(x => x[0] === k) || [k, k])[1])}</span>`).join('')}${esc(v.note || '')}</div></div></div>`).join('')}</div>` : '<div class="empty">Nenhuma visita registrada.</div>'}
      <p><button class="btn danger flat" style="color:#c0392b" data-act="del-person" data-id="${id}">Apagar interessado</button></p>`,
    fab: `<button class="fab" data-act="add-visit" data-id="${id}">+</button>`,
  });
}

function viewTerritory() {
  const list = [...S.territory].sort((a, b) => (a.name || '').localeCompare(b.name || '', 'pt', { numeric: true }));
  return shell({
    title: 'Território', body: list.length ? `<div class="cardlist">${list.map(t => {
      const days = t.lastWorked ? Math.floor((Date.now() - parseYmd(t.lastWorked)) / 864e5) : null;
      return `<div class="card" data-act="edit-territory" data-id="${t.id}"><h2>${esc(t.name)}<span class="pill ${days == null || days > 180 ? 'warn' : ''}">${days == null ? 'nunca trabalhado' : days === 0 ? 'hoje' : `há ${days} dia${days === 1 ? '' : 's'}`}</span></h2>
      ${t.assignee ? `<div class="sub">Responsável: ${esc(t.assignee)}</div>` : ''}<div class="sub" style="white-space:pre-wrap">${esc(t.notes || '')}</div>
      ${t.lastWorked ? `<div class="sub">Último trabalho: ${fmtDateLong(t.lastWorked)}</div>` : ''}
      <div style="margin-top:6px"><button class="btn flat" data-act="terr-today" data-id="${t.id}">Marcar como trabalhado hoje</button></div></div>`; }).join('')}</div>` : '<div class="empty">Nenhum cartão de território.<br>Toque em + para adicionar.</div>',
    fab: `<button class="fab" data-act="add-territory">+</button>`,
  });
}

let agendaOffset = 0;
function calendar(mk) {
  const [y, m] = mk.split('-').map(Number), first = new Date(y, m - 1, 1), n = new Date(y, m, 0).getDate();
  const ws = S.settings.weekStart === 1 ? 1 : 0;
  const names = [...DIAS.slice(ws), ...DIAS.slice(0, ws)];
  const lead = (first.getDay() - ws + 7) % 7;
  const cells = [];
  for (let i = 0; i < lead; i++) { const d = new Date(y, m - 1, 1 - lead + i); cells.push({ d: d.getDate(), out: true }); }
  for (let d = 1; d <= n; d++) cells.push({ d, date: `${mk}-${pad(d)}` });
  while (cells.length % 7) cells.push({ d: cells.length - lead - n + 1, out: true });
  const plan = Object.fromEntries(S.plan.map(p => [p.date, p]));
  let rows = '';
  for (let i = 0; i < cells.length; i += 7) rows += `<tr>${cells.slice(i, i + 7).map(c => c.out ? `<td class="out">${c.d}</td>` : `<td data-act="plan-day" data-date="${c.date}" class="${c.date === today() ? 'today' : ''}">${c.d}${plan[c.date] ? `<span class="h">${fmtDur(plan[c.date].minutes)}</span>` : ''}</td>`).join('')}</tr>`;
  return `<table class="cal"><caption>${monthLabel(mk)}</caption><tr>${names.map(d => `<th>${d}</th>`).join('')}</tr>${rows}</table>`;
}
function viewAgenda() {
  const cur = monthKey(today()), base = addMonths(cur, agendaOffset);
  const sy = serviceYearOf(base), yearStart = `${sy - 1}-09`, yearEnd = `${sy}-08`;
  const yearPlanned = S.plan.filter(p => monthKey(p.date) >= yearStart && monthKey(p.date) <= yearEnd).reduce((a, p) => a + Number(p.minutes), 0);
  const mk = base;
  return shell({
    title: 'Agenda para a pregação', right: `<button class="ib" data-act="agenda-prev">‹</button><button class="ib" data-act="agenda-next">›</button>`,
    body: `<div class="card"><h2>Ano de serviço ${sy}</h2>
      <div class="row"><span>Horas planejadas para ${MESES[+mk.slice(5) - 1]}:</span><span class="v">${fmtNum(hoursOf(monthPlanned(mk)))}/${goalFor(mk)}h</span></div>
      <div class="row"><span>Horas planejadas para o ano de serviço:</span><span class="v">${fmtNum(hoursOf(yearPlanned))}h</span></div>
      <div class="sub">Dica: toque em um dia para definir as horas planejadas.</div></div>
      ${calendar(mk)}${calendar(addMonths(mk, 1))}`,
  });
}

function viewHelp() {
  return shell({ left: 'back', title: 'Ajuda', body: `<div class="card"><h2>Como usar</h2><div class="sub" style="line-height:1.55">
    <b>Início</b> — cronômetro de serviço, estatísticas do mês e quanto falta para o alvo. Use + para lançar horas manualmente.<br><br>
    <b>Relatório</b> — totais do mês e do ano de serviço (setembro–agosto). No menu ⋮ há o gráfico comparando os anos.<br><br>
    <b>Interessados</b> — pessoas, endereços e visitas. Agrupados por bairro.<br><br>
    <b>Território</b> — cartões de território e quando foram trabalhados pela última vez.<br><br>
    <b>Agenda</b> — planeje horas por dia no calendário.<br><br>
    <b>Instalar no iPhone</b> — abra no Safari, toque em Compartilhar e escolha “Adicionar à Tela de Início”. Faça o login de novo dentro do app instalado.</div></div>` });
}
function viewBackup() {
  return shell({ left: 'back', title: 'Cópia de Segurança', body: `<div class="card"><h2>Exportar</h2><p class="sub">Baixa um arquivo .json com todos os seus dados.</p><button class="btn full" data-act="export">Exportar dados</button></div>
    <div class="card"><h2>Importar</h2><p class="sub">Substitui TODOS os dados da conta pelo conteúdo do arquivo.</p><button class="btn full" data-act="import">Importar arquivo…</button><input type="file" id="impfile" accept="application/json,.json" hidden></div>` });
}
function viewSettings() {
  const tg = (k, on) => `<button class="tg ${on ? 'on' : ''}" data-act="toggle" data-k="${k}" aria-pressed="${on}"></button>`;
  return shell({ left: 'back', title: 'Configurações', body: `
    <div class="card"><h2>Geral</h2>
      <div class="row"><div>Perfil<div class="sub">${esc(profileName(profile()))}</div></div><button class="btn flat" data-act="edit-profile">Alterar</button></div>
      <div class="row"><div>Cronômetro de serviço<div class="sub">Mostrar cartão de horas</div></div>${tg('timer', S.settings.timer !== false)}</div>
      <div class="row"><div>Primeiro dia da semana<div class="sub">Ligado = domingo; desligado = segunda</div></div>${tg('sunday', S.settings.weekStart !== 1)}</div>
      <div class="row"><div>Usar o Open Street Map<div class="sub">Em vez do Google Maps</div></div>${tg('osm', !!S.settings.osm)}</div></div>
    <div class="card"><h2>Conta</h2><div class="sub">E-mail: <b>${esc(S.user.username)}</b></div>
      <div style="margin-top:8px"><button class="btn flat" data-act="edit-name">Alterar nome</button><button class="btn flat" data-act="change-pw">Alterar senha</button><button class="btn flat" data-act="change-email">Alterar e-mail</button></div></div>
    <div class="card"><h2>Zona de perigo</h2><p class="sub">Excluir a conta apaga para sempre todos os seus dados (horas, interessados, visitas, territórios, agenda).</p>
      <button class="btn flat" style="color:#c0392b" data-act="delete-account">Excluir minha conta</button></div>` });
}

function viewLogin(mode = 'login') {
  return `<div class="login"><img class="logo" src="icons/icon.svg" alt=""><h1>Assistente do Ministério</h1>
    <div class="tabsw"><button data-act="lmode" data-v="login" class="${mode === 'login' ? 'on' : ''}">Entrar</button><button data-act="lmode" data-v="register" class="${mode === 'register' ? 'on' : ''}">Criar conta</button></div>
    <form id="lf" data-mode="${mode}">
      ${mode === 'register' ? '<label class="f">Seu nome</label><input type="text" name="name" autocomplete="name">' : ''}
      <label class="f">E-mail</label><input type="email" name="username" autocomplete="email" autocapitalize="none" required>
      <label class="f">Senha</label><input type="password" name="password" autocomplete="${mode === 'login' ? 'current-password' : 'new-password'}" required minlength="6">
      <div class="err" id="lerr"></div><button class="btn full" style="margin-top:12px">${mode === 'login' ? 'Entrar' : 'Criar conta'}</button>
      ${mode === 'login' ? '<p style="text-align:center;margin-top:14px"><a href="#" data-act="forgot" style="color:var(--pink-d)">Esqueci a senha</a></p>' : ''}</form></div>`;
}

// ---------- render ----------
let loginMode = 'login';
function render() {
  const app = $('#app');
  if (!CONFIGURED) { app.innerHTML = '<div class="login"><h1>Falta configurar</h1><p class="sub">Edite o arquivo <b>config.js</b> com a URL e a chave anon do seu projeto Supabase (veja o README).</p></div>'; return; }
  if (!S.token || !S.user) { app.innerHTML = viewLogin(loginMode); return; }
  const r = route();
  const views = { home: viewHome, report: viewReport, chart: viewChart, people: viewPeople, territory: viewTerritory, agenda: viewAgenda, help: viewHelp, backup: viewBackup, settings: viewSettings };
  const scroll = $('#main')?.scrollTop || 0;
  app.innerHTML = (r.name === 'person' ? viewPerson(r.arg) : (views[r.name] || viewHome)()) + (drawerOpen ? drawerHtml() : '') + (menuOpen === 'report' ? `<div class="scrim" style="background:transparent" data-act="close-menus"></div><div class="drop" style="position:absolute;top:56px">
    <a data-act="go-chart">Gráfico anual</a><a data-act="go-year">Ano de serviço</a></div>` : '');
  if ($('#main')) $('#main').scrollTop = scroll;
  const pq = $('#pq'); if (pq) { pq.oninput = e => { peopleQuery = e.target.value; const pos = e.target.selectionStart; render(); const n = $('#pq'); n.focus(); n.setSelectionRange(pos, pos); }; }
  clearInterval(tickInterval);
  if (r.name === 'home' && $('#tclock')) tickInterval = setInterval(() => { const c = $('#tclock'); if (c) c.textContent = fmtClock(timer.elapsed()); }, 1000);
}

// ---------- ações ----------
function timeDialog(entry) {
  const e = entry || { date: today(), minutes: 60, ldc: false, note: '' };
  return dialog({
    title: entry ? 'Editar tempo' : 'Adicionar tempo', ok: 'Definir',
    fields: [{ name: 'date', label: 'Data', type: 'date', value: e.date, required: true },
      { name: 'h', label: 'Horas', type: 'number', min: 0, max: 24, value: Math.floor(e.minutes / 60) },
      { name: 'm', label: 'Minutos', type: 'number', min: 0, max: 59, value: e.minutes % 60 },
      { name: 'ldc', label: 'Horas no LDC (construção/projetos teocráticos)', type: 'check', value: e.ldc },
      { name: 'note', label: 'Notas', value: e.note }],
    extra: entry ? [{ label: 'Apagar', run: async () => { await remove('time', entry.id); render(); } }] : [],
    onSubmit: async v => {
      const minutes = Number(v.h || 0) * 60 + Number(v.m || 0);
      if (minutes <= 0) throw new Error('Informe um tempo maior que zero');
      await save('time', { ...(entry || {}), date: v.date, minutes, ldc: v.ldc, note: v.note });
      render();
    },
  });
}
function personDialog(p) {
  p = p || {};
  const bairros = [...new Set(S.person.map(x => x.bairro).filter(Boolean))];
  return dialog({
    title: p.id ? 'Editar interessado' : 'Novo interessado',
    html: bairros.length ? `<datalist id="bl">${bairros.map(b => `<option value="${esc(b)}">`).join('')}</datalist>` : '',
    fields: [{ name: 'name', label: 'Nome', value: p.name, required: true }, { name: 'address', label: 'Endereço', value: p.address },
      { name: 'bairro', label: 'Bairro', value: p.bairro }, { name: 'phone', label: 'Telefone', type: 'text', value: p.phone },
      { name: 'notes', label: 'Anotações', type: 'textarea', value: p.notes }],
    onSubmit: async v => { await save('person', { ...p, ...v, name: v.name.trim(), created: p.created || today() }); render(); },
  }).then(r => { const l = $('#bl'); if (l) l.remove(); return r; });
}
function visitDialog(personId, v) {
  v = v || { date: today(), kinds: ['revisita'], note: '' };
  return dialog({
    title: v.id ? 'Editar visita' : 'Nova visita', fields: [{ name: 'date', label: 'Data', type: 'date', value: v.date, required: true },
      ...VISIT_KINDS.map(([k, l]) => ({ name: 'k_' + k, label: l, type: 'check', value: (v.kinds || []).includes(k) })),
      { name: 'note', label: 'Anotações', type: 'textarea', value: v.note }],
    extra: v.id ? [{ label: 'Apagar', run: async () => { await remove('visit', v.id); render(); } }] : [],
    onSubmit: async f => { await save('visit', { ...v, personId, date: f.date, note: f.note, kinds: VISIT_KINDS.map(x => x[0]).filter(k => f['k_' + k]) }); render(); },
  });
}
function territoryDialog(t) {
  t = t || {};
  return dialog({
    title: t.id ? 'Editar território' : 'Novo território',
    fields: [{ name: 'name', label: 'Nome / número do cartão', value: t.name, required: true }, { name: 'assignee', label: 'Responsável', value: t.assignee },
      { name: 'lastWorked', label: 'Último dia trabalhado', type: 'date', value: t.lastWorked }, { name: 'notes', label: 'Anotações', type: 'textarea', value: t.notes }],
    extra: t.id ? [{ label: 'Apagar', run: async () => { if (await confirmDlg('Apagar território?', t.name)) { await remove('territory', t.id); render(); } else return false; } }] : [],
    onSubmit: async v => { await save('territory', { ...t, ...v }); render(); },
  });
}
async function planDialog(date) {
  const cur = S.plan.find(p => p.date === date);
  await dialog({
    title: 'Definir tempo — ' + fmtDateLong(date), ok: 'Definir',
    fields: [{ name: 'h', label: 'Horas', type: 'number', min: 0, max: 24, value: cur ? Math.floor(cur.minutes / 60) : 1 },
      { name: 'm', label: 'Minutos', type: 'number', min: 0, max: 59, value: cur ? cur.minutes % 60 : 0 }, { name: 'note', label: 'Notas', value: cur?.note }],
    extra: cur ? [{ label: 'Limpar', run: async () => { await remove('plan', cur.id); render(); } }] : [],
    onSubmit: async v => {
      const minutes = Number(v.h || 0) * 60 + Number(v.m || 0);
      if (minutes <= 0) { if (cur) await remove('plan', cur.id); } else await save('plan', { ...(cur || {}), date, minutes, note: v.note });
      render();
    },
  });
}
async function profileDialog() {
  await dialog({ title: 'Perfil', fields: [{ name: 'profile', label: 'Perfil de serviço', type: 'select', value: profile(), options: PROFILES }],
    onSubmit: async v => { await saveSettings({ profile: v.profile }); render(); } });
}
function reportText(mk) {
  const s = monthStats(mk);
  return `Relatório de ${monthLabel(mk)}\nHoras: ${fmtDur(s.ministry).replace('h', '')}${s.ldc ? `\nHoras no LDC: ${fmtDur(s.ldc).replace('h', '')}` : ''}\nEstudos: ${s.studies}\nRevisitas: ${s.revisitas}\nVídeos mostrados: ${s.videos}`;
}
function download(name, text) {
  const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([text], { type: 'application/json' })); a.download = name; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 2000);
}
function doLogout() {
  if (sb) sb.auth.signOut().catch(() => {});
  S.token = null; S.user = null; S.time = S.report = S.person = S.visit = S.territory = S.plan = []; S.settings = {}; drawerOpen = false; render();
}

const actions = {
  drawer: () => { drawerOpen = true; render(); },
  'drawer-close': () => { drawerOpen = false; render(); },
  'close-menus': () => { menuOpen = null; chartMenu = null; render(); },
  back: () => { const r = route(); if (r.name === 'person' || r.name === 'chart') go(r.name === 'chart' ? 'report' : 'people'); else history.length > 1 ? history.back() : go('home'); },
  logout: () => doLogout(),
  reload: () => guard(async () => { await loadAll(); render(); toast('Atualizado'); }),
  'timer-toggle': () => { timer.toggle(); render(); },
  'timer-stop': () => guard(async () => {
    const ms = timer.elapsed(); if (ms < 1000) { timer.reset(); render(); return; }
    const min = Math.max(1, Math.round(ms / 60000));
    const ok = await dialog({ title: 'Parar cronômetro', html: `<p class="sub">Salvar ${fmtDur(min)} em ${fmtDateLong(today())}?</p>`, ok: 'Salvar', extra: [{ label: 'Descartar', run: async () => { timer.reset(); render(); } }] });
    if (ok) { await save('time', { date: today(), minutes: min, ldc: false, note: 'Cronômetro' }); timer.reset(); toast('Tempo salvo'); render(); }
  }),
  'add-time': () => timeDialog(),
  'edit-time': el => timeDialog(S.time.find(x => x.id === el.dataset.id)),
  'add-report': () => { drawerOpen = false; timeDialog(); },
  'go-people-search': () => { peopleSearchOpen = true; go('people'); },
  rtab: el => { reportTab = el.dataset.v; render(); },
  mprev: () => { reportMonth = addMonths(reportMonth, -1); render(); }, mnext: () => { reportMonth = addMonths(reportMonth, 1); render(); },
  yprev: () => { reportMonth = addMonths(reportMonth, -12); render(); }, ynext: () => { reportMonth = addMonths(reportMonth, 12); render(); },
  'edit-studies': async () => { const cur = S.report.find(r => r.month === reportMonth) || { month: reportMonth };
    await dialog({ title: 'Estudos individuais', fields: [{ name: 'n', label: 'Quantidade', type: 'number', min: 0, value: cur.studies || 0 }],
      onSubmit: async v => { await save('report', { ...cur, studies: Number(v.n || 0) }); render(); } }); },
  'edit-goal': async () => { await dialog({ title: 'Objetivo do mês', fields: [{ name: 'g', label: `Horas em ${monthLabel(reportMonth)}`, type: 'number', min: 0, value: goalFor(reportMonth) }],
    extra: [{ label: 'Padrão', run: async () => { const g = { ...(S.settings.goals || {}) }; delete g[reportMonth]; await saveSettings({ goals: g }); render(); } }],
    onSubmit: async v => { await saveSettings({ goals: { ...(S.settings.goals || {}), [reportMonth]: Number(v.g || 0) } }); render(); } }); },
  'edit-profile': () => profileDialog(),
  share: async () => { const text = reportText(reportMonth); try { if (navigator.share) await navigator.share({ text }); else { await navigator.clipboard.writeText(text); toast('Relatório copiado'); } } catch { /* cancelado */ } },
  'report-menu': () => { menuOpen = 'report'; render(); },
  'go-chart': () => { menuOpen = null; go('chart'); },
  'go-year': () => { menuOpen = null; reportTab = 'year'; render(); },
  'chart-metric-menu': () => { chartMenu = chartMenu === 'metric' ? null : 'metric'; render(); },
  'chart-years-menu': () => { chartMenu = chartMenu === 'years' ? null : 'years'; render(); },
  'chart-metric': el => { chartMetric = el.dataset.v; chartMenu = null; render(); },
  'chart-year': el => { const y = +el.dataset.v; chartYears.has(y) ? chartYears.delete(y) : chartYears.add(y); render(); },
  'people-search': () => { peopleSearchOpen = !peopleSearchOpen; if (!peopleSearchOpen) peopleQuery = ''; render(); const q = $('#pq'); if (q) q.focus(); },
  'add-person': () => personDialog(),
  'open-person': el => go('person/' + el.dataset.id),
  'edit-person': el => personDialog(S.person.find(x => x.id === el.dataset.id)),
  'del-person': async el => { const p = S.person.find(x => x.id === el.dataset.id); if (await confirmDlg('Apagar interessado?', `${p.name} e todas as visitas serão apagados.`)) { await remove('person', p.id); go('people'); } },
  'add-visit': el => visitDialog(el.dataset.id),
  'edit-visit': el => { const v = S.visit.find(x => x.id === el.dataset.id); return visitDialog(v.personId, v); },
  'add-territory': () => territoryDialog(),
  'edit-territory': el => territoryDialog(S.territory.find(x => x.id === el.dataset.id)),
  'terr-today': async el => { const t = S.territory.find(x => x.id === el.dataset.id); await save('territory', { ...t, lastWorked: today() }); render(); },
  'agenda-prev': () => { agendaOffset--; render(); }, 'agenda-next': () => { agendaOffset++; render(); },
  'plan-day': el => planDialog(el.dataset.date),
  export: () => guard(async () => { download(`ministerio-backup-${today()}.json`, JSON.stringify(await exportAll(), null, 2)); }),
  import: () => $('#impfile').click(),
  toggle: async el => { const k = el.dataset.k; const patch = k === 'sunday' ? { weekStart: S.settings.weekStart === 1 ? 0 : 1 } : { [k]: k === 'timer' ? S.settings.timer === false : !S.settings[k] }; await saveSettings(patch); render(); },
  'edit-name': () => dialog({ title: 'Seu nome', fields: [{ name: 'name', label: 'Nome', value: S.user.name }], onSubmit: async v => { S.user.name = v.name; await saveSettings({ displayName: v.name }); render(); } }),
  'change-pw': () => dialog({ title: 'Alterar senha', fields: [{ name: 'old', label: 'Senha atual', type: 'password' }, { name: 'new', label: 'Nova senha (mín. 6)', type: 'password' }],
    onSubmit: async v => { if (String(v.new).length < 6) throw new Error('A nova senha precisa de pelo menos 6 caracteres'); must(await sb.auth.signInWithPassword({ email: S.user.username, password: v.old })); must(await sb.auth.updateUser({ password: v.new })); toast('Senha alterada'); } }),
  forgot: () => dialog({ title: 'Recuperar senha', html: '<p class="sub">Enviaremos um link para o seu e-mail.</p>', ok: 'Enviar link',
    fields: [{ name: 'email', label: 'E-mail da conta', type: 'email', value: $('#lf [name=username]')?.value || '', required: true }],
    onSubmit: async v => { must(await sb.auth.resetPasswordForEmail(String(v.email).trim(), { redirectTo: location.origin + location.pathname })); toast('Se o e-mail existir, o link foi enviado'); } }),
  'change-email': () => dialog({ title: 'Alterar e-mail', html: '<p class="sub">Você receberá um link de confirmação. O e-mail só muda depois de confirmar.</p>', ok: 'Enviar',
    fields: [{ name: 'email', label: 'Novo e-mail', type: 'email', required: true }],
    onSubmit: async v => { must(await sb.auth.updateUser({ email: String(v.email).trim() }, { emailRedirectTo: location.origin + location.pathname })); toast('Confirme pelo link enviado ao e-mail'); } }),
  'delete-account': () => dialog({ title: 'Excluir conta', ok: 'Excluir para sempre',
    html: '<p class="sub">Esta ação não pode ser desfeita. Considere exportar um backup antes. Para confirmar, digite <b>EXCLUIR</b>.</p>',
    fields: [{ name: 'c', label: 'Confirmação', required: true }],
    onSubmit: async v => { if (String(v.c).trim().toUpperCase() !== 'EXCLUIR') throw new Error('Digite EXCLUIR para confirmar'); must(await sb.rpc('delete_my_account')); await sb.auth.signOut({ scope: 'local' }).catch(() => {}); doLogout(); toast('Conta excluída'); } }),
  lmode: el => { loginMode = el.dataset.v; render(); },
};

document.addEventListener('click', e => {
  const g = e.target.closest('[data-go]'); if (g) { drawerOpen = false; go(g.dataset.go); return; }
  const el = e.target.closest('[data-act]'); if (!el || el.matches('input[type=checkbox]')) return;
  if (el.tagName === 'A' && el.getAttribute('href') === '#') e.preventDefault();
  if (el.matches('dialog *')) return;
  const fn = actions[el.dataset.act]; if (fn) { if (!['chart-metric-menu', 'chart-years-menu', 'report-menu'].includes(el.dataset.act) && (chartMenu || menuOpen)) { chartMenu = null; menuOpen = null; } guard(() => fn(el)); }
});
document.addEventListener('change', e => {
  const el = e.target.closest('[data-act]');
  if (el && el.matches('input[type=checkbox]') && actions[el.dataset.act]) { guard(() => actions[el.dataset.act](el)); return; }
  if (e.target.id === 'impfile' && e.target.files[0]) {
    const f = e.target.files[0]; e.target.value = '';
    f.text().then(async txt => {
      let data; try { data = JSON.parse(txt); } catch { return toast('Arquivo inválido'); }
      if (!(await confirmDlg('Importar dados?', 'Todos os dados atuais da conta serão substituídos.', 'Importar'))) return;
      await guard(async () => { await importAll(data); await loadAll(); render(); toast('Dados importados'); });
    });
  }
});
document.addEventListener('submit', async e => {
  if (e.target.id !== 'lf') return;
  e.preventDefault();
  const fd = new FormData(e.target), mode = e.target.dataset.mode, err = $('#lerr');
  err.textContent = '';
  const btn = $('#lf button.btn'); btn.disabled = true;
  try {
    const email = String(fd.get('username')).trim(), password = String(fd.get('password'));
    let session;
    if (mode === 'register') {
      const d = must(await sb.auth.signUp({ email, password, options: { data: { name: String(fd.get('name') || '').trim() || email } } }));
      session = d.session;
      if (!session) { err.style.color = '#2a7d4f'; err.textContent = 'Conta criada! Confirme o e-mail que enviamos e depois entre.'; return; }
    } else session = must(await sb.auth.signInWithPassword({ email, password })).session;
    S.token = session.access_token; S.user = sessionUser(session);
    await loadAll(); if (S.settings.displayName) S.user.name = S.settings.displayName; go('home'); render();
  } catch (ex) { err.style.color = ''; err.textContent = ex.message; } finally { btn.disabled = false; }
});
window.addEventListener('hashchange', () => { drawerOpen = false; menuOpen = null; chartMenu = null; render(); window.scrollTo(0, 0); });

// ---------- início ----------
function recoveryDialog() {
  return dialog({ title: 'Definir nova senha', ok: 'Salvar senha', fields: [{ name: 'p1', label: 'Nova senha (mín. 6)', type: 'password', required: true }, { name: 'p2', label: 'Repita a nova senha', type: 'password', required: true }],
    onSubmit: async v => {
      if (v.p1.length < 6) throw new Error('A senha precisa de pelo menos 6 caracteres');
      if (v.p1 !== v.p2) throw new Error('As senhas não conferem');
      must(await sb.auth.updateUser({ password: v.p1 }));
      toast('Senha alterada!'); setTimeout(() => { history.replaceState(null, '', location.pathname); location.reload(); }, 800);
    } });
}
(async function init() {
  if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(() => {});
  const hp = new URLSearchParams(location.hash.replace(/^#\/?/, ''));
  if (hp.get('error_description')) { history.replaceState(null, '', location.pathname); setTimeout(() => toast(/expired|invalid/i.test(hp.get('error_description')) ? 'Link expirado ou inválido. Peça outro.' : hp.get('error_description')), 300); }
  if (sb) {
    // registrar antes de qualquer await para não perder o evento PASSWORD_RECOVERY
    sb.auth.onAuthStateChange((ev, session) => {
      if (ev === 'PASSWORD_RECOVERY') setTimeout(recoveryDialog, 0);
      if (ev === 'SIGNED_OUT' && S.user) setTimeout(doLogout, 0);
    });
    try {
      const { data } = await sb.auth.getSession();
      if (data.session) { S.token = data.session.access_token; S.user = sessionUser(data.session); await loadAll(); if (S.settings.displayName) S.user.name = S.settings.displayName; }
    } catch (e) { toast('Sem conexão com o servidor'); }
  }
  render();
})();
