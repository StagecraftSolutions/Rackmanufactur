# Maintaining product data with ChatGPT

The tedious work on the product database – adding weights, checking dimensions, creating views, translating – can be done by another AI. The data lives as JSON/CSV in `data/`; a script validates it and writes it into the app.

```
data/devices.json       devices (213)
data/weights.json       weights for cases, panels, inserts, shelves, accessories
data/views.json         scale views incl. connector function labels
data/devices.csv        devices as a table
data/weight-catalog.csv every item with its weight key
data/i18n/*.json        German → English dictionary
        │
        ▼  node scripts/data.mjs import   (validates, stops on errors)
public/index.html
```

The rules for the AI are in [`AGENTS.md`](../AGENTS.md). Codex reads the file automatically; in a normal chat, upload it as well.

**Principle: the AI captures, you approve.** The AI enters values and measured positions; everything stays marked as unchecked until you tick it in the app under "Review view".

## Option A: Codex in the ChatGPT app (recommended)

Codex works directly in the GitHub repository and delivers every change as a pull request.

1. ChatGPT desktop app → **Codex** → connect GitHub → choose the repository `TD-Media-Chemnitz/rackwerk`.
2. Paste a task from the templates below and start it.
3. Codex opens a pull request. Review it (or let Claude review: "Review PR #… against the sources"), then merge.
4. Locally `git pull`, test the app, `scripts/deploy.sh`.

## Option B: normal chat with files

1. Get the file:
   - devices: `node scripts/data.mjs export` → `data/devices.csv`
   - weights of all items: `data/weight-catalog.csv` (regenerate with `node scripts/weight-catalog.mjs`), or in the app step 3 → build notes → **Weight list (CSV)**
2. Upload `AGENTS.md` and the CSV to ChatGPT, paste a template.
3. Download the finished file into `data/`, then:

```bash
node scripts/data.mjs import --csv
```

```bash
node scripts/data.mjs import --weights data/weight-catalog.csv
```

4. `node scripts/manufacturers.mjs`, test the app, commit.

## Templates

**Add weights**

> Read AGENTS.md. In data/weight-catalog.csv (columns key;name;part_no;kg) the kg column is partly empty. For every empty row research the net weight in kg on the manufacturer page or datasheet (dealers only if the manufacturer gives nothing). Enter only confirmed values with a decimal point, leave the rest empty. Save the file, run node scripts/data.mjs import --weights data/weight-catalog.csv and list key | kg | source URL in the PR.

**Check placeholders** (devices with `"ph": 1`)

> Read AGENTS.md. Check all devices with "ph": 1 from manufacturer XY in data/devices.json against the official datasheets: rack units (he), mounting depth (d), weight (kg), connectors front/rear (io, in English), part number, RRP. Correct the values and remove "ph" when the dimensions are confirmed by the datasheet; "chk" stays, I approve. Then node scripts/data.mjs import and node scripts/manufacturers.mjs. Sources in the PR description.

**Create a scale view**

> Read AGENTS.md, section "View". Create the front and rear view of device <key> in data/views.json. Source: <URL of the dimensional drawing / frontal photo>. Download the image and measure with a small script: scale via the front plate width 482.6 mm, centre points of all connectors, buttons, displays and knobs in mm (origin top left), rounded to 0.5 mm. Rear seen from behind, hw = housing width. Give every connector its English function label "l". Enter measured values; chk stays, I approve. Then node scripts/data.mjs import. In the PR: source, which positions were measured and which are estimated.

**New devices of a manufacturer**

> Read AGENTS.md. Add all current 19″ devices of <manufacturer> that are not yet in data/devices.json. Per device: n, mk, g (group like existing devices), fit, he, d, kg, art, price (if known), url, io (English). Omit unconfirmed values and set "ph": 1. Then import + manufacturers.

**Translate**

> Read AGENTS.md, section "Translations". Fill all empty values in data/i18n/ui.json and data/i18n/catalog.json with English translations, keep the placeholders {0}, {1} … and the short UI tone. Then node scripts/data.mjs import.

## Review and approve (you)

1. Open the app: **Projects → Review device views**, in a device's inspector **Review / edit view**, or directly `…/rackwerk/#pruefen=<key>`.
2. **Load manufacturer image** (photo or drawing from your computer – it stays in the browser). Align it with "Move image", x/y and width so that the front plate lies exactly on 482.6 mm. Adjust the opacity as needed.
3. Click and drag deviating elements (Shift: 0.5 mm grid) or enter values on the right; arrow keys move by 0.1 mm. Add missing ones via "New element". Check the function label of each connector.
4. Tick **Front checked**, **Rear checked**, **Device data checked**. The device list then shows ✓.
5. After a few devices **Save all drafts** → file `views-review-<date>.json`, then in the repository:

```bash
node scripts/data.mjs import --review ~/Downloads/views-review-2026-11-16.json
```

```bash
node scripts/manufacturers.mjs
```

Drafts stay in your browser until then. "Device data checked" removes the marks `chk` and `ph` on import.

Also: `node scripts/data.mjs check` must run without ERROR, and do not approve AI values without a source.
