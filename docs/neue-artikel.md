# Neue Artikel anlegen

So kommen Geräte, Rackwannen, D-Einsätze und Rackteile in die Rack Manufaktur. Alles steht in `public/index.html`.

## Grundsätze

1. **Quelle zuerst.** Jede Angabe stammt aus Herstellerseite, Datenblatt, Handbuch oder Händlerseite. Die Quelle kommt in `docs/datenbasis.md`.
2. **Ungeprüftes kennzeichnen.** Geschätzte Maße bekommen `chk: 1`, geschätzte Preise `src: 'check'`. Die App zeigt dann „Maße prüfen“ bzw. „prüfen“.
3. **Maßstäblich oder schematisch.** Ein Gerät ohne Eintrag in `EXACT` wird schematisch gezeichnet. Maßstäblich wird es erst mit Positionen aus einer Maßzeichnung oder einem frontalen Foto.
4. **Keine Fremdinhalte einbetten.** Keine Herstellerbilder oder Logos als Datei. Logos nur als Text in der Ansicht nachbauen.

## 1. Gerät (`DEVDB`)

```js
mein_geraet: {
  n: 'Hersteller Modell',            // Anzeigename
  mk: 'Hersteller',                  // für Gruppierung und Schriftzug (MK_SHORT für Kurzform)
  g: 'Bereich · Hersteller',         // Gruppe im Popup, z. B. 'Funk · Shure'
  fit: 'rack',                       // Bauform, siehe unten
  he: 1,                             // nur bei fit 'rack': Höheneinheiten
  frac: 1 / 3,                       // nur bei 'bmd' und 'half': Anteil der Rackbreite
  kitType: 'ma',                     // nur bei 'half', wenn nicht Shure: passendes Rackkit
  w: 214, h: 43,                     // nur bei 'free'/'half': Gehäuse in mm (B × H)
  d: 250,                            // Einbautiefe in mm (zählt für Kollisionen)
  col: 'silver',                     // optional: helle Front
  price: 499,                        // optional: € inkl. MwSt., Quelle in docs
  art: '123456',                     // optional: Hersteller-Art.-Nr.
  note: 'abgekündigt, Nachfolger …', // optional
  chk: 1,                            // Maße/Anschlüsse noch nicht belegt
  url: 'https://hersteller/produkt',
  io: { f: 'lcd:1 Display; rj45:2 Ethernet', r: 'bnc:4 SDI; iec:1 Netz' },
},
```

**Bauform `fit`:**

| Wert | Bedeutung | Montage |
|---|---|---|
| `rack` | 19″-Gerät mit eigenen Rackohren | direkt ins Rack |
| `bmd` | Blackmagic-Bauform 1/3, 1/2, 2/3 Rackbreite | Universal Rack Shelf (Raster in Sechsteln) oder jede freie Wanne |
| `half` | halbe Rackbreite mit Hersteller-Kit | Shure-Rackkit (`kitType` leer) oder MA-Rackkit (`kitType: 'ma'`) |
| `free` | beliebiges Kleingerät | jede freie Rackwanne, bündig vorn |

**Anschlüsse `io`:** `typ:anzahl Text; …`, getrennt nach vorn (`f`) und hinten (`r`). Der Text erscheint in Listen und PDF, der Typ bestimmt das Symbol.

Typen: `rj45 sfp bnc xlr xlr5 hdmi usb usba usbc iec dc jack opt sd powercon cee32m cee32f cee16m cee16f schuko brk rcd lcd btn knob`

Neue Gruppe? In `g` eintragen, sie erscheint automatisch. Eine neue Hersteller-Kurzform kommt in `MK_SHORT`.

## 2. Maßstäbliche Ansicht (`EXACT`)

Vorlage ist eine Maßzeichnung des Herstellers (Blackmagic: „Physical specifications“ in den techn. Daten) oder ein frontales Foto mit bekannter Breite.

**Vorgehen:**
1. Maßstab bestimmen: bekannte Breite (z. B. 482,6 mm Frontplatte, 442 mm Gehäuse, 140 mm Teranex) durch Bildbreite in Pixeln.
2. Jeden Anschluss als Mittelpunkt in mm messen, Ursprung oben links.
   - Vorderseite: Frontplatte inkl. Rackohren (482,6 mm).
   - Rückseite: Gehäuse, **von hinten gesehen**, Breite `hw`.
3. Größen in mm übernehmen: XLR-Flansch ca. 19 mm, BNC ca. 11 mm, RJ45 ca. 12,5 × 10 mm, Kaltgerätebuchse ca. 25 × 18 mm, CEE 16 A ca. 60 × 74 mm.

```js
EXACT.mein_geraet = {
  w: 207, h: 43,        // nur für Geräte in Wannen/Kits: Bezugsmaß, wird in das Feld skaliert
  hw: 442,              // nur für Rackgeräte: Gehäusebreite der Rückseite
  f: [ { t: 'xlr', x: 48, y: 15.6, s: 11 }, { t: 'txt', x: 10, y: 6, v: 'LOGO', s: 3, a: 'start' } ],
  r: [ { t: 'iec', x: 394, y: 24, s: 17 } ],
};
```

**Elemente:**
- Anschlüsse: alle `io`-Typen; `s` ist der Größenfaktor (Breite = Faktor × Grundmaß aus `PORT_SZ`).
- Schrift: `txt` (`v`, `s`, `a`: start/middle/end, `c`: exorange/exthin/exdark) und `logo`.
- Bedienung: `btn` (`w`, `h`, `c`: exbtn-w/-g/-r/-a/-dk, `v` Beschriftung), `enc` (`r`, `plain`), `screen`, `madisp`, `lcd`.
- Strom: `lamp`, `din`, `mcb` (`n` Pole), `rcd`, `schuko`, `gland`.
- Sonstiges: `cover`, `led`, `reset`, `malogo`.

Wiederkehrende Fronten als Funktion anlegen, z. B. `TM_FRONT(name)` für alle Teranex Mini.

**Prüfen:** PNG der Vorder- und Rückansicht exportieren und neben die Vorlage legen. Stimmt die Lage, in `docs/datenbasis.md` in der Spalte „Ansicht“ `M` eintragen.

## 3. Rackwanne oder Rackkit (`SHELVES`)

```js
meine_wanne: { n: 'Name', short: 'Kurzname', mk: 'Hersteller', art: 'Art.-Nr.', price: 0, src: 'web', q: 'Quelle',
  he: 1, mode: 'free', innerW: 440, depth: 375, acc: ['free', 'bmd', 'half'], url: '…', info: 'Text im Inspektor' },
```

- `mode: 'free'`: Geräte frei in mm. `mode: 'grid'` mit `cells`: festes Raster (BMD 6, Kits 2).
- `acc` legt fest, welche Bauformen hineinpassen. `kit: true` heißt: keine Wanne, die Seitenteile dienen als Rackohren. `kitType` nimmt nur passende Geräte.
- Liegt ein Kit dem Gerät bei: `price: null`, dann kommt es nicht in die Bestellung.
- Ist die Wanne derselbe Artikel wie eine Wanne hinter einer Gitterblende: `bom: 'tray1'`, dann wird die Stückliste zusammengefasst.
- Im Popup „Module → Rackwannen“ einen Chip mit `data-shelf="meine_wanne"` ergänzen.

## 4. D-Einsatz (`CON` und `PICK`)

```js
mein_stecker: { s: 'KURZ', n: 'Name', art: 'Hersteller Art.-Nr.', price: 4.90, src: 'web', q: 'Thomann', g: 'glyphe' },
```

- Mit `drill: 8` wird der Einsatz in eine gebohrte Blindplatte gesetzt. Die Blindplatte kommt mit in die Stückliste, das Bohrmaß in die Fertigung.
- Den Schlüssel in `PICK` an passender Stelle einreihen; sonst fehlt er in der Palette.
- Für ein neues Symbol `glyph()` (vorn) und `rearGlyph()` (hinten) um den `g`-Wert erweitern.

## 5. Abschluss

1. `docs/datenbasis.md`: Gerätetabelle mit dem Skript im Abschnitt „Geräte“ neu erzeugen oder die Zeile von Hand ergänzen, mit Quelle.
2. `CHANGELOG.md` ergänzen.
3. Testen:
   - Gerät über das Popup einsetzen und in Vorder-, Rück- und Seitenansicht prüfen.
   - PNG und Projekt-PDF exportieren.
   - Die Liste „Geräte & Anschlüsse“ in Stufe 3 prüfen.
4. `scripts/deploy.sh --dry-run`, danach committen und hochladen.
