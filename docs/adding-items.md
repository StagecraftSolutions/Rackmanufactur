# Adding items

How devices, scale views, rack shelves, D-size inserts and rack parts get into Rack Manufaktur.

- **Devices, weights, views, translations** are JSON files in `data/` and are written into `public/index.html` with `node scripts/data.mjs import` (data blocks `DATA:DEVDB`, `DATA:KG`, `DATA:EXACT`, `DATA:I18N` – never edit them by hand).
- **Cases, panels, inserts, shelves, drawers** are JavaScript objects in `public/index.html` (`CASES`, `PANELS`, `CON`, `ART`, `SHELVES`, `DRAWERS`).
- Rules for AI assistants: [AGENTS.md](../AGENTS.md).

## Principles

1. **Source first.** Every value comes from a manufacturer page, datasheet, manual or dealer page. Name the source in [data-sources.md](data-sources.md) or the pull request.
2. **Mark unchecked data.** Estimated dimensions get `chk: 1`, estimated prices `src: 'check'`; the app then shows "check dimensions" / "check". Devices taken from a manufacturer list without dimensions get `ph: 1`.
3. **Approval is human.** Values may be entered (also measured positions); approval happens in the review editor (field `ok`, see [ai-workflow.md](ai-workflow.md)).
4. **No third-party content.** No manufacturer images or logos as files. Logos are rebuilt as text in the view.
5. **Connector labels in English.** Connector descriptions (`io`) and function labels (`l`) are always English, like the printing on the devices.

## 1. Device (`data/devices.json`)

```json
"my_device": {
  "n": "Manufacturer Model",
  "mk": "Manufacturer",
  "g": "Area · Manufacturer",
  "fit": "rack",
  "he": 1,
  "d": 250,
  "kg": 1.8,
  "price": 499,
  "art": "123456",
  "url": "https://manufacturer/product",
  "io": { "f": "lcd:1 Display; rj45:2 Ethernet", "r": "bnc:4 SDI In; iec:1 Power" }
}
```

| Field | Meaning |
|---|---|
| `n`, `mk`, `g` | display name, manufacturer (grouping, short form in `MK_SHORT`), group in the popup (e.g. `Wireless · Shure`; written in German, translated by the dictionary) |
| `fit` | form factor, see below |
| `he` | rack units (only `rack`) |
| `frac` | share of the rack width (only `bmd`, `half`) |
| `kitType` | rack kit for `half` devices that are not Shure (e.g. `ma`) |
| `w`, `h` | housing width/height in mm (only `free`, `half`, `desk`) |
| `d` | mounting depth in mm (counts for collisions) |
| `kg` | weight in kg (unknown: omit) |
| `col` | `silver` for a light front |
| `price`, `art`, `note` | EUR incl. VAT, manufacturer part number, note |
| `chk`, `ph`, `ok` | unchecked dimensions, placeholder, approvals (set by the review import) |
| `io` | connectors front (`f`) and rear (`r`) as `type:count description; …` in English |

**Form factor `fit`:**

| Value | Meaning | Mounting |
|---|---|---|
| `rack` | 19″ device with its own rack ears | directly into the rack |
| `bmd` | Blackmagic form factor 1/3, 1/2, 2/3 rack width | Universal Rack Shelf (grid in sixths) or any free shelf |
| `half` | half rack width with manufacturer kit | Shure rack kit (`kitType` empty) or MA rack kit (`kitType: "ma"`) |
| `free` | any small device | any free rack shelf, flush at the front |
| `desk` | desktop device | not rack-mountable, information only |

**io types:** `rj45 sfp bnc xlr xlrf xlr5 hdmi usb usba usbc iec dc jack opt sd powercon cee32m cee32f cee16m cee16f schuko gland brk rcd lcd btn knob combo ethercon din rca sma ant nl4 nl8 euroblock db9 fan`. Write counts in descriptions as `4× Analog In, 2× AES3 In` – the label generator uses them.

## 2. Scale view (`data/views.json`)

Template: a manufacturer drawing (Blackmagic: "Physical specifications" in the tech specs) or a frontal photo with a known width. Devices without a view appear as placeholders (name, height, depth).

1. Determine the scale: known width (482.6 mm front plate, 442 mm housing, 140 mm Teranex Mini) divided by the image width in pixels.
2. Measure every element as its centre point in mm, origin top left.
   - Front: front plate including rack ears (482.6 mm).
   - Rear: housing **seen from behind**, width `hw`.
3. Sizes: XLR flange approx. 19–22 mm (`s` ≈ 12.4), BNC (`s` ≈ 11), RJ45 (`s` ≈ 11), IEC inlet (`s` ≈ 17), powerCON (`s` ≈ 13.6).
4. Give every connector its function label `l` in English ("SDI In 1", "Headphones", "Power In").

```json
"my_device": {
  "hw": 442,
  "f": [ { "t": "xlrf", "x": 48, "y": 15.6, "s": 12.4, "l": "Mic In 1" }, { "t": "txt", "x": 10, "y": 6, "v": "LOGO", "s": 3, "a": "start" } ],
  "r": [ { "t": "iec", "x": 394, "y": 24, "s": 17, "l": "Power" } ]
}
```

For devices in shelves or kits add the reference size `w`/`h`; the view is scaled into the slot.

**Elements:** connectors (all io types, `s` = size, `l` = function label), text `txt` (`v`, `s`, `a`: start/middle/end, `c`: exorange/exthin/exred), `logo`, controls `btn` (`w`, `h`, `c`, `v`), `enc` (`r`, `plain`), `screen`, `lcdl`, `madisp`, power `lamp`, `din`, `mcb` (`n` poles), `rcd`, `schuko`, `gland`, `cee16f`, `cee32f`, other `rect` (`w`, `h`, `c`: ex-mod/ex-screen/exredline/pg-lcdl), `ledc`, `led`, `cover`, `reset`, `fan`.

**Check:** open the device in the review editor (Projects → "Review device views" or `#pruefen=<key>`), overlay the source image and approve.

Any element may carry `rot` (degrees) to draw it rotated around its x/y point, e.g. a circuit breaker mounted sideways: `{ "t": "mcb", "x": 104, "y": 25, "n": 1, "h": 43, "rot": 90 }`.

## Weight

Devices: field `kg`. All other items: `data/weights.json` with keys `art:<ART key>`, `con:<CON>`, `panel:<PANELS>`, `shelf:<SHELVES>`, `case:<type>:<U>`, `acc:<id>`, `x:rail_rear`. All keys: `data/weight-catalog.csv` (regenerate with `node scripts/weight-catalog.mjs`).

## 3. Rack shelf or rack kit (`SHELVES` in index.html)

```js
my_shelf: { n: 'Name', short: 'Short name', mk: 'Manufacturer', art: 'Part no.', price: 0, src: 'web', q: 'Source',
  he: 1, mode: 'free', innerW: 440, depth: 375, acc: ['free', 'bmd', 'half'], url: '…', info: 'Text in the inspector' },
```

- `mode: 'free'`: devices placed freely in mm. `mode: 'grid'` with `cells`: fixed grid (BMD 6, kits 2).
- `acc` defines which form factors fit. `kit: true` = no shelf, the side brackets are the rack ears. `kitType` only accepts matching devices.
- Kit included with the device: `price: null` (not ordered).
- Same item as a shelf behind a vent panel: `bom: 'tray1'` merges the BOM rows.
- Add a chip with `data-shelf="my_shelf"` in the popup "Modules → Rack shelves".

**Panel in front of a shelf:** vent and blank panels (`vent`, `blank`) may share the U with a rack shelf (`canStack`). Other overlaps are errors.

## 4. Connector (`data/connectors.json`)

The connector database has **types** (what the connector is, e.g. XLR 3-pin female) and **connectors** (a concrete part from a supplier). In a connector panel you choose the type and then the supplier/part.

```json
"types": { "xlr3f": { "n": "XLR 3-pol Buchse", "s": "XLR3 F", "def": "xlr3f" } },
"connectors": {
  "xlr3f_a": { "type": "xlr3f", "mk": "Amphenol", "fit": "d", "s": "XLR3 F", "n": "XLR 3-pol Buchse", "art": "Amphenol AC3FDZ", "price": null, "src": "check", "g": "xlrf", "p": 3 },
  "cee16f_70": { "type": "cee16f", "mk": "PCE", "fit": "fp", "s": "CEE16 F", "n": "CEE-Anbausteckdose 16 A 5-pol, Flansch 70 × 70", "art": "…", "src": "check",
                 "el": { "t": "cee16f", "w": 56, "h": 66 },
                 "fp": { "w": 70, "h": 70, "cut": [{ "t": "c", "d": 54 }, { "t": "h", "x": -28, "y": -28, "d": 4.5 }] }, "chk": 1 }
}
```

| Field | Meaning |
|---|---|
| `type` | key in `types`; `def` of a type is the connector picked first |
| `mk` | supplier (Neutrik, Seetronic, Amphenol …), shown in the supplier list |
| `fit` | `d` = fits a D-size hole · `dblank` = in a drilled blank plate (needs `drill`, Ø mm) · `fp` = own cutout, only in custom connector panels |
| `g` | symbol for D-size connectors (`glyph()` / `rearGlyph()`) |
| `el` | drawing element for `fp` connectors (same elements as in the scale views, e.g. `cee16f`, `schuko`, `iec`) |
| `fp` | footprint for `fp`: flange `w` × `h` (mm) and cutouts `cut` relative to the centre – `c` circle (`d`), `r` rectangle (`w`, `h`), `h` screw hole (`x`, `y`, `d`). D-size connectors use the D footprint (Ø 24 mm, 2 × M3 diagonal 19 × 24 mm, flange 26 × 31 mm) |
| `mount: "f"` | front mounting only; the mounting direction is then fixed |
| `chk: 1` | dimensions not verified – shown as "check dimensions" in the drill plan |

Weights go into `data/weights.json` as `con:<key>`. `node scripts/data.mjs import` validates types, fits and footprints.

## 5. Finish

1. `node scripts/data.mjs import`, then `node scripts/manufacturers.mjs`.
2. New UI texts: `node scripts/i18n-extract.mjs`, translate the empty entries, import again.
3. Add a `CHANGELOG.md` entry.
4. Test: insert the device via the popup, check front, rear and side view in both languages, export PNG and project PDF.
5. `scripts/deploy.sh --dry-run`, then commit and deploy.
