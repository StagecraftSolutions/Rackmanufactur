# Changelog

## 2026-11-16 – Stand 18 · Mehrere Projekte

- **Fenster „Projekte“** (Knopf in der Kopfzeile und „Alle Projekte“ in Stufe 1): alle Cases mit Name, Kunde, Case, HE, Anzahl Elemente und Änderungsdatum; Neu, Öffnen, Duplizieren, Löschen (mit Rückfrage), Suche.
- Projekte liegen in der Browser-Datenbank (IndexedDB) und werden automatisch gespeichert. „Neues Projekt“ und „Beispiel laden“ legen ein neues Projekt an, statt das offene zu überschreiben.
- **Projektordner** (Chrome/Edge): Ordner wählen, z. B. in Nextcloud – jedes Projekt als eigene .json-Datei, automatisch geschrieben; neuere Fassungen aus dem Ordner (anderer Rechner) werden übernommen. Nach dem Neuladen einmal „Wieder verbinden“.
- **Alle Projekte sichern** als Paketdatei; Projektdateien und Pakete lassen sich importieren. Alte Projektdateien ohne ID werden zu neuen Projekten.
- Datenschutzerklärung um IndexedDB und Projektordner ergänzt.

## 2026-11-16 – Stand 17 · Bedienung, kurze Schubladen

- Liste „Im Rack“: × zum Entfernen; Vorder-/Rückseite nur noch für Screenreader (aria-label).
- Geräte-Popup kompakter, Suche bleibt oben; Platzhalter und „Eigenes Gerät“ unter „Eigene Elemente“.
- Stecker im Steckerfeld per Ziehen tauschen (Ansicht und Lochliste).
- Seetronic SAC3FPX20 nur von vorn einbaubar.
- Rackwanne kürzbar (Checkbox + neue Tiefe), Fertigungshinweis mit Winkelschleifer.
- Geräte kommen mit Preis in die Bestellung; „vorhanden“ je Gerät umschaltbar, eigene Preise werden in der Projektdatei gespeichert.
- **Herstellerlisten:** 19″-Sortiment von Blackmagic, Ubiquiti, Shure, Behringer, Midas, MA Lighting, Swisson, NovaStar und Eurolite in `docs/hersteller-19zoll.md`; 97 fehlende Geräte als Platzhalter in der Datenbank (schematisch, im Popup als „Platzhalter“ markiert). Gerätedatenbank jetzt 163 Geräte.
- Fix: Geräte aus der Datenbank behalten beim Einsetzen ihren Namen (statt „Gerät 1 HE“).
- Swisson XND-8 und XSP-5R: Tiefe nach Datenblatt (136 / 112 mm).
- **Kurze Schubladen:** Adam Hall 87402 S (210 mm), Thon Rack Drawer 2U Short (210 mm), Flyht Pro 2U/3U 28 cm; Modell im Inspektor umschaltbar.

## 2026-11-16 – Stand 16 · 54 von 66 Geräten maßstäblich

- Maßstäblich nach Maßzeichnung/Herstellerfoto: Teranex-Mini-Rückseiten, Streaming Encoder HD/4K und Decoder 4K, Videohub 20x20 12G, CleanSwitch 12x12, Audio Monitor 12G G3, ATEM Constellation 1/2/4 M/E (HD und 4K), HyperDeck Studio (4 Modelle), UniFi Pro Max 24 PoE und Cloud Gateway Max, Shure ULXD4/4D/4Q, QLXD4, AD4D/AD4Q, P9T, P10T (hinten), UA845UWB, PA821B, Behringer WING RACK, Midas DL32/DL16/DN4816, NovaStar MX20.
- Datenkorrekturen: WING RACK 4 HE, DL16 2 HE, ATEM Television Studio HD8/ISO/4K8 sind Tischpulte, ATEM Microphone Converter ist eine Box (200 × 125 × 41 mm), UCG Max 142 × 30 × 128 mm.
- Aufgabenliste `docs/AUFGABEN.md`.

## 2026-11-16 – Stand 15

- **Blende vor Rackwanne:** Gitter- und Rackblenden dürfen auf derselben HE wie eine Rackwanne liegen (einzige erlaubte Überlappung). Die Blende liegt davor, Geräte in der Wanne bleiben sichtbar, auswählbar und verschiebbar; die Blende wird an den Rackohren angefasst. Die frühere Option „Rackwanne dahinter verschrauben“ entfällt; gespeicherte Projekte werden automatisch umgewandelt.
- Export: keine gelbe Hervorhebung mehr an Gitterblenden.
- Maßstäblich: Shure ULXD4D (vorn/hinten), Behringer WING RACK (vorn/hinten, 4 HE, 326 mm).
- Guideline für neue Artikel: `docs/neue-artikel.md`.

## 2026-11-15 – Stand 14 · Maßstäbliche Geräte

- Maßstäbliche Ansichten nach Herstellerzeichnung/-foto: **Teranex Mini** (Front aller Modelle, Rückseite SDI to HDMI), **UniFi USW-24-PoE** (vorn/hinten), **ATEM 2 M/E Constellation HD** (vorn/hinten), **grandMA3 2Port/4Port/8Port Node** (vorn).
- Neu im Katalog: **grandMA3 Nodes** (2Port, 4Port, 4Port PoE, 8Port, 8Port PoE, onPC 8Port Node 4k) und **ATEM Constellation** (1/2/4 M/E HD, 1/2/4 M/E 4K, 4 M/E 4K Plus).
- **MA-Rackkit** (130283) für zwei Nodes halber Breite; Shure- und MA-Geräte werden nicht gemischt.
- BMD-Raster kennt 2/3 Rackbreite (ATEM 1 M/E Constellation).
- Inspektor nennt, welche Seite maßstäblich ist.

## 2026-11-15 – Stand 13 · Gerätedarstellung

- Rackwannen ohne perspektivische Linien; leere Bereiche schwarz.
- Neue Gerätedarstellung: Hersteller und Modell, Displays, Tasten, Regler, Anschlüsse in beschrifteten Gruppen (z. B. „RJ45 24“, „SDI 9“), viele Ports zweireihig, Netz hinten rechts, Status-LED.
- **Maßstäbliche Fronten** (Positionen in mm nach Herstellerfoto/Datenblatt), zuerst **Eurolite SB-1100**: vorn Phasenlampen, FI 40 A, 2 × LS C16 3-polig, 3 × LS C16 1-polig, 2 × CEE-16-Kupplung; hinten 6 × Schuko mit Klappdeckel, CEE-32-Kupplung, Zuleitung. Daten korrigiert (295 mm tief, abgekündigt, Nachfolger SB-1100B).
- CEE-Stecker und -Kupplungen 16/32 A, LS- und FI-Schalter als Symbole.
- Inspektor zeigt, ob ein Gerät maßstäblich oder schematisch dargestellt ist.

## 2026-11-15 – Stand 12

- Popup „Module“ gegliedert: Steckerfelder, Blenden, Rackwannen, Schubladen, Sonstiges (Bürstenblende). Reiter „Zubehör“ entfällt, lose Teile gibt es in Stufe 3.
- Popup „Geräte“ gegliedert: 19″-Rackgeräte, halbe Rackbreite (Shure-Rackkit), Blackmagic 1/3 und 1/2, nicht 19″ (Rackwanne).
- Jede Rackwanne nimmt Geräte auf (Adam Hall 87551/87552, Thon, BMD); die BMD-Wanne hat feste Verschraubungspunkte. Leere Bereiche bleiben schwarz, Wanne perspektivisch.
- Shure-Rackkit: zwei Geräte halber Breite (ULXD4, QLXD4, SLXD4, PSM900 P9T) mittig nebeneinander, optional Antennen nach vorn mit BNC an den Seitenteilen.
- **+** auch waagerecht in Rackwannen: freie Plätze zeigen beim Überfahren ein Plus, das Popup listet nur die Geräte, die genau dort passen.
- Alte Rackwannen in gespeicherten Projekten werden zu Wannen mit Geräten.

## 2026-11-15 – Stand 11

- Neue Stecker: powerCON In blau / Out weiß (D-Format), opticalCON DUO, SDI (BNC 75 Ω isoliert), Cinch/RCA (D-Format), Klinke 6,3 mm TRS/TS (D-Format).
- Einsätze in **gebohrter Blindplatte**: Cinch (Ø 8 mm), Klinke (Ø 9,5 mm), SMA-Antenne (Ø 6,5 mm); Blindplatte kommt in die Stückliste, Bohrmaß in die Fertigung.
- Geräte in BMD- und Thomann-Wanne per **Ziehen nach links/rechts** verschieben (BMD im Sechstel-Raster, Thomann millimeterweise bis ans Nachbargerät).
- Popup-Überschrift nur noch „Steckerfelder“.

## 2026-11-15 – Stand 10 · Rack Manufaktur

- Projekt heißt jetzt **Rack Manufaktur** (Titel, Kopf, PDF, Dateinamen, rechtliche Seiten).
- **Gerätedatenbank** mit 50 Geräten: Bauform, Tiefe, Anschlüsse vorn/hinten, Links zu Hersteller und Thomann; Gerätefronten und -rückseiten mit Anschlüssen gezeichnet.
- Neues Modul **Rackwanne mit Geräten**: Blackmagic Universal Rack Shelf (Raster 1/3 + 1/2, z. B. 3 × Teranex Mini) und Thon Rackwanne 1 HE (frei, bündig zur Vorderkante).
- Popup „Geräte“ mit Suche; Stufe 3 mit Liste **Geräte & Anschlüsse**; Stückliste, Fertigung und Warnungen kennen die Wannen.
- Beispiel nutzt ULXD4D, USW-24-PoE und eine BMD-Wanne mit drei Teranex Mini.
- MIT-Lizenz.

## 2026-11-15 – Stand 9

- Beispiel passt ins Case: vorn 7 HE, hinten 1 HE (Steckerfeld B in HE 8), Name „Beispiel · Anschlussrack“ ohne Ortsbezug; Platzhalter „z. B. Anschlussrack 8 HE“.
- Module der anderen Seite sind in Vorder- und Rückansicht nicht mehr auswählbar; in der Rückansicht ist die Vorderseite abgedunkelt.
- Deckende Fläche hinter jedem Modul: nichts von der anderen Seite scheint mehr durch die Fugen (auch im PNG).
- Rackwanne hinter Gitter-/Rackblende in der Vorderansicht perspektivisch (Boden als Trapez, Rückwand).
- Setup-Skript prüft den Server direkt nach der Host-Eingabe.

## 2026-11-15 – Stand 8 · Online stellen

- Seite liegt jetzt in `public/`; nur dieser Ordner wird hochgeladen.
- Schriften (Barlow Condensed, IBM Plex) und jsPDF lokal eingebunden – keine Verbindung zu Google Fonts oder cdnjs mehr.
- **Impressum** (TD Media / Bachmann, Schmidt & Seerig GbR) und **Datenschutzerklärung** (Hoster STRATO), Fuß mit Hinweisen und Links in der App. Offene Platzhalter `⟦…⟧` blockieren den Upload.
- `.htaccess` mit Sicherheits-Headern und Content-Security-Policy.
- `scripts/deploy-setup.sh`: SFTP-Zugang im Terminal abfragen, nach `.env` schreiben, Host-Schlüssel prüfen, optional Upload bei `git push`.
- `scripts/deploy.sh`: prüft Platzhalter und externe Quellen, lädt `public/` per SFTP hoch (Passwort oder SSH-Schlüssel).

## 2026-11-15 – Stand 7

- „Projektdatei laden“ in Stufe 1 (neben Beispiel und Neues Projekt sowie bei der Projektdatei).
- Alle Löcher eines Steckerfelds frei belegbar, auch Loch 1 und 2; powerCON TRUE1 In/Out/D-Norm stehen in der Palette. Standard: hinten montierte Steckerfelder bekommen Loch 1/2 = TRUE1 In/Out, vorne montierte starten mit Blindplatten. Knopf „Loch 1/2 = TRUE1 In/Out“.
- Lochbeschriftung abgeschaltet (müsste gelasert werden); Löcher sitzen mittig in der HE. Schalter `HOLE_LABELS` im Code.
- Einbau der D-Einsätze je Loch **von hinten** (Standard) oder **von vorn**. Von hinten eingebaut zeigt die Vorderansicht nur Lochrand und Schrauben, die Rückansicht den Flansch; von vorn umgekehrt. Fertigungshinweis nennt die Einbaurichtung.
- Steckertypen per **Drag & Drop** aus der Palette rechts auf ein Loch in der Ansicht oder auf eine Zeile der Lochliste ziehen.
- **Projekt als PDF** (jsPDF): Deckblatt mit Vorder- und Rückansicht, Hinweise, Stückliste, Bestellung nach Lieferant, Fertigung, Seitenzahlen. Ersetzt „Drucken“.
- **PNG-Export** der Vorder- und Rückansicht (Stufe 3) und der aktuellen Ansicht (Stufe 2).

## 2026-11-15 – Stand 6

- Konfigurator in drei Stufen: **1 Projekt & Case**, **2 Konfigurator**, **3 Bestellen & Fertigen**.
- Projektname, Kunde und Notiz; Projektname erscheint im Kopf, in Dateinamen und im Beschriftungs-PDF.
- Case-Auswahl als Karten mit Filter (ProCase, Thomann, mit Schiene hinten). Neu: **ProCase QSD-Rack 2.0** (600 und 800 mm) und **Thon**-Serien von Thomann (Live 45 BK RR, Live 63 RR, Profi 48 RR, SD System Rack 600, Eco II 35, Live 40, Live 50) mit Art.-Nr. und Webpreis je Höhe.
- Hinzufügen über ein **Popup** mit den Reitern Module, Zubehör, Geräte und Eigene Elemente. In Vorder- und Rückansicht erscheint beim Überfahren freier Plätze ein **+**, das das Popup genau an dieser Stelle öffnet.
- Geräte-Vorlagen mit typischen Maßen; eigene Geräte als Platzhalter.
- **Eigene Elemente** mit Art.-Nr., Preis und Lieferant; sie kommen in die Stückliste und lassen sich als „Meine Elemente“ im Browser merken.
- Liste „Im Rack“ zum schnellen Auswählen.
- Stufe 3: Übersicht mit Vorder- und Rückansicht (druckbar), Stückliste mit Spalte **Lieferant**, **Bestelllisten je Lieferant** zum Kopieren, Fertigung, lose Teile.
- Schraubenvorschlag passend zur Schiene (RSS, Stahl/Käfigmutter, stufenlose Aluschiene); QSD bringt 24 Geräteschrauben mit.
- Projektdatei als JSON speichern. Gespeicherte Stände v1–v4 werden übernommen.

## 2026-11-15 – Stand 5

- Live-Ansicht mit Umschalter Vorderansicht / Seitenansicht / Rückansicht.
- Widget „Belegung“ entfällt: Module werden direkt in der Ansicht per Klicken und Ziehen verschoben (0,5-HE-Raster, Nachrutschen bei Überlappung).
- Module sind der Vorder- oder Rückseite zuweisbar; freie Positionen statt lückenloser Liste. „Leer (Abstand)“ entfällt.
- Seitenansicht erkennt Kollisionen zwischen vorn und hinten montierten Modulen.
- Rackwanne als eigenes Modul.
- Beschriftungsblende mit Teilungen, mehreren Zeilen, Raster vom Steckerfeld und PDF-Export.
- Neue Steckerfelder: 872213 (12 D), 872225 (16 D + Zugentlastung), 872214 (2 HE, 24 D).
- TRUE1-Out wahlweise ohne Bohren (Seetronic SAC3FPX20, D-Norm).

## 2026-11-15 – Stand 4

- Cases auf ProCase Pro Rackmodule (560 mm und 715 mm) umgestellt; „Anderes Case“ für eigene Bauformen. Alte gespeicherte Bauformen werden automatisch übernommen.
- Rackschienen hinten (ProCase 11910) mit einstellbarer Lage; Geräte lassen sich hinten verschrauben.
- Deckel vorne und hinten als Option für das 560-mm-Modul.
- Stufenlose RSS-Schiene dargestellt; Schraubenvorschlag nutzt jetzt Geräteschrauben-Sätze, 4 liegen dem Modul bei.
- Gitterblende 0,5 HE (Adam Hall 872205 VR) ergänzt.
- „Frontansicht“ heißt jetzt „Live-Ansicht“; neue Rückansicht, seitenverkehrt, mit Steckerrückseiten und Abständen zur Rückwand.
- Seitenansicht zeigt die hintere Schiene.

## Stand 3

- Artikelnummern und Händlerpreise recherchiert; Thon-M3-Pack auf 48 Stk. korrigiert; Rackwannen 375 mm.

## Stand 1–2

- Erster Konfigurator: Steckerfelder mit festem powerCON TRUE1 In/Out, Bohrmarkierung Loch 2, Gitter-/Rackblenden mit Rackwanne, Schubladen, Geräte-Platzhalter, Stückliste, Fertigungshinweise, JSON-Export.
