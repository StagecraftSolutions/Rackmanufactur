# Notes for AI assistants (ChatGPT/Codex, Claude)

Rack Manufaktur is a 19″ rack configurator in **one file**: `public/index.html`. Product data also lives as JSON in `data/` and is written into the app by a script. Project language is English (the UI is bilingual, see below).

## What you may work on

Only the product data, unless the task explicitly says otherwise:

| File | Content |
|---|---|
| `data/devices.json` | device database (key → device) |
| `data/weights.json` | weights in kg for items without their own field (`art:`, `con:`, `panel:`, `shelf:`, `case:`, `acc:`, `x:`) |
| `data/views.json` | scale views (key = device key), incl. connector function labels `l` |
| `data/connectors.json` | connector database: types and parts per supplier, D-size or own footprint (see [docs/adding-items.md](docs/adding-items.md)) |
| `data/sysboxx.json` | Sommer Cable SYSBOXX: housing kits per depth/height and front plates (width in BE, holes/elements in mm, see [docs/adding-items.md](docs/adding-items.md)) |
| `data/devices.csv` | the same devices as a table (semicolon, UTF-8) |
| `data/weight-catalog.csv` | all items with their weight key (`key;name;part_no;kg`), empty kg = missing |
| `data/i18n/ui.json`, `data/i18n/catalog.json` | German → English dictionary (`{0}` placeholders must be kept) |

**Never edit `public/index.html` by hand.** After every change in `data/`:

```bash
node scripts/data.mjs import          # validates and writes public/index.html
node scripts/manufacturers.mjs        # updates docs/manufacturers.md
```

If `import` stops with ERROR, fix the data – do not force anything.

## Rules

**Capturing and approving are separate.** You capture: research values, measure positions from drawings and photos, enter them. A human approves – in the app under "Review view" (overlay the manufacturer image, correct, tick). So do enter measured values; they stay marked as unchecked until approved.

1. **Sources.** Every number comes from a manufacturer page, datasheet, manual or dealer page. Name the source in the pull request description (URL + page). Measured positions are allowed; say what they were measured from.
2. **Marking.** `"chk": 1` stays until a human approves – never remove `chk` yourself. Taken from a manufacturer list with open dimensions → `"ph": 1`; once dimensions are confirmed by a datasheet you may remove `ph`. Never set or change the field `ok` (approvals).
3. **Weight** in kg with a decimal point (`"kg": 1.8`). Unknown → omit the field, never 0.
4. **Prices** in EUR incl. VAT; net prices × 1.19. Unknown → omit.
5. **Connector texts in English:** `io` descriptions and function labels `l` (e.g. "SDI In 1", "Headphones", "Power In").
6. **No images or logos** from manufacturers in the repository. Views are rebuilt from elements (see below).
7. Small, self-contained changes; one PR per task.

## Device (`data/devices.json`)

```json
"swisson_xnd8": { "n": "Swisson XND-8R5 Art-Net-Node 8-fach", "mk": "Swisson", "g": "Licht · Swisson",
  "fit": "rack", "he": 1, "d": 136, "kg": 1.8, "art": "10 48 31",
  "url": "https://…", "io": { "f": "lcd:1 OLED; xlrf:8 DMX 1–8", "r": "powercon:2 Power In/Thru" } }
```

- `fit`: `rack` (own rack ears, then `he`), `bmd` (Blackmagic 1/3·1/2·2/3 width, then `frac`), `half` (half width with rack kit, `frac: 0.5`, `w`, `h`), `free` (small device for a rack shelf, `w`, `h`), `desk` (desktop, information only).
- `d` = mounting depth in mm incl. handles/connectors if stated.
- `n` and `g` are written in German (the dictionary translates them); `io` is English.
- `io`: `type:count description; …` front (`f`) and rear (`r`). Types: `rj45 sfp bnc xlr xlrf xlr5 hdmi usb usba usbc iec dc jack opt sd powercon cee32m cee32f cee16m cee16f schuko gland brk rcd lcd btn knob combo ethercon din rca sma ant nl4 nl8 euroblock db9 fan han16f han16m han10f han10m han6f han6m lka25 lk37 cee63m cee63f cee125m cee125f powerlockm powerlockf cpot cee16f4 cee16m4 cee32f4 cee32m4`.

## View (`data/views.json`)

Coordinates in **mm**, origin top left.

- Rack device front: front plate 482.6 mm wide incl. rack ears, height `he × 44.45`.
- Rack device rear: housing **seen from behind**, width `hw` (usually 430–442 mm).
- Device in a shelf/kit: give the reference size `w`/`h`, coordinates relative to it.

```json
"swisson_xes8g": { "hw": 432,
  "f": [ { "t": "ethercon", "x": 113.9, "y": 23.7, "s": 12.4, "l": "Ethernet 1" }, { "t": "txt", "x": 113.9, "y": 40.4, "v": "ethernet", "s": 1.5 } ],
  "r": [ { "t": "powercon", "x": 16.5, "y": 22, "s": 13.6, "l": "Backup In" } ] }
```

Elements: connectors (`t` = io type, `s` = size: XLR/etherCON ≈ 12.4, BNC ≈ 11, powerCON ≈ 13.6, IEC ≈ 17, `l` = function label in English), `txt` (`v`, `s`, `a`: start/middle/end, `c`: exorange/exthin/exred), `btn` (`w`, `h`, `v`), `enc` (`r`, `plain`), `rect` (`w`, `h`, `c`: ex-mod/ex-screen/exredline/pg-lcdl), `ledc` (`r`, `c`: exled-r), `lcdl`, `screen`, `cover`, `led`, `fan` (`r`).

Measuring: scale the image/PDF to the known width and convert pixels to mm – rather write a small script than guess positions. A missing position is better than a guessed one; state in the PR which values are estimated. Round to 0.1 mm.

## Translations (`data/i18n/`)

Keys are the German UI texts, values the English translation. Keep placeholders `{0}`, `{1}` …; keep the tone short and neutral. New texts appear with an empty value after `node scripts/i18n-extract.mjs`.

More details: [docs/adding-items.md](docs/adding-items.md), workflow with ChatGPT: [docs/ai-workflow.md](docs/ai-workflow.md).
