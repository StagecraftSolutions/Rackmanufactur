#!/usr/bin/env bash
# Rackwerk – SFTP-Zugang einrichten.
# Fragt Server, Pfad und Zugangsdaten im Terminal ab und schreibt sie in .env (nur für dich lesbar, nicht im Git).
# Prüft den Host-Schlüssel des Servers und testet die Verbindung.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
ENV_FILE="$ROOT/.env"
KH_DIR="$ROOT/.deploy"
KH_FILE="$KH_DIR/known_hosts"

say()  { printf '%s\n' "$*"; }
ask()  { # ask VAR "Frage" "Vorgabe"
  local __v="$1" __q="$2" __d="${3:-}" __a
  if [[ -n "$__d" ]]; then read -r -p "$__q [$__d]: " __a || true; __a="${__a:-$__d}"
  else read -r -p "$__q: " __a || true; fi
  printf -v "$__v" '%s' "$__a"
}
yes_no() { local a; read -r -p "$1 [j/N]: " a || true; [[ "$a" =~ ^[jJyY] ]]; }
q() { # Wert für .env in einfache Anführungszeichen setzen
  local s="${1//\'/\'\\\'\'}"; printf "'%s'" "$s"
}

say "Rackwerk · SFTP-Zugang einrichten"
say "Die Angaben landen in $ENV_FILE (Rechte 600, steht in .gitignore)."
say ""

if [[ -f "$ENV_FILE" ]]; then
  yes_no ".env gibt es schon. Überschreiben?" || { say "Abgebrochen, nichts geändert."; exit 0; }
  # bisherige Werte als Vorgabe
  # shellcheck disable=SC1090
  set -a; source "$ENV_FILE"; set +a
fi

ask SFTP_HOST "Server (Host, z. B. ssh.example.de)" "${SFTP_HOST:-}"
[[ -n "$SFTP_HOST" ]] || { say "Server fehlt."; exit 1; }
ask SFTP_PORT "Port" "${SFTP_PORT:-22}"
[[ "$SFTP_PORT" =~ ^[0-9]+$ ]] || { say "Port muss eine Zahl sein."; exit 1; }
ask SFTP_USER "Benutzername" "${SFTP_USER:-}"
[[ -n "$SFTP_USER" ]] || { say "Benutzername fehlt."; exit 1; }
ask SFTP_REMOTE_PATH "Zielordner auf dem Server (z. B. /html/rackwerk oder rackwerk)" "${SFTP_REMOTE_PATH:-}"
[[ -n "$SFTP_REMOTE_PATH" ]] || { say "Zielordner fehlt."; exit 1; }
SFTP_REMOTE_PATH="${SFTP_REMOTE_PATH%/}"
ask SITE_URL "Adresse der Seite (optional, z. B. https://rackwerk.example.de)" "${SITE_URL:-}"

say ""
say "Anmeldung:"
say "  1) Passwort"
say "  2) SSH-Schlüssel (empfohlen)"
ask auth_choice "Auswahl" "$([[ "${SFTP_AUTH:-password}" == key ]] && echo 2 || echo 1)"
SFTP_PASSWORD=""; SFTP_KEY=""
if [[ "$auth_choice" == 2 ]]; then
  SFTP_AUTH=key
  ask SFTP_KEY "Pfad zum privaten Schlüssel" "${SFTP_KEY:-$HOME/.ssh/id_ed25519}"
  SFTP_KEY="${SFTP_KEY/#\~/$HOME}"
  [[ -f "$SFTP_KEY" ]] || { say "Schlüssel $SFTP_KEY nicht gefunden. Erzeugen mit: ssh-keygen -t ed25519"; exit 1; }
else
  SFTP_AUTH=password
  read -r -s -p "Passwort (Eingabe unsichtbar): " SFTP_PASSWORD || true; echo
  [[ -n "$SFTP_PASSWORD" ]] || { say "Passwort fehlt."; exit 1; }
  if ! command -v sshpass >/dev/null && ! command -v expect >/dev/null; then
    say "Für Passwort-Anmeldung wird sshpass oder expect gebraucht (brew install hudochenkov/sshpass/sshpass)."; exit 1
  fi
fi

# Host-Schlüssel holen und bestätigen lassen
say ""
say "Hole den Host-Schlüssel von $SFTP_HOST:$SFTP_PORT …"
mkdir -p "$KH_DIR"; chmod 700 "$KH_DIR"
tmp_kh="$(mktemp)"; trap 'rm -f "$tmp_kh"' EXIT
if ! ssh-keyscan -p "$SFTP_PORT" -T 10 "$SFTP_HOST" 2>/dev/null >"$tmp_kh" || [[ ! -s "$tmp_kh" ]]; then
  say "Server nicht erreichbar oder kein SSH auf Port $SFTP_PORT."; exit 1
fi
say "Fingerprints des Servers:"
ssh-keygen -lf "$tmp_kh" | sed 's/^/  /'
say "Vergleiche sie mit den Angaben deines Hosters (Kundenmenü oder Support)."
yes_no "Stimmen die Fingerprints?" || { say "Abgebrochen. Nichts gespeichert."; exit 1; }
cp "$tmp_kh" "$KH_FILE"; chmod 600 "$KH_FILE"

# .env schreiben
umask 077
{
  echo "# Rackwerk – SFTP-Zugang. Nicht einchecken, nicht weitergeben."
  echo "# Erstellt mit scripts/deploy-setup.sh am $(date '+%Y-%m-%d %H:%M')"
  echo "SFTP_HOST=$(q "$SFTP_HOST")"
  echo "SFTP_PORT=$(q "$SFTP_PORT")"
  echo "SFTP_USER=$(q "$SFTP_USER")"
  echo "SFTP_REMOTE_PATH=$(q "$SFTP_REMOTE_PATH")"
  echo "SFTP_AUTH=$(q "$SFTP_AUTH")"
  echo "SFTP_KEY=$(q "$SFTP_KEY")"
  echo "SFTP_PASSWORD=$(q "$SFTP_PASSWORD")"
  echo "SITE_URL=$(q "$SITE_URL")"
} >"$ENV_FILE"
chmod 600 "$ENV_FILE"
say "Gespeichert in $ENV_FILE."

# Verbindung testen
say ""
say "Teste die Verbindung …"
if "$ROOT/scripts/deploy.sh" --check; then
  say "Verbindung klappt."
else
  say "Verbindung fehlgeschlagen. Angaben prüfen und dieses Skript erneut starten."; exit 1
fi

# Optional: automatisch bei git push auf main hochladen
HOOK="$ROOT/.git/hooks/pre-push"
if [[ -d "$ROOT/.git" ]]; then
  say ""
  if yes_no "Bei jedem 'git push' auf main automatisch hochladen?"; then
    cat >"$HOOK" <<'HOOK'
#!/usr/bin/env bash
# Rackwerk: lädt public/ per SFTP hoch, wenn main gepusht wird (eingerichtet von scripts/deploy-setup.sh).
# Ein fehlgeschlagener Upload hält den Push nicht auf.
ROOT="$(git rev-parse --show-toplevel)"
while read -r local_ref local_sha remote_ref remote_sha; do
  if [[ "$remote_ref" == "refs/heads/main" && "$local_sha" != 0000000000000000000000000000000000000000 ]]; then
    echo "Rackwerk: lade public/ auf den Server …"
    "$ROOT/scripts/deploy.sh" --yes || echo "Rackwerk: Upload fehlgeschlagen – später mit scripts/deploy.sh wiederholen." >&2
  fi
done
exit 0
HOOK
    chmod +x "$HOOK"
    say "Eingerichtet: .git/hooks/pre-push"
  elif [[ -f "$HOOK" ]] && grep -q 'Rackwerk: lädt public/' "$HOOK"; then
    rm -f "$HOOK"; say "Automatischen Upload entfernt."
  fi
fi

say ""
say "Fertig. Hochladen mit: scripts/deploy.sh"
