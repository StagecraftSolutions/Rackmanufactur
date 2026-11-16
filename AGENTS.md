# Hinweise für KI-Assistenten (ChatGPT/Codex, Claude)

Rack Manufaktur ist ein 19″-Rack-Konfigurator als **eine Datei**: `public/index.html`. Die Produktdaten liegen zusätzlich als JSON in `data/` und werden mit einem Skript in die App übernommen.

## Woran du arbeiten darfst

Nur an den Produktdaten, außer der Auftrag sagt ausdrücklich etwas anderes:

| Datei | Inhalt |
|---|---|
| `data/geraete.json` | Gerätedatenbank (Schlüssel → Gerät) |
| `data/gewichte.json` | Gewichte in kg für Artikel ohne eigenes Feld (`art:`, `con:`, `panel:`, `shelf:`, `case:`, `acc:`, `x:`) |
| `data/ansichten.json` | maßstäbliche Ansichten (Schlüssel = Geräteschlüssel) |
| `data/geraete.csv` | dieselben Geräte als Tabelle (Semikolon, UTF-8) |

`public/index.html` **nicht von Hand ändern**. Nach jeder Änderung an `data/`:

```bash
node scripts/daten.mjs import      # prüft und schreibt in public/index.html
node scripts/herstellerliste.mjs   # aktualisiert docs/hersteller-19zoll.md
```

Bricht `import` mit FEHLER ab, die Daten korrigieren – nichts erzwingen.

## Regeln

1. **Nur belegte Werte.** Jede Zahl stammt von Herstellerseite, Datenblatt, Handbuch oder Händlerseite. Quelle in der Pull-Request-Beschreibung nennen (URL + Seite).
2. **Ungeprüftes kennzeichnen.** Geschätzt → `"chk": 1`. Aus einer Herstellerliste übernommen, Maße offen → `"ph": 1`. Wenn du Maße belegst, `ph`/`chk` entfernen.
3. **Gewicht** in kg, Punkt als Dezimaltrenner (`"kg": 1.8`). Unbekannt → Feld weglassen, nicht 0.
4. **Preise** in Euro inkl. MwSt.; Netto-Preise × 1,19. Unbekannt → weglassen.
5. **Keine Bilder oder Logos** von Herstellern ins Repo legen. Ansichten werden aus Elementen nachgebaut (siehe unten).
6. Kleine, thematisch geschlossene Änderungen; ein PR pro Aufgabe.

## Gerät (`data/geraete.json`)

```json
"swisson_xnd8": { "n": "Swisson XND-8R5 Art-Net-Node 8-fach", "mk": "Swisson", "g": "Licht · Swisson",
  "fit": "rack", "he": 1, "d": 136, "kg": 1.8, "art": "10 48 31",
  "url": "https://…", "io": { "f": "lcd:1 OLED; xlrf:8 DMX 1–8", "r": "powercon:2 Netz In/Thru" } }
```

- `fit`: `rack` (eigene Rackohren, dann `he`), `bmd` (Blackmagic 1/3·1/2·2/3 Breite, dann `frac`), `half` (halbe Breite mit Rackkit, `frac: 0.5`, `w`, `h`), `free` (Kleingerät für Rackwanne, `w`, `h`), `desk` (Tischgerät, nur Info).
- `d` = Einbautiefe in mm inkl. Griffe/Stecker, wenn angegeben.
- `io`: `typ:anzahl Text; …` vorn (`f`) und hinten (`r`). Typen: `rj45 sfp bnc xlr xlrf xlr5 hdmi usb usba usbc iec dc jack opt sd powercon cee32m cee32f cee16m cee16f schuko gland brk rcd lcd btn knob combo ethercon din rca sma ant nl4 nl8 euroblock db9 fan`.

## Ansicht (`data/ansichten.json`)

Koordinaten in **mm**, Ursprung oben links.

- Rackgerät vorn: Frontplatte 482,6 mm breit inkl. Rackohren, Höhe `he × 44,45`.
- Rackgerät hinten: Gehäuse **von hinten gesehen**, Breite `hw` (meist 430–442 mm).
- Gerät in Wanne/Kit: Bezugsmaß `w`/`h` angeben, Koordinaten relativ dazu.

```json
"swisson_xes8g": { "hw": 432,
  "f": [ { "t": "ethercon", "x": 113.9, "y": 23.7, "s": 12.4 }, { "t": "txt", "x": 113.9, "y": 40.4, "v": "ethernet", "s": 1.5 } ],
  "r": [ { "t": "powercon", "x": 16.5, "y": 22, "s": 13.6 } ] }
```

Elemente: Anschlüsse (`t` = io-Typ, `s` = Größe: XLR/etherCON ≈ 12,4, BNC ≈ 11, powerCON ≈ 13,6, IEC ≈ 17), `txt` (`v`, `s`, `a`: start/middle/end, `c`: exorange/exthin/exred), `btn` (`w`, `h`, `v`), `enc` (`r`, `plain`), `rect` (`w`, `h`, `c`: ex-mod/ex-screen/exredline/pg-lcdl), `ledc` (`r`, `c`: exled-r), `lcdl`, `screen`, `cover`, `led`, `fan` (`r`).

Vorgehen: Maßstab aus bekannter Breite (482,6 mm Frontplatte) bestimmen, jeden Mittelpunkt messen, Werte auf 0,1 mm runden. Quelle ist eine Maßzeichnung oder ein frontales Foto.

Weitere Details: `docs/neue-artikel.md`, Ablauf mit ChatGPT: `docs/ki-workflow.md`.
