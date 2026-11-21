# Notes for AI assistants (ChatGPT/Codex, Claude)

Rack Manufaktur is a 19″ rack configurator in **one file**: `public/index.html`. Project language is English (the UI is bilingual, see below).

## No product data in this repository

Devices, scale views, connectors, SYSBOXX, rack parts (cases, panels, shelves, drawers, accessories, rear rail) and weights are **not** kept here. The app loads them at runtime from the official open API of the Stagecraft Library:

```
https://library.stagecraft.solutions/api/v1/index.json
https://library.stagecraft.solutions/api/v1/rackmanufaktur/{devices,views,connectors,sysboxx,parts,weights}.json
```

- Never add device, connector, case or other article data to this repository – no JSON/CSV tables, no data blocks, no views or part lists in the code. New devices, corrections, weights, views and sources go into the **Stagecraft Library** (repository `Library`, see its README and `docs/data-format.md`).
- The only data kept here is the German → English dictionary in `data/i18n/` (see below).
- The loader at the end of `public/index.html` fetches the files, caches them in IndexedDB and starts the app; every project stores a snapshot of the data it uses (`lib` in the project file). See README, section "Product data: Stagecraft Library".
- Test against another library source: `index.html?library=http://localhost:8752/api/v1/` (`?library=default` resets).
- Fully local: the user chooses a Git checkout of the Library in the Library window; the loader reads `data/` and runs the Library's `scripts/lib/rackmanufaktur.mjs` (must stay free of Node imports) from that folder. Do not copy that export logic into this repository.

## What you may work on

| File | Content |
|---|---|
| `public/index.html` | the app (code, styles, loader) – edit directly, except the block `DATA:I18N` |
| `data/i18n/ui.json`, `data/i18n/catalog.json` | German → English dictionary (`{0}` placeholders must be kept) |

After changing UI texts or when the library has new catalog texts:

```bash
node scripts/i18n-extract.mjs         # UI texts from index.html, catalog texts from the library API
node scripts/i18n.mjs import          # validates and writes block DATA:I18N into public/index.html
```

If `import` stops with ERROR, fix the dictionary – do not force anything.

## Rules

1. Small, self-contained changes; one PR per task.
2. **No images or logos** from manufacturers in the repository.
3. Do not reintroduce built-in fallbacks for product data (e.g. views or devices "defined in code"). If the library lacks something, add it to the library.
4. The app must keep working offline with the cached catalog and the project snapshot.

## Translations (`data/i18n/`)

Keys are the German UI texts, values the English translation. Keep placeholders `{0}`, `{1}` …; keep the tone short and neutral. New texts appear with an empty value after `node scripts/i18n-extract.mjs`. Device names and groups (`n`, `g`) are German in the library and are translated through `catalog.json`; connector texts (`io`, labels `l`) are English already.
