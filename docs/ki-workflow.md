# Produktdaten mit ChatGPT pflegen

Die Fleißarbeit an der Produktdatenbank – Gewichte nachtragen, Maße prüfen, Ansichten anlegen – kann eine andere KI übernehmen. Die Daten liegen dafür als JSON/CSV in `data/`, ein Skript prüft sie und schreibt sie in die App.

```
data/geraete.json    Geräte (200)
data/gewichte.json   Gewichte für Cases, Blenden, Einsätze, Wannen, Zubehör
data/ansichten.json  maßstäbliche Ansichten
data/geraete.csv     Geräte als Tabelle
        │
        ▼  node scripts/daten.mjs import   (prüft, bricht bei Fehlern ab)
public/index.html
```

Die Regeln für die KI stehen in [`AGENTS.md`](../AGENTS.md). Codex liest die Datei automatisch; im normalen Chat einfach mit hochladen.

**Grundsatz: Die KI erfasst, du gibst frei.** Die KI trägt Werte und gemessene Positionen ein; alles bleibt als ungeprüft markiert, bis du es in der App unter „Ansicht prüfen“ abhakst.

## Weg A: Codex in der ChatGPT-App (empfohlen)

Codex arbeitet direkt im GitHub-Repository und liefert jede Änderung als Pull Request.

1. ChatGPT-Desktop-App → **Codex** → GitHub verbinden → Repository `TD-Media-Chemnitz/rackwerk` wählen.
2. Aufgabe aus den Vorlagen unten einfügen und starten.
3. Codex öffnet einen Pull Request. Prüfen (oder Claude prüfen lassen: „Prüfe PR #… gegen die Quellen“), dann mergen.
4. Lokal `git pull`, App testen, `scripts/deploy.sh`.

## Weg B: normaler Chat mit Dateien

1. Datei exportieren:
   - Geräte: `node scripts/daten.mjs export` → `data/geraete.csv`
   - Gewichte aller Artikel: liegt als `data/gewichte-katalog.csv` im Repository (neu erzeugen mit `node scripts/gewichte-katalog.mjs`), oder in der App Stufe 3 → Fertigung → **Gewichte-Liste (CSV)**
2. In ChatGPT `AGENTS.md` und die CSV hochladen, Vorlage unten einfügen.
3. Die fertige Datei herunterladen und nach `data/` legen, dann:

```bash
node scripts/daten.mjs import --csv
```

```bash
node scripts/daten.mjs import --gewichte data/gewichte-katalog.csv
```

4. `node scripts/herstellerliste.mjs`, App testen, committen.

## Vorlagen

**Gewichte nachtragen**

> Lies AGENTS.md. In data/gewichte-katalog.csv (Spalten schluessel;name;art_nr;kg) ist die Spalte kg teils leer. Recherchiere für jede leere Zeile das Nettogewicht in kg auf der Herstellerseite oder im Datenblatt (bei Händlern nur, wenn der Hersteller nichts angibt). Trage nur belegte Werte ein, Punkt als Dezimaltrenner, Rest leer lassen. Speichere die Datei, führe node scripts/daten.mjs import --gewichte data/gewichte-katalog.csv aus und liste in der PR schluessel | kg | Quelle-URL.

**Platzhalter prüfen** (Geräte mit `"ph": 1`)

> Lies AGENTS.md. Prüfe in data/geraete.json alle Geräte mit "ph": 1 von Hersteller XY gegen die offiziellen Datenblätter: Höheneinheiten (he), Einbautiefe (d), Gewicht (kg), Anschlüsse vorn/hinten (io), Artikelnummer, UVP. Korrigiere die Werte, entferne "ph" und "chk", wenn alles belegt ist. Danach node scripts/daten.mjs import und node scripts/herstellerliste.mjs. Quellen in die PR-Beschreibung.

**Maßstäbliche Ansicht anlegen**

> Lies AGENTS.md, Abschnitt „Ansicht“. Lege für das Gerät <schluessel> die Vorder- und Rückansicht in data/ansichten.json an. Quelle: <URL der Maßzeichnung / des frontalen Fotos>. Lade das Bild herunter und miss mit einem kleinen Skript: Maßstab über die Frontplattenbreite 482,6 mm, Mittelpunkte aller Anschlüsse, Tasten, Displays und Regler in mm (Ursprung oben links), auf 0,5 mm gerundet. Rückseite von hinten gesehen, hw = Gehäusebreite. Gemessene Werte trägst du ein; chk bleibt stehen, die Freigabe mache ich. Dann node scripts/daten.mjs import. In der PR: Quelle, welche Positionen gemessen und welche geschätzt sind.

**Neue Geräte eines Herstellers**

> Lies AGENTS.md. Lege alle aktuellen 19″-Geräte von <Hersteller> an, die noch nicht in data/geraete.json stehen. Pro Gerät: n, mk, g (Gruppe wie bei vorhandenen Geräten), fit, he, d, kg, art, price (falls bekannt), url, io. Unbelegte Werte weglassen und "ph": 1 setzen. Dann import + herstellerliste.

## Prüfen und freigeben (du)

1. App öffnen: im Fenster **Projekte → Geräteansichten prüfen**, im Inspektor eines Geräts **Ansicht prüfen / bearbeiten**, oder direkt `…/rackwerk/#pruefen=<schluessel>`.
2. **Herstellerbild laden** (Foto oder Maßzeichnung von deinem Rechner – es bleibt im Browser). Mit „Bild verschieben“, x/y und Breite so ausrichten, dass die Frontplatte genau auf 482,6 mm liegt. Deckkraft nach Bedarf.
3. Abweichende Elemente anklicken und ziehen (Umschalt: 0,5-mm-Raster) oder Werte rechts eintragen; Pfeiltasten verschieben um 0,1 mm. Fehlendes über „Neues Element“ ergänzen.
4. Haken setzen: **Vorderseite geprüft**, **Rückseite geprüft**, **Gerätedaten geprüft**. In der Geräteliste steht dann ✓.
5. Nach einigen Geräten **Alle Entwürfe speichern** → Datei `ansichten-pruefung-<datum>.json`, dann im Repository:

```bash
node scripts/daten.mjs import --pruefung ~/Downloads/ansichten-pruefung-2026-11-16.json
```

```bash
node scripts/herstellerliste.mjs
```

Entwürfe bleiben bis dahin in deinem Browser gespeichert. „Gerätedaten geprüft“ entfernt beim Import die Kennzeichen `chk` und `ph`.

Zusätzlich: `node scripts/daten.mjs check` muss ohne FEHLER durchlaufen, und KI-Werte ohne Quelle nicht freigeben.
