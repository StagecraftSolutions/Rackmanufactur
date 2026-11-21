// Maintain the product database: JSON/CSV in data/ <-> data blocks in public/index.html
//
//   node scripts/data.mjs export                 index.html -> data/*.json + data/devices.csv
//   node scripts/data.mjs import                 data/*.json -> index.html (validates first)
//   node scripts/data.mjs import --csv           also merge data/devices.csv (columns as exported)
//   node scripts/data.mjs import --weights data/weight-catalog.csv
//                                                merge a weight list (columns key;name;part_no;kg)
//   node scripts/data.mjs import --review ~/Downloads/views-review-2026-11-16.json
//                                                merge views and approvals from the in-app review editor
//   node scripts/data.mjs check [--…]            validate only, write nothing
//
// Data blocks in index.html (plain JSON between the markers):
//   /* DATA:DEVDB */ const DEVDB = {...};        <- data/devices.json
//   /* DATA:KG */ const KG = {...};              <- data/weights.json
//   /* DATA:EXACT */ const EXACT_JSON = {...};   <- data/views.json
//   /* DATA:CTYPES */ const CTYPES = {...};      <- data/connectors.json (types)
//   /* DATA:CON */ const CON = {...};            <- data/connectors.json (connectors)
//   /* DATA:I18N */ const I18N_EN = {...};       <- data/i18n/ui.json + data/i18n/catalog.json (only translated entries)
//   /* DATA:SBX */ const SBX = {...};            <- data/sysboxx.json (Sommer Cable SYSBOXX housings and front plates)
//   /* DATA:PARTS */ const PARTS = {...};        <- data/parts.json (panels, ART, shelves, drawers, cases, accessories, rear rail)
import { readFileSync, writeFileSync, existsSync } from 'node:fs';

const ROOT = new URL('..', import.meta.url);
const HTML = new URL('public/index.html', ROOT);
const F = { DEVDB: 'data/devices.json', KG: 'data/weights.json', EXACT: 'data/views.json' };
const VAR = { DEVDB: 'DEVDB', KG: 'KG', EXACT: 'EXACT_JSON', I18N: 'I18N_EN', CTYPES: 'CTYPES', CON: 'CON', SBX: 'SBX', PARTS: 'PARTS' };
const SBXF = 'data/sysboxx.json';
const PARTSF = 'data/parts.json';
const CONF = 'data/connectors.json';
const CFIT = ['d', 'dblank', 'fp'];

const FIT = ['rack', 'bmd', 'half', 'free', 'desk'];
const IO = ['rj45', 'sfp', 'bnc', 'xlr', 'xlrf', 'xlr5', 'hdmi', 'usb', 'usba', 'usbc', 'iec', 'dc', 'jack', 'opt', 'sd', 'powercon', 'cee32m', 'cee32f', 'cee16m', 'cee16f', 'schuko', 'gland', 'brk', 'rcd', 'lcd', 'btn', 'knob', 'combo', 'ethercon', 'din', 'rca', 'sma', 'ant', 'nl4', 'nl8', 'euroblock', 'db9', 'fan', 'han16f', 'han16m', 'han10f', 'han10m', 'han6f', 'han6m', 'lka25', 'lk37', 'cee63m', 'cee63f', 'cee125m', 'cee125f', 'powerlockm', 'powerlockf', 'cpot', 'cee16f4', 'cee16m4', 'cee32f4', 'cee32m4'];
const EL = ['btn', 'malogo', 'madisp', 'enc', 'rect', 'vline', 'ledc', 'lcdl', 'sw', 'combo', 'ethercon', 'din', 'xlrf', 'fan', 'db9', 'rca', 'cover', 'led', 'reset', 'screen', 'txt', 'logo', 'lamp', 'mcb', 'rcd', 'cee16f', 'cee32f', 'schuko', 'gland', ...IO];

const rx = k => new RegExp(`/\\* DATA:${k} \\*/[\\s\\S]*?/\\* /DATA:${k} \\*/`);
function readBlock(src, k) {
  const m = src.match(rx(k)); if (!m) throw new Error(`block DATA:${k} missing in index.html`);
  return JSON.parse(m[0].slice(m[0].indexOf('{'), m[0].lastIndexOf('}') + 1));
}
const fmt = obj => '{\n' + Object.entries(obj).map(([k, v]) => `  ${JSON.stringify(k)}: ${JSON.stringify(v)}`).join(',\n') + '\n}';   // one entry per line: readable diffs
// parts: one section per key, one entry per line
const fmtParts = p => '{\n' + Object.entries(p).map(([k, v]) => `  ${JSON.stringify(k)}: ` + (Array.isArray(v) ? '[\n' + v.map(x => `    ${JSON.stringify(x)}`).join(',\n') + '\n  ]' : v && typeof v === 'object' && Object.values(v).every(x => x && typeof x === 'object') ? '{\n' + Object.entries(v).map(([a, x]) => `    ${JSON.stringify(a)}: ${JSON.stringify(x)}`).join(',\n') + '\n  }' : JSON.stringify(v))).join(',\n') + '\n}';
const block = (k, obj) => `/* DATA:${k} */ const ${VAR[k]} = ${k === 'PARTS' ? fmtParts(obj) : fmt(obj)};\n/* /DATA:${k} */`;
function writeBlock(src, k, obj) { if (!rx(k).test(src)) throw new Error(`block DATA:${k} missing`); return src.replace(rx(k), () => block(k, obj)); }
const fileUrl = f => new URL(f, f.startsWith('/') ? 'file://' : new URL(process.cwd() + '/', 'file://'));

function checkCon(cdb, err) {
  const { types = {}, connectors = {} } = cdb;
  for (const [k, t] of Object.entries(types)) {
    if (!t.n || !t.s) err.push(`connector type ${k}: n/s missing`);
    if (!connectors[t.def] || connectors[t.def].type !== k) err.push(`connector type ${k}: default "${t.def}" missing or of another type`);
  }
  for (const [k, c] of Object.entries(connectors)) {
    const at = `connector ${k}`;
    if (!/^[a-z0-9_]+$/.test(k)) err.push(`${at}: key may only use a–z, 0–9, _`);
    if (!types[c.type]) err.push(`${at}: unknown type "${c.type}"`);
    for (const f of ['n', 's', 'mk']) if (!c[f]) err.push(`${at}: field ${f} missing`);
    if (!CFIT.includes(c.fit)) err.push(`${at}: fit must be ${CFIT.join(', ')}`);
    if (c.fit === 'dblank' && !(c.drill > 0)) err.push(`${at}: dblank needs drill (Ø mm)`);
    if (c.fit !== 'fp' && !c.g) err.push(`${at}: g (D glyph) missing`);
    if (c.fit === 'fp') {
      if (!c.el || !c.el.t) err.push(`${at}: el (drawing element) missing`);
      if (!c.fp || !(c.fp.w > 0 && c.fp.h > 0) || !Array.isArray(c.fp.cut) || !c.fp.cut.length) err.push(`${at}: fp {w, h, cut[]} missing`);
      else c.fp.cut.forEach((x, i) => { if (!['c', 'r', 'h'].includes(x.t) || (x.t === 'r' ? !(x.w > 0 && x.h > 0) : !(x.d > 0))) err.push(`${at}: cut[${i}] invalid (c: d · r: w, h · h: x, y, d)`); });
    }
    if (c.price != null && typeof c.price !== 'number') err.push(`${at}: price must be a number`);
  }
}
// SYSBOXX: housings per depth/height, front plates in BE (1 BE = 35.6 mm, 12 BE per 19″ row, plates 2 U high)
const SBX_KIND = ['blank', 'd', 'mod', 'cut'];
function checkSbx(sbx, err, cdb) {
  if (!sbx) return;
  if (!(sbx.be > 0)) err.push('sysboxx: be (mm per width unit) missing');
  for (const [d, hs] of Object.entries(sbx.housings || {})) for (const [he, h] of Object.entries(hs)) {
    if (!h.art) err.push(`sysboxx housing ${d}/${he}: art missing`);
    if (h.price != null && typeof h.price !== 'number') err.push(`sysboxx housing ${d}/${he}: price must be a number`);
    if (+he % 2) err.push(`sysboxx housing ${d}/${he}: height must be a multiple of 2 U`);
  }
  for (const [k, x] of Object.entries(sbx.extra || {})) if (!x.n || !x.art) err.push(`sysboxx extra ${k}: n/art missing`);
  for (const [k, p] of Object.entries(sbx.plates || {})) {
    const at = `sysboxx plate ${k}`, W = p.be * sbx.be, H = 88.9;
    if (!/^[a-z0-9_]+$/.test(k)) err.push(`${at}: key may only use a–z, 0–9, _`);
    for (const f of ['n', 's', 'g', 'art']) if (!p[f]) err.push(`${at}: field ${f} missing`);
    if (!(Number.isInteger(p.be) && p.be >= 1 && p.be <= 12)) err.push(`${at}: be must be 1–12`);
    if (!SBX_KIND.includes(p.kind)) err.push(`${at}: kind must be ${SBX_KIND.join(', ')}`);
    if (p.price != null && typeof p.price !== 'number') err.push(`${at}: price must be a number`);
    if (!(p.screws > 0)) err.push(`${at}: screws missing`);
    const inside = (x, y) => x >= 0 && x <= W && y >= 0 && y <= H;
    if (p.kind === 'd') { if (!Array.isArray(p.holes) || !p.holes.length) err.push(`${at}: holes [[x, y, rot?]] missing`); else p.holes.forEach((h, i) => { if (!inside(h[0], h[1])) err.push(`${at}: hole ${i + 1} outside the plate`); }); }
    if (p.kind === 'mod') { if (!Array.isArray(p.els) || !p.els.length) err.push(`${at}: els missing`); else p.els.forEach((e, i) => { if (!EL.includes(e.t)) err.push(`${at}: els[${i}] unknown element "${e.t}"`); else if (!inside(e.x, e.y)) err.push(`${at}: els[${i}] outside the plate`); });
      if (p.io) for (const q of p.io.split(';').map(x => x.trim()).filter(Boolean)) { const m = q.match(/^(\w+):(\d+)/); if (!m || !IO.includes(m[1])) err.push(`${at}: io "${q}" invalid`); } }
    if (p.acc != null) { if (p.kind !== 'cut' || !Array.isArray(p.acc) || !p.acc.length) err.push(`${at}: acc (connector types for the cutouts) only for kind cut, as a list`); else p.acc.forEach(t => { if (cdb && !(cdb.types || {})[t]) err.push(`${at}: acc "${t}" is not a connector type`); }); }
    if (p.kind === 'cut') { if (!Array.isArray(p.cut) || !p.cut.length) err.push(`${at}: cut missing`); else p.cut.forEach((c, i) => { if (!['c', 'r'].includes(c.t) || (c.t === 'c' ? !(c.d > 0) : !(c.w > 0 && c.h > 0))) err.push(`${at}: cut[${i}] invalid (c: d · r: w, h)`); else if (!inside(c.x, c.y)) err.push(`${at}: cut[${i}] outside the plate`); }); }
  }
}
// Rack parts (data/parts.json). Values per height are tables keyed by the U as text.
const RAILS = ['rss', 'steel', 'alu', 'hole'], REARS = ['opt', 'std', 'none'], SRC = ['cart', 'web', 'ref', 'check', 'user'];
function checkParts(p, err) {
  if (!p) return;
  const isObj = o => o && typeof o === 'object' && !Array.isArray(o);
  for (const s of ['panels', 'art', 'shelves', 'drawers', 'cases', 'railRear']) if (!isObj(p[s])) err.push(`parts: section ${s} missing`);
  if (!Array.isArray(p.acc)) err.push('parts: acc must be a list');
  if (err.some(e => e.startsWith('parts: section') || e.startsWith('parts: acc'))) return;
  const price = (at, v) => { if (v != null && !(typeof v === 'number' && v >= 0)) err.push(`${at}: price must be a number or null`); };
  const src = (at, v) => { if (v != null && !SRC.includes(v)) err.push(`${at}: src must be ${SRC.join(', ')}`); };
  const heOk = h => typeof h === 'number' && h > 0 && h <= 50 && Number.isInteger(h * 2);
  for (const [k, x] of Object.entries(p.panels)) { const at = `parts panel ${k}`;
    for (const f of ['n', 'short', 'art']) if (typeof x[f] !== 'string') err.push(`${at}: ${f} missing`);
    if (!heOk(x.he) || !(x.cols > 0) || !(x.rows > 0)) err.push(`${at}: he/cols/rows missing`); price(at, x.price); src(at, x.src); }
  for (const [k, x] of Object.entries(p.art)) { const at = `parts art ${k}`;
    if (!x.n) err.push(`${at}: n missing`); if (typeof x.art !== 'string') err.push(`${at}: art must be text ('' if unknown)`); price(at, x.price); src(at, x.src); }
  for (const [k, x] of Object.entries(p.shelves)) { const at = `parts shelf ${k}`;
    for (const f of ['n', 'short']) if (!x[f]) err.push(`${at}: ${f} missing`);
    if (!heOk(x.he)) err.push(`${at}: he missing`);
    if (!['free', 'grid'].includes(x.mode)) err.push(`${at}: mode must be free or grid`);
    if (x.mode === 'grid' && !(x.cells > 0)) err.push(`${at}: grid needs cells`);
    if (x.mode === 'free' && !(x.innerW > 0)) err.push(`${at}: free needs innerW`);
    if (typeof x.depth !== 'number') err.push(`${at}: depth missing`);
    if (!Array.isArray(x.acc) || !x.acc.length) err.push(`${at}: acc (accepted fit types) missing`);
    if (x.bom && !p.art[x.bom]) err.push(`${at}: bom "${x.bom}" is not an ART key`);
    price(at, x.price); src(at, x.src); }
  for (const [k, x] of Object.entries(p.drawers)) { const at = `parts drawer ${k}`;
    if (!x.n) err.push(`${at}: n missing`);
    if (!Array.isArray(x.hes) || !x.hes.length || !x.hes.every(heOk)) { err.push(`${at}: hes missing`); continue; }
    for (const h of x.hes) {
      if (!((x.depth || {})[h] > 0)) err.push(`${at}: depth for ${h} U missing`);
      const key = (x.keys || {})[h]; if (!key) err.push(`${at}: keys for ${h} U missing`); else if (!p.art[key]) err.push(`${at}: keys ${h} U → "${key}" is not an ART key`);
    } }
  for (const [k, x] of Object.entries(p.cases)) { const at = `parts case ${k}`;
    if (k === 'custom') err.push(`${at}: custom is the input form in the code, not a part`);
    for (const f of ['n', 'short', 'group']) if (!x[f]) err.push(`${at}: ${f} missing`);
    if (!REARS.includes(x.rear)) err.push(`${at}: rear must be ${REARS.join(', ')}`);
    if (!RAILS.includes(x.rail)) err.push(`${at}: rail must be ${RAILS.join(', ')}`);
    src(at, x.src);
    if (!Array.isArray(x.he) || !x.he.length || !x.he.every(heOk)) { err.push(`${at}: he (list of heights) missing`); continue; }
    const tbl = (f, need, ok) => { const t = x[f]; if (t == null && !need) return; if (!isObj(t)) { err.push(`${at}: ${f} must be a table per height`); return; }
      for (const h of x.he) if (!(String(h) in t)) err.push(`${at}: ${f} for ${h} U missing`); else if (!ok(t[h])) err.push(`${at}: ${f} for ${h} U invalid`);
      for (const h of Object.keys(t)) if (!x.he.includes(+h)) err.push(`${at}: ${f} has ${h} U, which is not in he`); };
    tbl('art', true, v => typeof v === 'string'); tbl('price', true, v => v === null || (typeof v === 'number' && v >= 0)); tbl('outer', false, v => typeof v === 'string');
    if (isObj(x.use)) tbl('use', true, v => typeof v === 'number' && v > 0); else if (!(typeof x.use === 'number' && x.use > 0)) err.push(`${at}: use (usable depth) must be a number or a table per height`);
    if (x.railMin != null && x.railMax != null && !(x.railMin <= x.railMax)) err.push(`${at}: railMin > railMax`); }
  const ids = new Set();
  p.acc.forEach((a, i) => { const at = `parts acc[${i}]`; if (!a.id || !a.n) err.push(`${at}: id/n missing`); if (ids.has(a.id)) err.push(`${at}: id ${a.id} twice`); ids.add(a.id); price(at, a.price); src(at, a.src);
    if (a.auto && a.auto.split(' ').some(r => !RAILS.includes(r))) err.push(`${at}: auto must list rail types (${RAILS.join(', ')})`); });
  if (!p.railRear.n) err.push('parts railRear: n missing');
}
function check(devdb, kg, exact, i18n, cdb, sbx, parts) {
  const err = [], warn = [];
  if (cdb) checkCon(cdb, err);
  checkSbx(sbx, err, cdb);
  checkParts(parts, err);
  for (const [k, d] of Object.entries(devdb)) {
    const at = `device ${k}`;
    if (!/^[a-z0-9_]+$/.test(k)) err.push(`${at}: key may only use a–z, 0–9, _`);
    for (const f of ['n', 'mk', 'g', 'fit', 'url']) if (!d[f]) err.push(`${at}: field ${f} missing`);
    if (d.fit && !FIT.includes(d.fit)) err.push(`${at}: unknown fit "${d.fit}" (${FIT.join(', ')})`);
    if (d.fit === 'rack' && !(d.he > 0 && d.he <= 20)) err.push(`${at}: he missing/invalid`);
    if ((d.fit === 'bmd' || d.fit === 'half') && !(d.frac > 0 && d.frac <= 1)) err.push(`${at}: frac missing`);
    if ((d.fit === 'free' || d.fit === 'desk') && !(d.w > 0 && d.h > 0)) err.push(`${at}: w/h missing`);
    if (d.d != null && !(d.d > 0 && d.d < 1200)) err.push(`${at}: implausible depth d`);
    if (d.kg != null && !(typeof d.kg === 'number' && d.kg > 0 && d.kg < 300)) err.push(`${at}: implausible kg`);
    if (d.kg == null) warn.push(`${at}: weight missing`);
    if (d.price != null && !(typeof d.price === 'number' && d.price >= 0)) err.push(`${at}: price must be a number`);
    if (!d.io || typeof d.io.f !== 'string' || typeof d.io.r !== 'string') err.push(`${at}: io.f/io.r missing`);
    else for (const s of [d.io.f, d.io.r]) for (const p of s.split(';').map(x => x.trim()).filter(Boolean)) {
      const m = p.match(/^(\w+):(\d+)\s*(.*)$/);
      if (!m) err.push(`${at}: io "${p}" is not type:count text`);
      else if (!IO.includes(m[1])) err.push(`${at}: unknown io type "${m[1]}"`);
    }
  }
  for (const [k, v] of Object.entries(kg)) {
    if (!/^(art|con|panel|shelf|case|acc|x):/.test(k)) err.push(`weight ${k}: prefix art:/con:/panel:/shelf:/case:/acc:/x: missing`);
    if (v != null && !(typeof v === 'number' && v >= 0 && v < 500)) err.push(`weight ${k}: ${v} implausible`);
  }
  for (const [k, E] of Object.entries(exact)) {
    const at = `view ${k}`;
    if (!k.startsWith('_') && !devdb[k]) err.push(`${at}: no device with this key`);
    const d = devdb[k];
    if (d && d.fit !== 'rack' && !(E.w > 0 && E.h > 0)) err.push(`${at}: w/h (reference size) needed for devices in shelves/kits`);
    if (d && d.fit === 'rack' && E.r && !(E.hw > 0)) err.push(`${at}: hw (rear housing width) missing`);
    const W = E.w || 482.6, Hh = E.h || (d && d.he ? d.he * 44.45 : 44.45), HW = E.hw || W;
    for (const side of ['f', 'r']) for (const [i, e] of (E[side] || []).entries()) {
      if (!EL.includes(e.t)) err.push(`${at} ${side}[${i}]: unknown element "${e.t}"`);
      if (typeof e.x !== 'number' || typeof e.y !== 'number') err.push(`${at} ${side}[${i}]: x/y missing`);
      else if (e.x < -1 || e.x > (side === 'r' ? HW : W) + 1 || e.y < -1 || e.y > Hh + 1) warn.push(`${at} ${side}[${i}]: ${e.t} at ${e.x}/${e.y} is outside`);
    }
  }
  for (const [de, en] of Object.entries(i18n)) {
    const ph = s => (s.match(/\{\d+\}/g) || []);
    if (en && ph(en).some(p => !de.includes(p))) err.push(`translation "${de.slice(0, 40)}": placeholder ${ph(en).find(p => !de.includes(p))} not in the German text`);
  }
  return { err, warn };
}

const CSV_COLS = ['key', 'n', 'mk', 'g', 'fit', 'he', 'frac', 'w', 'h', 'd', 'kg', 'price', 'art', 'url', 'io_f', 'io_r', 'note', 'chk', 'ph', 'col', 'kitType'];
const csvCell = v => v == null ? '' : /[";\n]/.test(String(v)) ? `"${String(v).replace(/"/g, '""')}"` : String(v);
const toCsv = devdb => [CSV_COLS.join(';'), ...Object.entries(devdb).map(([k, d]) => CSV_COLS.map(c => csvCell(c === 'key' ? k : c === 'io_f' ? d.io?.f : c === 'io_r' ? d.io?.r : d[c])).join(';'))].join('\n') + '\n';
function parseCsv(txt) {
  const rows = []; let row = [], cell = '', q = false;
  for (let i = 0; i < txt.length; i++) {
    const ch = txt[i];
    if (q) { if (ch === '"' && txt[i + 1] === '"') { cell += '"'; i++; } else if (ch === '"') q = false; else cell += ch; }
    else if (ch === '"') q = true; else if (ch === ';') { row.push(cell); cell = ''; } else if (ch === '\n') { row.push(cell); rows.push(row); row = []; cell = ''; } else if (ch !== '\r') cell += ch;
  }
  if (cell || row.length) { row.push(cell); rows.push(row); }
  const head = rows.shift();
  return rows.filter(r => r.some(Boolean)).map(r => Object.fromEntries(head.map((h, i) => [h, r[i] ?? ''])));
}
const NUM = ['he', 'frac', 'w', 'h', 'd', 'kg', 'price', 'chk', 'ph'];
function mergeCsv(devdb, rows) {
  for (const r of rows) {
    const k = r.key; if (!k) continue;
    const d = devdb[k] ? { ...devdb[k] } : { io: { f: '', r: '' } };
    for (const c of CSV_COLS) {
      if (c === 'key') continue;
      let v = r[c];
      if (c === 'io_f' || c === 'io_r') { d.io = d.io || {}; d.io[c === 'io_f' ? 'f' : 'r'] = v; continue; }
      if (v === '') { delete d[c]; continue; }
      if (NUM.includes(c)) { v = +String(v).replace(',', '.'); if (Number.isNaN(v)) throw new Error(`CSV ${k}.${c}: not a number`); }
      d[c] = v;
    }
    devdb[k] = d;
  }
  return devdb;
}
const argVal = flag => { const i = process.argv.indexOf(flag); return i > 0 ? process.argv[i + 1] : null; };

const cmd = process.argv[2] || 'check';
let src = readFileSync(HTML, 'utf8');
if (cmd === 'export') {
  for (const k of Object.keys(F)) writeFileSync(new URL(F[k], ROOT), JSON.stringify(readBlock(src, k), null, 1) + '\n');
  writeFileSync(new URL(CONF, ROOT), JSON.stringify({ types: readBlock(src, 'CTYPES'), connectors: readBlock(src, 'CON') }, null, 1) + '\n');
  writeFileSync(new URL('data/devices.csv', ROOT), toCsv(readBlock(src, 'DEVDB')));
  writeFileSync(new URL(PARTSF, ROOT), JSON.stringify(readBlock(src, 'PARTS'), null, 1) + '\n');
  console.log('Exported: data/devices.json, data/weights.json, data/views.json, data/connectors.json, data/parts.json, data/devices.csv');
} else if (cmd === 'import' || cmd === 'check') {
  const load = k => existsSync(new URL(F[k], ROOT)) ? JSON.parse(readFileSync(new URL(F[k], ROOT), 'utf8')) : readBlock(src, k);
  let devdb = load('DEVDB'); const kg = load('KG'), exact = load('EXACT');
  const cdb = existsSync(new URL(CONF, ROOT)) ? JSON.parse(readFileSync(new URL(CONF, ROOT), 'utf8')) : { types: readBlock(src, 'CTYPES'), connectors: readBlock(src, 'CON') };
  const sbx = existsSync(new URL(SBXF, ROOT)) ? JSON.parse(readFileSync(new URL(SBXF, ROOT), 'utf8')) : null;
  const parts = existsSync(new URL(PARTSF, ROOT)) ? JSON.parse(readFileSync(new URL(PARTSF, ROOT), 'utf8')) : readBlock(src, 'PARTS');
  const i18n = {};
  for (const f of ['data/i18n/ui.json', 'data/i18n/catalog.json']) if (existsSync(new URL(f, ROOT))) for (const [de, en] of Object.entries(JSON.parse(readFileSync(new URL(f, ROOT), 'utf8')))) if (en) i18n[de] = en;
  if (process.argv.includes('--csv')) devdb = mergeCsv(devdb, parseCsv(readFileSync(new URL('data/devices.csv', ROOT), 'utf8')));
  const rf = argVal('--review');
  if (rf) {
    const P = JSON.parse(readFileSync(fileUrl(rf), 'utf8'));
    let nV = 0, nO = 0;
    for (const [k, x] of Object.entries(P)) {
      if (!devdb[k]) throw new Error(`review file: unknown device ${k}`);
      const view = x.view || x.ansicht;
      if (view && (view.f || view.r)) { exact[k] = view; nV++; }
      const ok = Object.fromEntries(Object.entries(x.ok || {}).filter(([, v]) => v));
      if (Object.keys(ok).length) { devdb[k].ok = { ...(devdb[k].ok || {}), ...ok }; nO++; if (ok.data) { delete devdb[k].chk; delete devdb[k].ph; } }
    }
    console.log(`Review file: ${nV} views, ${nO} approvals merged`);
  }
  const wf = argVal('--weights');
  if (wf) {
    let n = 0;
    for (const r of parseCsv(readFileSync(fileUrl(wf), 'utf8').replace(/^\ufeff/, ''))) {
      const key = r.key || r.schluessel, v = String(r.kg || '').replace(',', '.').trim(); if (!v || !key) continue;
      const num = +v; if (Number.isNaN(num)) throw new Error(`weight ${key}: "${r.kg}" is not a number`);
      if (key.startsWith('dev:')) { const d = devdb[key.slice(4)]; if (!d) throw new Error(`unknown device ${key}`); d.kg = num; } else kg[key] = num;
      n++;
    }
    console.log(`Weight list: ${n} values merged`);
  }
  const { err, warn } = check(devdb, kg, exact, i18n, cdb, sbx, parts);
  const missingKg = warn.filter(w => /weight missing/.test(w)).length;
  warn.filter(w => !/weight missing/.test(w)).forEach(w => console.log('Note:', w));
  if (missingKg) console.log(`Note: ${missingKg} devices without weight`);
  if (err.length) { err.forEach(e => console.error('ERROR:', e)); console.error(`${err.length} error(s) – nothing written.`); process.exit(1); }
  if (cmd === 'import') {
    for (const [k, v] of [['DEVDB', devdb], ['KG', kg], ['EXACT', exact]]) writeFileSync(new URL(F[k], ROOT), JSON.stringify(v, null, 1) + '\n');
    src = writeBlock(src, 'DEVDB', devdb); src = writeBlock(src, 'KG', kg); src = writeBlock(src, 'EXACT', exact); src = writeBlock(src, 'I18N', i18n); src = writeBlock(src, 'CTYPES', cdb.types); src = writeBlock(src, 'CON', cdb.connectors);
    if (sbx) { const { _source, ...app } = sbx; src = writeBlock(src, 'SBX', app); }
    src = writeBlock(src, 'PARTS', parts);   // the source note stays in the data file
    writeFileSync(new URL(CONF, ROOT), JSON.stringify(cdb, null, 1) + '\n');
    writeFileSync(HTML, src);
    console.log(`Imported: ${Object.keys(devdb).length} devices, ${Object.keys(cdb.connectors).length} connectors, ${sbx ? Object.keys(sbx.plates).length : 0} SYSBOXX plates, ${Object.keys(parts.cases).length} cases, ${Object.keys(kg).length} weights, ${Object.keys(exact).length} views, ${Object.keys(i18n).length} translations. Then: node scripts/manufacturers.mjs`);
    await import('./build-local.mjs');   // keep the local variant public/local.html in step with index.html
  } else console.log(`OK: ${Object.keys(devdb).length} devices, ${Object.keys(cdb.connectors).length} connectors, ${Object.keys(kg).length} weights, ${Object.keys(exact).length} views, ${Object.keys(i18n).length} translations`);
} else { console.error('Usage: node scripts/data.mjs export|import|check [--csv] [--weights file] [--review file]'); process.exit(2); }
