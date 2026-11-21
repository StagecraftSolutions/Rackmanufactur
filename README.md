# Rack Manufaktur

Web configurator for 19″ rack cases with connector panels, devices and rack parts. The app is a single HTML file in `public/` (plus local fonts and jsPDF), no build step: open `public/index.html` in a browser or upload the folder to a web server.

**Live instance: <https://rack.stagecraft.solutions/>** – runs the current `main` branch; the page footer links the exact commit that is deployed. Interface in **English and German** (switch in the header).

Cases: **ProCase Pro rack modules** and **ProCase QSD racks** (procaseshop.de) and **Thon** racks from Thomann. Connector panels, blank/vent panels, rack shelves and drawers from Adam Hall, D-size inserts from Seetronic and Neutrik. All product data (devices, views, connectors, cases, rack parts, weights) comes from the [Stagecraft Library](https://library.stagecraft.solutions/) – this repository holds no product data.

## Three steps

1. **Project & case:** project name, client, note. Choose a rack case from cards (filter ProCase / Thomann / with rear rail), height, depth, rear rail, lids.
2. **Configurator:** live view with front, side and rear view. Add elements via a popup with the tabs **Modules**, **Devices** and **Custom elements**, or with the **+** that appears when hovering over a free spot. "In the rack" list, inspector on the right.
3. **Order & build:** overview with front and rear view for printing, bill of materials with suppliers and total weight, order lists per supplier, build notes, label PDF, loose parts.

## Features

- **Cases:** ProCase Pro rack module 560 / 715 mm, ProCase QSD-Rack 2.0 600 / 800 mm, Thon with rear rail (Live 45 BK RR, Live 63 RR, Profi 48 RR, SD System Rack 600), Thon front only (Eco II 35, Live 40, Live 50), custom case with free dimensions.
- **Live view:** front view (rear-mounted modules dashed), side view with mounting depths and **collisions** between front and rear modules (overlap in mm), rear view mirrored (rear-mounted modules show their front, front-mounted ones their rear).
- **Placing modules:** click and drag (0.5 U grid), overlapping modules move down; inspector with "from U", ↑/↓ 0.5 U, "close gaps". Front or rear side per module. **Stepless placement** (case option for rails without hole pattern – ProCase RSS, Thon aluminium rails, custom cases): modules move in 1 mm steps instead of the 0.5 U grid, with a "from top edge (mm)" field; grid positions stay exact.
- **Modules:** connector panels 1 U · 12 D (with/without strain relief), 1 U · 16 D, 2 U · 24 D; label panel 0.5 U; vent panels 0.5–4 U and blank panels 1–4 U (may sit in front of a rack shelf); rack shelves (Adam Hall, Thon, Blackmagic Universal Rack Shelf, Shure and MA rack kits); drawers incl. short models; brush panel; custom elements with part no., price, supplier and weight.
- **Connector panels:** fill holes by click or drag & drop, swap by dragging; the selected hole shows type, supplier/part, name/note and mounting direction (rear or front); drilled blank plates for RCA, jack, SMA.
- **Connector database:** connector types with parts from several suppliers (Neutrik, Seetronic, Amphenol …), each D-size, in a drilled blank plate, or with its own footprint (cutouts and screw holes), e.g. CEE 16 A, Schuko, IEC C14.
- **Custom connector panels:** a steel blank panel (1–4 U) with freely placed connectors in an editor (drag, arrow keys, coordinates), overlap and edge checks, drill plan in the build notes and a 1:1 drill template as PDF. Saved in the project file.
- **Devices** from the Stagecraft Library (Blackmagic, Ubiquiti, Shure, Behringer, Midas, d&b, L-Acoustics, Powersoft, dBTechnologies, MA Lighting, Swisson, NovaStar, Eurolite, Netgear, APC, Stairville, GLP, Showtec, RF Venue, Botex, the t.amp). Devices with a scale view are drawn from dimensional drawings or photos; every connector has an English function label (tooltip, e.g. "SDI In 1", "Headphones"). Devices without a view appear as placeholders with name, height and depth.
- **Label panel:** divisions, lines, pitch, offset, strip size; PDF export at actual size with cut marks.
- **Bill of materials** with part numbers, suppliers, prices, sources and **weight**; prices, part numbers and suppliers can be overridden and are saved in the project file. Devices can be marked as "owned".
- **Build notes:** drilling, mounting direction, rack shelf cutting (angle grinder), MA front panels, label strips.
- **Projects:** "Projects" window with all cases (new, open, duplicate, delete, search), stored in IndexedDB; optional **project folder** (File System Access API, Chrome/Edge), e.g. in Nextcloud, one `.json` file per project; back up all projects as one package.
- **Review editor:** overlay a manufacturer photo or drawing (stays local), correct elements by dragging, approve front/rear/data; the result is applied in the Stagecraft Library.
- **Export:** project PDF (views, BOM, orders, build notes), front/rear view as PNG, project file (.json). Exports follow the selected language.

## Product data: Stagecraft Library

The app has **no built-in product database**, and this repository keeps none. Devices, scale views, connectors, SYSBOXX, rack parts (cases, panels, shelves, drawers, accessories, rear rail) and weights are loaded from the official open API of the [Stagecraft Library](https://library.stagecraft.solutions/):

| Endpoint (`https://library.stagecraft.solutions/api/v1/`) | Content |
|---|---|
| `index.json` | library state (commit, date) – checked first, the files below are only fetched when it changed |
| `rackmanufaktur/devices.json` | device database |
| `rackmanufaktur/views.json` | scale views incl. connector function labels (`l`) |
| `rackmanufaktur/connectors.json` | connector types and parts per supplier, footprints |
| `rackmanufaktur/sysboxx.json` | SYSBOXX housings and front plates |
| `rackmanufaktur/parts.json` | cases, connector panels, blank/vent panels, shelves and kits, drawers, accessories, rear rail |
| `rackmanufaktur/weights.json` | weights of all non-device items (`art:`, `con:`, `panel:`, `shelf:`, `case:`, `acc:`, `x:`) |

New devices, corrections, weights, views and sources are maintained **in the Stagecraft Library** (repository `Library`, see its README and `docs/data-format.md`), not here.

- **Catalog:** the last library state is cached in the browser (IndexedDB). With a cache the app starts at once and checks the library in the background (on start, every 5 minutes, when the tab becomes visible or the network returns). Only the first start needs a connection.
- **Project snapshot:** every project stores the data it uses in the project file (`lib`: used devices and their views, connectors and types, SYSBOXX, rack parts incl. case prices and part numbers, weights). The project always draws this snapshot, so it opens and can be edited offline and does not change on its own.
- **Updates:** when the library has a newer state of a device or a new/changed view, a **↻ icon** appears on the right rack ear (like the SYSBOXX pencil) and a note in the inspector; a click takes it into the project. The **Library** chip in the header shows the connection and the number of updates; its window lists them (also connectors, SYSBOXX, cases and other rack parts, weights) with "Take over" / "Take over all" and "Check now".
- Other source for testing: `index.html?library=http://localhost:8752/api/v1/` (remembered; `?library=default` resets).

### Fully local: Library from a folder

Like before (when the data was built in), the configurator also runs without internet and without a server:

1. Download the Library repository with Git:

   ```bash
   git clone https://github.com/StagecraftSolutions/Library.git
   ```

2. Open the configurator (`public/index.html` from this repository, or the live instance) → **Library** chip in the header → **Choose library folder …** → select the `Library` folder.

The app reads `data/articles/`, `data/views/` and `data/meta/` and converts them with the Library's own export code (`scripts/lib/rackmanufaktur.mjs` + `io.mjs`, loaded from that folder) – no build, no Node. The result is the same as `api/v1/rackmanufaktur/*.json`. A folder with the built API (`rackmanufaktur/*.json`, e.g. `public/api/v1` after `node scripts/build.mjs`) works as well.

- **Chrome/Edge** remember the folder (read access only). After a reload the browser may ask again: "Allow folder" in the Library window. "Read folder again" picks up `git pull` or own edits (uncommitted changes count too); the app also re-reads it in the background while access is allowed.
- **Firefox/Safari** read the folder once per choice; choose it again for a new state.
- The chosen source is remembered; **Use the online library** switches back. Projects keep their snapshot either way, newer states show up as updates.
- Without any cached data the start screen offers "Choose library folder …" directly – so the very first start also works offline.
- The loader sits at the end of `public/index.html`: the app script is `<script type="text/plain" id="rmApp">` and is started once the data is there.

**Review editor:** "Review view" in the app overlays a manufacturer photo or drawing (stays local), corrects elements by dragging and approves front/rear/data. "Save all drafts" writes `views-review-<date>.json` (views and approvals per device key); apply it in the Stagecraft Library.

## Translations

UI texts are written in German in the code. In English mode a dictionary translates every rendered text (placeholders `{0}` for inserted values); unknown catalog texts fall back to a term list. After changing UI texts:

```bash
node scripts/i18n-extract.mjs
```

It reads UI texts from `public/index.html` and catalog texts (device names, groups, part names …) from the Stagecraft Library API (`--library <url>` for another source). Then fill the new empty entries in `data/i18n/*.json` and write them into the app:

```bash
node scripts/i18n.mjs import
```

## Fixed rules

| Rule | Implementation |
|---|---|
| powerCON In/Out | default for **rear**-mounted connector panels: hole 1 = TRUE1 In (Seetronic SAC3MPX TR1), hole 2 = TRUE1 Out; all holes can be changed |
| TRUE1 Out | **SAC3FPX-LY TR1 + drill out** or **Seetronic SAC3FPX20, D size, no drilling** (front mounting only) |
| Panels over shelves | vent and blank panels may share the U with a rack shelf (only allowed overlap) |
| Rear-mounted modules | depth counts from the rear rail forward; collision if they hit a front module in the same U |
| D insert screws | 2× Thon M3×12 per insert, pack of 48 |
| Rack screws | 4 per module, 2 at 0.5 U, matching the rail type |
| Supplier | derived from part no. and price source; can be overridden |

## Deployment

| Path | Content |
|---|---|
| `public/` | the site: `index.html`, `impressum.html`, `datenschutz.html` (German legal pages), `.htaccess`, `assets/` |
| `public/assets/fonts/` | Barlow Condensed, IBM Plex Sans/Mono as WOFF2 (OFL 1.1) |
| `public/assets/vendor/` | jsPDF 2.5.1 (MIT) |
| `scripts/` | translation tools |

The public instance runs as a Docker container on TD Media's own server; the deployment setup is not part of this repository. The old address td-media.eu/rackwerk redirects (301) to rack.stagecraft.solutions; that redirect lives in the td-media.eu website repository.

The public instance is run by Bachmann, Schmidt & Seerig GbR (TD Media), Chemnitz, on its own server; no cookies, no tracking, no third-party services. If you host your own instance, replace `impressum.html` and `datenschutz.html` with your own legal pages.

## Code structure (`public/index.html`)

| Part | Content |
|---|---|
| `DEVDB`, `EXACT_JSON` → `EXACT`, `KG`, `CTYPES`, `CON`, `SBX`, `PARTS` | product data from the Stagecraft Library (`window.__RM`, set by the loader) |
| `PARTS` → `PANELS`, `ART`, `DRAWERS`, `SHELVES`, `CASES`, `ACC_DEFAULT`, `RAIL_REAR` | rack parts; `partCase()`/`partDrawer()` turn the tables per height into functions, `CASES.custom` (input form for an own case) stays in the code |
| `I18N_EN` | dictionary, written by `scripts/i18n.mjs` (do not edit by hand) |
| `libApply()`, `libCapture()`, `libUpdates()`, `libTake()` | Stagecraft Library: catalog + project snapshot, update icons, Library window |
| `rackSVG`, `sideSVG`, `faceSVG`, `backSVG`, `exactFace`, `devFace` | views as SVG in mm (1 U = 44.45; 19″ = 482.6) |
| `bom()`, `weightOf()`, `notesData()` | bill of materials, weight, build notes |
| `LIB` | project library (IndexedDB, project folder) |
| `tr()`, `trTree()` | translation layer |
| `openVE()` … | review editor |
| `openCP()`, `cpPdf()` … | custom connector panel editor, drill template |

Code comments are partly still German; see [docs/TASKS.md](docs/TASKS.md).

## License

MIT, see [LICENSE](LICENSE). Fonts (OFL 1.1) and jsPDF (MIT) keep their own licenses. Brand and product names belong to their owners.
