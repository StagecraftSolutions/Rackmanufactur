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

## Weg A: Codex in der ChatGPT-App (empfohlen)

Codex arbeitet direkt im GitHub-Repository und liefert jede Änderung als Pull Request.

1. ChatGPT-Desktop-App → **Codex** → GitHub verbinden → Repository `TD-Media-Chemnitz/rackwerk` wählen.
2. Aufgabe aus den Vorlagen unten einfügen und starten.
3. Codex öffnet einen Pull Request. Prüfen (oder Claude prüfen lassen: „Prüfe PR #… gegen die Quellen“), dann mergen.
4. Lokal `git pull`, App testen, `scripts/deploy.sh`.

## Weg B: normaler Chat mit Dateien

1. Datei exportieren:
   - Geräte: `node scripts/daten.mjs export` → `data/geraete.csv`
   - Gewichte aller Artikel: in der App Stufe 3 → Fertigung → **Gewichte-Liste (CSV)**
2. In ChatGPT `AGENTS.md` und die CSV hochladen, Vorlage unten einfügen.
3. Die fertige Datei herunterladen und nach `data/` legen, dann:

```bash
node scripts/daten.mjs import --csv
```

```bash
node scripts/daten.mjs import --gewichte data/gewichte.csv
```

4. `node scripts/herstellerliste.mjs`, App testen, committen.

## Vorlagen

**Gewichte nachtragen**

> Lies AGENTS.md. In der angehängten Gewichte-Liste (Spalten schluessel;name;art_nr;kg) ist die Spalte kg teils leer. Recherchiere für jede leere Zeile das Nettogewicht in kg auf der Herstellerseite oder im Datenblatt (bei Händlern nur, wenn der Hersteller nichts angibt). Trage nur belegte Werte ein, Punkt als Dezimaltrenner, Rest leer lassen. Gib die vollständige CSV zurück und darunter eine Tabelle schluessel | kg | Quelle-URL.

**Platzhalter prüfen** (Geräte mit `"ph": 1`)

> Lies AGENTS.md. Prüfe in data/geraete.json alle Geräte mit "ph": 1 von Hersteller XY gegen die offiziellen Datenblätter: Höheneinheiten (he), Einbautiefe (d), Gewicht (kg), Anschlüsse vorn/hinten (io), Artikelnummer, UVP. Korrigiere die Werte, entferne "ph" und "chk", wenn alles belegt ist. Danach node scripts/daten.mjs import und node scripts/herstellerliste.mjs. Quellen in die PR-Beschreibung.

**Maßstäbliche Ansicht anlegen**

> Lies AGENTS.md, Abschnitt „Ansicht“. Lege für das Gerät <schluessel> eine maßstäbliche Ansicht in data/ansichten.json an. Quelle: die Maßzeichnung bzw. das frontale Foto auf <URL>. Bestimme den Maßstab über die Frontplattenbreite 482,6 mm, miss die Mittelpunkte aller Anschlüsse, Tasten, Displays und Regler in mm (Ursprung oben links) und übertrage sie als Elemente. Rückseite von hinten gesehen mit hw = Gehäusebreite. Dann node scripts/daten.mjs import. Beschreibe in der PR, welche Positionen gemessen und welche geschätzt sind.

**Neue Geräte eines Herstellers**

> Lies AGENTS.md. Lege alle aktuellen 19″-Geräte von <Hersteller> an, die noch nicht in data/geraete.json stehen. Pro Gerät: n, mk, g (Gruppe wie bei vorhandenen Geräten), fit, he, d, kg, art, price (falls bekannt), url, io. Unbelegte Werte weglassen und "ph": 1 setzen. Dann import + herstellerliste.

## Prüfen, was die KI geliefert hat

- `node scripts/daten.mjs check` muss ohne FEHLER durchlaufen.
- Gerät in der App einsetzen, Vorder-/Rückansicht als PNG exportieren und neben die Quelle legen.
- Stichproben der Quellen-URLs öffnen. KI-Werte ohne Quelle nicht übernehmen.
