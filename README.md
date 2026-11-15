# Rackwerk

Web-Konfigurator für 19″-Rackmodule mit Steckerfeldern. Eine einzelne HTML-Datei (`index.html`), ohne Build und ohne Server: im Browser öffnen, fertig.

Primäre Case-Basis sind die **ProCase Pro Rackmodule** (procaseshop.de) mit Rackschienen vorn und hinten. Steckerfelder, Blenden, Rackwannen und Schubladen kommen von Adam Hall, die D-Einsätze von Seetronic und Neutrik.

## Funktionen

- **Case wählen:** ProCase Pro Rackmodul 560 mm oder 715 mm Systemtiefe, oder ein eigenes Case. Für ProCase sind Höhe und Nutztiefe vorgegeben. Hintere Rackschienen (ProCase 11910) und die Deckel vorn und hinten sind wählbar.
- **Module stapeln:** Steckerfeld 1 HE (12× D), Gitterblende 0,5–4 HE, Rackblende 1–4 HE, Schublade 1–4 HE, Beschriftungsblende 0,5 HE, Bürstenblende 1 HE, Geräte-Platzhalter und Leerraum. Die Reihenfolge lässt sich per Ziehen oder mit den Pfeilen ändern.
- **Drei Ansichten:**
  - **Live:** Frontansicht mit Steckern, Beschriftung und Bohrmarkierung.
  - **Rückansicht:** von hinten, also seitenverkehrt. Sie zeigt die Steckerrückseiten mit ihren Lochnummern, Gerätetiefen, den Abstand zur Rückwand und hinten verschraubte Geräte.
  - **Seite / Tiefe:** Einbautiefen im Vergleich zur Nutztiefe, mit vorderer und hinterer Schiene.
- **Stückliste** mit Artikelnummern, Preisen und Quelle. Preise und Art.-Nr. lassen sich überschreiben, die Liste lässt sich als Tabelle kopieren.
- **Fertigungshinweise** pro Steckerfeld, Rackwanne und hinten verschraubtem Gerät.
- **Speichern:** im Browser (`localStorage`, Schlüssel `rackwerk-v1`) und als JSON-Export/-Import.

## Feste Regeln

| Regel | Umsetzung |
|---|---|
| powerCON In/Out immer ganz links | Loch 1 = TRUE1 In (Seetronic SAC3MPX TR1), Loch 2 = TRUE1 Out (SAC3FPX-LY TR1); nicht änderbar |
| 2. Loch wird für TRUE1 aufgebohrt | Orange gestrichelter Ring in der Live-Ansicht, Hinweis in der Fertigung |
| Rackwannen nur hinter Gitter- oder Rackblenden | Option gibt es nur bei diesen Modulen, ab 1 HE Blendenhöhe |
| Geräte als Platzhalter | Name mittig, Höhe in HE darunter, Tiefe für Seiten- und Rückansicht |
| Schrauben D-Einsätze | 2× Thon M3×12 pro Einsatz, Pack à 48 |
| Rackschrauben | ProCase-RSS-Schiene: Geräteschrauben-Sätze (4 liegen dem Modul bei). Sonst M6 + Käfigmuttern. 4 je Modul, 2 bei 0,5 HE, +4 je hinten verschraubtem Gerät |

Die stufenlose RSS-Schiene der ProCase-Module hat kein Lochraster. Deshalb gibt es bei ihnen keine Warnung zum 0,5-HE-Versatz.

## Datenbasis

Siehe [docs/datenbasis.md](docs/datenbasis.md): alle Artikel mit Nummer, Preis, Quelle und Stand.

## Offene Punkte

- **ProCase-Preise:** nur mit Händler-Login sichtbar; in der Stückliste stehen sie deshalb als „Art.-Nr. belegt“ ohne Preis.
- **Hintere Schiene:** Die Lage ist nicht veröffentlicht. Der Startwert ist Nutztiefe − 25 mm; bitte am Case messen und eintragen.
- **Pro Rackmodul 715 mm:** Die Nutztiefe ist nicht angegeben. Der Wert 637 mm ist abgeleitet (482 + 155 mm) und lässt sich überschreiben.
- **Deckel-Art.-Nr.:** Für andere Höhen als 2 HE sind sie aus dem Muster 135502D / 135502DH abgeleitet und als „prüfen“ markiert.
- **Noch ohne Preis:** NC5MD-L-1, NBB-75DFIB, NL4MP, Schublade 87402, Lüftungsblende 87223 VR, Rackschrauben 5924 BLP, Schaumstoffeinlagen 1/3/4 HE.
- **Ohne Artikel:** Gitterblende 4 HE und Kabelabfangschiene.
- **Nicht im Browser geklickt:** Getestet wurden nur Syntax und Darstellung (Headless-Screenshots aller Ansichten, keine JS-Fehler). Die Bedienabläufe sind noch nicht im Browser durchgeklickt.

## Code-Aufbau (`index.html`)

| Bereich | Inhalt |
|---|---|
| `CON` | Stecker-Katalog (D-Format) mit Glyphe, Artikel, Preis, Quelle |
| `ART` | Adam-Hall-Teile; Schlüssel über `artKey(kind, he)`, z. B. `vent0_5`, `blank2`, `drawer3` |
| `CASES` | Case-Typen `pro560`, `pro715`, `custom` mit HE-Liste, Nutztiefe, Art.-Nr.-Funktion |
| `ACC_DEFAULT` | Zubehör; `auto: 'rss'` bzw. `'hole'` steuert den Schraubenvorschlag je Schienentyp |
| `frontSVG` / `rearSVG` / `sideSVG` | Die drei Ansichten als SVG in Millimetern (1 HE = 44,45; 19″ = 482,6) |
| `bom()` | Stückliste inklusive Überschreibungen aus `state.ov` |
| `normalize()` | Migriert gespeicherte Stände (v1 → v3, alte Bauformen → „eigenes Case“) |

Quellen-Kennzeichnung in der Stückliste: `cart` = Warenkorb, `web` = Webpreis 11/2026, `ref` = Art.-Nr. belegt, `check` = prüfen, `user` = eigene Angabe.
