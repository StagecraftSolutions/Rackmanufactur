# Rackwerk

Web-Konfigurator für 19″-Rackmodule mit Steckerfeldern. Eine einzelne HTML-Datei (`index.html`), ohne Build und ohne Server: im Browser öffnen, fertig.

Primäre Case-Basis sind die **ProCase Pro Rackmodule** (procaseshop.de) mit Rackschienen vorn und hinten. Steckerfelder, Blenden, Rackwannen und Schubladen kommen von Adam Hall, die D-Einsätze von Seetronic und Neutrik.

## Funktionen

- **Case wählen:** ProCase Pro Rackmodul 560 mm oder 715 mm Systemtiefe, oder ein eigenes Case. Hintere Rackschienen (ProCase 11910) mit einstellbarer Lage, Deckel vorn und hinten.
- **Live-Ansicht** mit drei umschaltbaren Ansichten:
  - **Vorderansicht:** vorne montierte Module; hinten montierte erscheinen gestrichelt.
  - **Seitenansicht:** Tiefen ab Front- bzw. Rückschiene. **Kollisionen** zwischen vorn und hinten montierten Modulen werden rot markiert und mit Überdeckung in mm gemeldet.
  - **Rückansicht:** seitenverkehrt. Hinten montierte Module zeigen ihre Front, vorne montierte ihre Rückseite (Steckerrückseiten mit Lochnummer, Gerätetiefe, Abstand zur Rückschiene).
- **Module frei platzieren:** in der Ansicht per Klicken und Ziehen verschieben (Raster 0,5 HE). Überlappende Module derselben Seite rutschen nach unten. Alternativ im Inspektor über „Ab HE“, ↑/↓ 0,5 HE, Alt+↑/↓ oder „Lücken schließen“.
- **Vorder- oder Rückseite** pro Modul zuweisen. Neue Module landen auf dem ersten freien Platz der gerade gezeigten Seite.
- **Module:**
  - Steckerfeld 1 HE · 12 D mit/ohne Zugentlastung, 1 HE · 16 D, 2 HE · 24 D (2 Reihen)
  - Beschriftungsblende 0,5 HE
  - Gitterblende 0,5–4 HE und Rackblende 1–4 HE, jeweils mit Rackwanne dahinter (ab 1 HE)
  - Rackwanne 1/2 HE als eigenes Modul
  - Schublade 1–4 HE, Bürstenblende, Geräte-Platzhalter
- **Beschriftungsblende:**
  - Teilungen (1–32) und 1–4 Zeilen je Teilung.
  - Teilungsabstand, Versatz und Streifenmaß sind einstellbar.
  - „Raster + Texte vom Steckerfeld“ übernimmt Lochzahl und Beschriftung des nächsten Steckerfelds.
  - **PDF-Export** in Originalgröße auf A4 quer, mit Schnittmarken. Streifen breiter als die Seite werden an einer Teilungslinie in zwei Teile geteilt. Alle Beschriftungen eines Racks lassen sich auf einmal exportieren (Fertigung → „Beschriftungen als PDF“).
- **Stückliste** mit Artikelnummern, Preisen und Quelle. Preise und Art.-Nr. lassen sich überschreiben.
- **Fertigungshinweise** pro Steckerfeld, Rackwanne, Beschriftung und hinten verschraubtem Gerät.
- **Speichern:** im Browser (`localStorage`, Schlüssel `rackwerk-v1`) und als JSON-Export/-Import. Ältere Stände (v1–v3) werden beim Laden migriert.

## Feste Regeln

| Regel | Umsetzung |
|---|---|
| powerCON In/Out immer ganz links | Loch 1 = TRUE1 In (Seetronic SAC3MPX TR1), Loch 2 = TRUE1 Out; bei 2 HE in der oberen Reihe |
| Loch 2 für TRUE1 Out | Wahlweise **SAC3FPX-LY TR1 + aufbohren** (orange Bohrmarkierung) oder **Seetronic SAC3FPX20 in D-Norm ohne Bohren** |
| Rackwannen | Als eigenes Modul oder hinter Gitter-/Rackblenden ab 1 HE |
| Hinten montierte Module | Tiefe zählt von der Rückschiene nach vorn; Kollision, wenn sie in derselben HE auf ein vorderes Modul treffen |
| Geräte als Platzhalter | Name mittig, Höhe in HE darunter, Tiefe für Kollisionsprüfung; optional zusätzlich hinten verschraubt |
| Schrauben D-Einsätze | 2× Thon M3×12 pro Einsatz, Pack à 48 |
| Rackschrauben | RSS-Schiene: Geräteschrauben-Sätze (4 liegen dem Modul bei), sonst M6 + Käfigmuttern; 4 je Modul, 2 bei 0,5 HE |

## Datenbasis

Siehe [docs/datenbasis.md](docs/datenbasis.md): alle Artikel mit Nummer, Preis, Quelle und Stand.

## Offene Punkte

- **Maße nachmessen:** Den Beschriftungsstreifen 872205 LBL gibt Adam Hall nicht an. Startwert 440 × 15 mm; Teilungsabstand 36,38 mm bei 12 Löchern (D-Raster der Zeichnung).
- **D-Lochabstände:** Die echten Abstände von 872215/872213/872225/872214 sind nicht verifiziert (2D-Zeichnung im Adam-Hall-Downloadcenter).
- **Hintere Schiene:** Die Lage ist nicht veröffentlicht. Startwert Nutztiefe − 25 mm.
- **Pro Rackmodul 715 mm:** Nutztiefe 637 mm ist abgeleitet, nicht vom Hersteller.
- **Ohne Preis:** ProCase-Preise (nur mit Händler-Login), Adam-Hall-Preise für 872213/872225 (nur mit Login), NC5MD-L-1, NBB-75DFIB, NL4MP, 87402, 87223 VR, 5924 BLP und Schaumstoffeinlagen 1/3/4 HE.
- **SAC3FPX20 im Adam-Hall-D-Loch:** Laut Kundenbewertungen passt die Buchse knapp. Vor der Serie an einer Blende testen.
- **PDF im Artifact:** Der Download nutzt die `downloads`-Freigabe von claude.ai, standalone geht er direkt über jsPDF. In claude.ai noch nicht von Hand getestet.

## Code-Aufbau (`index.html`)

| Bereich | Inhalt |
|---|---|
| `CON`, `PICK` | Stecker-Katalog (D-Format) mit Glyphe, Artikel, Preis, Quelle |
| `PANELS` | Steckerfeld-Varianten (`d12tb`, `d12`, `d16tb`, `d24`) mit Spalten, Reihen, Artikel |
| `ART` | Adam-Hall-Teile; Schlüssel über `artKey(kind, he)`, z. B. `vent0_5`, `tray2` |
| `CASES` | Case-Typen `pro560`, `pro715`, `custom` |
| Modell | `items[]` mit `kind`, `he`, `pos` (HE ab oben, 0-basiert, 0,5er Schritte) und `side` (`front`/`rear`) |
| `place()` / `firstFree()` / `compact()` | Platzieren mit Nachrutschen, ersten freien Platz suchen, Lücken schließen |
| `span()` / `collisions()` | Tiefenbereich je Modul und Kollisionsprüfung vorn/hinten |
| `rackSVG(L, 'front'/'rear')`, `sideSVG` | Ansichten als SVG in mm (1 HE = 44,45; 19″ = 482,6) |
| `faceSVG` / `backSVG` / `behindSVG` | Modul von vorn, von hinten (gespiegelt), als Umriss der anderen Seite |
| `exportLabels()` | PDF der Beschriftungsstreifen (jsPDF 2.5.1 von cdnjs, lädt bei Bedarf) |
| `bom()` / `normalize()` | Stückliste; Migration gespeicherter Stände nach v4 |

Quellen-Kennzeichnung in der Stückliste: `cart` = Warenkorb, `web` = Webpreis 11/2026, `ref` = Art.-Nr. belegt, `check` = prüfen, `user` = eigene Angabe.
