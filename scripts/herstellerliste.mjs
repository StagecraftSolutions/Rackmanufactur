// Erzeugt docs/hersteller-19zoll.md aus DEVDB/EXACT in public/index.html.
// Aufruf: node scripts/herstellerliste.mjs
import { readFileSync, writeFileSync } from 'node:fs';
const src = readFileSync(new URL('../public/index.html', import.meta.url), 'utf8');
const grab = (start, end = '\n};') => { const a = src.indexOf(start); return src.slice(a, src.indexOf(end, a) + end.length); };
const BMD = src.match(/const BMD = ('[^']*')/)?.[1] ?? "''";
const DEVDB = new Function(`const BMD = ${BMD}; ${grab('const DEVDB = {')} return DEVDB;`)();
const exactBlock = grab('const EXACT = {');
const exactKeys = new Set([
  ...[...exactBlock.matchAll(/^  (\w+): \{/gm)].map(m => m[1]),
  ...[...src.matchAll(/EXACT\.(\w+)\s*=/g)].map(m => m[1]),
  ...Object.keys(DEVDB).filter(k => /^tm_|^bmd_2110/.test(k)),   // TM_FRONT-Schleife
  ...Object.keys(JSON.parse(grab('const EXACT_JSON = {').replace(/^const EXACT_JSON = /, '').replace(/;$/, ''))),
]);
const EXTRA = readFileSync(new URL('../docs/hersteller-nicht-aufgenommen.md', import.meta.url), 'utf8');
const fit = d => d.fit === 'rack' ? `19″ · ${d.he} HE` : d.fit === 'bmd' ? `${d.frac < .4 ? '1/3' : d.frac < .6 ? '1/2' : '2/3'} Rackbreite` : d.fit === 'half' ? 'halbe Breite (Rackkit)' : d.fit === 'desk' ? 'Tischgerät' : 'in Rackwanne';
const eur = v => v == null ? '–' : v.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
const state = (k, d) => exactKeys.has(k) ? 'maßstäblich' : d.ph ? 'Platzhalter' : 'Daten belegt';
const kgT = v => v == null ? '–' : v.toLocaleString('de-DE') + ' kg';
const by = {};
for (const [k, d] of Object.entries(DEVDB)) (by[d.mk] ??= []).push([k, d]);
let md = `# 19″-Geräte je Hersteller

Alle Hersteller, deren Geräte in der Rack Manufaktur stehen, mit den 19″-fähigen Geräten aus dem aktuellen Sortiment (Stand 11/2026).
Erzeugt mit \`node scripts/herstellerliste.mjs\` aus der Gerätedatenbank.

**Stand:** *maßstäblich* = Ansicht nach Maßzeichnung/Foto · *Daten belegt* = Maße aus Herstellerdaten, Ansicht als Platzhalter (Name, Höhe, Tiefe) · *Platzhalter* = aus der Herstellerliste übernommen, Maße und Anschlüsse noch nicht geprüft (\`ph: 1\`). „HE prüfen“ = Höhe geschätzt. Fehlende Gewichte (–) werden nachgetragen, siehe [ki-workflow.md](ki-workflow.md).

Preise: UVP bzw. Webpreis inkl. MwSt.; Eurolite nach Steinigke-Liste netto + 19 %. Ohne Preis: Hersteller nennt keinen.

`;
const order = ['Blackmagic Design', 'Ubiquiti', 'Shure', 'Behringer', 'Midas', 'd&b audiotechnik', 'L-Acoustics', 'Powersoft', 'dBTechnologies', 'MA Lighting', 'Swisson', 'NovaStar', 'Eurolite'];
for (const mk of [...order, ...Object.keys(by).filter(m => !order.includes(m))]) {
  const list = by[mk]; if (!list) continue;
  const n = s => list.filter(([k, d]) => state(k, d) === s).length;
  md += `## ${mk}\n\n${list.length} Geräte · ${n('maßstäblich')} maßstäblich · ${n('Daten belegt')} Daten belegt · ${n('Platzhalter')} Platzhalter · ${list.filter(([, d]) => d.kg == null).length} ohne Gewicht\n\n| Gerät | Bauform | Tiefe | Gewicht | Preis | Stand | Link |\n|---|---|---|---|---|---|---|\n`;
  for (const [k, d] of list) md += `| ${d.n} | ${fit(d)} | ${d.d ? d.d + ' mm' + (d.chk ? '*' : '') : '–'} | ${kgT(d.kg)} | ${eur(d.price)} | ${state(k, d)}${d.ok && (d.ok.f || d.ok.r) ? ' · ✓ Ansicht geprüft' : ''}${d.ok && d.ok.data ? ' · ✓ Daten geprüft' : ''}${/HE prüfen/.test(d.note || '') ? ' · HE prüfen' : ''}${/abgekündigt/.test(d.note || '') ? ' · abgekündigt' : ''} | [Hersteller](${d.url}) |\n`;
  md += '\n';
}
md += EXTRA;
writeFileSync(new URL('../docs/hersteller-19zoll.md', import.meta.url), md);
console.log('docs/hersteller-19zoll.md:', Object.keys(DEVDB).length, 'Geräte');
