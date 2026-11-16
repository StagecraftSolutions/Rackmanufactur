// Generates docs/manufacturers.md from the device database in public/index.html.
// Usage: node scripts/manufacturers.mjs
import { readFileSync, writeFileSync } from 'node:fs';
const src = readFileSync(new URL('../public/index.html', import.meta.url), 'utf8');
const block = k => { const m = src.match(new RegExp(`/\\* DATA:${k} \\*/[\\s\\S]*?/\\* /DATA:${k} \\*/`))[0]; return JSON.parse(m.slice(m.indexOf('{'), m.lastIndexOf('}') + 1)); };
const DEVDB = block('DEVDB'), VIEWS = block('EXACT');
const EXCLUDED = readFileSync(new URL('../docs/manufacturers-excluded.md', import.meta.url), 'utf8');
const fit = d => d.fit === 'rack' ? `19″ · ${d.he} U` : d.fit === 'bmd' ? `${d.frac < .4 ? '1/3' : d.frac < .6 ? '1/2' : '2/3'} rack width` : d.fit === 'half' ? 'half width (rack kit)' : d.fit === 'desk' ? 'desktop' : 'in rack shelf';
const eur = v => v == null ? '–' : v.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
const kgT = v => v == null ? '–' : v + ' kg';
const state = (k, d) => VIEWS[k] ? 'scale view' : d.ph ? 'placeholder' : 'data confirmed';
const by = {};
for (const [k, d] of Object.entries(DEVDB)) (by[d.mk] ??= []).push([k, d]);
let md = `# 19″ devices by manufacturer

All manufacturers whose devices are in Rack Manufaktur, with the 19″-capable devices of their current range (as of 11/2026).
Generated with \`node scripts/manufacturers.mjs\` from the device database – do not edit by hand.

**Status:** *scale view* = drawn to scale from a dimensional drawing or photo · *data confirmed* = dimensions from manufacturer data, shown as placeholder (name, height, depth) · *placeholder* = taken from the manufacturer list, dimensions and connectors not checked yet (\`ph: 1\`). "check U" = height estimated. ✓ = approved in the review editor. Missing weights (–) are being added, see [ai-workflow.md](ai-workflow.md).

Prices: RRP or web price incl. VAT; Eurolite from the Steinigke list net + 19 %. No price: the manufacturer does not publish one.

`;
const order = ['Blackmagic Design', 'Ubiquiti', 'Shure', 'Behringer', 'Midas', 'd&b audiotechnik', 'L-Acoustics', 'Powersoft', 'dBTechnologies', 'MA Lighting', 'Swisson', 'NovaStar', 'Eurolite'];
for (const mk of [...order, ...Object.keys(by).filter(m => !order.includes(m))]) {
  const list = by[mk]; if (!list) continue;
  const n = s => list.filter(([k, d]) => state(k, d) === s).length;
  md += `## ${mk}\n\n${list.length} devices · ${n('scale view')} scale view · ${n('data confirmed')} data confirmed · ${n('placeholder')} placeholder · ${list.filter(([, d]) => d.kg == null).length} without weight\n\n| Device | Form | Depth | Weight | Price | Status | Link |\n|---|---|---|---|---|---|---|\n`;
  for (const [k, d] of list) md += `| ${d.n} | ${fit(d)} | ${d.d ? d.d + ' mm' + (d.chk ? '*' : '') : '–'} | ${kgT(d.kg)} | ${eur(d.price)} | ${state(k, d)}${d.ok && (d.ok.f || d.ok.r) ? ' · ✓ view' : ''}${d.ok && d.ok.data ? ' · ✓ data' : ''}${/HE prüfen|check U/.test(d.note || '') ? ' · check U' : ''}${/abgekündigt|discontinued/.test(d.note || '') ? ' · discontinued' : ''} | [Manufacturer](${d.url}) |\n`;
  md += '\n';
}
md += EXCLUDED;
writeFileSync(new URL('../docs/manufacturers.md', import.meta.url), md);
console.log('docs/manufacturers.md:', Object.keys(DEVDB).length, 'devices');
