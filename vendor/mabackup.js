/* Leitura e escrita de backups .mabackup do Ministry Assistant (gzip + Smile).
   Estrutura: 4 objetos Smile em sequência: [0] interessados/listas, [1] relatórios mensais, [2] horas diárias, [3] literatura.
   O que o app não edita é guardado "cru" (J.to) e reexportado exatamente como veio. */
(function (root) {
  'use strict';
  const S = typeof require !== 'undefined' && typeof module !== 'undefined' ? require('./smile.js') : root.Smile;
  const { Obj, Long, Float32, Double } = S;
  const pad = n => String(n).padStart(2, '0');

  // ---- JSON seguro para guardar estruturas Smile no banco ----
  const J = {
    to(v) {
      if (v instanceof Obj) return { $o: v.entries.map(([k, x]) => [k, J.to(x)]) };
      if (Array.isArray(v)) return v.map(J.to);
      if (v instanceof Long) return { $l: v.v.toString() };
      if (v instanceof Float32) return { $f: v.v };
      if (v instanceof Double) return { $d: v.v };
      return v;
    },
    from(j) {
      if (Array.isArray(j)) return j.map(J.from);
      if (j && typeof j === 'object') {
        if ('$o' in j) return new Obj(j.$o.map(([k, x]) => [k, J.from(x)]));
        if ('$l' in j) return new Long(BigInt(j.$l));
        if ('$f' in j) return new Float32(j.$f);
        if ('$d' in j) return new Double(j.$d);
      }
      return j;
    },
  };
  const num = v => (v instanceof Long ? Number(v.v) : v instanceof Float32 || v instanceof Double ? v.v : v);
  const dateOfMs = ms => { const d = new Date(Number(ms)); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; };
  const msOfDate = s => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d, 12, 0, 0).getTime(); };
  const serviceYear = (y, m) => (m >= 9 ? y + 1 : y);
  const monthOfId = id => { const sy = Math.floor(id / 100), m = id % 100; return `${m >= 9 ? sy - 1 : sy}-${pad(m)}`; };
  const idOfMonth = mk => { const [y, m] = mk.split('-').map(Number); return serviceYear(y, m) * 100 + m; };

  // helpers de Obj ordenado
  const setKey = (o, k, v, afterKeys) => {
    const e = o.entries.find(x => x[0] === k);
    if (e) { e[1] = v; return; }
    let idx = -1; (afterKeys || []).forEach(a => { const i = o.entries.findIndex(x => x[0] === a); if (i > idx) idx = i; });
    o.entries.splice(idx + 1, 0, [k, v]);
  };
  const setKeyBefore = (o, k, v, beforeKeys) => {
    const e = o.entries.find(x => x[0] === k); if (e) { e[1] = v; return; }
    let idx = o.entries.length; (beforeKeys || []).forEach(b => { const i = o.entries.findIndex(x => x[0] === b); if (i >= 0 && i < idx) idx = i; });
    o.entries.splice(idx, 0, [k, v]);
  };
  const delKey = (o, k) => { const i = o.entries.findIndex(x => x[0] === k); if (i >= 0) o.entries.splice(i, 1); };

  // ================= LER =================
  function toModel(roots) {
    const find = key => roots.find(r => r instanceof Obj && r.get(key) !== undefined);
    const r0 = find('PersonMap'), r1 = find('Years'), r2 = find('Array'), r3 = find('Books');
    const model = { persons: [], visits: [], times: [], reports: [], ma: {} };

    if (r0) {
      model.ma.r0 = { FileVersion: num(r0.get('FileVersion')), Territories: J.to(r0.get('Territories')), lists: {} };
      for (const k of ['Suburbs', 'SuDate', 'Cities', 'CiDate', 'ScriptureCont', 'ScDate']) if (r0.get(k) !== undefined) model.ma.r0.lists[k] = J.to(r0.get(k));
      for (const [, pe] of r0.get('PersonMap').entries) {
        const P = pe.get('P'); if (!P) continue;
        const id = P.get('ID'); const key = id instanceof Long ? id.v.toString() : String(id);
        const inf = P.get('Inf');
        const rawP = new Obj(P.entries.map(([k, v]) => [k, k === 'Inf' ? new Obj() : v]));
        const dt = num(P.get('Date'));
        model.persons.push({ key, name: P.get('N') || '', address: P.get('Add') || '', bairro: P.get('Sub') || '', notes: P.get('Gen') || '',
          created: dt ? dateOfMs(dt) : '', raw: J.to(rawP) });
        if (inf) inf.entries.forEach(([, pi], i) => {
          const d = num(pi.get('D'));
          model.visits.push({ personKey: key, idx: i, date: d ? dateOfMs(d) : '', note: pi.get('I') || '', raw: J.to(pi) });
        });
      }
    }
    if (r1) {
      model.ma.r1 = J.to(r1); // árvore inteira, reexportada com os ajustes
      for (const [, Y] of r1.get('Years').entries) {
        for (const [, M] of Y.get('Month').entries) {
          const rp = M.get('RP'); const ss = rp && rp.get('SS'); if (!ss) continue;
          const id = num(M.get('Id'));
          model.reports.push({ month: monthOfId(id), id, hm: num(ss.get('Hm')) || 0, studies: num(ss.get('S')) || 0, rv: num(ss.get('RV')) || 0, videos: num(ss.get('VS')) || 0 });
        }
      }
    }
    if (r2) {
      model.ma.r2 = { FileVersion: num(r2.get('FileVersion')) };
      for (const [k, v] of r2.get('Array').entries) {
        if (k !== 'Year') continue;
        const e = v.entries;
        for (let i = 0; i + 2 < e.length + 0 && e[i][0] === 'F'; i += 3) {
          const F = e[i][1], D = num(e[i + 1][1]), C = e[i + 2] ? e[i + 2][1] : '';
          const s = String(D); const date = `${s.slice(0, 4)}-${s.slice(4, 6)}-${s.slice(6, 8)}`;
          model.times.push({ date, minutes: Math.round(num(F) * 60), note: C || '', raw: { F: J.to(F), C: C || '' } });
        }
      }
    }
    if (r3) model.ma.r3 = J.to(r3);
    return model;
  }

  // ================= ESCREVER =================
  const randomLong = () => {
    const b = new Uint8Array(8); (root.crypto || require('crypto').webcrypto).getRandomValues(b);
    let v = 0n; for (const x of b) v = (v << 8n) | BigInt(x);
    return new Long(BigInt.asIntN(64, v));
  };
  function defaultP(p, last, now) {
    const o = new Obj([['Inf', new Obj()], ['TpI', 0], ['Add', p.address || ''], ['N', p.name || ''], ['Age', 0], ['Hidden', false], ['Pinned', false],
      ['Intd', true], ['LstTry', last || now], ['Prio', 0], ['VTm', 0], ['Date', now], ['ID', p.key && /^-?\d+$/.test(p.key) ? new Long(BigInt(p.key)) : randomLong()], ['Type', 1], ['Lat', 0], ['Lon', 0]]);
    return o;
  }

  // m: { persons:[{key,name,address,bairro,notes,raw}], visits:[{personKey,date,note,raw}], times:[{date,minutes,note,ldc,raw}],
  //      reports:[{month,hm,studies,imp:{hm,studies}}], ma:{...} }
  function fromModel(m, nowMs) {
    const now = nowMs || Date.now(); const ma = m.ma || {};
    // ---- raiz 0: interessados ----
    const PM = new Obj();
    const brs = [];
    for (const p of m.persons) {
      const vs = m.visits.filter(v => v.personKey === p.key).map((v, i) => ({ ...v, _i: i }));
      const last = vs.length ? Math.max(...vs.map(v => msOfDate(v.date))) : 0;
      const P = p.raw ? J.from(p.raw) : defaultP(p, last, now);
      setKey(P, 'N', p.name || '');
      setKey(P, 'Add', p.address || '', ['TpI']);
      if (p.bairro) { setKey(P, 'Sub', p.bairro, ['Add']); brs.push(p.bairro); } else delKey(P, 'Sub');
      if (p.notes) setKey(P, 'Gen', p.notes, ['VTm']); else delKey(P, 'Gen');
      const age = num(P.get('Age')) || 0;
      const items = vs.map(v => {
        const PI = v.raw ? J.from(v.raw) : new Obj([['PtI', 0], ['D', msOfDate(v.date)], ['Ag', age]]);
        if (v.note) setKeyBefore(PI, 'I', v.note, ['PtI']); else delKey(PI, 'I');
        const d0 = PI.get('D'); if (d0 === undefined || dateOfMs(num(d0)) !== v.date) setKey(PI, 'D', msOfDate(v.date), ['PtI']);
        return { PI, d: num(PI.get('D')), i: v.idx != null ? v.idx : 1e9 + v._i };
      }).sort((a, b) => a.i - b.i || a.d - b.d);
      setKey(P, 'Inf', new Obj(items.map(x => ['PI', x.PI])), []);
      PM.entries.push(['Pe', new Obj([['P', P]])]);
    }
    const L = (ma.r0 && ma.r0.lists) || {};
    const sub = L.Suburbs ? L.Suburbs.slice() : [];
    let subChanged = false; brs.forEach(b => { if (!sub.includes(b)) { sub.push(b); subChanged = true; } });
    const r0 = new Obj([
      ['FileVersion', (ma.r0 && ma.r0.FileVersion) || 27],
      ['Territories', ma.r0 && ma.r0.Territories ? J.from(ma.r0.Territories) : new Obj()],
      ['PersonMap', PM],
      ['Suburbs', sub], ['SuDate', subChanged || !L.SuDate ? now : J.from(L.SuDate)],
      ['Cities', L.Cities ? J.from(L.Cities) : []], ['CiDate', L.CiDate ? J.from(L.CiDate) : now],
      ['ScriptureCont', L.ScriptureCont ? J.from(L.ScriptureCont) : []], ['ScDate', L.ScDate ? J.from(L.ScDate) : now],
    ]);

    // ---- raiz 2: horas diárias (só ministério; LDC não tem campo aqui) ----
    const byDate = new Map();
    for (const t of m.times) {
      if (t.ldc) continue;
      const e = byDate.get(t.date) || { min: 0, items: [] }; e.min += Number(t.minutes); e.items.push(t); byDate.set(t.date, e);
    }
    const dates = [...byDate.keys()].sort();
    const groups = new Map();
    for (const d of dates) {
      const e = byDate.get(d); const [y, mo] = d.split('-').map(Number); const k = serviceYear(y, mo);
      let F, C;
      const one = e.items.length === 1 && e.items[0].raw;
      if (one && Math.round(num(J.from(e.items[0].raw.F)) * 60) === e.min) { F = J.from(e.items[0].raw.F); C = e.items[0].raw.C || ''; }
      else { F = new Float32(Math.fround(e.min / 60)); C = e.items.map(t => t.note).filter(Boolean).join(', '); }
      (groups.get(k) || groups.set(k, []).get(k)).push(['F', F], ['D', Number(d.replace(/-/g, ''))], ['C', C]);
    }
    const arr = new Obj();
    [...groups.keys()].sort((a, b) => a - b).forEach(k => { arr.entries.push(['K', k], ['Year', new Obj(groups.get(k))]); });
    const r2 = new Obj([['FileVersion', (ma.r2 && ma.r2.FileVersion) || 3], ['Date', now], ['Array', arr]]);

    // ---- raiz 1: relatórios mensais (árvore original + ajustes) ----
    const minutesByMonth = {}; m.times.forEach(t => { if (!t.ldc) { const k = t.date.slice(0, 7); minutesByMonth[k] = (minutesByMonth[k] || 0) + Number(t.minutes); } });
    const hasDaily = {}; m.times.forEach(t => { hasDaily[t.date.slice(0, 7)] = true; });
    const r1 = ma.r1 ? J.from(ma.r1) : new Obj([['FileVersion', 22], ['Years', new Obj()], ['Ct1', false], ['Cc1', false], ['Ct2', false], ['Cc2', false], ['Ct3', false], ['Cc3', false], ['CD', String(now)]]);
    const Years = r1.get('Years');
    const monthIndex = new Map(); // id -> M
    for (const [, Y] of Years.entries) for (const [, M] of Y.get('Month').entries) monthIndex.set(num(M.get('Id')), M);
    const yearIndex = new Map(); for (const [, Y] of Years.entries) yearIndex.set(num(Y.get('Year')), Y);
    const ensureMonth = mk => {
      const id = idOfMonth(mk); if (monthIndex.has(id)) return monthIndex.get(id);
      const sy = Math.floor(id / 100); let Y = yearIndex.get(sy);
      if (!Y) {
        Y = new Obj([['Month', new Obj([9, 10, 11, 12, 1, 2, 3, 4, 5, 6, 7, 8].map(mm => ['M', new Obj([['Id', sy * 100 + mm]])]))], ['PII', 0], ['FirstPI', 9], ['Year', sy], ['Infirm', false], ['Modified', now]]);
        Years.entries.push(['Year', Y]); Years.entries.sort((a, b) => num(a[1].get('Year')) - num(b[1].get('Year'))); yearIndex.set(sy, Y);
        for (const [, M] of Y.get('Month').entries) monthIndex.set(num(M.get('Id')), M);
      }
      return monthIndex.get(id);
    };
    const reps = new Map(m.reports.map(r => [r.month, r]));
    const months = new Set([...reps.keys(), ...Object.keys(minutesByMonth)]);
    for (const mk of months) {
      const rep = reps.get(mk) || {}; const imp = rep.imp || { hm: 0, studies: 0 };
      const cur = hasDaily[mk] ? (minutesByMonth[mk] || 0) : (rep.hm || 0);
      const studies = Number(rep.studies || 0);
      const changed = cur !== (imp.hm || 0) || studies !== (imp.studies || 0);
      if (!changed) continue;
      const M = ensureMonth(mk);
      let RP = M.get('RP');
      if (!RP) { RP = new Obj([['SS', new Obj([['SD', now]])]]); setKey(M, 'RP', RP, []); setKey(M, 'RM', now, ['RP']); }
      const SS = RP.get('SS');
      setKeyBefore(SS, 'Hm', cur, ['T', 'M', 'Br', 'Bk', 'RV', 'S', 'SD', 'C']);
      if (studies) setKeyBefore(SS, 'S', studies, ['VS', 'SD', 'C']); else delKey(SS, 'S');
      setKey(SS, 'SD', now, []);
    }
    const r3 = ma.r3 ? J.from(ma.r3) : new Obj([['FileVersion', 5], ['Date', now], ['Books', []], ['Broschures', []], ['Other', []], ['Movies', []], ['Videos', []], ['Tracts', []], ['Magazines', new Obj()], ['Watchtower', new Obj()], ['Awake', new Obj()]]);
    return [r0, r1, r2, r3];
  }

  const api = { J, toModel, fromModel, dateOfMs, msOfDate, monthOfId, idOfMonth };
  if (typeof module !== 'undefined') module.exports = api; else root.MABackup = api;
})(typeof self !== 'undefined' ? self : this);
