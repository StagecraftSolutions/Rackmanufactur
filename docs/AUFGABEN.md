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

- [x] Geräteliste im Popup schmaler, Suche zuerst (bleibt oben stehen)
- [x] Platzhaltergeräte in den Reiter „Eigene Elemente“ verschoben
- [x] Liste „Im Rack“: × zum Löschen, Seite nur noch für Screenreader (aria-label, versteckter Text)
- [x] Stecker per Ziehen tauschen (Ansicht und Lochliste)
- [x] Seetronic SAC3FPX20 nur von vorn einbaubar (Einbau fest auf „von vorn“)

## 4. Rackwannen und Schubladen

- [x] Kurze Rackschubladen aufgenommen: Adam Hall 87402 S, Thon 2U Short (210 mm), Flyht Pro 2U/3U 28 cm (keine kurze 1-HE-Schublade am Markt gefunden)
- [x] Rackwanne per Checkbox kürzbar; Fertigungshinweis Winkelschleifer

## 5. Preise und Bestellung

- [x] Geräte standardmäßig mit Preis in der Bestellung, „vorhanden“ umschaltbar (auch in Wannen)
- [x] Eigener Preis je Gerät in der Stückliste eintragbar
- [x] Preise/Lieferanten (state.ov) sind Teil der Projektdatei und werden beim Laden übernommen

## 6. Katalog erweitern

- [ ] Je Hersteller (Blackmagic Design, Ubiquiti, Shure, Behringer, Midas, MA Lighting, Swisson, NovaStar, Eurolite) Liste der 19″-fähigen Geräte
- [ ] Fehlende Geräte als schematische Einträge (Platzhalter) in `DEVDB` anlegen, mit `chk: 1`
