// Decodificador/codificador Smile (formato binário JSON do Jackson) — suporte ao subconjunto usado pelo Ministry Assistant.
(function (root) {
  'use strict';
  const TD = typeof TextDecoder !== 'undefined' ? new TextDecoder('utf-8') : new (require('util').TextDecoder)('utf-8');
  const TE = typeof TextEncoder !== 'undefined' ? new TextEncoder() : new (require('util').TextEncoder)();

  class Double { constructor(v) { this.v = v; } valueOf() { return this.v; } toJSON() { return this.v; } }
  class Float32 { constructor(v) { this.v = v; } valueOf() { return this.v; } toJSON() { return this.v; } }
  class Obj { constructor(e) { this.entries = e || []; } get(k) { const f = this.entries.find(x => x[0] === k); return f ? f[1] : undefined; } all(k) { return this.entries.filter(x => x[0] === k).map(x => x[1]); } keys() { return this.entries.map(x => x[0]); } }
  class Long { constructor(v) { this.v = v; } valueOf() { return Number(this.v); } toJSON() { return Number(this.v); } }

  function decode(buf) {
    let p = 0;
    if (buf[0] !== 0x3a || buf[1] !== 0x29 || buf[2] !== 0x0a) throw new Error('Cabeçalho Smile inválido');
    const flags = buf[3]; p = 4;
    const sharedNames = !!(flags & 1), sharedStrings = !!(flags & 2);
    if (flags & 4) throw new Error('Binário bruto não suportado');
    const names = [], strs = [];
    const u8 = () => { if (p >= buf.length) throw new Error('Fim inesperado'); return buf[p++]; };
    const vint = () => { // retorna BigInt sem sinal
      let v = 0n;
      for (;;) { const b = u8(); if (b & 0x80) { return (v << 6n) | BigInt(b & 0x3f); } v = (v << 7n) | BigInt(b); }
    };
    const unzig = v => (v & 1n) ? -((v + 1n) >> 1n) : (v >> 1n);
    const text = n => { const s = TD.decode(buf.subarray(p, p + n)); p += n; return s; };
    const cstr = () => { const st = p; while (buf[p] !== 0xfc) p++; const s = TD.decode(buf.subarray(st, p)); p++; return s; };
    const addStr = (s, n) => { if (sharedStrings && n <= 64) { if (strs.length >= 1024) strs.length = 0; strs.push(s); } return s; };
    const raw7 = n => { // 7 bits por byte, n = bytes decodificados
      const out = new Uint8Array(n); let i = 0;
      while (n - i >= 7) { let acc = 0n; for (let k = 0; k < 8; k++) acc = (acc << 7n) | BigInt(u8()); for (let k = 6; k >= 0; k--) { out[i++] = Number((acc >> BigInt(k * 8)) & 0xffn); } }
      const rem = n - i; if (rem) { let bits = 0n; for (let k = 0; k < rem; k++) bits = (bits << 7n) | BigInt(u8()); /* simplificado */ }
      return out;
    };
    function key() {
      const b = u8();
      if (b === 0x20) return '';
      if (b >= 0x30 && b <= 0x33) return names[((b & 3) << 8) | u8()];
      if (b === 0x34) { const s = cstr(); return s; }
      if (b >= 0x40 && b <= 0x7f) return names[b - 0x40];
      let s;
      if (b >= 0x80 && b <= 0xbf) { const n = b - 0x80 + 1; s = text(n); }
      else if (b >= 0xc0 && b <= 0xf7) { const n = b - 0xc0 + 2; s = text(n); }
      else throw new Error('Chave inválida 0x' + b.toString(16) + ' em ' + (p - 1));
      if (sharedNames) { if (names.length >= 1024) names.length = 0; names.push(s); }
      return s;
    }
    function value() {
      const b = u8();
      if (b >= 0x01 && b <= 0x1f) return strs[b - 1];
      if (b >= 0x40 && b <= 0x5f) return addStr(text(b - 0x40 + 1), b - 0x40 + 1);
      if (b >= 0x60 && b <= 0x7f) return addStr(text(b - 0x60 + 33), b - 0x60 + 33);
      if (b >= 0x80 && b <= 0x9f) return addStr(text(b - 0x80 + 2), b - 0x80 + 2);
      if (b >= 0xa0 && b <= 0xbf) return addStr(text(b - 0xa0 + 34), b - 0xa0 + 34);
      if (b >= 0xc0 && b <= 0xdf) { const z = b & 0x1f; return (z & 1) ? -((z + 1) >> 1) : (z >> 1); }
      switch (b) {
        case 0x20: return '';
        case 0x21: return null;
        case 0x22: return false;
        case 0x23: return true;
        case 0x24: return Number(unzig(vint()));
        case 0x25: { const v = unzig(vint()); return (v > 2147483647n || v < -2147483648n) ? new Long(v) : Number(v); }
        case 0x28: { let acc = 0; for (let i = 0; i < 5; i++) acc = acc * 128 + u8(); const dv = new DataView(new ArrayBuffer(4)); dv.setUint32(0, acc >>> 0); return new Float32(dv.getFloat32(0)); }
        case 0x29: { let acc = 0n; for (let i = 0; i < 10; i++) acc = (acc << 7n) | BigInt(u8()); const dv = new DataView(new ArrayBuffer(8)); dv.setBigUint64(0, acc & 0xffffffffffffffffn); return new Double(dv.getFloat64(0)); }
        case 0xe0: return addStr(cstr(), 65);
        case 0xe4: return addStr(cstr(), 65);
        case 0xf8: { const arr = []; while (buf[p] !== 0xf9) arr.push(value()); p++; return arr; }
        case 0xfa: { const o = new Obj(); while (buf[p] !== 0xfb) { const k = key(); o.entries.push([k, value()]); } p++; return o; }
        default:
          if (b >= 0x2c && b <= 0x2f) return strs[((b & 3) << 8) | u8()];
          throw new Error('Token inválido 0x' + b.toString(16) + ' em ' + (p - 1));
      }
    }
    const roots = []; while (p < buf.length) { if (buf[p] === 0xff) { p++; continue; } roots.push(value()); }
    return { flags, root: roots[0], roots };
  }

  // ---------- codificador (espelha o Jackson: nomes compartilhados, strings não compartilhadas) ----------
  function encode(root, opts) {
    opts = opts || {};
    const out = []; // bytes
    const names = new Map(); // nome -> índice
    const push = b => out.push(b & 0xff);
    const pushAll = arr => { for (const b of arr) out.push(b); };
    out.push(0x3a, 0x29, 0x0a, 0x01); // ":)\n" + flags (nomes compartilhados)
    const vintBytes = (u) => { // u: BigInt >= 0
      const bytes = [Number(0x80n | (u & 0x3fn))]; u >>= 6n;
      while (u > 0n) { bytes.unshift(Number(u & 0x7fn)); u >>= 7n; }
      return bytes;
    };
    const zig = v => (v >= 0n ? v << 1n : ((-v) << 1n) - 1n);
    const isAscii = s => { for (let i = 0; i < s.length; i++) if (s.charCodeAt(i) > 127) return false; return true; };
    function writeKey(k) {
      if (k === '') { push(0x20); return; }
      if (names.has(k)) {
        const i = names.get(k);
        if (i < 64) push(0x40 + i); else { push(0x30 | (i >> 8)); push(i & 0xff); }
        return;
      }
      const bytes = TE.encode(k);
      const share = bytes.length <= 64;
      if (bytes.length === k.length && bytes.length <= 64) { push(0x80 + bytes.length - 1); pushAll(bytes); }
      else if (bytes.length !== k.length && bytes.length >= 2 && bytes.length <= 56) { push(0xc0 + bytes.length - 2); pushAll(bytes); }
      else { push(0x34); pushAll(bytes); push(0xfc); }
      if (share) { if (names.size >= 1024) names.clear(); names.set(k, names.size); }
    }
    function writeString(s) {
      if (s === '') { push(0x20); return; }
      const bytes = TE.encode(s), n = bytes.length, ascii = n === s.length;
      if (n <= 64) {
        if (ascii) { if (n <= 32) push(0x40 + n - 1); else push(0x60 + n - 33); }
        else { if (n <= 33) push(0x80 + n - 2); else push(0xa0 + n - 34); }
        pushAll(bytes);
      } else { push(ascii ? 0xe0 : 0xe4); pushAll(bytes); push(0xfc); }
    }
    function writeInt(v) { // v: BigInt
      if (v >= -16n && v <= 15n) { push(0xc0 + Number(zig(v))); return; }
      if (v >= -2147483648n && v <= 2147483647n) { push(0x24); pushAll(vintBytes(zig(v))); return; }
      push(0x25); pushAll(vintBytes(zig(v)));
    }
    function writeDouble(x) {
      push(0x29);
      const dv = new DataView(new ArrayBuffer(8)); dv.setFloat64(0, x);
      let acc = dv.getBigUint64(0); const bytes = [];
      for (let i = 0; i < 10; i++) { bytes.unshift(Number(acc & 0x7fn)); acc >>= 7n; }
      pushAll(bytes);
    }
    function writeFloat(x) {
      push(0x28);
      const dv = new DataView(new ArrayBuffer(4)); dv.setFloat32(0, x);
      let acc = dv.getUint32(0); const bytes = [];
      for (let i = 0; i < 5; i++) { bytes.unshift(acc & 0x7f); acc = Math.floor(acc / 128); }
      pushAll(bytes);
    }
    function value(v) {
      if (v === null || v === undefined) push(0x21);
      else if (v === true) push(0x23);
      else if (v === false) push(0x22);
      else if (typeof v === 'string') writeString(v);
      else if (typeof v === 'bigint') writeInt(v);
      else if (v instanceof Long) writeInt(BigInt(v.v));
      else if (v instanceof Float32) writeFloat(v.v);
      else if (v instanceof Double) writeDouble(v.v);
      else if (typeof v === 'number') { if (Number.isInteger(v)) writeInt(BigInt(v)); else writeDouble(v); }
      else if (Array.isArray(v)) { push(0xf8); v.forEach(value); push(0xf9); }
      else if (v instanceof Obj) { push(0xfa); for (const [k, x] of v.entries) { writeKey(k); value(x); } push(0xfb); }
      else throw new Error('Tipo não suportado no Smile');
    }
    (opts.multi ? root : [root]).forEach(value);
    if (opts.endMarker) push(0xff);
    return Uint8Array.from(out);
  }
  const api = { decode, encode, Double, Float32, Long, Obj };
  if (typeof module !== 'undefined') module.exports = api; else root.Smile = api;
})(typeof self !== 'undefined' ? self : this);
