# Aufgabenliste

Stand der offenen Arbeiten. Erledigtes wird abgehakt und mit Commit vermerkt. Wer weitermacht, beginnt beim ersten offenen Punkt.

## 1. Geräte in der Datenbank maßstäblich rendern

Vorgehen: siehe [neue-artikel.md](neue-artikel.md). Quellen sind Maßzeichnungen oder Herstellerfotos.

Erledigt:
- [x] Eurolite SB-1100 · UniFi USW-24-PoE · ATEM 2 M/E Constellation HD · grandMA3 Nodes (vorn)
- [x] Teranex Mini (vorn alle, hinten SDI to HDMI) · Shure ULXD4D · Shure AD4Q · Behringer WING RACK
- [x] Midas DL32, DL16 · NovaStar MX20 · HyperDeck Studio HD Mini, HD Plus, HD Pro, 4K Pro

Offen:
- [x] Teranex-Mini-Rückseiten (11 Modelle; 2110 ohne Zeichnung), Streaming Encoder HD/4K, Decoder 4K
- [x] Audio Monitor 12G G3, Videohub 20x20 12G, CleanSwitch 12x12
- [x] Constellation 1 M/E HD/4K, 2 M/E 4K, 4 M/E HD/4K
- [ ] Blackmagic: Constellation 4 M/E 4K Plus (4 HE)
- [x] Shure: ULXD4 (vorn), ULXD4Q, QLXD4, AD4D, PSM1000 P10T (hinten), PSM900 P9T, UA845UWB, PA821B
- [ ] Shure ohne frontale Quelle: SLXD4, AD600, P10T vorn, ULXD4 hinten
- [x] UniFi: Cloud Gateway Max, Pro Max 24 PoE
- [ ] MA Lighting: Rückseiten 2Port/4Port/8Port Node (Datenblätter ohne Rückseitenfoto)
- [x] Midas DN4816-O, DN4816-I (vorn)
- [ ] Midas DN4888, HUB4 (nicht mehr auf midasconsoles.com; HUB4 PRO 0609-AAO prüfen), DN4816 hinten
- [ ] Swisson: XND-8, XSP-5R
- [x] Gerätetabelle in `docs/datenbasis.md` neu erzeugt (54 von 66 maßstäblich)

## 2. Veröffentlichen

- [x] Committen, pushen, hochladen (Stand 16)

## 3. Bedienung

- [ ] Geräteliste im Popup schmaler, Suche zuerst
- [ ] Platzhaltergeräte aus „Geräte“ in den Reiter „Eigene Elemente“ verschieben
- [ ] Liste „Im Rack“: Kennzeichnung vorn/hinten entfernen, dafür × zum Löschen; Seite bleibt für Screenreader lesbar (aria-label)
- [ ] Stecker innerhalb eines Steckerfelds per Drag & Drop verschieben/tauschen
- [ ] Seetronic SAC3FPX20 (TRUE1 Out, D-Norm) nur von vorn einbaubar

## 4. Rackwannen und Schubladen

- [ ] Kurze Rackschubladen (geringe Einbautiefe) bei Adam Hall und anderen Herstellern recherchieren und aufnehmen
- [ ] Rackwanne per Checkbox kürzbar (Länge eingeben); Fertigungshinweis „mit Winkelschleifer kürzen“

## 5. Preise und Bestellung

- [ ] Geräte standardmäßig nicht „vorhanden“: umschaltbar, dann in der Bestellung mit Preis
- [ ] Eigener Preis je Gerät eintragbar (wie bei allen Stücklistenzeilen)
- [ ] Preise und Lieferanten in der Projektdatei sichern und beim Laden übernehmen

## 6. Katalog erweitern

- [ ] Je Hersteller (Blackmagic Design, Ubiquiti, Shure, Behringer, Midas, MA Lighting, Swisson, NovaStar, Eurolite) Liste der 19″-fähigen Geräte
- [ ] Fehlende Geräte als schematische Einträge (Platzhalter) in `DEVDB` anlegen, mit `chk: 1`
