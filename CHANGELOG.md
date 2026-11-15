# Changelog

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
