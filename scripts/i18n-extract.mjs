// Collects the German UI texts from public/index.html for translation.
//   node scripts/i18n-extract.mjs   → data/i18n/ui.json (interface) and data/i18n/catalog.json (item/device texts)
// Existing translations are kept; new texts are added with an empty value. Then: node scripts/data.mjs import
// Placeholders {0}, {1} … stand for inserted values and must be kept in the translation.
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';

const ROOT = new URL('..', import.meta.url);
const src = readFileSync(new URL('public/index.html', ROOT), 'utf8');
const GERMAN = /[äöüßÄÖÜ]|\b(der|die|das|den|dem|des|und|oder|mit|für|von|vom|nicht|kein|keine|ein|eine|einen|ist|sind|wird|werden|vorn|vorne|hinten|Gerät|Geräte|Projekt|Projekte|Blende|Wanne|Rackwanne|als|auf|bei|nach|zum|zur|im|ins|aus|bis|pro|je|hier|jetzt|alle|neu|neues|neue|Neues|Kein|Keine|Alle|Einsetzen|Hinzufügen|Entfernen|Schließen|Speichern|Laden|Öffnen|Löschen|Seite|Rückseite|Vorderseite|Tiefe|Höhe|Breite|Preis|Stück|Schiene|Schublade|Steckerfeld|Einsatz|Einsätze|Gewicht|Lieferant|Bestellung|Fertigung|Stückliste|Übersicht|Notiz|Kunde|Element|Elemente|Module|Modul|frei|belegt|prüfen|Bohrung|Loch|Ansicht|Ansichten|Platzhalter|Freigabe|geprüft|Datei|Ordner|Sprache|Beispiel|Bezeichnung|Anschlüsse|Zubehör|Seitenansicht|erstellt|gespeichert|kopiert|geladen|übernommen|angelegt|abgebrochen|möglich|fehlt|ungültig|Datei|wurde|verbunden|getrennt|aktualisiert|entfernt|geöffnet|hinzugefügt|eingetragen|markiert|gelöscht|verworfen|zeigen|kopieren|Entwurf|Entwürfe|Bild|Gewichte)\b/;
const looksCode = s => /^[\w.\-#:]+$/.test(s) || /[{};=]\s*$|^\s*[.#][\w-]+\s*\{|=>|\bfunction\b|\bconst\b|\breturn\b|\$\(|document\.|\.map\(|\.join\(/.test(s);
const decode = s => s.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&nbsp;/g, ' ').replace(/&shy;/g, '');
const norm = s => decode(s).replace(/\s+/g, ' ').trim();
const found = new Map();   // Text → Bereich ('ui' | 'katalog')
function add(raw, area, shown = false) {
  const s = norm(raw);
  if (!s || s.length < 2 || !/[a-zäöüß]/i.test(s)) return;
  if (/^(https?:|mailto:|\.\/|\/)/.test(s)) return;
  if (/^[\s{}\d.,:;·–—\-+×/%()|*]+$/.test(s.replace(/\{\d+\}/g, ''))) return;   // nur Platzhalter/Satzzeichen
  if ((shown ? /[{};=]\s*$|=>|\bfunction\b|\$\(/.test(s) : looksCode(s)) || (!shown && !GERMAN.test(s))) return;
  if (shown && !/[a-zäöüß]{3}/i.test(s.replace(/\{\d+\}/g, ''))) return;
  if (!found.has(s) || area === 'ui') found.set(s, area);
}
// HTML-Text und Attribute eines Fragments (mit {n}-Platzhaltern) zerlegen
function fromHtml(frag, area) {
  const html = /<[a-z]/i.test(frag);
  for (const m of frag.matchAll(/\b(?:title|aria-label|placeholder|alt|label)="([^"]*)"/g)) add(m[1], area, true);
  frag.replace(/<[^>]*>/g, '\u0000').split('\u0000').forEach(seg => add(seg, area, html));
}
// Bereiche: Datenblöcke und Katalog-Konstanten zählen als „katalog“
const KAT_STARTS = ['/* DATA:PARTS */', '/* DATA:CON */', '/* DATA:CTYPES */', '/* DATA:SBX */', 'const PANELS = {', 'const ART = {', 'const CASES = {', 'const RAIL_REAR', 'const ACC_DEFAULT', 'const DEVICES = [', 'const SHELVES = {', 'const DRAWERS = {', '/* DATA:DEVDB */'];
const katRanges = KAT_STARTS.map(k => { const a = src.indexOf(k); if (a < 0) return null; const e = k.startsWith('/*') ? src.indexOf(k.replace('/* ', '/* /'), a) : src.indexOf(k.endsWith('[') ? '\n];' : '\n};', a); return [a, e]; }).filter(Boolean);
const skipRanges = ['DATA:KG', 'DATA:EXACT', 'DATA:I18N'].map(k => [src.indexOf(`/* ${k} */`), src.indexOf(`/* /${k} */`)]).filter(r => r[0] > 0);
skipRanges.push([src.indexOf('const TERMS_EN = ['), src.indexOf('\n];', src.indexOf('const TERMS_EN = ['))]);
const areaAt = i => katRanges.some(([a, e]) => i >= a && i <= e) ? 'katalog' : 'ui';
const skipped = i => skipRanges.some(([a, e]) => i >= a && i <= e);

// 1) Statisches HTML außerhalb von <script>/<style>
const scriptA = src.indexOf('<script>', src.indexOf('<body')), styleE = src.indexOf('</style>');
fromHtml(src.slice(src.indexOf('<body'), scriptA), 'ui');
fromHtml(src.slice(0, styleE).replace(/<style>[\s\S]*$/, '').replace(/<title>([^<]*)<\/title>/, '<i>$1</i>'), 'ui');

// 2) JavaScript: Zeichenketten und Template-Literale (verschachtelt) einlesen
const js = src.slice(scriptA), off = scriptA;
let i = 0;
function readTemplate() {          // steht hinter dem öffnenden `
  let out = '', n = 0;
  while (i < js.length) {
    const c = js[i];
    if (c === '\\') { out += js[i + 1]; i += 2; continue; }
    if (c === '`') { i++; return out; }
    if (c === '$' && js[i + 1] === '{') { i += 2; scanExpr(); out += `{${n++}}`; continue; }
    out += c; i++;
  }
  return out;
}
function readQuoted(q) { let out = ''; while (i < js.length && js[i] !== q) { if (js[i] === '\\') { out += js[i + 1]; i += 2; continue; } if (js[i] === '\n') break; out += js[i++]; } i++; return out; }
function scanExpr() {               // bis zur passenden } (für ${…})
  let depth = 1;
  while (i < js.length && depth > 0) step(() => depth++, () => depth--);
}
function step(open = () => {}, close = () => {}) {
  const c = js[i], at = off + i;
  if (c === '/' && js[i + 1] === '/') { while (i < js.length && js[i] !== '\n') i++; return; }
  if (c === '/' && js[i + 1] === '*') { const e = js.indexOf('*/', i + 2); i = e < 0 ? js.length : e + 2; return; }
  if (c === '/') {                   // regular expression literal? (after an operator, bracket or keyword)
    let j = i - 1; while (j >= 0 && /\s/.test(js[j])) j--;
    const prev = js[j] || '', word = js.slice(Math.max(0, j - 5), j + 1);
    if (/[(,=:[!&|?{};+\-*%<>~^]/.test(prev) || /\breturn$|\btypeof$/.test(word)) {
      i++; let cls = false;
      while (i < js.length && js[i] !== '\n') { const ch = js[i]; if (ch === '\\') { i += 2; continue; } if (ch === '[') cls = true; else if (ch === ']') cls = false; else if (ch === '/' && !cls) break; i++; }
      i++; while (/[a-z]/i.test(js[i] || '')) i++;
      return;
    }
  }
  if (c === '`') { i++; const t = readTemplate(); if (!skipped(at)) fromHtml(t, areaAt(at)); return; }
  if (c === "'" || c === '"') { i++; const t = readQuoted(c); if (!skipped(at)) (/[<>]/.test(t) ? fromHtml(t, areaAt(at)) : add(t, areaAt(at))); return; }
  if (c === '{') open(); else if (c === '}') close();
  i++;
}
while (i < js.length) step();

// 3) Schreiben (vorhandene Übersetzungen behalten)
const dir = new URL('data/i18n/', ROOT); if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
const counts = {};
for (const area of ['ui', 'katalog']) {
  const file = new URL(`data/i18n/${area === 'katalog' ? 'catalog' : area}.json`, ROOT);
  const old = existsSync(file) ? JSON.parse(readFileSync(file, 'utf8')) : {};
  // texts from data tables that a translated pattern with {n} already covers (e.g. case dimensions per height) are not listed again
  const pats = Object.entries(old).filter(([k, v]) => v && /\{\d+\}/.test(k)).map(([k]) => new RegExp('^' + k.split(/\{\d+\}/).map(x => x.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('.+?') + '$', 's'));
  const covered = k => !/\{\d+\}/.test(k) && !old[k] && pats.some(rx => rx.test(k));
  const keys = [...found].filter(([k, a]) => a === area && !covered(k)).map(([k]) => k).sort((a, b) => a.localeCompare(b, 'de'));
  const out = {}; keys.forEach(k => { out[k] = old[k] ?? ''; });
  Object.keys(old).forEach(k => { if (!(k in out) && old[k]) out[k] = old[k]; });   // nicht mehr gefundene, aber übersetzte behalten
  writeFileSync(file, JSON.stringify(out, null, 1) + '\n');
  counts[area] = [keys.length, keys.filter(k => out[k]).length];
}
console.log(`ui: ${counts.ui[0]} texts (${counts.ui[1]} translated) · catalog: ${counts.katalog[0]} texts (${counts.katalog[1]} translated)`);
