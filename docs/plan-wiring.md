# Plan: new step 3 "Wiring & fit-out" (Verkabelung & Ausstattung)

Goal: after step 2 (configurator) the user plans which port is connected to which: device ↔ panel connector,
device ↔ device, panel ↔ panel. Result: cable list, extra BOM lines (patch cables, cable + plugs for solder
terminals) and build notes (what to solder where). Current step 3 "Order & build" becomes step 4.

## What is ready (2026-11-21)

| Piece | State |
|---|---|
| Panel connectors | ✅ every connector in the Library has `connector.form/front/rear` (exported as `sides`): face + gender or termination (solder, screw, crimp, pcb, faston, stud) |
| Panel endpoints in a project | ✅ D panels: slot index · custom panels: `cons[].id` · SYSBOXX: plate `id` + slot index |
| Rack devices | ✅ item `id`, side, position (U) |
| Devices on shelves | ⚠️ `devs[]` have **no stable id** (only `dev`, `x`) – needs an `id` (normalize on load) |
| Device ports | ⚠️ `io.front/rear` are **groups** (`count` + one label such as "10× SDI In, 6× SDI Out, Multiview, Reference"), no single ports, no direction, gender often unknown (`xlr` vs `xlrf`, `powercon` without A/B/TRUE1, `iec` without C13/C14) |
| Device port positions | ⚠️ only devices with a scale view (105 of 229) have single ports with position and label (`views`, elements with `t`/`l`) |
| io types ↔ connector faces | ❌ two vocabularies: devices use `io-types.json` (`xlr`, `ethercon`, `iec` …), panel connectors use `connector-faces.json` (`xlr3`, `ethercon`, `iec_c14` …) |
| Cables as articles | ❌ Library category `kabel` is empty |

## Phase 0 – Library preparation ✅ done 2026-11-21

Done in the Library (branch `steckverbinder-seiten`): `data/meta/io-faces.json` (every io type → face + gender or
`none`), `fam`/`mates` on faces, optional `dir`/`ports` on device io groups (exported as `iox`), category `kabel`
with 10 patch cables and 6 bulk cables, 11 cable plugs (`connector.form: cable`), export
`api/v1/rackmanufaktur/wiring.json` = `{ faces, terminations, ioFaces, cables, plugs }`.
Still open: single ports (`ports`) are filled in for no device yet – the app expands groups by `count`.
For Phase 1: the local-folder loader must pass `connectorFaces`, `terminations`, `ioFaces` (read from
`data/meta/`) to `exportRM`, and the API loader must fetch `wiring.json`.

Original plan:

1. **`data/meta/io-faces.json`**: io type → `{ face, gender? }` or `{ none: true }` for non-connectors (`btn`, `lcd`,
   `knob`, `fan`, `sd`, `brk`, `rcd`). Unknown gender stays empty → wiring check only by face family.
2. **Optional port details** on devices, gradually (no big bang): `io.*[].ports` = list of single ports
   `{ label, gender?, dir? }` (`dir`: `in`, `out`, `io`). Without it the app expands `count` into numbered ports
   ("SDI 1 … SDI 16" from the group label). First candidates: devices with a scale view (labels exist there).
3. **Cables** (category `kabel`): generic patch cables per face pair and length class (XLR3 m–f, RJ45/etherCON,
   BNC 75 Ω, HDMI, powerCON TRUE1, IEC C13–C14 …) plus bulk cable per metre (mic cable, Cat 6A, 75 Ω coax,
   H07RN-F) and cable plugs (`connector.form: cable`) for solder/screw ends.

## Phase 1 – Rackmanufaktur: step 3 "Wiring" ✅ first version 2026-11-21

Done: step 3 "Verkabelung" (old step 3 is step 4, projects < v6 move along), `state.wires`, endpoints for rack
devices, devices on shelves, D panels, custom panels and SYSBOXX (rear of panel connectors), click A → B to
connect, filter/search, check (face family + gender via cable ends, `any` faces, solder/screw ends checked against
the connector front: power ↔ signal = does not fit), cable choice from the Library with length estimate (height +
depth of both ports + 40 cm), label per cable, EN translation. `wiring.json` is loaded (API and local folder,
optional for older Library states) and kept in the project snapshot as offline fallback.
Not yet: BOM/cable list/build notes (phase 2), lines in the rear view (phase 3).

Original notes:

- **Project data**: `state.links = [{ id, a, b, cable?, len?, label? }]`, endpoint
  `{ item, slot? | con? | plate?+slot? | dev?, side, port }` (stable ids, port = index in the expanded port list).
  Stored in the project file; links to removed items/ports are dropped on load with a warning.
- **Endpoints**: rear of every panel connector (solder → "loose end", feed-through → face), all device ports
  (front and rear), devices on shelves.
- **UI** (left list, right rear view of the rack):
  - endpoint list grouped by rack element (U, name), filter "free / connected / all", search;
  - click port A, then port B → connection; dragging in the rear view later;
  - connection table: no., from, to, cable type, length, label (editable);
  - check: same face family; gender must complement (patch cable m↔f decided by the cable); solder/screw end
    → "make up cable with plug X"; warning for unknown gender; power ports only to power.
- **Length estimate**: vertical distance of the two U positions + depth offset + reserve, rounded up to the next
  length class (0.3 / 0.5 / 1 / 2 / 3 m).

## Phase 2 – Output (current step 4)

- Cable list (PDF/CSV): number, from, to, type, length, label text for the cable tags.
- BOM: patch cables per type and length, bulk cable in metres, cable plugs for solder ends, cable ties/labels.
- Build notes per panel: "slot 3 (XLR3 F, solder): pin 1 shield, 2 hot, 3 cold → cable 12 to UniFi …".

## Phase 3 – later

- Lines in the rear view, signal flow view, pin assignment per face (multipin, Harting), external connections
  (stage box, mains) as "outside" endpoints, "fit-out" extras to be defined with the user.
