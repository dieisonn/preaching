'use strict';
/* Meu relatório — PWA pessoal */

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
const fmtDur = min => { if (min > 0 && min < 1) return `${Math.max(1, Math.round(min * 60))}s`; min = Math.round(min); const h = Math.floor(min / 60), m = min % 60; return m ? `${h}:${pad(m)}h` : `${h}h`; };
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
  locate: '<svg viewBox="0 0 24 24"><path d="M12 8a4 4 0 100 8 4 4 0 000-8zm8.94 3A8.994 8.994 0 0013 3.06V1h-2v2.06A8.994 8.994 0 003.06 11H1v2h2.06A8.994 8.994 0 0011 20.94V23h2v-2.06A8.994 8.994 0 0020.94 13H23v-2zM12 19c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z"/></svg>',
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
    'Failed to fetch': 'Sem conexão com a internet', 'Load failed': 'Sem conexão com a internet', 'NetworkError': 'Sem conexão com a internet', 'New password should be different': 'A nova senha precisa ser diferente da atual', 'same_password': 'A nova senha precisa ser diferente da atual', 'not authenticated': 'Faça login novamente' };
  for (const k in t) if (String(m).includes(k)) return t[k];
  if (/Password should be at least/i.test(m)) return 'A senha precisa de pelo menos 6 caracteres';
  if (/rate limit/i.test(m)) return 'Muitas tentativas. Aguarde um pouco.';
  return m;
}
const rowToObj = r => ({ ...r.data, id: r.id });
const stripId = o => { const { id, ...rest } = o; return rest; };

// ----- modo offline: fila de alterações + cópia local -----
const Q_KEY = 'mr_queue', C_KEY = 'mr_cache';
const getQ = () => { try { return JSON.parse(localStorage.getItem(Q_KEY)) || []; } catch { return []; } };
const setQ = q => { try { localStorage.setItem(Q_KEY, JSON.stringify(q)); } catch { /* cheio */ } netBadge(); };
const isNet = e => !navigator.onLine || /Sem conexão/.test(String(e && e.message));
function netBadge() {
  let el = $('#net'); const n = getQ().length, off = !navigator.onLine;
  if (!n && !off) { if (el) el.remove(); return; }
  if (!el) { el = document.createElement('div'); el.id = 'net'; document.body.appendChild(el); }
  el.textContent = off ? `Sem internet${n ? ` · ${n} alteraç${n === 1 ? 'ão pendente' : 'ões pendentes'}` : ' · usando dados salvos'}` : `Sincronizando ${n} alteraç${n === 1 ? 'ão' : 'ões'}…`;
}
async function runOp(o) {
  if (o.t === 'up') must(await sb.from('records').upsert(o.row));
  else if (o.t === 'del') must(await sb.from('records').delete().eq('id', o.id));
  else if (o.t === 'delvisits') must(await sb.from('records').delete().eq('kind', 'visit').eq('data->>personId', o.id));
  else if (o.t === 'set') must(await sb.from('settings').upsert({ user_id: o.uid, data: o.data }));
}
let flushing = false;
async function flushQ() {
  if (flushing || !sb) return; flushing = true;
  try {
    let q = getQ();
    while (q.length) {
      try { await runOp(q[0]); q = q.slice(1); setQ(q); }
      catch (e) { if (isNet(e)) break; q = q.slice(1); setQ(q); toast('Uma alteração offline foi recusada pelo servidor'); }
    }
  } finally { flushing = false; netBadge(); }
}
async function exec(o) { // executa já; se estiver sem internet, guarda na fila
  if (!getQ().length) { try { await runOp(o); return; } catch (e) { if (!isNet(e)) throw e; } }
  setQ([...getQ(), o]);
}
function cacheSave() { try { const o = { uid: S.user.id, settings: S.settings }; KINDS.forEach(k => { o[k] = S[k]; }); localStorage.setItem(C_KEY, JSON.stringify(o)); } catch { /* cheio */ } }
function useCache() {
  try { const o = JSON.parse(localStorage.getItem(C_KEY)); if (!o || o.uid !== S.user.id) return false; S.settings = o.settings || {}; KINDS.forEach(k => { S[k] = o[k] || []; }); return true; } catch { return false; }
}
async function loadAll() {
  await flushQ();
  if (getQ().length) { if (useCache()) return; }
  try {
    const [st, rec] = await Promise.all([sb.from('settings').select('data').maybeSingle(), sb.from('records').select('id,kind,data').limit(50000)]);
    S.settings = must(st)?.data || {};
    const rows = must(rec);
    KINDS.forEach(k => { S[k] = rows.filter(r => r.kind === k).map(rowToObj); });
    cacheSave();
  } catch (e) { if (isNet(e) && useCache()) { netBadge(); return; } throw e; }
}
async function save(kind, obj) {
  const id = obj.id || uuid();
  await exec({ t: 'up', row: { id, user_id: S.user.id, kind, data: stripId(obj), updated_at: new Date().toISOString() } });
  const saved = { ...obj, id };
  S[kind] = obj.id && S[kind].some(x => x.id === id) ? S[kind].map(x => (x.id === id ? saved : x)) : [...S[kind], saved];
  cacheSave();
  return saved;
}
const KIND_NAME = { time: 'Tempo', report: 'Relatório', person: 'Interessado', visit: 'Visita', territory: 'Território', plan: 'Planejamento' };
let undoTimer, lastRem = { t: 0, items: [] };
function showUndo(label, restore) {
  let el = $('#undo'); if (!el) { el = document.createElement('div'); el.id = 'undo'; document.body.appendChild(el); }
  el.innerHTML = `<span>${esc(label)}</span><button type="button">Desfazer</button>`; el.classList.add('show');
  el.querySelector('button').onclick = async () => { el.classList.remove('show'); try { await restore(); render(); } catch (e) { toast(e.message || 'Erro'); } };
  clearTimeout(undoTimer); undoTimer = setTimeout(() => el.classList.remove('show'), 7000);
}
async function remove(kind, id, opts = {}) {
  const obj = S[kind].find(x => x.id === id), vs = kind === 'person' ? S.visit.filter(v => v.personId === id) : [];
  await exec({ t: 'del', id });
  S[kind] = S[kind].filter(x => x.id !== id);
  if (kind === 'person') {
    await exec({ t: 'delvisits', id });
    S.visit = S.visit.filter(v => v.personId !== id);
  }
  cacheSave();
  if (obj && !opts.silent) {
    if (Date.now() - lastRem.t > 1500) lastRem = { t: 0, items: [] };
    lastRem.t = Date.now(); lastRem.items.push({ kind, obj }, ...vs.map(v => ({ kind: 'visit', obj: v })));
    const items = lastRem.items, n = items.filter(i => i.kind === kind).length;
    showUndo(items.length > 1 ? `${items.length} itens apagados` : `${KIND_NAME[kind]} apagado`, async () => { for (const i of items) await save(i.kind, i.obj); lastRem = { t: 0, items: [] }; });
  }
}
async function saveSettings(patch) {
  const next = { ...S.settings, ...patch };
  await exec({ t: 'set', uid: S.user.id, data: next });
  S.settings = next; cacheSave();
}
async function exportAll() {
  const out = { version: 1, exported_at: new Date().toISOString(), settings: S.settings };
  KINDS.forEach(k => { out[k] = S[k]; });
  return out;
}
async function importAll(b) {
  await flushQ(); if (getQ().length) throw new Error('Sem conexão com a internet');
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
  else input = `<input type="${f.type || 'text'}" name="${f.name}" value="${esc(v)}" ${f.min != null ? `min="${f.min}"` : ''} ${f.max != null ? `max="${f.max}"` : ''} ${f.step ? `step="${f.step}"` : ''} ${f.required ? 'required' : ''} ${f.inputmode ? `inputmode="${f.inputmode}" maxlength="${f.inputmode === 'numeric' ? 4 : ''}"` : ''} ${f.auto ? `autocomplete="${f.auto}"` : ''}>`;
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
  const rep = S.report.find(r => r.month === mk) || {};
  const min = t.length ? t.filter(x => !x.ldc).reduce((a, x) => a + Number(x.minutes), 0) : Number(rep.hm || 0);
  const visits = S.visit.filter(v => monthKey(v.date) === mk);
  const has = k => visits.filter(v => (v.kinds || []).includes(k)).length;
  const studiesAuto = new Set(visits.filter(v => (v.kinds || []).includes('estudo')).map(v => v.personId)).size;
  const stu = rep.studiesSet ? Number(rep.studies || 0) : (studiesAuto || Number(rep.studies || 0));
  return { ministry: min, ldc, total: min + ldc, studies: stu, studiesAuto, visits: visits.length, revisitas: visits.length ? has('revisita') : Number(rep.rv || 0), estudos: stu, videos: visits.length ? has('video') : Number(rep.videos || 0), rep };
}
const progressBar = (done, goal) => { const p = goal > 0 ? Math.min(100, Math.round(done / goal * 100)) : 0; return `<div class="pbar" role="progressbar" aria-valuenow="${p}" aria-valuemin="0" aria-valuemax="100"><i style="width:${p}%"></i></div><div class="sub" style="display:flex;justify-content:space-between"><span>${fmtNum(done)}h de ${fmtNum(goal)}h</span><span>${p}%</span></div>`; };
function yearStats(sy) { // ano de serviço: set (sy-1) → ago (sy)
  const months = Array.from({ length: 12 }, (_, i) => addMonths(`${sy - 1}-09`, i));
  const goal = months.reduce((a, mk) => a + goalFor(mk), 0);
  const done = months.reduce((a, mk) => a + hoursOf(monthStats(mk).total), 0);
  const start = new Date(sy - 1, 8, 1), end = new Date(sy, 7, 31), now = new Date(); now.setHours(0, 0, 0, 0);
  const total = Math.round((end - start) / 864e5) + 1;
  const current = now >= start && now <= end;
  const elapsed = current ? Math.round((now - start) / 864e5) + 1 : (now > end ? total : 0);
  const daysLeft = current ? total - elapsed + 1 : 0;
  const left = Math.max(0, goal - done);
  return { goal, done, left, daysLeft, current, perDay: daysLeft ? left / daysLeft : 0, perMonth: daysLeft ? left / (daysLeft / 30.4) : 0, projected: current && elapsed > 14 ? done / elapsed * total : null };
}
function weekRange() { const ws = S.settings.weekStart === 1 ? 1 : 0, d = new Date(); d.setHours(0, 0, 0, 0); const off = (d.getDay() - ws + 7) % 7; const a = new Date(d); a.setDate(d.getDate() - off); const b = new Date(a); b.setDate(a.getDate() + 6); return [ymd(a), ymd(b)]; }
function streaks() {
  const ds = [...new Set(S.time.filter(t => Number(t.minutes) > 0).map(t => t.date))].sort(), set = new Set(ds);
  let best = 0, run = 0, prev = null;
  ds.forEach(d => { run = prev && Math.round((parseYmd(d) - parseYmd(prev)) / 864e5) === 1 ? run + 1 : 1; if (run > best) best = run; prev = d; });
  const d = new Date(); if (!set.has(ymd(d))) d.setDate(d.getDate() - 1);
  let cur = 0; while (set.has(ymd(d))) { cur++; d.setDate(d.getDate() - 1); }
  return { cur, best };
}
function paceCard(mk, st, goal, daysLeft) {
  if (!goal) return '';
  const done = dayMinutes(), todayMin = done[today()] || 0;
  const leftBefore = Math.max(0, goal - hoursOf(st.total) + hoursOf(todayMin)), target = leftBefore / Math.max(daysLeft, 1);
  const [a, b] = weekRange(); let wk = 0; Object.entries(done).forEach(([d, m]) => { if (d >= a && d <= b) wk += m; });
  const dim = new Date(+mk.slice(0, 4), +mk.slice(5), 0).getDate(), wGoal = S.settings.weeklyGoal != null ? Number(S.settings.weeklyGoal) : goal * 7 / dim, sk = streaks();
  return `<div class="card"><h2>Hoje e esta semana</h2>
    <div class="sub">Hoje · meta que se ajusta ao que falta</div>${target > 0 ? progressBar(hoursOf(todayMin), target) : '<div style="margin:4px 0">Alvo do mês já atingido 🎉</div>'}
    <div class="sub" style="margin-top:10px;display:flex;justify-content:space-between"><span>Semana · meta de ${fmtNum(wGoal)}h</span><button class="pen" data-act="edit-wgoal">✎</button></div>${progressBar(hoursOf(wk), wGoal)}
    <div class="sub" style="margin-top:8px">Dias seguidos de serviço: <b>${sk.cur}</b> · melhor sequência: <b>${sk.best}</b></div></div>`;
}
function compareYear(sy) { // mesmo período do ano de serviço anterior
  const months = i => Array.from({ length: 12 }, (_, k) => addMonths(`${sy - 1 - i}-09`, k));
  const curMk = monthKey(today()), isCur = serviceYearOf(curMk) === sy;
  const n = isCur ? months(0).indexOf(curMk) + 1 : 12;
  const sum = ms => ms.slice(0, n).reduce((a, mk) => a + hoursOf(monthStats(mk).total), 0);
  const a = sum(months(0)), b = sum(months(1)); if (!a && !b) return '';
  const diff = a - b, label = n === 12 ? 'ano inteiro' : `${MES_CURTO[+months(0)[0].slice(5) - 1]} a ${MES_CURTO[+months(0)[n - 1].slice(5) - 1]}`;
  const days = new Set(S.time.filter(t => serviceYearOf(monthKey(t.date)) === sy && Number(t.minutes) > 0).map(t => t.date)), mins = S.time.filter(t => serviceYearOf(monthKey(t.date)) === sy).reduce((x, t) => x + Number(t.minutes), 0);
  const sk = streaks();
  return `<div class="card"><h2>Estatísticas</h2>
    <div class="row"><span>Este ano (${label})</span><span class="v">${fmtNum(a)}h</span></div>
    <div class="row"><span>Ano anterior (mesmo período)</span><span class="v">${fmtNum(b)}h</span></div>
    <div class="row"><span>Diferença</span><span class="v" style="color:${diff >= 0 ? '#2a7d4f' : '#d32f2f'}">${diff >= 0 ? '+' : ''}${fmtNum(diff)}h</span></div>
    <div class="row"><span>Dias com serviço</span><span class="v">${days.size}</span></div>
    <div class="row"><span>Média por dia trabalhado</span><span class="v">${days.size ? fmtDur(mins / days.size) : '—'}</span></div>
    <div class="row"><span>Dias seguidos agora / melhor</span><span class="v">${sk.cur} / ${sk.best}</span></div></div>`;
}
function yearCard(sy) {
  const y = yearStats(sy); if (!y.goal) return '';
  return `<div class="card"><h2>Alvo do ano de serviço<span class="sub">${sy}</span></h2>${progressBar(y.done, y.goal)}
    ${y.current ? `<div class="sub" style="margin-top:6px">${y.left > 0 ? `Faltam <b>${fmtNum(y.left)}h</b> · cerca de <b>${fmtNum(y.perMonth)}h por mês</b> (${fmtNum(y.perDay)}h por dia) até 31 de agosto.` : 'Alvo do ano atingido! 🎉'}${y.projected != null && y.left > 0 ? `<br>No ritmo atual: ~${fmtNum(y.projected)}h no ano.` : ''}</div>` : ''}</div>`;
}
// lembrete de fechar/enviar o relatório
function reminderCard() {
  const cur = monthKey(today()), prev = addMonths(cur, -1), now = new Date(), day = now.getDate();
  const last = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const sent = S.settings.sent || {};
  let mk = null, msg = '';
  if (day <= 5 && !sent[prev] && monthStats(prev).total > 0) { mk = prev; msg = `Não esqueça de entregar o relatório de ${MESES[+prev.slice(5) - 1]}.`; }
  else if (last - day <= 2 && !sent[cur]) { mk = cur; msg = last === day ? 'Hoje é o último dia do mês: feche e envie o relatório.' : `Faltam ${last - day} dia${last - day === 1 ? '' : 's'} para fechar o relatório de ${MESES[+cur.slice(5) - 1]}.`; }
  if (!mk) return '';
  return `<div class="card remind"><h2>🔔 Relatório do mês</h2><div>${msg}</div><div style="margin-top:8px"><button class="btn flat" data-act="remind-share" data-mk="${mk}">Compartilhar</button><button class="btn flat" data-act="remind-done" data-mk="${mk}">Já enviei</button></div></div>`;
}
const IS_IOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
function weekVisits() { // interessados com próxima visita marcada (atrasadas ou nos próximos 7 dias)
  const lim = ymd(new Date(Date.now() + 7 * 864e5));
  return S.person.filter(p => p.nextVisit && p.nextVisit <= lim).sort((a, b) => a.nextVisit.localeCompare(b.nextVisit));
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
  const active = r.name === 'chart' ? 'report' : (r.name === 'person' || r.name === 'map') ? 'people' : r.name;
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
    title: 'Meu relatório', right: `<button class="ib" data-act="go-people-search">${ICON.search}</button><button class="ib" data-act="reload">${ICON.sync}</button>`,
    body: `
    ${showTimer ? `<div class="card"><h2>Cronômetro de serviço</h2><div class="timer">
      <button class="circ" data-act="timer-toggle" id="tbtn">${timer.running() ? ICON.pause : ICON.play}</button><span class="t" id="tclock">${fmtClock(timer.elapsed())}</span>
      <button class="circ" data-act="timer-stop">${ICON.stop}</button></div></div>` : ''}
    <div class="card"><h2>Lançamento rápido<span class="sub">hoje</span></h2><div class="chips" style="margin:0">${[15, 30, 60, 120].map(m => `<button class="chip" data-act="quick" data-m="${m}">+${m < 60 ? m + ' min' : m / 60 + ' h'}</button>`).join('')}</div></div>
    <div class="card"><h2>Estatísticas da pregação</h2><div style="display:flex;justify-content:space-between;align-items:center"><span class="sub">${monthLabel(mk)}</span><span class="big">${st.visits} visita${st.visits === 1 ? '' : 's'}</span></div>
      <div class="stats4"><div>${ICON.people}<b>${st.revisitas}</b><span class="sub">revisitas</span></div><div>${ICON.book}<b>${st.estudos}</b><span class="sub">estudos</span></div><div>${ICON.chart}<b>${st.videos}</b><span class="sub">vídeos</span></div><div>${ICON.user}<b>${nextVisits}</b><span class="sub">interessados</span></div></div></div>
    <div class="card"><h2>Relatório do mês atual<span class="sub">${monthLabel(mk)}</span></h2>
      <div class="row"><span>Horas</span><span class="v">${fmtDur(st.ministry)}</span></div>
      <div class="row"><span>Horas no LDC</span><span class="v">${fmtDur(st.ldc)}</span></div>
      <div class="row"><span>Estudos</span><span class="v">${st.studies}</span></div>
      <div class="sub" style="margin-top:6px">Perfil: ${esc(profileName(profile()))}</div></div>
    ${reminderCard()}
    ${goal ? `<div class="card"><h2>Alvo de horas mensal</h2>${progressBar(hoursOf(st.total), goal)}<div class="row" style="margin-top:6px"><span class="sub">Faltam para o alvo de ${goal} horas</span><span class="big">${fmtNum(left)}h</span></div>
      <div class="sub">${left > 0 ? `Cerca de ${fmtNum(left / daysLeft)}h por dia nos ${daysLeft} dias restantes.` : 'Alvo atingido! 🎉'}</div></div>` : ''}
    ${paceCard(mk, st, goal, daysLeft)}
    ${yearCard(serviceYearOf(mk))}
    ${(() => { const wv = weekVisits(); return wv.length ? `<div class="card"><h2>Visitar esta semana<span class="sub">${wv.length}</span></h2>${wv.slice(0, 6).map(p => `<div class="row" data-act="open-person" data-id="${p.id}" style="cursor:pointer"><span>${esc(p.name)}</span><span class="${p.nextVisit < today() ? 'red' : 'sub'}">${p.nextVisit < today() ? 'atrasada · ' : ''}${esc(fmtDateLong(p.nextVisit).split(' de ').slice(0, 2).join(' de '))}</span></div>`).join('')}</div>` : ''; })()}
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
      <div class="row"><span>Estudos bíblicos <button class="pen" data-act="edit-studies">✎</button></span><span class="v">${st.studies}</span></div>
      ${st.studiesAuto && !(st.rep && st.rep.studiesSet) ? '<div class="sub" style="margin-top:-4px">Contados pelas visitas de estudo do mês (toque no lápis para ajustar).</div>' : ''}
      <div class="sec">Objetivo do mês <button class="pen" data-act="edit-goal">✎</button></div>
      <div class="row"><span>Horas</span><span class="v">${goal}</span></div>
      <div class="row"><span>Horas que faltam fazer</span><span class="v">${fmtNum(left)}</span></div>
      <div class="row"><span>Horas restantes por dia</span><span class="v ${perDay > 3 ? 'red' : ''}">${fmtNum(perDay)}</span></div>
      ${goal ? `<div style="margin-top:6px">${progressBar(hoursOf(st.total), goal)}</div>` : ''}
      <div class="sec">Perfil <button class="pen" data-act="edit-profile">✎</button></div><div>${esc(profileName(profile()))}</div>
      <div style="margin-top:20px"><button class="btn full" data-act="share">Compartilhar texto</button></div>
      <div style="margin-top:8px"><button class="btn flat full" data-act="share-pdf">Gerar PDF do relatório</button></div>
      <div style="margin-top:10px"><button class="btn flat full" data-act="toggle-sent">${(S.settings.sent || {})[reportMonth] ? '✓ Relatório enviado (desfazer)' : 'Marcar como enviado'}</button></div>`;
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
      ${yearCard(sy)}${compareYear(sy)}<div class="card">${rows}<div class="row" style="border-top:1px solid var(--line);font-weight:700"><span>Total</span><span class="v">${fmtDur(tot)}</span></div>
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
  S.report.forEach(r => years.add(serviceYearOf(r.month)));
  years.add(serviceYearOf(monthKey(today())));
  const all = [...years].sort();
  if (!chartYears) chartYears = new Set(all.slice(-10));
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
    const mks = new Set([...[...S.time, ...S.visit].map(x => monthKey(x.date)), ...S.report.map(r => r.month)]);
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

let peopleQuery = '', peopleSearchOpen = false, peopleFilter = 'all';
const PFILTERS = [['all', 'Todos'], ['week', 'Visitar'], ['study', 'Estudos'], ['d30', 'Sem visita +30 dias'], ['d60', '+60 dias'], ['d90', '+90 dias']];
function personVisits(id) { return S.visit.filter(v => v.personId === id).sort((a, b) => b.date.localeCompare(a.date)); }
const personColor = id => PALETTE[[...id].reduce((a, c) => a + c.charCodeAt(0), 0) % PALETTE.length];
function viewPeople() {
  const q = peopleQuery.toLowerCase();
  let list = S.person.map(p => ({ ...p, last: (personVisits(p.id)[0] || {}).date || p.created || '', n: personVisits(p.id).length }));
  if (q) list = list.filter(p => [p.name, p.address, p.bairro, p.notes, p.phone].join(' ').toLowerCase().includes(q));
  if (peopleFilter === 'study') list = list.filter(p => p.studying);
  else if (peopleFilter === 'week') { const ids = new Set(weekVisits().map(p => p.id)); list = list.filter(p => ids.has(p.id)); }
  else if (/^d\d+$/.test(peopleFilter)) { const lim = ymd(new Date(Date.now() - +peopleFilter.slice(1) * 864e5)); list = list.filter(p => p.last && p.last <= lim); }
  const groups = {};
  list.forEach(p => { (groups[p.bairro || 'Outros'] ||= []).push(p); });
  const names = Object.keys(groups).sort((a, b) => (a === 'Outros') - (b === 'Outros') * 1 || a.localeCompare(b)).sort((a, b) => (b === 'Outros') - (a === 'Outros'));
  const body = `<div class="chips">${PFILTERS.map(([k, l]) => `<button class="chip ${peopleFilter === k ? 'on' : ''}" data-act="pfilter" data-v="${k}">${l}</button>`).join('')}</div>
    ${peopleSearchOpen ? `<div class="searchbar"><input type="search" id="pq" placeholder="Buscar nome, endereço, bairro…" value="${esc(peopleQuery)}"></div>` : ''}
    ${names.length ? names.map(n => `<div class="group">${esc(n)}</div><div class="list">${groups[n].sort((a, b) => b.last.localeCompare(a.last)).map(p => `
      <div class="item" data-act="open-person" data-id="${p.id}"><div class="avatar" style="background:${personColor(p.id)}">${esc((p.name || '?')[0].toUpperCase())}${p.n ? `<i>${p.n}</i>` : ''}</div>
      <div class="mid"><div class="nm"><span>${esc(p.name)}</span><small>${p.last ? esc(fmtDateLong(p.last)) : ''}</small></div><div class="ad">${esc(p.address || '')}</div><div class="nt">${p.studying ? '<span class="tag">Estuda</span>' : ''}${p.nextVisit ? `<span class="tag">Próx.: ${esc(p.nextVisit.split('-').reverse().slice(0, 2).join('/'))}</span>` : ''}${esc(p.notes || '')}</div></div>${p.address ? `<a class="mapbtn" href="${mapLink((p.address || '') + ' ' + (p.bairro || ''))}" target="_blank" rel="noopener" aria-label="Abrir no mapa">${ICON.map}</a>` : ''}</div>`).join('')}</div>`).join('')
      : `<div class="empty">${peopleFilter !== 'all' || q ? 'Nenhum interessado neste filtro.' : 'Nenhum interessado ainda.<br>Toque no botão + para adicionar.'}</div>`}`;
  return shell({ title: 'Interessados', right: `<button class="ib" data-act="go-map" aria-label="Mapa">${ICON.map}</button><button class="ib" data-act="people-search">${ICON.search}</button><button class="ib" data-act="add-person">${ICON.user}</button>`, body });
}
function mapLink(addr) {
  const q = encodeURIComponent(addr);
  if (S.settings.osm) return `https://www.openstreetmap.org/search?query=${q}`;
  return IS_IOS ? `https://maps.apple.com/?q=${q}` : `https://www.google.com/maps/search/?api=1&query=${q}`;
}
const VISIT_KINDS = [['revisita', 'Revisita'], ['estudo', 'Estudo bíblico'], ['video', 'Vídeo mostrado'], ['primeira', 'Primeira visita'], ['ausente', 'Não estava']];
function viewPerson(id) {
  const p = S.person.find(x => x.id === id);
  if (!p) return viewPeople();
  const vs = personVisits(id);
  return shell({
    left: 'back', title: p.name, right: `<button class="ib" data-act="edit-person" data-id="${id}">✎</button>`, tabs: true,
    body: `<div class="card"><div class="row"><span class="sub">Endereço</span></div><div>${esc(p.address || '—')}${p.bairro ? ` <span class="tag">${esc(p.bairro)}</span>` : ''}</div>
      ${p.address ? `<p><a class="btn flat" href="${mapLink((p.address || '') + ' ' + (p.bairro || ''))}" target="_blank" rel="noopener">${IS_IOS && !S.settings.osm ? 'Abrir no Mapas' : 'Abrir no mapa'}</a></p>` : ''}
      ${p.phone ? `<div class="row"><span class="sub">Telefone</span></div><div><a class="btn flat" href="tel:${esc(p.phone)}">Ligar ${esc(p.phone)}</a></div>` : ''}
      ${p.studying ? '<div><span class="tag">Estuda a Bíblia</span></div>' : ''}
      ${p.nextVisit ? `<div class="row"><span class="sub">Próxima visita</span></div><div class="${p.nextVisit < today() ? 'red' : ''}">${esc(fmtDateLong(p.nextVisit))}</div>` : ''}
      ${p.notes ? `<div class="row"><span class="sub">Anotações</span></div><div style="white-space:pre-wrap">${esc(p.notes)}</div>` : ''}</div>
      <div class="sec">Visitas (${vs.length})</div>
      ${vs.length ? `<div class="card list">${vs.map(v => `<div class="item" data-act="edit-visit" data-id="${v.id}"><div class="mid"><div class="nm"><span>${fmtDateLong(v.date)}</span></div><div class="nt">${(v.kinds || []).map(k => `<span class="tag">${esc((VISIT_KINDS.find(x => x[0] === k) || [k, k])[1])}</span>`).join('')}${esc(v.note || '')}</div></div></div>`).join('')}</div>` : '<div class="empty">Nenhuma visita registrada.</div>'}
      <p><button class="btn danger flat" style="color:#c0392b" data-act="del-person" data-id="${id}">Apagar interessado</button></p>`,
    fab: `<button class="fab" data-act="add-visit" data-id="${id}">+</button>`,
  });
}

// ---------- mapa dos interessados (OpenStreetMap + Leaflet) ----------
let mapObj = null, mapFilter = 'all', mapSession = 0, mapUser = null;
const geoQ = p => [p.address, p.bairro, S.settings.city].filter(Boolean).join(', ');
const dirLink = (la, ln) => S.settings.osm ? `https://www.openstreetmap.org/directions?to=${la},${ln}` : IS_IOS ? `https://maps.apple.com/?daddr=${la},${ln}` : `https://www.google.com/maps/dir/?api=1&destination=${la},${ln}`;
const mapPeople = () => { const base = S.person.filter(p => p.address); if (mapFilter === 'week') { const w = new Set(weekVisits().map(p => p.id)); return base.filter(p => w.has(p.id)); } return base; };
async function geocode(p) {
  const q = geoQ(p);
  const r = await fetch('https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&countrycodes=br&accept-language=pt-BR&q=' + encodeURIComponent(q));
  if (!r.ok) throw new Error('Sem conexão com a internet');
  const j = await r.json();
  return j[0] ? { lat: +j[0].lat, lng: +j[0].lon, q } : { fail: true, q };
}
function viewMap() {
  return shell({ left: 'back', title: 'Mapa', right: `<button class="ib" data-act="map-locate" aria-label="Onde estou">${ICON.locate}</button>`, body: `
    <div class="chips">${[['all', 'Todos'], ['week', 'Visitar esta semana']].map(([k, l]) => `<button class="chip ${mapFilter === k ? 'on' : ''}" data-act="mfilter" data-v="${k}">${l}</button>`).join('')}</div>
    <div id="map"></div><div class="sub" id="mapstat" style="padding:8px 2px"></div>
    <div class="sub">Rosa: interessado · roxo: visita nesta semana · vermelho: visita atrasada.${S.settings.city ? '' : ' Dica: defina a cidade em Configurações para achar os endereços com mais precisão.'}</div>` });
}
async function initMap() {
  const el = $('#map'); if (!el) return;
  if (typeof L === 'undefined') { el.innerHTML = '<div class="empty">O mapa precisa de internet na primeira abertura.</div>'; return; }
  const my = ++mapSession, st = $('#mapstat');
  mapObj = L.map(el).setView([-14.2, -51.9], 4);
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '© OpenStreetMap' }).addTo(mapObj);
  const layer = L.layerGroup().addTo(mapObj), wk = new Set(weekVisits().map(p => p.id)); let fitted = false;
  const ok = p => p.geo && !p.geo.fail && p.geo.q === geoQ(p);
  const draw = () => {
    layer.clearLayers(); const pts = [];
    mapPeople().filter(ok).forEach(p => {
      const color = p.nextVisit && p.nextVisit < today() ? '#d32f2f' : wk.has(p.id) ? '#8e3a8a' : '#e8508e';
      L.circleMarker([p.geo.lat, p.geo.lng], { radius: 9, color: '#fff', weight: 2, fillColor: color, fillOpacity: .95 }).addTo(layer)
        .bindPopup(`<b>${esc(p.name)}</b><br>${esc(p.address || '')}<br><a href="#/person/${p.id}">Abrir</a> · <a href="${dirLink(p.geo.lat, p.geo.lng)}" target="_blank" rel="noopener">Como chegar</a>`);
      pts.push([p.geo.lat, p.geo.lng]);
    });
    if (pts.length && !fitted) { mapObj.fitBounds(pts, { padding: [30, 30], maxZoom: 16 }); fitted = true; }
    const all = mapPeople(), failed = all.filter(p => p.geo && p.geo.fail && p.geo.q === geoQ(p)).length;
    if (st) st.innerHTML = all.length ? `${pts.length} de ${all.length} no mapa${failed ? ` · ${failed} endereço${failed === 1 ? '' : 's'} não encontrado${failed === 1 ? '' : 's'} <button class="btn flat" data-act="map-retry">Tentar de novo</button>` : ''}` : 'Nenhum interessado com endereço.';
  };
  draw();
  for (const p of mapPeople().filter(p => !p.geo || p.geo.q !== geoQ(p))) {
    if (my !== mapSession || !mapObj) return;
    if (st) st.textContent = `Localizando endereços… ${p.name}`;
    try { await save('person', { ...p, geo: await geocode(p) }); } catch (e) { if (isNet(e)) { if (st) st.textContent = 'Sem internet para localizar novos endereços.'; return; } }
    if (my !== mapSession) return; draw();
    await new Promise(r => setTimeout(r, 1100)); // limite do serviço gratuito: 1 consulta por segundo
  }
  if (my === mapSession) draw();
}

function viewTerritory() {
  const list = [...S.territory].sort((a, b) => (a.name || '').localeCompare(b.name || '', 'pt', { numeric: true }));
  return shell({
    title: 'Território', body: list.length ? `<div class="cardlist">${list.map(t => {
      const days = t.lastWorked ? Math.floor((Date.now() - parseYmd(t.lastWorked)) / 864e5) : null;
      return `<div class="card" data-act="edit-territory" data-id="${t.id}"><h2>${esc(t.name)}<span class="pill ${days == null || days > 180 ? 'warn' : ''}">${days == null ? 'nunca trabalhado' : days === 0 ? 'hoje' : `há ${days} dia${days === 1 ? '' : 's'}`}</span></h2>
      ${t.assignee ? `<div class="sub">Responsável: ${esc(t.assignee)}</div>` : ''}
      ${t.assigned || t.returned ? `<div class="sub">${t.assigned ? `Início: ${esc(fmtDateLong(t.assigned))}` : ''}${t.assigned && t.returned ? ' · ' : ''}${t.returned ? `Fim: ${esc(fmtDateLong(t.returned))}` : ''}</div>` : ''}
      ${(t.blocks || []).length ? `<div class="sub" style="margin-top:6px">Quadras: ${t.blocks.filter(b => b.done).length}/${t.blocks.length} trabalhadas</div><div class="chips" style="margin:4px 0">${t.blocks.map((b, i) => `<button class="chip ${b.done ? 'on' : ''}" data-act="terr-block" data-id="${t.id}" data-i="${i}">${esc(b.n)}</button>`).join('')}</div>` : ''}
      <div class="sub" style="white-space:pre-wrap">${esc(t.notes || '')}</div>
      ${t.lastWorked ? `<div class="sub">Último trabalho: ${fmtDateLong(t.lastWorked)}</div>` : ''}
      <div style="margin-top:6px"><button class="btn flat" data-act="terr-today" data-id="${t.id}">Marcar como trabalhado hoje</button></div></div>`; }).join('')}</div>` : '<div class="empty">Nenhum cartão de território.<br>Toque em + para adicionar.</div>',
    fab: `<button class="fab" data-act="add-territory">+</button>`,
  });
}

let agendaOffset = 0;
const agendaFromReport = () => S.settings.agendaFromReport !== false;
function dayMinutes() { // minutos realizados por dia
  const m = {}; S.time.forEach(t => { m[t.date] = (m[t.date] || 0) + Number(t.minutes); }); return m;
}
// valor do dia no calendário: realizado (se "Atualizar do relatório atual") senão planejado
function dayValue(date, done, plan) { const d = done[date] || 0, p = plan[date] ? Number(plan[date].minutes) : 0; return agendaFromReport() ? (d || p) : p; }
function calendar(mk) {
  const [y, m] = mk.split('-').map(Number), first = new Date(y, m - 1, 1), n = new Date(y, m, 0).getDate();
  const ws = S.settings.weekStart === 1 ? 1 : 0;
  const names = [...DIAS.slice(ws), ...DIAS.slice(0, ws)];
  const lead = (first.getDay() - ws + 7) % 7;
  const cells = [];
  for (let i = 0; i < lead; i++) { const d = new Date(y, m - 1, 1 - lead + i); cells.push({ d: d.getDate(), out: true }); }
  for (let d = 1; d <= n; d++) cells.push({ d, date: `${mk}-${pad(d)}` });
  while (cells.length % 7) cells.push({ d: cells.length - lead - n + 1, out: true });
  const plan = Object.fromEntries(S.plan.map(p => [p.date, p])), done = dayMinutes();
  const cell = c => {
    if (c.out) return `<td class="out">${c.d}</td>`;
    const d = done[c.date] || 0, p = plan[c.date] ? Number(plan[c.date].minutes) : 0;
    const showDone = agendaFromReport() && d > 0;
    const v = showDone ? d : p;
    return `<td data-act="plan-day" data-date="${c.date}" class="${c.date === today() ? 'today' : ''}">${c.d}${v ? `<span class="h ${showDone ? 'done' : 'plan'}">${fmtDur(v)}</span>` : ''}</td>`;
  };
  let rows = '';
  for (let i = 0; i < cells.length; i += 7) rows += `<tr>${cells.slice(i, i + 7).map(cell).join('')}</tr>`;
  return `<table class="cal"><caption>${monthLabel(mk)}</caption><tr>${names.map(d => `<th>${d}</th>`).join('')}</tr>${rows}</table>`;
}
function agendaTotal(fromKey, toKey) {
  const done = dayMinutes(), plan = Object.fromEntries(S.plan.map(p => [p.date, p]));
  const dates = new Set([...Object.keys(done), ...Object.keys(plan)]);
  let t = 0; dates.forEach(d => { const k = monthKey(d); if (k >= fromKey && k <= toKey) t += dayValue(d, done, plan); });
  return t;
}
function viewAgenda() {
  const cur = monthKey(today()), mk = addMonths(cur, agendaOffset);
  const sy = serviceYearOf(mk), yearStart = `${sy - 1}-09`, yearEnd = `${sy}-08`; // ano de serviço: setembro → agosto
  return shell({
    title: 'Agenda para a pregação', right: `<button class="ib" data-act="agenda-prev">‹</button><button class="ib" data-act="agenda-next">›</button>`,
    body: `<div class="card"><h2>Ano de serviço ${sy}<span class="sub">set. ${sy - 1} – ago. ${sy}</span></h2>
      <div class="row"><span>Horas em ${MESES[+mk.slice(5) - 1]}:</span><span class="v">${fmtNum(hoursOf(agendaTotal(mk, mk)))}/${goalFor(mk)}h</span></div>
      <div class="row"><span>Horas no ano de serviço:</span><span class="v">${fmtNum(hoursOf(agendaTotal(yearStart, yearEnd)))}h</span></div>
      <label class="ck"><input type="checkbox" data-act="agenda-toggle" ${agendaFromReport() ? 'checked' : ''}> Atualizar do relatório atual</label>
      <div class="sub">Em roxo: horas já feitas. Em azul claro: planejadas. Toque em um dia para planejar.</div></div>
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
let bkList = null;
async function loadBackups() { try { bkList = must(await sb.from('backups').select('id,created_at,auto').order('created_at', { ascending: false })); } catch { bkList = []; } if (route().name === 'backup') render(); }
async function autoBackup() { // garante pelo menos uma cópia a cada 7 dias, mesmo que o agendamento do servidor falhe
  try { const r = must(await sb.from('backups').select('created_at').order('created_at', { ascending: false }).limit(1)); const has = S.time.length + S.person.length + S.report.length > 0;
    if (has && (!r.length || Date.now() - new Date(r[0].created_at) > 7 * 864e5)) must(await sb.rpc('snapshot_my_backup', { is_auto: true })); } catch { /* sem rede */ }
}
function viewBackup() {
  return shell({ left: 'back', title: 'Cópia de Segurança', body: `
    <div class="card"><h2>Backup (.mabackup)</h2><p class="sub">Mesmo formato do Ministry Assistant: interessados, visitas, relatórios mensais e horas diárias. Pode ser restaurado aqui ou no app original.</p>
      <button class="btn full" data-act="export-ma">Gerar backup</button></div>
    <div class="card"><h2>Restaurar</h2><p class="sub">Escolha um arquivo .mabackup (ou o JSON completo).</p>
      <label class="btn full filelbl">Escolher arquivo…<input type="file" id="impfile" class="filein"></label></div>
    <div class="card"><h2>Cópia completa (JSON)</h2><p class="sub">Inclui tudo deste app, também as horas no LDC, territórios e agenda planejada, que o formato .mabackup não guarda.</p>
      <button class="btn flat" data-act="export">Exportar JSON</button></div>
    <div class="card"><h2>Cópias automáticas</h2><p class="sub">O servidor guarda uma cópia por semana (as últimas 8). Você também pode criar uma agora.</p>
      <button class="btn flat" data-act="bk-now">Criar cópia agora</button>
      ${bkList === null ? '<div class="sub">Carregando…</div>' : bkList.length ? bkList.map(b => `<div class="row"><div>${esc(new Date(b.created_at).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' }))}<div class="sub">${b.auto ? 'automática' : 'manual'}</div></div>
        <div><button class="btn flat" data-act="bk-dl" data-id="${b.id}">Baixar</button><button class="btn flat" data-act="bk-restore" data-id="${b.id}">Restaurar</button></div></div>`).join('') : '<div class="sub">Nenhuma cópia ainda.</div>'}</div>` });
}
function viewSettings() {
  const tg = (k, on) => `<button class="tg ${on ? 'on' : ''}" data-act="toggle" data-k="${k}" aria-pressed="${on}"></button>`;
  return shell({ left: 'back', title: 'Configurações', body: `
    <div class="card"><h2>Geral</h2>
      <div class="row"><div>Perfil<div class="sub">${esc(profileName(profile()))}</div></div><button class="btn flat" data-act="edit-profile">Alterar</button></div>
      <div class="row"><div>Cronômetro de serviço<div class="sub">Mostrar cartão de horas</div></div>${tg('timer', S.settings.timer !== false)}</div>
      <div class="row"><div>Primeiro dia da semana<div class="sub">Ligado = domingo; desligado = segunda</div></div>${tg('sunday', S.settings.weekStart !== 1)}</div>
      <div class="row"><div>Cidade para o mapa<div class="sub">${esc(S.settings.city || 'não definida')}</div></div><button class="btn flat" data-act="edit-city">Alterar</button></div>
      <div class="row"><div>Usar o Open Street Map<div class="sub">Em vez do app Mapas / Google Maps</div></div>${tg('osm', !!S.settings.osm)}</div></div>
    <div class="card"><h2>Aparência e segurança</h2>
      <div class="row"><div>Tema</div><div class="seg2">${[['auto', 'Auto'], ['light', 'Claro'], ['dark', 'Escuro']].map(([k, l]) => `<button class="${getTheme() === k ? 'on' : ''}" data-act="theme" data-v="${k}">${l}</button>`).join('')}</div></div>
      <div class="row"><div>Bloqueio por PIN<div class="sub">${pinCfg() ? 'Ativado neste aparelho' : 'Pede um PIN de 4 dígitos ao abrir o app'}</div></div>
        <div>${pinCfg() ? '<button class="btn flat" data-act="pin-change">Alterar</button><button class="btn flat" data-act="pin-off">Desativar</button>' : '<button class="btn flat" data-act="pin-on">Ativar</button>'}</div></div></div>
    <div class="card"><h2>Notificações</h2><p class="sub">Avisos no celular, mesmo com o app fechado: entregar o relatório do mês e visitas marcadas para hoje (por volta das 9h).</p>
      ${pushOn ? '<button class="btn flat" data-act="push-test">Enviar teste</button><button class="btn flat" data-act="push-off">Desativar</button>' : '<button class="btn flat" data-act="push-on">Ativar notificações</button>'}
      ${IS_IOS && !matchMedia('(display-mode: standalone)').matches ? '<div class="sub" style="margin-top:6px">No iPhone só funciona com o app instalado na Tela de Início (Safari → Compartilhar → Adicionar à Tela de Início).</div>' : ''}</div>
    <div class="card"><h2>Conta</h2><div class="sub">E-mail: <b>${esc(S.user.username)}</b></div>
      <div style="margin-top:8px"><button class="btn flat" data-act="edit-name">Alterar nome</button><button class="btn flat" data-act="change-pw">Alterar senha</button><button class="btn flat" data-act="change-email">Alterar e-mail</button></div></div>
    <div class="card"><h2>Zona de perigo</h2><p class="sub">Excluir a conta apaga para sempre todos os seus dados (horas, interessados, visitas, territórios, agenda).</p>
      <button class="btn flat" style="color:#c0392b" data-act="delete-account">Excluir minha conta</button></div>` });
}

function viewLogin(mode = 'login') {
  const reg = mode === 'register';
  return `<div class="login"><div class="hero"><img src="icons/icon-192.png" alt=""><h1>Meu relatório</h1><p>Suas horas, visitas e território</p></div>
    <div class="panel"><div class="seg"><button type="button" data-act="lmode" data-v="login" class="${!reg ? 'on' : ''}">Entrar</button><button type="button" data-act="lmode" data-v="register" class="${reg ? 'on' : ''}">Criar conta</button></div>
    <form id="lf" data-mode="${mode}" novalidate>
      ${reg ? '<label class="f">Seu nome</label><input type="text" name="name" autocomplete="name" autocapitalize="words" enterkeyhint="next">' : ''}
      <label class="f">E-mail</label><input type="email" name="username" autocomplete="email" autocapitalize="none" autocorrect="off" spellcheck="false" inputmode="email" enterkeyhint="next" placeholder="voce@email.com">
      <label class="f">Senha</label><div class="pwwrap"><input type="password" name="password" autocomplete="${reg ? 'new-password' : 'current-password'}" enterkeyhint="go" placeholder="${reg ? 'mínimo 6 caracteres' : 'sua senha'}"><button type="button" class="eye" data-act="eye" aria-label="Mostrar senha">👁</button></div>
      <div class="err" id="lerr" role="alert"></div>
      <button class="btn" type="submit">${reg ? 'Criar conta' : 'Entrar'}</button>
      ${!reg ? '<button type="button" class="linkbtn" data-act="forgot">Esqueci a senha</button>' : ''}</form></div>
    <div class="foot">Seus dados ficam salvos na sua conta, só você tem acesso.</div></div>`;
}

// ---------- render ----------
let loginMode = 'login';
function render() {
  const app = $('#app');
  if (!CONFIGURED) { app.innerHTML = '<div class="login"><h1>Falta configurar</h1><p class="sub">Edite o arquivo <b>config.js</b> com a URL e a chave anon do seu projeto Supabase (veja o README).</p></div>'; return; }
  if (!S.token || !S.user) { app.innerHTML = viewLogin(loginMode); return; }
  const r = route();
  const views = { map: viewMap, home: viewHome, report: viewReport, chart: viewChart, people: viewPeople, territory: viewTerritory, agenda: viewAgenda, help: viewHelp, backup: viewBackup, settings: viewSettings };
  if (mapObj) { mapSession++; try { mapObj.remove(); } catch { /* já removido */ } mapObj = null; }
  const scroll = $('#main')?.scrollTop || 0;
  app.innerHTML = (r.name === 'person' ? viewPerson(r.arg) : (views[r.name] || viewHome)()) + (drawerOpen ? drawerHtml() : '') + (menuOpen === 'report' ? `<div class="scrim" style="background:transparent" data-act="close-menus"></div><div class="drop" style="position:absolute;top:56px">
    <a data-act="go-chart">Gráfico anual</a><a data-act="go-year">Ano de serviço</a></div>` : '');
  if ($('#main')) $('#main').scrollTop = scroll;
  const pq = $('#pq'); if (pq) { pq.oninput = e => { peopleQuery = e.target.value; const pos = e.target.selectionStart; render(); const n = $('#pq'); n.focus(); n.setSelectionRange(pos, pos); }; }
  if (r.name === 'map') initMap();
  if (r.name === 'settings') refreshPush();
  if (r.name === 'backup' && bkList === null && navigator.onLine) loadBackups();
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
      { name: 'm', label: 'Minutos', type: 'number', min: 0, max: 59, step: 'any', value: Math.round((e.minutes % 60) * 100) / 100 },
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
      { name: 'bairro', label: 'Bairro', value: p.bairro }, { name: 'phone', label: 'Telefone', type: 'tel', value: p.phone },
      { name: 'nextVisit', label: 'Próxima visita (opcional)', type: 'date', value: p.nextVisit },
      { name: 'studying', label: 'Estuda a Bíblia', type: 'check', value: p.studying },
      { name: 'notes', label: 'Anotações', type: 'textarea', value: p.notes }],
    onSubmit: async v => { await save('person', { ...p, ...v, name: v.name.trim(), created: p.created || today(), maId: p.maId || randomLongStr() }); render(); },
  }).then(r => { const l = $('#bl'); if (l) l.remove(); return r; });
}
function visitDialog(personId, v) {
  v = v || { date: today(), kinds: ['revisita'], note: '' };
  return dialog({
    title: v.id ? 'Editar visita' : 'Nova visita', fields: [{ name: 'date', label: 'Data', type: 'date', value: v.date, required: true },
      ...VISIT_KINDS.map(([k, l]) => ({ name: 'k_' + k, label: l, type: 'check', value: (v.kinds || []).includes(k) })),
      { name: 'note', label: 'Anotações', type: 'textarea', value: v.note },
      { name: 'next', label: 'Próxima visita (opcional)', type: 'date', value: (S.person.find(x => x.id === personId) || {}).nextVisit }],
    extra: v.id ? [{ label: 'Apagar', run: async () => { await remove('visit', v.id); render(); } }] : [],
    onSubmit: async f => {
      await save('visit', { ...v, personId, date: f.date, note: f.note, kinds: VISIT_KINDS.map(x => x[0]).filter(k => f['k_' + k]) });
      const p = S.person.find(x => x.id === personId);
      if (p) {
        const patch = {};
        if ((f.next || '') !== (p.nextVisit || '')) patch.nextVisit = f.next || '';
        else if (!v.id && p.nextVisit && !f.next && p.nextVisit <= f.date) patch.nextVisit = '';
        if (f.k_estudo && !p.studying) patch.studying = true;
        if (Object.keys(patch).length) await save('person', { ...p, ...patch });
      }
      render();
    },
  });
}
function territoryDialog(t) {
  t = t || {};
  return dialog({
    title: t.id ? 'Editar território' : 'Novo território',
    fields: [{ name: 'name', label: 'Nome / número do cartão', value: t.name, required: true }, { name: 'assignee', label: 'Responsável', value: t.assignee },
      { name: 'assigned', label: 'Data de início', type: 'date', value: t.assigned }, { name: 'returned', label: 'Data de fim / devolução', type: 'date', value: t.returned },
      { name: 'lastWorked', label: 'Último dia trabalhado', type: 'date', value: t.lastWorked },
      { name: 'blocksText', label: 'Quadras (uma por linha)', type: 'textarea', value: (t.blocks || []).map(b => b.n).join('\n') },
      { name: 'notes', label: 'Anotações', type: 'textarea', value: t.notes }],
    extra: t.id ? [{ label: 'Apagar', run: async () => { if (await confirmDlg('Apagar território?', t.name)) { await remove('territory', t.id); render(); } else return false; } }] : [],
    onSubmit: async v => {
      const old = new Map((t.blocks || []).map(b => [b.n, b]));
      const blocks = String(v.blocksText || '').split('\n').map(x => x.trim()).filter(Boolean).map(n => old.get(n) || { n, done: false });
      const { blocksText, ...rest } = v;
      await save('territory', { ...t, ...rest, blocks }); render();
    },
  });
}
async function planDialog(date) {
  const cur = S.plan.find(p => p.date === date), done = S.time.filter(t => t.date === date);
  await dialog({
    title: 'Definir tempo — ' + fmtDateLong(date), ok: 'Definir',
    fields: [{ name: 'h', label: 'Horas', type: 'number', min: 0, max: 24, value: cur ? Math.floor(cur.minutes / 60) : 1 },
      { name: 'm', label: 'Minutos', type: 'number', min: 0, max: 59, value: cur ? cur.minutes % 60 : 0 }, { name: 'note', label: 'Notas', value: cur?.note }],
    html: done.length ? `<p class="sub">Registrado neste dia: <b>${fmtDur(done.reduce((a, x) => a + Number(x.minutes), 0))}</b></p>` : '',
    extra: [
      ...(cur ? [{ label: 'Limpar planejado', run: async () => { await remove('plan', cur.id); render(); } }] : []),
      ...(done.length ? [{ label: 'Apagar horas registradas', run: async () => {
        if (!(await confirmDlg('Apagar horas registradas?', `${fmtDateLong(date)}: ${fmtDur(done.reduce((a, x) => a + Number(x.minutes), 0))}`, 'Apagar'))) return false;
        for (const x of done) await remove('time', x.id); render(); } }] : []),
    ],
    onSubmit: async v => {
      const minutes = Number(v.h || 0) * 60 + Number(v.m || 0);
      if (minutes <= 0) { if (cur) await remove('plan', cur.id); } else await save('plan', { ...(cur || {}), date, minutes, note: v.note });
      render();
    },
  });
}
function pinSetDialog(change) {
  return dialog({ title: change ? 'Novo PIN' : 'Criar PIN', ok: 'Salvar', html: '<p class="sub">4 dígitos. Vale só neste aparelho e é um bloqueio de conveniência: a senha da conta continua sendo a proteção real.</p>',
    fields: [...(change ? [{ name: 'old', label: 'PIN atual', type: 'password', inputmode: 'numeric' }] : []), { name: 'p1', label: 'PIN (4 dígitos)', type: 'password', inputmode: 'numeric' }, { name: 'p2', label: 'Repita o PIN', type: 'password', inputmode: 'numeric' }],
    onSubmit: async v => {
      if (change && !(await checkPin(String(v.old)))) throw new Error('PIN atual incorreto');
      if (!/^\d{4}$/.test(v.p1)) throw new Error('O PIN precisa ter 4 números');
      if (v.p1 !== v.p2) throw new Error('Os PINs não conferem');
      await setPin(v.p1); render(); toast('PIN salvo');
    } });
}
async function profileDialog() {
  await dialog({ title: 'Perfil', fields: [{ name: 'profile', label: 'Perfil de serviço', type: 'select', value: profile(), options: PROFILES }],
    onSubmit: async v => { await saveSettings({ profile: v.profile }); render(); } });
}
function reportText(mk) {
  const s = monthStats(mk), nome = S.user && S.user.name && S.user.name !== S.user.username ? S.user.name : '';
  const h = x => fmtDur(x).replace('h', '');
  return [`Relatório de serviço — ${monthLabel(mk)}`, nome && `Nome: ${nome}`, `Horas: ${h(s.ministry)}`, s.ldc ? `Horas no LDC: ${h(s.ldc)}` : '', `Estudos bíblicos: ${s.studies}`, `Revisitas: ${s.revisitas}`, `Vídeos mostrados: ${s.videos}`, `Perfil: ${profileName(profile())}`].filter(Boolean).join('\n');
}
function pdfBytes(title, rows, footer) { // PDF simples (1 página A4, Helvetica) escrito à mão, sem bibliotecas
  const map = { '—': '\\227', '–': '\\226', '•': '\\225', '“': '\\223', '”': '\\224', '’': '\\222' };
  const esc2 = t => { let o = ''; for (const ch of String(t)) { const c = ch.charCodeAt(0); if (map[ch]) o += map[ch]; else if ('()\\'.includes(ch)) o += '\\' + ch; else if (c < 128) o += ch; else if (c < 256) o += '\\' + c.toString(8).padStart(3, '0'); else o += '?'; } return o; };
  let y = 770, c = '';
  const text = (t, x, size, bold) => { c += `BT /F${bold ? 2 : 1} ${size} Tf ${x} ${y} Td (${esc2(t)}) Tj ET\n`; };
  text(title, 60, 20, true); y -= 14; c += `0.9 0.31 0.56 RG 2 w 60 ${y} m 535 ${y} l S\n0 0 0 RG\n`; y -= 34;
  rows.forEach(r => { if (r.head) { y -= 8; text(r.head, 60, 13, true); y -= 8; c += `0.8 0.8 0.8 RG 0.5 w 60 ${y} m 535 ${y} l S\n`; y -= 20; return; } text(r[0], 60, 12, false); text(r[1], 400, 12, true); y -= 22; });
  y = 60; text(footer, 60, 9, false);
  const objs = ['<< /Type /Catalog /Pages 2 0 R >>', '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents 4 0 R /Resources << /Font << /F1 5 0 R /F2 6 0 R >> >> >>',
    `<< /Length ${c.length} >>\nstream\n${c}endstream`, '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>', '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>'];
  let out = '%PDF-1.4\n'; const off = [];
  objs.forEach((o, i) => { off.push(out.length); out += `${i + 1} 0 obj\n${o}\nendobj\n`; });
  const xr = out.length; out += `xref\n0 ${objs.length + 1}\n0000000000 65535 f \n${off.map(o => String(o).padStart(10, '0') + ' 00000 n \n').join('')}trailer\n<< /Size ${objs.length + 1} /Root 1 0 R >>\nstartxref\n${xr}\n%%EOF`;
  const u = new Uint8Array(out.length); for (let i = 0; i < out.length; i++) u[i] = out.charCodeAt(i) & 255; return u;
}
async function shareReportPdf(mk) {
  const s = monthStats(mk), h = x => fmtDur(x).replace('h', ''), nome = S.user && S.user.name && S.user.name !== S.user.username ? S.user.name : '';
  const rows = [['Nome', nome || '—'], ['Mês', monthLabel(mk)], ['Perfil', profileName(profile())], { head: 'Ministério' }, ['Horas', h(s.ministry)], ...(s.ldc ? [['Horas no LDC', h(s.ldc)]] : []), ['Total de horas', h(s.total)], { head: 'Atividade' },
    ['Estudos bíblicos', String(s.studies)], ['Revisitas', String(s.revisitas)], ['Vídeos mostrados', String(s.videos)], ['Visitas registradas', String(s.visits)]];
  const bytes = pdfBytes(`Relatório de serviço — ${monthLabel(mk)}`, rows, `Gerado por Meu relatório em ${new Date().toLocaleDateString('pt-BR')}`);
  const file = new File([bytes], `Relatorio-${mk}.pdf`, { type: 'application/pdf' });
  if (navigator.canShare && navigator.canShare({ files: [file] })) { try { await navigator.share({ files: [file], title: `Relatório ${monthLabel(mk)}` }); return; } catch (e) { if (e.name === 'AbortError') return; } }
  const a = document.createElement('a'); a.href = URL.createObjectURL(file); a.download = file.name; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 4000);
}
function download(name, text) {
  const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([text], { type: 'application/json' })); a.download = name; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 2000);
}
// ---------- backup .mabackup (gzip + Smile, igual ao app original) ----------
function randomLongStr() { const b = new Uint8Array(8); crypto.getRandomValues(b); let v = 0n; for (const x of b) v = (v << 8n) | BigInt(x); return BigInt.asIntN(64, v).toString(); }
async function pipeBytes(bytes, stream) { const w = stream.writable.getWriter(); w.write(bytes); w.close(); return new Uint8Array(await new Response(stream.readable).arrayBuffer()); }
async function gzipBytes(bytes) { const out = await pipeBytes(bytes, new CompressionStream('gzip')); out[8] = 0; out[9] = 0xff; return out; } // cabeçalho igual ao do app original
const gunzipBytes = bytes => pipeBytes(bytes, new DecompressionStream('gzip'));
function buildModel() {
  const key = p => p.maId || p.id;
  const ids = new Map(S.person.map(p => [p.id, key(p)]));
  return {
    persons: S.person.map(p => ({ key: key(p), name: p.name, address: p.address || '', bairro: p.bairro || '', notes: p.notes || '', raw: p.raw || null })),
    visits: S.visit.filter(v => ids.has(v.personId)).map(v => ({ personKey: ids.get(v.personId), date: v.date, note: v.note || '', raw: v.raw || null, idx: v.idx })),
    times: S.time.map(t => ({ date: t.date, minutes: Number(t.minutes), note: t.note || '', ldc: !!t.ldc, raw: t.raw || null })),
    reports: S.report.map(r => ({ month: r.month, hm: Number(r.hm || 0), studies: Number(r.studies || 0), imp: r.imp || { hm: 0, studies: 0 } })),
    ma: S.settings.ma || {},
  };
}
async function exportMaBackup() {
  const roots = MABackup.fromModel(buildModel(), Date.now());
  const gz = await gzipBytes(Smile.encode(roots, { multi: true }));
  const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([gz], { type: 'application/octet-stream' }));
  a.download = `MABackup-${today()}.mabackup`; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 3000);
}
async function readBackupFile(file) {
  let bytes = new Uint8Array(await file.arrayBuffer());
  if (bytes[0] === 0x1f && bytes[1] === 0x8b) bytes = await gunzipBytes(bytes);
  if (bytes[0] === 0x3a && bytes[1] === 0x29 && bytes[2] === 0x0a) return { kind: 'ma', model: MABackup.toModel(Smile.decode(bytes).roots) };
  try { return { kind: 'json', data: JSON.parse(new TextDecoder().decode(bytes)) }; } catch { throw new Error('Arquivo de backup não reconhecido'); }
}
async function importMaModel(model, mode) {
  await flushQ(); if (getQ().length) throw new Error('Sem conexão com a internet');
  const replace = mode === 'replace';
  if (replace) must(await sb.from('records').delete().in('kind', ['person', 'visit', 'time', 'report']));
  const rows = [], uid = S.user.id, now = new Date().toISOString();
  const row = (kind, data) => { const id = uuid(); rows.push({ id, user_id: uid, kind, data, updated_at: now }); return id; };
  const haveP = new Set(replace ? [] : S.person.map(p => p.maId).filter(Boolean));
  const haveT = new Set(replace ? [] : S.time.map(t => t.date));
  const haveR = new Set(replace ? [] : S.report.map(r => r.month));
  const pid = new Map();
  for (const p of model.persons) {
    if (haveP.has(p.key)) { const ex = S.person.find(x => x.maId === p.key); if (ex) pid.set(p.key, ex.id); continue; }
    pid.set(p.key, row('person', { name: p.name, address: p.address, bairro: p.bairro, notes: p.notes, created: p.created || today(), maId: p.key, raw: p.raw }));
  }
  const newP = new Set(model.persons.filter(p => !haveP.has(p.key)).map(p => p.key));
  for (const v of model.visits) if (newP.has(v.personKey)) row('visit', { personId: pid.get(v.personKey), date: v.date || today(), note: v.note, kinds: [], raw: v.raw, idx: v.idx });
  for (const t of model.times) if (!haveT.has(t.date)) row('time', { date: t.date, minutes: t.minutes, ldc: false, note: t.note, raw: t.raw });
  for (const r of model.reports) if (!haveR.has(r.month)) row('report', { month: r.month, hm: r.hm, studies: r.studies, rv: r.rv, videos: r.videos, imp: { hm: r.hm, studies: r.studies } });
  for (let i = 0; i < rows.length; i += 400) must(await sb.from('records').upsert(rows.slice(i, i + 400)));
  if (replace || !S.settings.ma) await saveSettings({ ma: model.ma });
  await loadAll();
  return { persons: newP.size, times: model.times.filter(t => !haveT.has(t.date)).length, reports: model.reports.filter(r => !haveR.has(r.month)).length };
}
function doLogout() {
  stopRealtime();
  if (sb) sb.auth.signOut().catch(() => {});
  try { localStorage.removeItem(C_KEY); localStorage.removeItem(Q_KEY); } catch {}
  netBadge();
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
    const ms = timer.elapsed();
    if (ms < 1000) { timer.reset(); render(); return; }
    const min = Math.round(ms / 600) / 100; // minutos com 2 casas: 34 s = 0,57 min
    const date = today(); // dia em que parou
    await save('time', { date, minutes: min, ldc: false, note: 'Cronômetro' }); // se falhar, o cronômetro NÃO é zerado
    timer.reset(); render(); toast(`Tempo salvo: ${fmtDur(min)}`);
  }),
  'add-time': () => timeDialog(),
  'edit-time': el => timeDialog(S.time.find(x => x.id === el.dataset.id)),
  'add-report': () => { drawerOpen = false; timeDialog(); },
  'go-people-search': () => { peopleSearchOpen = true; go('people'); },
  rtab: el => { reportTab = el.dataset.v; render(); },
  mprev: () => { reportMonth = addMonths(reportMonth, -1); render(); }, mnext: () => { reportMonth = addMonths(reportMonth, 1); render(); },
  yprev: () => { reportMonth = addMonths(reportMonth, -12); render(); }, ynext: () => { reportMonth = addMonths(reportMonth, 12); render(); },
  'edit-studies': async () => { const cur = S.report.find(r => r.month === reportMonth) || { month: reportMonth };
    await dialog({ title: 'Estudos individuais', fields: [{ name: 'n', label: 'Quantidade', type: 'number', min: 0, value: monthStats(reportMonth).studies }],
      onSubmit: async v => { await save('report', { ...cur, studies: Number(v.n || 0), studiesSet: true }); render(); } }); },
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
  quick: el => guard(async () => {
    const m = +el.dataset.m, d = today(), ex = S.time.find(t => t.date === d && !t.ldc && t.note === 'Rápido');
    await save('time', ex ? { ...ex, minutes: Number(ex.minutes) + m } : { date: d, minutes: m, ldc: false, note: 'Rápido' });
    render(); showUndo(`+${m < 60 ? m + ' min' : m / 60 + ' h'} lançado`, async () => { if (ex) await save('time', ex); else { const cur = S.time.find(t => t.date === d && !t.ldc && t.note === 'Rápido'); if (cur) await remove('time', cur.id, { silent: true }); } });
  }),
  'edit-wgoal': () => dialog({ title: 'Meta da semana', fields: [{ name: 'g', label: 'Horas por semana', type: 'number', step: 'any', min: 0, value: S.settings.weeklyGoal != null ? S.settings.weeklyGoal : '' }],
    extra: [{ label: 'Padrão', run: async () => { const x = { ...S.settings }; await saveSettings({ weeklyGoal: null }); render(); } }],
    onSubmit: async v => { await saveSettings({ weeklyGoal: v.g === '' ? null : Number(v.g) }); render(); } }),
  'go-map': () => go('map'),
  mfilter: el => { mapFilter = el.dataset.v; render(); },
  'map-retry': () => guard(async () => { for (const p of S.person.filter(p => p.geo && p.geo.fail)) await save('person', { ...p, geo: null }); render(); }),
  'map-locate': () => { if (!mapObj) return; if (!navigator.geolocation) return toast('Localização indisponível'); navigator.geolocation.getCurrentPosition(pos => { const ll = [pos.coords.latitude, pos.coords.longitude]; if (mapUser) mapUser.remove(); mapUser = L.circleMarker(ll, { radius: 8, color: '#fff', weight: 3, fillColor: '#1e7bff', fillOpacity: 1 }).addTo(mapObj); mapObj.setView(ll, 15); }, () => toast('Permita a localização para ver onde você está')); },
  'edit-city': () => dialog({ title: 'Cidade para o mapa', html: '<p class="sub">Usada para achar os endereços (ex.: Campinas, SP).</p>', fields: [{ name: 'c', label: 'Cidade e estado', value: S.settings.city }], onSubmit: async v => { await saveSettings({ city: String(v.c || '').trim() }); render(); } }),
  pfilter: el => { peopleFilter = el.dataset.v; render(); },
  'share-pdf': () => guard(() => shareReportPdf(reportMonth)),
  'remind-share': el => { reportMonth = el.dataset.mk; return actions.share(); },
  'remind-done': async el => { await saveSettings({ sent: { ...(S.settings.sent || {}), [el.dataset.mk]: true } }); render(); toast('Marcado como enviado'); },
  'toggle-sent': async () => { const sent = { ...(S.settings.sent || {}) }; if (sent[reportMonth]) delete sent[reportMonth]; else sent[reportMonth] = true; await saveSettings({ sent }); render(); },
  'add-person': () => personDialog(),
  'open-person': el => go('person/' + el.dataset.id),
  'edit-person': el => personDialog(S.person.find(x => x.id === el.dataset.id)),
  'del-person': async el => { const p = S.person.find(x => x.id === el.dataset.id); if (await confirmDlg('Apagar interessado?', `${p.name} e todas as visitas serão apagados.`)) { await remove('person', p.id); go('people'); } },
  'add-visit': el => visitDialog(el.dataset.id),
  'edit-visit': el => { const v = S.visit.find(x => x.id === el.dataset.id); return visitDialog(v.personId, v); },
  'add-territory': () => territoryDialog(),
  'edit-territory': el => territoryDialog(S.territory.find(x => x.id === el.dataset.id)),
  'terr-today': async el => { const t = S.territory.find(x => x.id === el.dataset.id); await save('territory', { ...t, lastWorked: today() }); render(); },
  'terr-block': async el => { const t = S.territory.find(x => x.id === el.dataset.id), i = +el.dataset.i;
    const blocks = t.blocks.map((b, j) => (j === i ? { ...b, done: !b.done, date: !b.done ? today() : '' } : b));
    await save('territory', { ...t, blocks, lastWorked: !t.blocks[i].done ? today() : t.lastWorked }); render(); },
  'bk-now': () => guard(async () => { must(await sb.rpc('snapshot_my_backup', { is_auto: false })); bkList = null; loadBackups(); render(); toast('Cópia criada'); }),
  'bk-dl': el => guard(async () => { const d = must(await sb.from('backups').select('data,created_at').eq('id', el.dataset.id).single()); download(`meurelatorio-copia-${d.created_at.slice(0, 10)}.json`, JSON.stringify(d.data, null, 2)); }),
  'bk-restore': el => guard(async () => {
    if (!(await confirmDlg('Restaurar esta cópia?', 'Todos os dados atuais da conta serão substituídos pelos desta cópia.', 'Restaurar'))) return;
    const d = must(await sb.from('backups').select('data').eq('id', el.dataset.id).single());
    toast('Restaurando…'); await importAll(d.data); await loadAll(); render(); toast('Cópia restaurada');
  }),
  'push-on': () => guard(async () => { await pushEnable(); await refreshPush(); render(); toast('Notificações ativadas'); }),
  'push-off': () => guard(async () => { await pushDisable(); pushOn = false; render(); toast('Notificações desativadas'); }),
  'push-test': () => guard(async () => {
    const { data: { session } } = await sb.auth.getSession();
    const r = await fetch(CFG.SUPABASE_URL + '/functions/v1/send-reminders', { method: 'POST', headers: { Authorization: 'Bearer ' + session.access_token, apikey: CFG.SUPABASE_ANON_KEY, 'Content-Type': 'application/json' }, body: '{}' });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error('Falha ao enviar o teste');
    toast(j.report && j.report[0] && j.report[0].sent ? 'Teste enviado — aguarde alguns segundos' : 'Não foi possível entregar (' + ((j.report && j.report[0] && (j.report[0].status || j.report[0].err)) || 'sem aparelho') + ')');
  }),
  theme: el => { localStorage.setItem('mr_theme', el.dataset.v); applyTheme(); render(); },
  'pin-on': () => pinSetDialog(), 'pin-change': () => pinSetDialog(true),
  'pin-off': () => dialog({ title: 'Desativar PIN', ok: 'Desativar', fields: [{ name: 'p', label: 'PIN atual', type: 'password', inputmode: 'numeric' }],
    onSubmit: async v => { if (!(await checkPin(String(v.p)))) throw new Error('PIN incorreto'); localStorage.removeItem(PIN_KEY); render(); toast('PIN desativado'); } }),
  'agenda-toggle': async () => { await saveSettings({ agendaFromReport: !agendaFromReport() }); render(); },
  'agenda-prev': () => { agendaOffset--; render(); }, 'agenda-next': () => { agendaOffset++; render(); },
  'plan-day': el => planDialog(el.dataset.date),
  'export-ma': () => guard(async () => { await exportMaBackup(); toast('Backup gerado'); }),
  export: () => guard(async () => { download(`meurelatorio-completo-${today()}.json`, JSON.stringify(await exportAll(), null, 2)); }),
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
  eye: el => { const i = $('#lf [name=password]'); const show = i.type === 'password'; i.type = show ? 'text' : 'password'; el.style.opacity = show ? 1 : .6; },
  lmode: el => { loginMode = el.dataset.v; render(); },
};

document.addEventListener('click', e => {
  const g = e.target.closest('[data-go]'); if (g) { drawerOpen = false; go(g.dataset.go); return; }
  if (e.target.closest('a[href^="http"], a[href^="tel:"]')) return;
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
    guard(async () => {
      const bk = await readBackupFile(f);
      if (bk.kind === 'json') {
        if (!(await confirmDlg('Importar dados?', 'Todos os dados atuais da conta serão substituídos.', 'Importar'))) return;
        await importAll(bk.data); await loadAll(); render(); toast('Dados importados'); return;
      }
      const m = bk.model;
      const r = await dialog({ title: 'Restaurar backup', ok: 'Restaurar',
        html: `<p class="sub">O arquivo contém <b>${m.persons.length}</b> interessados, <b>${m.visits.length}</b> visitas, <b>${m.times.length}</b> dias de horas e <b>${m.reports.length}</b> relatórios mensais.</p>`,
        fields: [{ name: 'mode', label: 'Como restaurar', type: 'select', value: 'replace', options: [['replace', 'Substituir (apaga interessados, horas e relatórios atuais)'], ['merge', 'Mesclar (só adiciona o que ainda não existe)']] }] });
      if (!r) return;
      toast('Restaurando…');
      const res = await importMaModel(m, r.mode); render();
      toast(`Pronto: ${res.persons} interessados, ${res.times} dias, ${res.reports} relatórios`);
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
    if (!/^\S+@\S+\.\S+$/.test(email)) throw new Error('Digite um e-mail válido');
    if (password.length < 6) throw new Error('A senha precisa de pelo menos 6 caracteres');
    let session;
    if (mode === 'register') {
      const d = must(await sb.auth.signUp({ email, password, options: { data: { name: String(fd.get('name') || '').trim() || email } } }));
      session = d.session;
      if (!session) { err.style.color = '#2a7d4f'; err.textContent = 'Conta criada! Confirme o e-mail que enviamos e depois entre.'; return; }
    } else session = must(await sb.auth.signInWithPassword({ email, password })).session;
    S.token = session.access_token; S.user = sessionUser(session);
    await loadAll(); if (S.settings.displayName) S.user.name = S.settings.displayName; startRealtime(); go('home'); render();
  } catch (ex) { err.style.color = ''; err.textContent = ex.message; } finally { btn.disabled = false; }
});
window.addEventListener('hashchange', () => { drawerOpen = false; menuOpen = null; chartMenu = null; render(); window.scrollTo(0, 0); });

// ---------- aparência (claro / escuro / automático) ----------
const getTheme = () => localStorage.getItem('mr_theme') || 'auto';
function applyTheme() {
  const t = getTheme(), dark = t === 'dark' || (t === 'auto' && matchMedia('(prefers-color-scheme: dark)').matches);
  document.documentElement.dataset.theme = dark ? 'dark' : 'light';
}
applyTheme();
matchMedia('(prefers-color-scheme: dark)').addEventListener?.('change', applyTheme);

// ---------- sincronização em tempo real entre aparelhos ----------
let rtChan = null, rtTimer = null;
function soon() {
  cacheSave(); clearTimeout(rtTimer);
  const tryRender = () => {
    if (route().name === 'map') return;
    if (document.querySelector('dialog[open]') || (document.activeElement && document.activeElement.matches('input,textarea,select'))) { rtTimer = setTimeout(tryRender, 1200); return; }
    render();
  };
  rtTimer = setTimeout(tryRender, 250);
}
function onRec(pl) {
  if (getQ().length || !S.user) return;
  if (pl.eventType === 'DELETE') { const id = pl.old && pl.old.id; if (!id) return; let ch = false; KINDS.forEach(k => { const n = S[k].length; S[k] = S[k].filter(x => x.id !== id); if (S[k].length !== n) ch = true; }); if (ch) soon(); return; }
  const n = pl.new; if (!n || n.user_id !== S.user.id || !KINDS.includes(n.kind)) return;
  const obj = rowToObj(n), arr = S[n.kind], i = arr.findIndex(x => x.id === n.id);
  if (i >= 0) { if (JSON.stringify(arr[i]) === JSON.stringify(obj)) return; arr[i] = obj; } else arr.push(obj);
  soon();
}
function onSet(pl) { const n = pl.new; if (!n || !S.user || n.user_id !== S.user.id) return; if (JSON.stringify(S.settings) === JSON.stringify(n.data)) return; S.settings = n.data || {}; soon(); }
function startRealtime() {
  if (!sb || !sb.channel || rtChan || !S.user) return;
  try { rtChan = sb.channel('sync-' + S.user.id).on('postgres_changes', { event: '*', schema: 'public', table: 'records' }, onRec).on('postgres_changes', { event: '*', schema: 'public', table: 'settings' }, onSet).subscribe(); } catch { rtChan = null; }
}
function stopRealtime() { if (rtChan && sb) { try { sb.removeChannel(rtChan); } catch { /* ok */ } } rtChan = null; }

// ---------- notificações push ----------
const urlB64 = b => { const p = '='.repeat((4 - b.length % 4) % 4), r = (b + p).replace(/-/g, '+').replace(/_/g, '/'), raw = atob(r); return Uint8Array.from([...raw].map(c => c.charCodeAt(0))); };
const pushSupported = () => 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
async function pushSub() { if (!pushSupported()) return null; const reg = await navigator.serviceWorker.ready; return reg.pushManager.getSubscription(); }
async function pushEnable() {
  if (!pushSupported()) throw new Error(IS_IOS ? 'No iPhone, instale o app na Tela de Início (iOS 16.4 ou mais) e abra por lá.' : 'Este navegador não suporta notificações.');
  const perm = await Notification.requestPermission();
  if (perm !== 'granted') throw new Error('Permissão negada. Ative em Ajustes > Notificações > Meu relatório.');
  const reg = await navigator.serviceWorker.ready;
  const sub = (await reg.pushManager.getSubscription()) || await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: urlB64(CFG.VAPID_PUBLIC_KEY) });
  const j = sub.toJSON();
  must(await sb.from('push_subs').upsert({ user_id: S.user.id, endpoint: j.endpoint, p256dh: j.keys.p256dh, auth: j.keys.auth, tz: Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/Sao_Paulo' }, { onConflict: 'endpoint' }));
}
async function pushDisable() {
  const sub = await pushSub(); if (!sub) return;
  await sb.from('push_subs').delete().eq('endpoint', sub.endpoint); await sub.unsubscribe();
}
let pushOn = false;
async function refreshPush() { try { const s = await pushSub(); const on = !!s && Notification.permission === 'granted'; if (on !== pushOn) { pushOn = on; if (route().name === 'settings') render(); } } catch { /* sem suporte */ } }

// ---------- bloqueio por PIN (neste aparelho) ----------
const PIN_KEY = 'mr_pin';
const pinCfg = () => { try { return JSON.parse(localStorage.getItem(PIN_KEY)); } catch { return null; } };
async function pinHash(pin, salt) { const b = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(salt + ':' + pin)); return [...new Uint8Array(b)].map(x => x.toString(16).padStart(2, '0')).join(''); }
async function setPin(pin) { const salt = uuid(); localStorage.setItem(PIN_KEY, JSON.stringify({ salt, hash: await pinHash(pin, salt) })); }
async function checkPin(pin) { const c = pinCfg(); return !!c && (await pinHash(pin, c.salt)) === c.hash; }
let locked = false;
function showLock() {
  if (!pinCfg() || locked) return; locked = true;
  const el = document.createElement('div'); el.id = 'lock'; let val = '';
  const draw = (msg = '') => {
    el.innerHTML = `<img src="icons/icon-192.png" alt=""><h2>Digite o PIN</h2><div class="dots">${[0, 1, 2, 3].map(i => `<i class="${i < val.length ? 'on' : ''}"></i>`).join('')}</div><div class="lerr">${msg}</div>
      <div class="pad">${[1, 2, 3, 4, 5, 6, 7, 8, 9, '', 0, '⌫'].map(k => k === '' ? '<span></span>' : `<button type="button" data-k="${k}">${k}</button>`).join('')}</div>
      <button type="button" class="linkbtn" data-forgot>Esqueci o PIN (sair da conta)</button>`;
  };
  el.onclick = async e => {
    if (e.target.closest('[data-forgot]')) { if (confirm('Sair da conta e remover o PIN? Depois é só entrar de novo com e-mail e senha.')) { localStorage.removeItem(PIN_KEY); el.remove(); locked = false; doLogout(); } return; }
    const b = e.target.closest('[data-k]'); if (!b) return;
    const k = b.dataset.k; if (k === '⌫') val = val.slice(0, -1); else if (val.length < 4) val += k;
    draw();
    if (val.length === 4) { if (await checkPin(val)) { el.remove(); locked = false; } else { val = ''; draw('PIN incorreto'); el.classList.add('shake'); setTimeout(() => el.classList.remove('shake'), 400); } }
  };
  draw(); document.body.appendChild(el);
}
let hiddenAt = 0;
document.addEventListener('visibilitychange', () => {
  if (document.hidden) { hiddenAt = Date.now(); return; }
  if (pinCfg() && hiddenAt && Date.now() - hiddenAt > 30000) showLock();
  if (S.user) { const away = Date.now() - hiddenAt; flushQ().then(() => { if (away > 60000 && hiddenAt) return loadAll(); }).then(() => { if (!document.querySelector('dialog[open]') && route().name !== 'map') render(); }).catch(() => {}); }
});
window.addEventListener('online', () => { netBadge(); if (S.user) flushQ().then(() => loadAll().then(render).catch(() => {})); });
window.addEventListener('offline', netBadge);

// ---------- início ----------
const splashStart = performance.now();
function hideSplash() {
  const sp = $('#splash'); if (!sp) return;
  const wait = Math.max(0, 900 - (performance.now() - splashStart));
  setTimeout(() => { sp.classList.add('hide'); setTimeout(() => sp.remove(), 500); }, wait);
}
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
  showLock(); netBadge();
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
      if (data.session) { S.token = data.session.access_token; S.user = sessionUser(data.session); await loadAll(); if (S.settings.displayName) S.user.name = S.settings.displayName; setTimeout(autoBackup, 4000); startRealtime(); }
    } catch (e) { toast('Sem conexão com o servidor'); }
  }
  render();
  hideSplash();
})();
