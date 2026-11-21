// Write the German → English dictionary into public/index.html
//
//   node scripts/i18n.mjs import     data/i18n/ui.json + data/i18n/catalog.json -> block DATA:I18N (validates first)
//   node scripts/i18n.mjs check      validate only, write nothing
//
// Only translated entries go into the app. Placeholders {0}, {1} … in the English text must exist in the German text.
// Product data (devices, views, connectors, SYSBOXX, rack parts, weights) is not kept here: the app loads it from the
// Stagecraft Library (https://library.stagecraft.solutions/api/v1/rackmanufaktur/*.json), see the loader in index.html.
import { readFileSync, writeFileSync, existsSync } from 'node:fs';

const ROOT = new URL('..', import.meta.url);
const HTML = new URL('public/index.html', ROOT);
const RX = /\/\* DATA:I18N \*\/[\s\S]*?\/\* \/DATA:I18N \*\//;
const fmt = obj => '{\n' + Object.entries(obj).map(([k, v]) => `  ${JSON.stringify(k)}: ${JSON.stringify(v)}`).join(',\n') + '\n}';

const cmd = process.argv[2] || 'check';
if (cmd !== 'import' && cmd !== 'check') { console.error('Usage: node scripts/i18n.mjs import|check'); process.exit(2); }

const i18n = {};
for (const f of ['data/i18n/ui.json', 'data/i18n/catalog.json']) {
  const u = new URL(f, ROOT);
  if (existsSync(u)) for (const [de, en] of Object.entries(JSON.parse(readFileSync(u, 'utf8')))) if (en) i18n[de] = en;
}
const err = [];
const ph = s => s.match(/\{\d+\}/g) || [];
for (const [de, en] of Object.entries(i18n)) {
  const miss = ph(en).find(p => !de.includes(p));
  if (miss) err.push(`translation "${de.slice(0, 40)}": placeholder ${miss} not in the German text`);
}
if (err.length) { err.forEach(e => console.error('ERROR:', e)); console.error(`${err.length} error(s) – nothing written.`); process.exit(1); }

if (cmd === 'import') {
  let src = readFileSync(HTML, 'utf8');
  if (!RX.test(src)) { console.error('block DATA:I18N missing in public/index.html'); process.exit(1); }
  src = src.replace(RX, () => `/* DATA:I18N */ const I18N_EN = ${fmt(i18n)};\n/* /DATA:I18N */`);
  writeFileSync(HTML, src);
  console.log(`Imported: ${Object.keys(i18n).length} translations into public/index.html`);
} else console.log(`OK: ${Object.keys(i18n).length} translations`);
