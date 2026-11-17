# Changelog

## 2026-11-17 – Version 26 · Views from product photos, safer project files

- **14 scale views drawn from product photos** (status "not checked yet", like the WING RACK): Behringer X32 RACK, Eurolite SB-1100B, dBTechnologies RDNet Control 8, Botex DPX-620 III (front), Botex CHC-8, Botex PSA 16PT2-TR1, Stairville DMX Splitter 4 MKIII, the t.amp Quadro 500 DSP, Showtec PSA-32A12S, RF Venue DISTRO4, Blackmagic SmartView Duo, ATEM 2 M/E Production Studio 4K, APC Smart-UPS C 1000 (front from an angled photo), Web Presenter HD (taken over from its successor Streaming Encoder HD). These devices are no longer placeholders.
- Connector lists corrected from the photos (e.g. DMX splitter with 3- and 5-pin per port, CHC-8 with four CEE motor outputs, RDNet Control 8 with powerCON and XLR, DISTRO4 with four DC outputs).
- **Rotated elements:** view elements accept `rot` (degrees, around x/y) – used for circuit breakers mounted sideways (Botex DPX-620 III, PSA 16PT2-TR1); editable in the review editor.
- **Project files keep unknown devices:** a project opened in an app version that does not know a device no longer loses the device key – it is kept (`devKey` / `devsUnknown`), shown as a placeholder with a warning and restored automatically once the device exists.

## 2026-11-16 – Version 25 · Connector database, custom connector panels

- **Connector database** `data/connectors.json` (23 types, 37 parts): each connector has a type, supplier/part, price and a fit – D-size, in a drilled blank plate, or its own footprint (cutouts, screw holes). New parts: Amphenol XLR/DMX, Neutrik powerCON blue/white, TRUE1 Out D-size, etherCON Cat 6A, USB 3.0; for custom panels CEE 16 A socket/inlet (PCE), Schuko panel socket (Mennekes 11081), IEC C14 snap-in (Schurter 1061) – footprints from manufacturer data, cutout diameters marked "check dimensions".
- **Connector panel inspector:** holes as a compact grid; only the selected hole shows its properties – type, supplier/part, name/note, mounting from rear/front. The palette picks a type and keeps the supplier. Names appear in tooltips and the build notes.
- **Custom connector panels** (Add → Custom elements): steel blank panel 1–4 U, connectors placed freely in an editor (drag, 0.5 mm grid, arrow keys, x/y), cutouts shown, warnings for overlaps and the rack-ear zone. BOM with blank panel, connectors and M3 screws; build notes with a drill plan (coordinates and cutouts); drill template 1:1 as PDF. Saved in the project file.
- `scripts/data.mjs` validates and imports the connector database (data blocks `CTYPES`, `CON`).

## 2026-11-16 – Version 24 · Inventory devices

- **13 new rack devices** from TD Media's rack modules: Netgear GS724T, APC Smart-UPS C 1000 (2 U), Stairville DMX Splitter 4 MKIII, GLP PDP-2/S, Showtec PSA-32A12S, RF Venue DISTRO4, Blackmagic SmartView Duo, ATEM 2 M/E Production Studio 4K, Web Presenter HD, Botex CHC-8, the t.amp Quadro 500 DSP, Botex DPX-620 III (Harting), Botex PSA 16PT2-TR1 – with English connector descriptions, depth, weight and price where known. 8 new manufacturers (213 devices, 21 manufacturers).
- **8 generated scale views** (from data sheet values, not yet checked against photos); the rest are placeholders. Missing prices and weights of Midas DL16/DL32, X32 RACK, ULXD4D/ULXD4 and MX20 filled from the inventory list.
- speakON connectors (NL4/NL8) have their own symbol in the scale views.
- Fix: DIN rails in scale views (e.g. Eurolite SB-1100) were drawn as a broken DIN socket.
- Project names are no longer run through the translation in English mode (window title, project list, overview, PDF).
- Translation: sentences whose full stop was split off now find their dictionary entry.

## 2026-11-16 – Version 23 · Examples

- First visit: four more example projects in the project list besides the connector rack – Shure wireless rack (antenna distribution, Shure rack kit with front antennas, in-ear, BNC rear panel), lighting network (Swisson to scale, MA rack kit with front panel, DMX panel), Blackmagic video control (switcher, router, BMD shelf, short drawer, 2 U SDI rear panel) and FOH audio (WING RACK, DL16, d&b D20 as placeholder, label panel, speakON rear).
- Examples are marked in the project list and are only written to a project folder once edited.

## 2026-11-16 – Version 22 · Source and version reference

- Footer links the source code on GitHub and the deployed commit ("Version <sha> · <date>"); `scripts/deploy.sh` writes the revision into the uploaded page (`+` = uncommitted changes in `public/`).
- README points to the live instance at td-media.eu/rackwerk.

## 2026-11-16 – Version 21 · English and German, connector labels

- **Bilingual UI:** language switch DE/EN in the header (default from the browser language, saved per browser). In English mode a dictionary translates every rendered text, attributes, PDF and PNG exports; numbers and prices use the English format.
- **Connector function labels:** every connector in the scale views has an English label (field `l`, e.g. "SDI In 1", "Headphones", "Power In"), shown as a tooltip and editable in the review editor. 1,178 labels assigned automatically from the printed labels and the device data – to be reviewed.
- **Connector descriptions (`io`) in English** for all 200 devices.
- All scale views now live in `data/views.json` (authoritative over the views in the code).
- **Project language English:** documentation, file names, script names and messages. Renamed: `scripts/data.mjs` (was `daten.mjs`, options `--weights`, `--review`), `scripts/manufacturers.mjs`, `scripts/weight-catalog.mjs`, `data/devices.json`, `weights.json`, `views.json`, `devices.csv`, `weight-catalog.csv`, `docs/TASKS.md`, `adding-items.md`, `data-sources.md`, `manufacturers.md`, `ai-workflow.md`; data block markers `DATA:…`.
- New: `scripts/i18n-extract.mjs`, dictionary in `data/i18n/`.

## 2026-11-16 – Version 20 · Review views

- **Review editor:** choose a device, overlay a manufacturer image (local, not uploaded) semi-transparently and align it, correct elements by dragging, arrow keys or input, add new elements. Approval per front, rear and device data. Drafts stay in the browser; "Save all drafts" produces a review file for `node scripts/data.mjs import --review`.
- Entry via Projects → "Review device views", the device info box or `#pruefen=<device>`; device list with ✓ approved / ◐ view / ○ placeholder.
- Views from the JSON file take precedence over the views in the code.
- Weight catalog CSV in the repository (all 360 items with weight key).
- AI rules: capturing (AI) and approving (human) separated; first AI view ATEM 4 M/E Constellation 4K Plus (unchecked).

## 2026-11-16 – Version 19 · Placeholders, weights, new manufacturers

- **Placeholder view:** devices without a scale view look like "custom elements" – name, manufacturer, height or size and depth from the database, dashed outline, "PLACEHOLDER" mark. The schematic connector rendering was removed.
- **Swisson to scale** from datasheet drawings and manufacturer photos: XND-8R5, XND-4R5, XPD-28-5R, XES-8G, XES-2T6, XSP-5R, XSR-5R, XSP-5R-5R (front and rear), depths and weights confirmed.
- **MA rack kit:** per node "connectors to the front" with front panel MA 130285 (2Port) or 130282 (4Port) and adapter cable set; free half with blank panel 130281 in the BOM.
- **New manufacturers:** d&b audiotechnik (D80, D40, D20, 40D, 30D, 10D, 5D, DS10, DS20, DS100, DS100M with dimensions and weight), L-Acoustics (LA12X, LA7.16, LA7.16i, LA4X, LA2Xi, P1), Powersoft (X8, X4, X4L, T series, Quattrocanali, Duecanali), dBTechnologies (Control 8, AC26N, IA3204). Database now 200 devices.
- **Weight:** field `kg` for devices, weight table for all other items. Total weight in BOM, build notes, overview and PDF, with the number of items without weight. "Weight list (CSV)" in the build notes; weight can be entered for custom elements.
- **Product data as JSON** (`data/`) with a data script (export, validated import, CSV, weight list). Guide for ChatGPT/Codex: `AGENTS.md`.

## 2026-11-16 – Version 18 · Multiple projects

- **"Projects" window** (header button and "All projects" in step 1): all cases with name, client, case, U, number of elements and date changed; new, open, duplicate, delete (with confirmation), search.
- Projects are stored in the browser database (IndexedDB) and saved automatically. "New project" and "Load example" create a new project instead of overwriting the open one.
- **Project folder** (Chrome/Edge): choose a folder, e.g. in Nextcloud – each project as its own .json file, written automatically; newer versions from the folder (other computer) are imported. After reloading, "Reconnect" once.
- **Back up all projects** as a package file; project files and packages can be imported. Old project files without an ID become new projects.
- Privacy policy extended with IndexedDB and project folder.
- **Header = project management:** the summary bar was removed (U usage/collisions are in step 2, the total in step 3). Instead: switch project, new project, all projects, folder status.

## 2026-11-16 – Version 17 · Usability, short drawers

- "In the rack" list: × to remove; front/rear only for screen readers (aria-label).
- More compact device popup, search stays on top; placeholders and "custom device" under "Custom elements".
- Swap connectors in a connector panel by dragging (view and hole list).
- Seetronic SAC3FPX20 front mounting only.
- Rack shelf can be shortened (checkbox + new depth), build note with angle grinder.
- Devices go into the order with price; "owned" switchable per device, own prices are saved in the project file.
- **Manufacturer lists:** 19″ range of Blackmagic, Ubiquiti, Shure, Behringer, Midas, MA Lighting, Swisson, NovaStar and Eurolite; 97 missing devices as placeholders. Device database 163 devices.
- Fix: devices from the database keep their name when inserted.
- Swisson XND-8 and XSP-5R: depth per datasheet (136 / 112 mm).
- **Short drawers:** Adam Hall 87402 S (210 mm), Thon Rack Drawer 2U Short (210 mm), Flyht Pro 2U/3U 28 cm; model switchable in the inspector.

## 2026-11-16 – Version 16 · 54 of 66 devices to scale

- To scale from dimensional drawings/manufacturer photos: Teranex Mini rears, Streaming Encoder HD/4K and Decoder 4K, Videohub 20x20 12G, CleanSwitch 12x12, Audio Monitor 12G G3, ATEM Constellation 1/2/4 M/E (HD and 4K), HyperDeck Studio (4 models), UniFi Pro Max 24 PoE and Cloud Gateway Max, Shure ULXD4/4D/4Q, QLXD4, AD4D/AD4Q, P9T, P10T (rear), UA845UWB, PA821B, Behringer WING RACK, Midas DL32/DL16/DN4816, NovaStar MX20.
- Data corrections: WING RACK 4 U, DL16 2 U, ATEM Television Studio HD8/ISO/4K8 are desk consoles, ATEM Microphone Converter is a box (200 × 125 × 41 mm), UCG Max 142 × 30 × 128 mm.
- Task list.

## 2026-11-16 – Version 15

- **Panel in front of a rack shelf:** vent and blank panels may share the U with a rack shelf (the only allowed overlap). The panel sits in front, devices in the shelf stay visible, selectable and movable; the panel is grabbed by its rack ears. The former option "rack shelf screwed behind" was removed; saved projects are converted automatically.
- Export: no more yellow highlight on vent panels.
- To scale: Shure ULXD4D (front/rear), Behringer WING RACK (front/rear, 4 U, 326 mm).
- Guide for adding items.

## 2026-11-15 – Version 14 · Devices to scale

- Scale views from manufacturer drawings/photos: **Teranex Mini** (front of all models, rear of SDI to HDMI), **UniFi USW-24-PoE** (front/rear), **ATEM 2 M/E Constellation HD** (front/rear), **grandMA3 2Port/4Port/8Port Node** (front).
- New in the catalog: **grandMA3 nodes** (2Port, 4Port, 4Port PoE, 8Port, 8Port PoE, onPC 8Port Node 4k) and **ATEM Constellation** (1/2/4 M/E HD, 1/2/4 M/E 4K, 4 M/E 4K Plus).
- **MA rack kit** (130283) for two half-width nodes; Shure and MA devices are not mixed.
- The BMD grid knows 2/3 rack width (ATEM 1 M/E Constellation).
- The inspector shows which side is to scale.

## 2026-11-15 – Version 13 · Device rendering

- Rack shelves without perspective lines; empty areas black.
- New device rendering: manufacturer and model, displays, buttons, knobs, connectors in labelled groups, power at the rear right, status LED.
- **Scale fronts** (positions in mm from manufacturer photo/datasheet), first the **Eurolite SB-1100**: front phase lamps, RCD 40 A, 2 × MCB C16 3-pole, 3 × MCB C16 1-pole, 2 × CEE 16 coupler; rear 6 × Schuko with hinged lid, CEE 32 coupler, supply cable. Data corrected (295 mm deep, discontinued, successor SB-1100B).
- CEE plugs and couplers 16/32 A, MCB and RCD as symbols.
- The inspector shows whether a device is drawn to scale or schematically.

## 2026-11-15 – Version 12

- "Modules" popup structured: connector panels, panels, rack shelves, drawers, other (brush panel). The "Accessories" tab was removed; loose parts are in step 3.
- "Devices" popup structured: 19″ rack devices, half rack width (Shure rack kit), Blackmagic 1/3 and 1/2, not 19″ (rack shelf).
- Every rack shelf takes devices (Adam Hall 87551/87552, Thon, BMD); the BMD shelf has fixed mounting points.
- Shure rack kit: two half-width devices (ULXD4, QLXD4, SLXD4, PSM900 P9T) side by side, optional antennas to the front with BNC on the side brackets.
- **+** also horizontally in rack shelves: free spots show a plus on hover, the popup lists only devices that fit exactly there.
- Old rack shelves in saved projects become shelves with devices.

## 2026-11-15 – Version 11

- New connectors: powerCON In blue / Out white (D size), opticalCON DUO, SDI (BNC 75 Ω insulated), RCA (D size), 6.3 mm jack TRS/TS (D size).
- Inserts in a **drilled blank plate**: RCA (Ø 8 mm), jack (Ø 9.5 mm), SMA antenna (Ø 6.5 mm); the plate goes into the BOM, the hole size into the build notes.
- Move devices in BMD and Thomann shelves by **dragging left/right** (BMD in the sixth grid, Thomann by millimetres up to the neighbouring device).

## 2026-11-15 – Version 10 · Rack Manufaktur

- The project is now called **Rack Manufaktur** (title, header, PDF, file names, legal pages).
- **Device database** with 50 devices: form factor, depth, connectors front/rear, links to manufacturer and Thomann; device fronts and rears drawn with connectors.
- New module **rack shelf with devices**: Blackmagic Universal Rack Shelf (grid 1/3 + 1/2, e.g. 3 × Teranex Mini) and Thon rack shelf 1 U (free, flush with the front edge).
- "Devices" popup with search; step 3 with **Devices & connectors** list; BOM, build notes and warnings know the shelves.
- MIT license.

## 2026-11-15 – Version 9

- The example fits the case (front 7 U, rear 1 U), named without a location.
- Modules of the other side are no longer selectable in front and rear view; in the rear view the front side is dimmed.
- Opaque area behind every module: nothing from the other side shows through the gaps (also in the PNG).
- The setup script checks the server right after entering the host.

## 2026-11-15 – Version 8 · Going online

- The site now lives in `public/`; only this folder is uploaded.
- Fonts (Barlow Condensed, IBM Plex) and jsPDF hosted locally – no connection to Google Fonts or cdnjs.
- **Legal notice** and **privacy policy** (host STRATO), footer with notes and links. Open placeholders `⟦…⟧` block the upload.
- `.htaccess` with security headers and content security policy.
- `scripts/deploy-setup.sh`: asks for SFTP access in the terminal, writes `.env`, checks the host key, optional upload on `git push`.
- `scripts/deploy.sh`: checks placeholders and external sources, uploads `public/` via SFTP (password or SSH key).

## 2026-11-15 – Version 7

- "Load project file" in step 1.
- All holes of a connector panel can be assigned freely; powerCON TRUE1 In/Out/D size in the palette. Default: rear-mounted panels get hole 1/2 = TRUE1 In/Out, front-mounted ones start with blank plates.
- Hole labels switched off (would need laser engraving); switch `HOLE_LABELS` in the code.
- D inserts mounted **from the rear** (default) or **from the front** per hole; the build notes name the mounting direction.
- Connector types by **drag & drop** from the palette onto a hole in the view or a row of the hole list.
- **Project as PDF** (jsPDF): cover with front and rear view, notes, BOM, orders by supplier, build notes, page numbers.
- **PNG export** of the front and rear view.

## 2026-11-15 – Version 6

- Configurator in three steps: **1 Project & case**, **2 Configurator**, **3 Order & build**.
- Project name, client and note.
- Case selection as cards with filter. New: **ProCase QSD-Rack 2.0** (600 and 800 mm) and **Thon** series from Thomann with part number and web price per height.
- Add elements via a **popup**; hovering over free spots shows a **+** that opens the popup exactly there.
- Device templates with typical dimensions; **custom elements** with part no., price and supplier, can be kept as "My elements".
- Step 3: overview, BOM with **supplier** column, **order lists per supplier**, build notes, loose parts.
- Screw suggestion matching the rail; QSD includes 24 device screws.
- Save the project file as JSON. Saved states v1–v4 are migrated.

## 2026-11-15 – Version 5

- Live view with front / side / rear view switch.
- Modules are moved directly in the view by click and drag (0.5 U grid, pushing down on overlap).
- Modules can be assigned to the front or rear side.
- The side view detects collisions between front and rear mounted modules.
- Rack shelf as its own module; label panel with divisions, lines and PDF export.
- New connector panels: 872213 (12 D), 872225 (16 D + strain relief), 872214 (2 U, 24 D).
- TRUE1 Out optionally without drilling (Seetronic SAC3FPX20, D size).

## 2026-11-15 – Version 4

- Cases switched to ProCase Pro rack modules (560 mm and 715 mm); "other case" for custom forms.
- Rear rack rails (ProCase 11910) with adjustable position; devices can be fixed at the rear.
- Front and rear lids as options for the 560 mm module.
- Vent panel 0.5 U (Adam Hall 872205 VR).
- New mirrored rear view with connector rears and distances to the rear wall.

## Version 3

- Part numbers and dealer prices researched; Thon M3 pack corrected to 48 pcs; rack shelves 375 mm.

## Versions 1–2

- First configurator: connector panels with fixed powerCON TRUE1 In/Out, drill mark on hole 2, vent/blank panels with rack shelf, drawers, device placeholders, BOM, build notes, JSON export.
