/* ---------- Stagecraft Library (local variant, injected by scripts/build-local.mjs) ----------
   Catalog = last state of library.stagecraft.solutions (window.__RMLIB.cat, cached in IndexedDB).
   Project snapshot state.lib = the data this project uses, so it opens and renders offline:
     dev {key: device}, view {key: view | null (no library view yet)}, con, types, sbx, kg,
     parts {panels, art, shelves, drawers, cases, acc, railRear} (rack parts, see data/parts.json),
     rev {'dev:key' | 'view:key' | 'con' | 'types' | 'sbx' | 'kg' | 'part:<section>': commit date of the library state taken}
   The app always draws the snapshot. A newer library state shows a refresh icon on the device (like the
   SYSBOXX pencil) and in the "Library" window; clicking it takes the library state into the project. */
const RML = window.__RMLIB || { cat: null, online: false, check: async () => { throw new Error('no loader'); } };
const LT = (de, en) => LANG === 'en' ? en : de;
const RMS = { cur: null, upd: [], updKeys: new Set(), timer: null, busy: false, appliedViews: new Set() };
const CASE_CUSTOM = CASES.custom;   // input form for an own case, not a part
const PSECT = ['panels', 'art', 'shelves', 'drawers', 'cases'], PWHOLE = ['acc', 'railRear'];
const PNAME = { panels: ['Steckerfeld-Bleche', 'Connector panels'], art: ['Blenden und Teile', 'Panels and parts'], shelves: ['Rackwannen und Kits', 'Shelves and kits'], drawers: ['Schubladen', 'Drawers'], cases: ['Cases', 'Cases'], acc: ['Zubehör', 'Accessories'], railRear: ['Hintere Rackschiene', 'Rear rail'] };
const CODEV = {};   // views defined in code only (Teranex Mini fronts, MA nodes …), used when the library has none
Object.keys(EXACT).forEach(k => { if (!(k in EXACT_JSON)) CODEV[k] = EXACT[k]; });
// stripped() drops keys starting with '_' – snapshot view keys like _ma_fp2 are stored as ~ma_fp2
const VK = k => k[0] === '_' ? '~' + k.slice(1) : k, KV = k => k[0] === '~' ? '_' + k.slice(1) : k;
const libViews = L => Object.fromEntries(Object.entries((L && L.view) || {}).map(([k, v]) => [KV(k), v]));
const libClone = o => o == null ? o : JSON.parse(JSON.stringify(o));
const libSigs = new WeakMap();
const libSig = o => {
  if (o == null || typeof o !== 'object') return JSON.stringify(o ?? null);
  let s = libSigs.get(o); if (s) return s;
  const sort = v => Array.isArray(v) ? v.map(sort) : v && typeof v === 'object' ? Object.fromEntries(Object.keys(v).sort().map(k => [k, sort(v[k])])) : v;
  s = JSON.stringify(sort(o)); libSigs.set(o, s); return s;
};
const libSame = (a, b) => libSig(a) === libSig(b);
const libTime = s => { const t = Date.parse(s || ''); return Number.isNaN(t) ? 0 : t; };
const libRefill = (obj, src) => { Object.keys(obj).forEach(k => { if (!(k in src)) delete obj[k]; }); Object.assign(obj, src); };
const libCat = () => RML.cat || null;
const libUsed = s => {
  const ks = new Set();
  (s.items || []).forEach(it => {
    if (it.kind === 'device') { if (it.dev) ks.add(it.dev); if (it.devKey) ks.add(it.devKey); }
    if (it.kind === 'shelf') [...(it.devs || []), ...(it.devsUnknown || [])].forEach(o => { if (o && o.dev) ks.add(o.dev); });
  });
  return ks;
};

// globals ← catalog + snapshot of project s (snapshot wins)
function libApply(s) {
  const C = libCat() || {}, L = s.lib || {}, CV = C.view || {}, LV = libViews(L);
  libRefill(DEVDB, { ...(C.dev || {}), ...(L.dev || {}) });
  const keys = new Set([...Object.keys(CV), ...Object.keys(LV), ...RMS.appliedViews]);
  keys.forEach(k => { const v = (k in LV ? LV[k] : CV[k]) || CODEV[k]; if (v) EXACT[k] = v; else delete EXACT[k]; });
  RMS.appliedViews = keys;
  libRefill(CTYPES, { ...((C.con || {}).types || {}), ...(L.types || {}) });
  libRefill(CON, { ...((C.con || {}).connectors || {}), ...(L.con || {}) });
  libRefill(SBX, L.sbx || C.sbx || {});
  libRefill(KG, { ...(C.kg || {}), ...(L.kg || {}) });
  const P = RMS.parts = RML.mergeParts(C.part, L.parts);
  libRefill(PANELS, P.panels); libRefill(ART, P.art); libRefill(SHELVES, P.shelves); libRefill(RAIL_REAR, P.railRear);
  libRefill(DRAWERS, Object.fromEntries(Object.entries(P.drawers).map(([k, o]) => [k, partDrawer(o)])));
  libRefill(CASES, { ...Object.fromEntries(Object.entries(P.cases).map(([k, o]) => [k, partCase(o)])), custom: CASE_CUSTOM });
  ACC_DEFAULT.splice(0, ACC_DEFAULT.length, ...P.acc);
  DEV_GROUPS.splice(0, DEV_GROUPS.length, ...new Set(Object.values(DEVDB).map(d => d.g)));
  PICK.splice(0, PICK.length, ...Object.keys(CTYPES).filter(t => conOf(t).some(k => CON[k].fit !== 'fp')));
  PICK_ALL.splice(0, PICK_ALL.length, ...Object.keys(CTYPES).filter(t => t !== 'open'));
}
// before normalize(): add what a project brings along, so nothing of it gets dropped (other projects, files)
function libFill(s) {
  const L = s && s.lib; if (!L) return;
  Object.entries(L.dev || {}).forEach(([k, d]) => { if (!DEVDB[k]) DEVDB[k] = d; });
  Object.entries(libViews(L)).forEach(([k, v]) => { if (v && !EXACT[k]) { EXACT[k] = v; RMS.appliedViews.add(k); } });
  Object.entries(L.types || {}).forEach(([k, t]) => { if (!CTYPES[k]) CTYPES[k] = t; });
  Object.entries(L.con || {}).forEach(([k, c]) => { if (!CON[k]) CON[k] = c; });
  if (L.sbx && !Object.keys(SBX).length) Object.assign(SBX, L.sbx);
}
// snapshot ← what the project uses (new devices and connectors are taken as they are drawn now)
function libCapture(s) {
  const C = libCat(), L = s.lib = s.lib || {}, used = libUsed(s);
  const rev = L.rev = L.rev || {}, dev = L.dev = L.dev || {}, view = L.view = L.view || {};
  const date = C ? C.date : null;
  if (C) L.src = C.src;
  used.forEach(k => {
    if (!(k in dev) && DEVDB[k]) { dev[k] = libClone(DEVDB[k]); rev['dev:' + k] = C && C.dev[k] && libSame(C.dev[k], DEVDB[k]) ? date : rev['dev:' + k] || null; }
    if (!(VK(k) in view) && C && C.dev[k]) { view[VK(k)] = libClone(C.view[k] || null); rev['view:' + k] = date; }
  });
  if (C) Object.keys(C.view).filter(k => k.startsWith('_') && !(VK(k) in view)).forEach(k => { view[VK(k)] = libClone(C.view[k]); rev['view:' + k] = date; });
  Object.keys(dev).forEach(k => { if (!used.has(k)) { delete dev[k]; delete rev['dev:' + k]; } });
  Object.keys(view).forEach(vk => { const k = KV(vk); if (!k.startsWith('_') && !used.has(k)) { delete view[vk]; delete rev['view:' + k]; } });
  // connectors, types, weights: the whole (small) tables, new entries are added; SYSBOXX as one block
  for (const [part, src] of [['con', CON], ['types', CTYPES], ['kg', KG]]) {
    const t = L[part] = L[part] || {};
    if (!rev[part] && date) rev[part] = date;
    Object.keys(src).forEach(k => { if (!(k in t)) t[k] = libClone(src[k]); });
  }
  if (!L.sbx && Object.keys(SBX).length) { L.sbx = libClone(SBX); rev.sbx = date; }
  // rack parts: all sections (about 20 KB), new entries are added; acc and railRear as a whole
  const P = RMS.parts || {}, LP = L.parts = L.parts || {};
  PSECT.forEach(sec => { const t = LP[sec] = LP[sec] || {}; if (!rev['part:' + sec] && date) rev['part:' + sec] = date; Object.keys(P[sec] || {}).forEach(k => { if (!(k in t)) t[k] = libClone(P[sec][k]); }); });
  PWHOLE.forEach(sec => { if (LP[sec] == null && P[sec] != null) { LP[sec] = libClone(P[sec]); rev['part:' + sec] = date; } });
}
const libNewer = (L, key) => { const C = libCat(); return !!C && libTime(C.date) >= libTime((L.rev || {})[key]); };
// list of library states that are newer than the snapshot
function libUpdates(s) {
  const C = libCat(), L = s.lib, out = []; if (!C || !L) return out;
  Object.keys(L.dev || {}).forEach(k => {
    if (!C.dev[k]) return;
    const d = !libSame(L.dev[k], C.dev[k]) && libNewer(L, 'dev:' + k);
    const lv = (L.view || {})[VK(k)], v = VK(k) in (L.view || {}) && !libSame(lv ?? null, C.view[k] ?? null) && libNewer(L, 'view:' + k);
    if (d || v) out.push({ kind: 'dev', k, n: C.dev[k].n || L.dev[k].n || k, dev: d, view: v, newView: v && !lv });
  });
  const diff = (a, b) => Object.keys(a || {}).filter(k => k in (b || {}) && !libSame(a[k], b[k]));
  const con = diff(L.con, C.con.connectors), types = diff(L.types, C.con.types), kg = diff(L.kg, C.kg);
  if ((con.length || types.length) && libNewer(L, 'con')) out.push({ kind: 'con', n: LT('Steckverbinder', 'Connectors'), count: con.length + types.length });
  if (L.sbx && !libSame(L.sbx, C.sbx) && libNewer(L, 'sbx')) out.push({ kind: 'sbx', n: 'SYSBOXX' });
  if (kg.length && libNewer(L, 'kg')) out.push({ kind: 'kg', n: LT('Gewichte', 'Weights'), count: kg.length });
  const LP = L.parts || {}, CP = C.part || {};
  PSECT.forEach(sec => { const d = diff(LP[sec], CP[sec]); if (d.length && libNewer(L, 'part:' + sec)) out.push({ kind: 'part', sec, n: LT(...PNAME[sec]), count: d.length }); });
  PWHOLE.forEach(sec => { if (LP[sec] != null && CP[sec] != null && !libSame(LP[sec], CP[sec]) && libNewer(L, 'part:' + sec)) out.push({ kind: 'part', sec, n: LT(...PNAME[sec]) }); });
  return out;
}
// take one library state (or all) into the project
function libTake(list) {
  const C = libCat(), L = state.lib; if (!C || !L || !list.length) return 0;
  const rev = L.rev = L.rev || {};
  list.forEach(u => {
    if (u.kind === 'dev') {
      if (u.dev) { L.dev[u.k] = libClone(C.dev[u.k]); rev['dev:' + u.k] = C.date; }
      if (u.view) { L.view[VK(u.k)] = libClone(C.view[u.k] || null); rev['view:' + u.k] = C.date; }
    }
    if (u.kind === 'con') { Object.keys(L.con).forEach(k => { if (C.con.connectors[k]) L.con[k] = libClone(C.con.connectors[k]); }); Object.keys(L.types).forEach(k => { if (C.con.types[k]) L.types[k] = libClone(C.con.types[k]); }); rev.con = rev.types = C.date; }
    if (u.kind === 'sbx') { L.sbx = libClone(C.sbx); rev.sbx = C.date; }
    if (u.kind === 'part') {
      const LP = L.parts, CP = C.part || {};
      if (PWHOLE.includes(u.sec)) LP[u.sec] = libClone(CP[u.sec]);
      else Object.keys(LP[u.sec] || {}).forEach(k => { if (CP[u.sec] && CP[u.sec][k]) LP[u.sec][k] = libClone(CP[u.sec][k]); });
      rev['part:' + u.sec] = C.date;
    }
    if (u.kind === 'kg') { Object.keys(L.kg).forEach(k => { if (k in C.kg) L.kg[k] = C.kg[k]; }); rev.kg = C.date; }
  });
  libApply(state); RMS.cur = state;
  if (list.some(u => u.kind === 'part' && u.sec === 'acc')) {   // the project keeps its own copy of the accessories (with quantities)
    const old = state.acc || [];
    state.acc = ACC_DEFAULT.map(d => ({ ...d, qty: old.find(a => a.id === d.id)?.qty ?? 0 })).concat(old.filter(a => !ACC_DEFAULT.some(d => d.id === a.id)));
  }
  render();
  return list.length;
}
function libSync() {
  if (RMS.cur !== state) { libApply(state); RMS.cur = state; }
  libCapture(state);
  RMS.upd = libUpdates(state);
  RMS.updKeys = new Set(RMS.upd.filter(u => u.kind === 'dev').map(u => u.k));
  libChip();
}
const updOf = it => it.kind === 'device' ? (it.dev ? [it.dev] : []) : it.kind === 'shelf' ? (it.devs || []).map(o => o.dev) : [];
const libItemUpd = it => RMS.upd.filter(u => u.kind === 'dev' && updOf(it).includes(u.k));
const libWhat = u => [u.dev && LT('Daten', 'data'), u.view && (u.newView ? LT('neue Ansicht', 'new view') : LT('Ansicht', 'view'))].filter(Boolean).join(' + ');

// ---------- hooks into the app ----------
const _render = render;
render = function () { try { libSync(); } catch (e) { console.error('library sync', e); } return _render.apply(this, arguments); };
const _normalize = normalize;
normalize = function (s) { try { libFill(s); } catch (e) {} return _normalize(s); };
// refresh icon on the right rack ear, like the SYSBOXX pencil
const _faceSVG = faceSVG;
faceSVG = function (it, xL, W, live) {
  let g = _faceSVG(it, xL, W, live);
  if (!live) return g;
  const ups = libItemUpd(it); if (!ups.length) return g;
  const f = v => (+v).toFixed(2), y = CW + it.pos * HE + .4, h = it.he * HE - .8;
  const cx = xL + W19 - EAR / 2, cy = y + Math.min(h / 2, 16.5);
  const tip = LT('Neuer Stand in der Stagecraft Library', 'New state in the Stagecraft Library') + ': ' + ups.map(u => `${u.n} (${libWhat(u)})`).join(', ') + ' – ' + LT('klicken zum Übernehmen', 'click to take it over');
  g += `<g class="libupd" data-libupd="${it.id}"><title>${esc(tip)}</title><circle cx="${f(cx)}" cy="${f(cy)}" r="5.6"/>`
    + `<path d="M${f(cx + 2.9)} ${f(cy - 1.2)}A3 3 0 1 0 ${f(cx + 2.6)} ${f(cy + 1.6)}"/><path d="M${f(cx + 3.3)} ${f(cy - 3.6)}v2.6h-2.6"/></g>`;
  return g;
};
const _renderInsp = renderInsp;
renderInsp = function () {
  _renderInsp.apply(this, arguments);
  const it = state.items.find(i => i.id === sel); if (!it) return;
  const ups = libItemUpd(it); if (!ups.length) return;
  $('#insp').insertAdjacentHTML('afterbegin', `<div class="libnote" data-noi18n><span class="libico" aria-hidden="true">↻</span><div><b>${LT('Neuer Stand in der Library', 'New state in the library')}</b>`
    + `<small>${ups.map(u => `${esc(u.n)}: ${esc(libWhat(u))}`).join('<br>')}</small></div><button type="button" class="btn sm primary" data-libupd="${it.id}">${LT('Übernehmen', 'Take over')}</button></div>`);
};
function libUpdateItem(id) {
  const it = state.items.find(i => i.id === id); if (!it) return;
  const ups = libItemUpd(it); if (!ups.length) return;
  libTake(ups);
  toast(LT(`Aus der Library übernommen: ${ups.map(u => u.n).join(', ')}`, `Taken from the library: ${ups.map(u => u.n).join(', ')}`));
}
['pointerdown', 'mousedown', 'touchstart'].forEach(ev => document.addEventListener(ev, e => { if (e.target.closest && e.target.closest('[data-libupd]')) e.stopPropagation(); }, true));
document.addEventListener('click', e => {
  const t = e.target.closest ? e.target : e.target.parentElement;
  const b = t && t.closest('[data-libupd],[data-libact],#btnLib'); if (!b) return;
  e.stopPropagation(); e.preventDefault();
  if (b.id === 'btnLib') { libOpen(); return; }
  if (b.dataset.libupd) { libUpdateItem(b.dataset.libupd); if ($('#libDlg').open) libRender(); return; }
  libAction(b.dataset.libact, b.dataset.k);
}, true);

// ---------- header chip and window ----------
function libChip() {
  const b = $('#btnLib'); if (!b) return;
  const C = libCat(), n = RMS.upd.length;
  b.dataset.st = RML.online === false ? 'off' : n ? 'upd' : RML.online ? 'ok' : 'wait';
  $('#libTxt').textContent = 'Library' + (RML.online === false ? ' · offline' : '');
  $('#libCount').textContent = n ? ' ' + n : '';
  b.title = RML.online === false ? LT('Library nicht erreichbar – gearbeitet wird mit den Daten im Projekt', 'Library not reachable – working with the data stored in the project')
    : n ? LT(`${n} neue Stände in der Library`, `${n} new states in the library`) : C ? LT(`Library-Stand ${C.short}`, `Library state ${C.short}`) : 'Library';
}
const libDate = iso => iso ? fmtDate(iso) : '–';
function libRender() {
  const C = libCat(), L = state.lib || {}, ups = RMS.upd;
  const st = RML.online === false ? `<span class="libdot off"></span>${LT('offline', 'offline')}` : RML.online ? `<span class="libdot ok"></span>${LT('online', 'online')}` : `<span class="libdot"></span>${LT('wird geprüft …', 'checking …')}`;
  let h = `<dl class="libinfo"><dt>${LT('Quelle', 'Source')}</dt><dd><a href="${esc(RML.BASE.replace(/api\/v1\/?$/, ''))}" target="_blank" rel="noopener">${esc(RML.BASE)}</a></dd>`
    + `<dt>${LT('Verbindung', 'Connection')}</dt><dd>${st}${RML.checked ? ` · ${LT('geprüft', 'checked')} ${libDate(RML.checked)}` : ''}${RML.online === false && RML.error ? ` · <small>${esc(RML.error)}</small>` : ''}</dd>`
    + `<dt>${LT('Library-Stand', 'Library state')}</dt><dd>${C ? `<code>${esc(C.short)}</code> · ${libDate(C.date)} · ${Object.keys(C.dev).length} ${LT('Geräte', 'devices')}, ${Object.keys(C.view).length} ${LT('Ansichten', 'views')}` : LT('keiner (nur Projektdaten)', 'none (project data only)')}</dd>`
    + `<dt>${LT('Im Projekt', 'In the project')}</dt><dd>${Object.keys(L.dev || {}).length} ${LT('Geräte', 'devices')}, ${Object.values(L.view || {}).filter(Boolean).length} ${LT('Ansichten', 'views')}, ${Object.keys(L.con || {}).length} ${LT('Steckverbinder', 'connectors')}, ${Object.keys((L.parts || {}).cases || {}).length} Cases ${LT('und Rack-Teile', 'and rack parts')} – ${LT('auch offline verfügbar', 'also available offline')}</dd></dl>`;
  h += `<div class="actions"><button type="button" class="btn sm" data-libact="check"${RMS.busy ? ' disabled' : ''}>${RMS.busy ? LT('Prüfe …', 'Checking …') : LT('Jetzt prüfen', 'Check now')}</button>${ups.length ? `<button type="button" class="btn sm primary" data-libact="all">${LT(`Alle ${ups.length} übernehmen`, `Take over all ${ups.length}`)}</button>` : ''}</div>`;
  if (ups.length) {
    h += `<p class="subh">${LT('Neuere Stände in der Library', 'Newer states in the library')}</p><ul class="plist">` + ups.map((u, i) => `<li class="prow"><div class="pinfo"><b>${esc(u.n)}</b><small>${u.kind === 'dev' ? esc(libWhat(u)) : u.count ? LT(`${u.count} Einträge geändert`, `${u.count} entries changed`) : LT('geändert', 'changed')}</small></div>`
      + `<div class="pbtns"><button type="button" class="btn sm primary" data-libact="one" data-k="${i}">${LT('Übernehmen', 'Take over')}</button></div></li>`).join('') + '</ul>';
  } else h += `<p class="hint">${C ? LT('Das Projekt entspricht dem Library-Stand.', 'The project matches the library state.') : LT('Ohne Verbindung zur Library werden die im Projekt gespeicherten Daten verwendet.', 'Without a connection to the library the data stored in the project is used.')}</p>`;
  h += `<p class="hint">${LT('Geräte, Ansichten, Steckverbinder, Cases und Rack-Teile kommen aus der Stagecraft Library. Jedes Projekt speichert die Daten, die es verwendet, in der Projektdatei – so bleibt es unverändert und lässt sich auch offline bearbeiten. Neuere Stände werden nur auf Klick übernommen (↻ am Gerät).', 'Devices, views, connectors, cases and rack parts come from the Stagecraft Library. Every project stores the data it uses in the project file – it stays unchanged and can be edited offline. Newer states are only taken over on click (↻ on the device).')}</p>`;
  $('#libBody').innerHTML = h;
}
function libOpen() { const d = $('#libDlg'); if (!d.open) { if (typeof d.showModal === 'function') d.showModal(); else d.setAttribute('open', ''); } libRender(); }
function libClose() { const d = $('#libDlg'); if (d.open) { if (typeof d.close === 'function') d.close(); else d.removeAttribute('open'); } }
async function libAction(a, k) {
  if (a === 'close') { libClose(); return; }
  if (a === 'check') { await libRefresh(true); return; }
  if (a === 'all') { const n = libTake(RMS.upd.slice()); toast(LT(`${n} Stände aus der Library übernommen`, `${n} states taken from the library`)); libRender(); return; }
  if (a === 'one') { const u = RMS.upd[+k]; if (u) { libTake([u]); toast(LT(`Aus der Library übernommen: ${u.n}`, `Taken from the library: ${u.n}`)); } libRender(); }
}
// background check: index.json only; the data files are loaded when the library has a new commit
async function libRefresh(manual) {
  if (RMS.busy) return; RMS.busy = true; if ($('#libDlg').open) libRender();
  try {
    const r = await RML.check(RML.cat, 10000);
    RML.online = true; RML.error = '';
    if (r.changed) {
      RML.cat = r.cat; libApply(state); RMS.cur = state; render();
      if (RMS.upd.length) toast(LT(`Neuer Library-Stand: ${RMS.upd.length} Aktualisierungen für dieses Projekt`, `New library state: ${RMS.upd.length} updates for this project`));
      else if (manual) toast(LT('Neuer Library-Stand geladen', 'New library state loaded'));
    } else if (manual) toast(LT('Library ist aktuell', 'Library is up to date'));
  } catch (e) { RML.online = false; RML.error = String(e && e.message || e); if (manual) toast(LT('Library nicht erreichbar', 'Library not reachable')); }
  RML.checked = new Date().toISOString(); RMS.busy = false;
  libChip(); if ($('#libDlg').open) libRender();
}
window.addEventListener('online', () => libRefresh());
window.addEventListener('offline', () => { RML.online = false; libChip(); });
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible' && Date.now() - libTime(RML.checked) > 60000) libRefresh(); });
setInterval(() => { if (document.visibilityState === 'visible') libRefresh(); }, 5 * 60000);
$('#libDlg').addEventListener('click', e => { if (e.target === e.currentTarget) libClose(); });
libApply(state); RMS.cur = state;
if (RML.online == null) setTimeout(() => libRefresh(), 300);
