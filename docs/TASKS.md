# Tasks

Open work. Done items are checked off. Whoever continues starts with the first open item.

## Review and approve

- [x] Review editor with overlay, approval front/rear/data, import via `--review`
- [ ] **Review all scale views** (0 approved so far): overlay the manufacturer image, correct, approve
- [ ] ATEM 4 M/E Constellation 4K Plus: review the view created by ChatGPT
- [ ] Inventory devices (Version 24): check the 8 generated views (GS724T, Stairville splitter, GLP PDP-2/S, Showtec PSA-32A12S, DISTRO4, SmartView Duo, Quadro 500 DSP, PSA 16PT2-TR1) against photos; measure depth of Stairville splitter and PSA 16PT2-TR1; confirm the Showtec model and the Botex DPX-620 III weight
- [ ] Review the automatically assigned connector function labels (`l`) – 1,178 labels, about a third taken from the printed labels, the rest derived from the device data

## Weights and product data

- [x] Weight `kg` for devices, weight table `KG` for all other items, total weight in BOM/build notes/overview/PDF
- [ ] **Add missing weights** (devices: "without weight" in [manufacturers.md](manufacturers.md); cases, panels, inserts, shelves: [`data/weight-catalog.csv`](../data/weight-catalog.csv)) – workflow in [ai-workflow.md](ai-workflow.md)
- [ ] Check placeholders (`ph: 1`) against datasheets, starting with "check U" (Videohub 80/120, Behringer S16/S32/SD, Midas DL15x/DL231/DL252, NovaStar VX), L-Acoustics, Powersoft Quattrocanali/Duecanali, dBTechnologies
- [ ] Add weights of MA front panels, cable sets and rack kit (MA publishes none)
- [ ] Clarify open candidates in [manufacturers-excluded.md](manufacturers-excluded.md)

## Scale views still missing

- [ ] Shure without a frontal source: SLXD4, AD600, P10T front, ULXD4 rear
- [ ] MA Lighting: rear of 2Port/4Port/8Port Node (datasheets without rear photo)
- [ ] Midas DN4888, HUB4 (no longer on midasconsoles.com; check HUB4 PRO 0609-AAO), DN4816 rear
- [ ] All new manufacturers (d&b, L-Acoustics, Powersoft, dBTechnologies) and the placeholders
- [ ] Inventory placeholders: APC SMC1000I-2U, ATEM 2 M/E Production Studio 4K, Web Presenter HD, Botex CHC-8, Botex DPX-620 III

## Language and open source

- [x] UI in English and German, dictionary in `data/i18n/`
- [x] Documentation, file names and script messages in English
- [ ] Translate the German code comments in `public/index.html`
- [ ] Optional: English versions of the legal pages (the German ones stay binding for the public instance)
- [ ] CONTRIBUTING.md and issue templates

## Projects (without user accounts)

- [x] Stage 1: project library in the browser (IndexedDB), "Projects" window, project folder via File System Access, package backup/import
- [ ] Test with a real Nextcloud folder on two computers (sync, rename, delete)
- [ ] Stage 2 if needed: storage on the server (PHP) behind a team password, update privacy policy

## Done earlier

- Short rack drawers (Adam Hall 87402 S, Thon 2U Short, Flyht Pro 2U/3U 28 cm); rack shelf cutting with angle grinder note
- Devices ordered with price by default, "owned" switchable, own prices saved in the project file
- Compact device list, placeholders under "Custom elements", delete button in "In the rack", connector swap by dragging, SAC3FPX20 front-mounting only
- Swisson scale views (8 devices), MA rack kit front panels 130285/130282 with cable sets, blank panel 130281
- Manufacturer lists and 97 placeholder devices, new manufacturers d&b, L-Acoustics, Powersoft, dBTechnologies
