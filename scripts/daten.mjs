// Produktdatenbank pflegen: JSON/CSV in data/ <-> Datenblöcke in public/index.html
//
//   node scripts/daten.mjs export        index.html -> data/*.json + data/geraete.csv
//   node scripts/daten.mjs import        data/*.json -> index.html (prüft vorher)
//   node scripts/daten.mjs import --csv  zusätzlich data/geraete.csv übernehmen (Spalten wie beim Export)
//   node scripts/daten.mjs import --gewichte data/gewichte.csv
//                                        Gewichte-Liste aus der App (Stufe 3) übernehmen
//   node scripts/daten.mjs check         nur prüfen
//
// Datenblöcke in index.html (reines JSON zwischen den Markern):
//   /* DATEN:DEVDB */ const DEVDB = {...}; /* /DATEN:DEVDB */      -> data/geraete.json
//   /* DATEN:KG */ const KG = {...}; /* /DATEN:KG */               -> data/gewichte.json
//   /* DATEN:EXACT */ const EXACT_JSON = {...}; /* /DATEN:EXACT */ -> data/ansichten.json
import { readFileSync, writeFileSync, existsSync } from 'node:fs';

const ROOT = new URL('..', import.meta.url);
const HTML = new URL('public/index.html', ROOT);
const F = { DEVDB: 'data/geraete.json', KG: 'data/gewichte.json', EXACT: 'data/ansichten.json' };
const VAR = { DEVDB: 'DEVDB', KG: 'KG', EXACT: 'EXACT_JSON' };

const FIT = ['rack', 'bmd', 'half', 'free', 'desk'];
const IO = ['rj45', 'sfp', 'bnc', 'xlr', 'xlrf', 'xlr5', 'hdmi', 'usb', 'usba', 'usbc', 'iec', 'dc', 'jack', 'opt', 'sd', 'powercon', 'cee32m', 'cee32f', 'cee16m', 'cee16f', 'schuko', 'gland', 'brk', 'rcd', 'lcd', 'btn', 'knob', 'combo', 'ethercon', 'din', 'rca', 'sma', 'ant', 'nl4', 'nl8', 'euroblock', 'db9', 'fan'];
const EL = ['btn', 'malogo', 'madisp', 'enc', 'rect', 'vline', 'ledc', 'lcdl', 'sw', 'combo', 'ethercon', 'din', 'xlrf', 'fan', 'db9', 'rca', 'cover', 'led', 'reset', 'screen', 'txt', 'logo', 'lamp', 'mcb', 'rcd', 'cee16f', 'cee32f', 'schuko', 'gland', ...IO];

const rx = k => new RegExp(`/\\* DATEN:${k} \\*/[\\s\\S]*?/\\* /DATEN:${k} \\*/`);
function readBlock(src, k) {
  const m = src.match(rx(k)); if (!m) throw new Error(`Block DATEN:${k} fehlt in index.html`);
  const j = m[0].slice(m[0].indexOf('{'), m[0].lastIndexOf('}') + 1);
  return JSON.parse(j);
}
// ein Eintrag pro Zeile: gut lesbare Diffs
const fmt = obj => '{\n' + Object.entries(obj).map(([k, v]) => `  ${JSON.stringify(k)}: ${JSON.stringify(v)}`).join(',\n') + '\n}';
const block = (k, obj) => `/* DATEN:${k} */ const ${VAR[k]} = ${fmt(obj)};\n/* /DATEN:${k} */`;
function writeBlock(src, k, obj) { if (!rx(k).test(src)) throw new Error(`Block DATEN:${k} fehlt`); return src.replace(rx(k), () => block(k, obj)); }

function check(devdb, kg, exact) {
  const err = [], warn = [];
  for (const [k, d] of Object.entries(devdb)) {
    const at = `Gerät ${k}`;
    if (!/^[a-z0-9_]+$/.test(k)) err.push(`${at}: Schlüssel nur a–z, 0–9, _`);
    for (const f of ['n', 'mk', 'g', 'fit', 'url']) if (!d[f]) err.push(`${at}: Feld ${f} fehlt`);
    if (d.fit && !FIT.includes(d.fit)) err.push(`${at}: fit „${d.fit}“ unbekannt (${FIT.join(', ')})`);
    if (d.fit === 'rack' && !(d.he > 0 && d.he <= 20)) err.push(`${at}: he fehlt/ungültig`);
    if ((d.fit === 'bmd' || d.fit === 'half') && !(d.frac > 0 && d.frac <= 1)) err.push(`${at}: frac fehlt`);
    if ((d.fit === 'free' || d.fit === 'desk') && !(d.w > 0 && d.h > 0)) err.push(`${at}: w/h fehlen`);
    if (d.d != null && !(d.d > 0 && d.d < 1200)) err.push(`${at}: Tiefe d unplausibel`);
    if (d.kg != null && !(typeof d.kg === 'number' && d.kg > 0 && d.kg < 300)) err.push(`${at}: kg unplausibel`);
    if (d.kg == null) warn.push(`${at}: Gewicht fehlt`);
    if (d.price != null && !(typeof d.price === 'number' && d.price >= 0)) err.push(`${at}: price muss Zahl sein`);
    if (!d.io || typeof d.io.f !== 'string' || typeof d.io.r !== 'string') err.push(`${at}: io.f/io.r fehlen`);
    else for (const s of [d.io.f, d.io.r]) for (const p of s.split(';').map(x => x.trim()).filter(Boolean)) {
      const m = p.match(/^(\w+):(\d+)\s*(.*)$/);
      if (!m) err.push(`${at}: io „${p}“ nicht im Format typ:anzahl Text`);
      else if (!IO.includes(m[1])) err.push(`${at}: io-Typ „${m[1]}“ unbekannt`);
    }
  }
  for (const [k, v] of Object.entries(kg)) {
    if (!/^(art|con|panel|shelf|case|acc|x):/.test(k)) err.push(`Gewicht ${k}: Präfix art:/con:/panel:/shelf:/case:/acc:/x: fehlt`);
    if (v != null && !(typeof v === 'number' && v >= 0 && v < 500)) err.push(`Gewicht ${k}: ${v} unplausibel`);
  }
  for (const [k, E] of Object.entries(exact)) {
    const at = `Ansicht ${k}`;
    if (!k.startsWith('_') && !devdb[k]) err.push(`${at}: kein Gerät mit diesem Schlüssel`);
    const d = devdb[k];
    if (d && d.fit !== 'rack' && !(E.w > 0 && E.h > 0)) err.push(`${at}: w/h (Bezugsmaß) nötig für Geräte in Wannen/Kits`);
    if (d && d.fit === 'rack' && E.r && !(E.hw > 0)) err.push(`${at}: hw (Gehäusebreite hinten) fehlt`);
    const W = E.w || 482.6, Hh = E.h || (d && d.he ? d.he * 44.45 : 44.45), HW = E.hw || W;
    for (const side of ['f', 'r']) for (const [i, e] of (E[side] || []).entries()) {
      if (!EL.includes(e.t)) err.push(`${at} ${side}[${i}]: Element „${e.t}“ unbekannt`);
      if (typeof e.x !== 'number' || typeof e.y !== 'number') err.push(`${at} ${side}[${i}]: x/y fehlen`);
      else if (e.x < -1 || e.x > (side === 'r' ? HW : W) + 1 || e.y < -1 || e.y > Hh + 1) warn.push(`${at} ${side}[${i}]: ${e.t} bei ${e.x}/${e.y} liegt außerhalb`);
    }
  }
  return { err, warn };
}

const CSV_COLS = ['key', 'n', 'mk', 'g', 'fit', 'he', 'frac', 'w', 'h', 'd', 'kg', 'price', 'art', 'url', 'io_f', 'io_r', 'note', 'chk', 'ph', 'col', 'kitType'];
const csvCell = v => v == null ? '' : /[";\n]/.test(String(v)) ? `"${String(v).replace(/"/g, '""')}"` : String(v);
function toCsv(devdb) {
  return [CSV_COLS.join(';'), ...Object.entries(devdb).map(([k, d]) => CSV_COLS.map(c => csvCell(c === 'key' ? k : c === 'io_f' ? d.io?.f : c === 'io_r' ? d.io?.r : d[c])).join(';'))].join('\n') + '\n';
}
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
      if (NUM.includes(c)) { v = +String(v).replace(',', '.'); if (Number.isNaN(v)) throw new Error(`CSV ${k}.${c}: keine Zahl`); }
      d[c] = v;
    }
    devdb[k] = d;
  }
  return devdb;
}

const cmd = process.argv[2] || 'check';
let src = readFileSync(HTML, 'utf8');
if (cmd === 'export') {
  for (const k of Object.keys(F)) writeFileSync(new URL(F[k], ROOT), JSON.stringify(readBlock(src, k), null, 1) + '\n');
  writeFileSync(new URL('data/geraete.csv', ROOT), toCsv(readBlock(src, 'DEVDB')));
  console.log('Exportiert: data/geraete.json, data/gewichte.json, data/ansichten.json, data/geraete.csv');
} else if (cmd === 'import' || cmd === 'check') {
  const load = k => existsSync(new URL(F[k], ROOT)) && cmd === 'import' ? JSON.parse(readFileSync(new URL(F[k], ROOT), 'utf8')) : readBlock(src, k);
  let devdb = load('DEVDB'); const kg = load('KG'), exact = load('EXACT');
  if (process.argv.includes('--csv')) devdb = mergeCsv(devdb, parseCsv(readFileSync(new URL('data/geraete.csv', ROOT), 'utf8')));
  // Gewichte-Liste aus der App (Stufe 3 → „Gewichte-Liste (CSV)“), Spalten schluessel;name;art_nr;kg
  const gi = process.argv.indexOf('--gewichte');
  if (gi > 0) {
    const file = process.argv[gi + 1] || 'data/gewichte.csv';
    let n = 0;
    for (const r of parseCsv(readFileSync(new URL(file, ROOT), 'utf8').replace(/^﻿/, ''))) {
      const v = String(r.kg || '').replace(',', '.').trim(); if (!v || !r.schluessel) continue;
      const kgNum = +v; if (Number.isNaN(kgNum)) throw new Error(`Gewicht ${r.schluessel}: „${r.kg}“ ist keine Zahl`);
      if (r.schluessel.startsWith('dev:')) { const d = devdb[r.schluessel.slice(4)]; if (!d) throw new Error(`Gerät ${r.schluessel} unbekannt`); d.kg = kgNum; }
      else kg[r.schluessel] = kgNum;
      n++;
    }
    console.log(`Gewichte-Liste: ${n} Werte übernommen`);
    if (cmd === 'import') { writeFileSync(new URL(F.DEVDB, ROOT), JSON.stringify(devdb, null, 1) + '\n'); writeFileSync(new URL(F.KG, ROOT), JSON.stringify(kg, null, 1) + '\n'); }
  }
  const { err, warn } = check(devdb, kg, exact);
  const missingKg = warn.filter(w => /Gewicht fehlt/.test(w)).length;
  warn.filter(w => !/Gewicht fehlt/.test(w)).forEach(w => console.log('Hinweis:', w));
  if (missingKg) console.log(`Hinweis: ${missingKg} Geräte ohne Gewicht`);
  if (err.length) { err.forEach(e => console.error('FEHLER:', e)); console.error(`${err.length} Fehler – nichts geschrieben.`); process.exit(1); }
  if (cmd === 'import') {
    src = writeBlock(src, 'DEVDB', devdb); src = writeBlock(src, 'KG', kg); src = writeBlock(src, 'EXACT', exact);
    writeFileSync(HTML, src);
    if (process.argv.includes('--csv')) writeFileSync(new URL(F.DEVDB, ROOT), JSON.stringify(devdb, null, 1) + '\n');
    console.log(`Übernommen: ${Object.keys(devdb).length} Geräte, ${Object.keys(kg).length} Gewichte, ${Object.keys(exact).length} Ansichten. Danach: node scripts/herstellerliste.mjs`);
  } else console.log(`OK: ${Object.keys(devdb).length} Geräte, ${Object.keys(kg).length} Gewichte, ${Object.keys(exact).length} Ansichten`);
} else { console.error('Aufruf: node scripts/daten.mjs export|import [--csv]|check'); process.exit(2); }
