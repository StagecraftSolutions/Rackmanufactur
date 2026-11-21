// Rack Manufaktur, local variant – loader (runs before the app)
//
// The local variant has no built-in product database. Devices, views, connectors, SYSBOXX and weights come from
// the Stagecraft Library API (rackmanufaktur/*.json). The last downloaded state is kept in IndexedDB, and every
// project carries a snapshot of the data it uses (state.lib), so the app also starts and works offline.
//
// Order: cached catalog → (no cache: wait for the library) → snapshot of the current project → start the app.
// A cached catalog starts the app at once; the client inside the app checks the library in the background.
(() => {
  'use strict';
  const DEF = 'https://library.stagecraft.solutions/api/v1/';
  const FILES = { dev: 'rackmanufaktur/devices.json', view: 'rackmanufaktur/views.json', con: 'rackmanufaktur/connectors.json', sbx: 'rackmanufaktur/sysboxx.json', kg: 'rackmanufaktur/weights.json' };
  const KEY = 'rackwerk-v1', URLKEY = 'rm-library-url';
  const ls = { get: k => { try { return localStorage.getItem(k); } catch (e) { return null; } }, set: (k, v) => { try { v == null ? localStorage.removeItem(k) : localStorage.setItem(k, v); } catch (e) {} } };

  // ?library=http://localhost:8752/api/v1/ switches the source (remembered), ?library=default resets it
  const qp = new URLSearchParams(location.search).get('library');
  if (qp) ls.set(URLKEY, qp === 'default' ? null : qp);
  let BASE = ls.get(URLKEY) || DEF;
  if (!BASE.endsWith('/')) BASE += '/';

  // ---------- IndexedDB cache ----------
  let dbp = null;
  const db = () => dbp || (dbp = new Promise((res, rej) => {
    if (!window.indexedDB) { rej(new Error('no IndexedDB')); return; }
    const r = indexedDB.open('rack-manufaktur-library', 1);
    r.onupgradeneeded = () => r.result.createObjectStore('kv');
    r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); r.onblocked = () => rej(new Error('blocked'));
  }));
  const kv = async (mode, f) => { const d = await db(); return new Promise((res, rej) => { const q = f(d.transaction('kv', mode).objectStore('kv')); q.onsuccess = () => res(q.result); q.onerror = () => rej(q.error); }); };
  const cacheGet = () => kv('readonly', s => s.get('catalog')).catch(() => null);
  const cachePut = v => kv('readwrite', s => s.put(v, 'catalog')).catch(() => {});

  // ---------- Library API ----------
  async function getJSON(path, ms) {
    const ac = new AbortController(), t = setTimeout(() => ac.abort(), ms);
    try {
      const r = await fetch(BASE + path, { cache: 'no-cache', signal: ac.signal });
      if (!r.ok) throw new Error(`${path}: HTTP ${r.status}`);
      return await r.json();
    } finally { clearTimeout(t); }
  }
  const isObj = o => o && typeof o === 'object' && !Array.isArray(o);
  // Returns { cat, changed }; throws when the library is not reachable
  async function check(cat, ms = 10000) {
    const idx = await getJSON('index.json', ms);
    const commit = idx.commitFull || idx.commit || idx.generatedAt;
    if (cat && cat.src === BASE && cat.commit === commit) return { cat, changed: false };
    const keys = Object.keys(FILES), got = await Promise.all(keys.map(k => getJSON(FILES[k], Math.max(ms, 30000))));
    const d = Object.fromEntries(keys.map((k, i) => [k, got[i]]));
    if (!isObj(d.dev) || !isObj(d.view) || !isObj(d.con) || !isObj(d.con.types) || !isObj(d.con.connectors) || !isObj(d.sbx) || !isObj(d.kg)) throw new Error('unexpected data from the library');
    const { _source, ...sbx } = d.sbx;
    const nc = { src: BASE, commit, short: idx.commit || String(commit).slice(0, 7), date: idx.commitDate || idx.generatedAt || new Date().toISOString(), fetched: new Date().toISOString(),
      dev: d.dev, view: d.view, con: d.con, sbx, kg: d.kg };
    await cachePut(nc);
    return { cat: nc, changed: true };
  }

  const R = window.__RMLIB = { BASE, DEF, check, cat: null, online: null, checked: null, error: '' };

  // ---------- Start screen ----------
  const de = (ls.get('rm-lang') || (/^de\b/i.test(navigator.language || '') ? 'de' : 'en')) === 'de';
  const L = (a, b) => de ? a : b;
  function splash(html) {
    let el = document.getElementById('rmSplash');
    if (!el) { el = document.createElement('div'); el.id = 'rmSplash'; el.className = 'rm-splash'; document.body.appendChild(el); }
    el.innerHTML = `<div class="rm-splash-box">${html}</div>`;
    return el;
  }

  function start(snap) {
    const C = R.cat || {}, S = snap || {};
    // project snapshot wins over the catalog; the client inside the app applies it again on every project switch
    const views = { ...(C.view || {}) };
    Object.entries(S.view || {}).forEach(([vk, v]) => { const k = vk[0] === '~' ? '_' + vk.slice(1) : vk; if (v) views[k] = v; else delete views[k]; });
    window.__RM = {
      DEVDB: { ...(C.dev || {}), ...(S.dev || {}) },
      EXACT: views,
      CTYPES: { ...((C.con || {}).types || {}), ...(S.types || {}) },
      CON: { ...((C.con || {}).connectors || {}), ...(S.con || {}) },
      SBX: S.sbx || C.sbx || {},
      KG: { ...(C.kg || {}), ...(S.kg || {}) },
    };
    const sp = document.getElementById('rmSplash'); if (sp) sp.remove();
    const s = document.createElement('script');
    s.textContent = document.getElementById('rmApp').textContent;
    document.body.appendChild(s);
  }

  async function boot() {
    let snap = null;
    try { const p = JSON.parse(ls.get(KEY)); snap = p && p.lib && p.lib.con ? p.lib : null; } catch (e) {}
    R.cat = await cacheGet();
    if (R.cat) { start(snap); return; }                      // cached: start now, the client checks for news
    splash(`<b>Rack Manufaktur</b><p>${L('Lade Gerätedaten aus der Stagecraft Library …', 'Loading device data from the Stagecraft Library …')}</p><small>${BASE}</small>`);
    try { R.cat = (await check(null, 15000)).cat; R.online = true; R.checked = new Date().toISOString(); }
    catch (e) { R.online = false; R.error = String(e && e.message || e); }
    if (R.cat || snap) { start(snap); return; }               // offline without cache: the open project brings its own data
    const el = splash(`<b>Rack Manufaktur</b><p>${L('Die Stagecraft Library ist nicht erreichbar und in diesem Browser liegen noch keine Gerätedaten.', 'The Stagecraft Library cannot be reached and this browser has no device data yet.')}</p>`
      + `<p>${L('Einmal mit Internetverbindung öffnen – danach funktioniert die App auch offline.', 'Open once while online – after that the app also works offline.')}</p><small>${BASE} · ${R.error}</small>`
      + `<p><button type="button" class="btn primary" id="rmRetry">${L('Erneut versuchen', 'Try again')}</button></p>`);
    el.querySelector('#rmRetry').onclick = () => { el.remove(); boot(); };
  }
  boot();
})();
