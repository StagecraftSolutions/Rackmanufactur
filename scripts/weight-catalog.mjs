// Writes data/weight-catalog.csv: every catalog item with its weight key and current weight.
// Same list as in the app (step 3 → build notes → “Weight list (CSV)”), kept in the repository for AI assistants.
// Needs Google Chrome (path via CHROME=…). Usage: node scripts/weight-catalog.mjs
import { readFileSync, writeFileSync, mkdtempSync, rmSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const ROOT = new URL('..', import.meta.url);
const CHROME = process.env.CHROME || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const dir = mkdtempSync(join(tmpdir(), 'rm-kg-'));
const html = readFileSync(new URL('public/index.html', ROOT), 'utf8').replace('</body>',
  `<script>addEventListener('load', () => setTimeout(() => { const r = window.RM.weightCatalog(); document.body.setAttribute('data-kg', JSON.stringify(r)); }, 300));</script></body>`);
writeFileSync(join(dir, 'index.html'), html);
try {
  const out = execFileSync(CHROME, ['--headless=new', '--disable-gpu', `--user-data-dir=${join(dir, 'p')}`, '--virtual-time-budget=4000', '--dump-dom', 'file://' + join(dir, 'index.html')], { encoding: 'utf8', maxBuffer: 64 << 20, stdio: ['ignore', 'pipe', 'ignore'] });
  const m = out.match(/data-kg="([^"]*)"/); if (!m) throw new Error('catalog not found');
  const rows = JSON.parse(m[1].replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&#39;/g, "'"));
  const q = v => /[";\n]/.test(String(v)) ? `"${String(v).replace(/"/g, '""')}"` : String(v);
  writeFileSync(new URL('data/weight-catalog.csv', ROOT), ['key;name;part_no;kg', ...rows.map(r => r.map(q).join(';'))].join('\n') + '\n');
  console.log(`data/weight-catalog.csv: ${rows.length} items, ${rows.filter(r => r[3] === '').length} without weight`);
} finally { rmSync(dir, { recursive: true, force: true }); }
