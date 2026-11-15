#!/usr/bin/env bash
# Rackwerk – lädt den Ordner public/ per SFTP auf den Server.
# Zugangsdaten kommen aus .env (einrichten mit scripts/deploy-setup.sh).
#
#   scripts/deploy.sh            prüfen, nachfragen, hochladen
#   scripts/deploy.sh --yes      ohne Nachfrage hochladen
#   scripts/deploy.sh --dry-run  nur prüfen und anzeigen, was hochgeladen würde
#   scripts/deploy.sh --check    nur die Verbindung testen
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
PUBLIC="$ROOT/public"
ENV_FILE="$ROOT/.env"
KH_FILE="$ROOT/.deploy/known_hosts"

MODE=upload; ASSUME_YES=0
for arg in "$@"; do
  case "$arg" in
    --yes|-y) ASSUME_YES=1 ;;
    --dry-run|-n) MODE=dry ;;
    --check) MODE=check ;;
    -h|--help) sed -n '2,9p' "$0" | sed 's/^# \{0,1\}//'; exit 0 ;;
    *) echo "Unbekannte Option: $arg" >&2; exit 2 ;;
  esac
done

say()  { printf '%s\n' "$*"; }
fail() { printf 'Fehler: %s\n' "$*" >&2; exit 1; }

# ---------- Prüfungen der Seite ----------
check_site() {
  local problems=0
  [[ -f "$PUBLIC/index.html" ]] || fail "public/index.html fehlt."
  for f in impressum.html datenschutz.html; do
    [[ -f "$PUBLIC/$f" ]] || { say "  ✗ public/$f fehlt"; problems=1; }
  done
  # offene Platzhalter im Impressum / in der Datenschutzerklärung
  local ph
  ph="$(grep -rn '⟦' "$PUBLIC" --include='*.html' || true)"
  if [[ -n "$ph" ]]; then
    say "  ✗ Offene Platzhalter (Impressum/Datenschutz vervollständigen):"
    printf '%s\n' "$ph" | sed -E "s|^$PUBLIC/||; s|<[^>]+>||g; s/^/      /" | cut -c1-140
    problems=1
  fi
  # keine Dienste Dritter (Google Fonts, CDNs) – sonst wäre die Datenschutzerklärung falsch
  local ext
  ext="$(grep -rnE 'fonts\.googleapis|fonts\.gstatic|cdnjs\.|jsdelivr|unpkg\.com|googletagmanager|google-analytics|(src|href)="(https?:)?//' "$PUBLIC" --include='*.html' --include='*.css' || true)"
  if [[ -n "$ext" ]]; then
    say "  ✗ Externe Quellen gefunden (lokal einbinden oder Datenschutzerklärung anpassen):"
    printf '%s\n' "$ext" | sed -E "s|^$PUBLIC/||; s/^/      /" | cut -c1-140
    problems=1
  fi
  return $problems
}

# ---------- Zugang ----------
load_env() {
  [[ -f "$ENV_FILE" ]] || fail ".env fehlt. Zuerst einrichten: scripts/deploy-setup.sh"
  if [[ "$(stat -f '%Lp' "$ENV_FILE" 2>/dev/null || stat -c '%a' "$ENV_FILE")" != 600 ]]; then
    chmod 600 "$ENV_FILE"
  fi
  # shellcheck disable=SC1090
  set -a; source "$ENV_FILE"; set +a
  : "${SFTP_HOST:?SFTP_HOST fehlt in .env}" "${SFTP_USER:?SFTP_USER fehlt in .env}" "${SFTP_REMOTE_PATH:?SFTP_REMOTE_PATH fehlt in .env}"
  SFTP_PORT="${SFTP_PORT:-22}"; SFTP_AUTH="${SFTP_AUTH:-password}"
  SFTP_REMOTE_PATH="${SFTP_REMOTE_PATH%/}"
  [[ -s "$KH_FILE" ]] || fail "Host-Schlüssel fehlt (.deploy/known_hosts). scripts/deploy-setup.sh erneut starten."
  if [[ "$SFTP_AUTH" == key ]]; then
    [[ -f "${SFTP_KEY:-}" ]] || fail "SSH-Schlüssel ${SFTP_KEY:-(leer)} nicht gefunden."
  else
    [[ -n "${SFTP_PASSWORD:-}" ]] || fail "SFTP_PASSWORD fehlt in .env."
  fi
}

# Pfad für die sftp-Batchdatei in Anführungszeichen setzen
bq() { local s="${1//\\/\\\\}"; s="${s//\"/\\\"}"; printf '"%s"' "$s"; }

run_sftp() { # $1 = Batchdatei
  local batch="$1"
  local common=(-P "$SFTP_PORT" -o UserKnownHostsFile="$KH_FILE" -o StrictHostKeyChecking=yes
                -o ConnectTimeout=15 -o ServerAliveInterval=15 -o LogLevel=ERROR)
  if [[ "$SFTP_AUTH" == key ]]; then
    sftp -b "$batch" "${common[@]}" -o BatchMode=yes -o IdentitiesOnly=yes -i "$SFTP_KEY" "$SFTP_USER@$SFTP_HOST"
  else
    local pw=(-o BatchMode=no -o PubkeyAuthentication=no -o PreferredAuthentications=password,keyboard-interactive -o NumberOfPasswordPrompts=1)
    if command -v sshpass >/dev/null; then
      # Passwort über die Umgebung, nicht über die Kommandozeile (nicht in ps sichtbar)
      SSHPASS="$SFTP_PASSWORD" sshpass -e sftp "${pw[@]}" -b "$batch" "${common[@]}" "$SFTP_USER@$SFTP_HOST"
    elif command -v expect >/dev/null; then
      local exp; exp="$(mktemp)"
      cat >"$exp" <<'EXP'
set timeout 600
set pw $env(RW_SFTP_PW)
set sent 0
spawn -noecho {*}$argv
expect {
  -re {(?i)password[^\n]*: ?$} { if {$sent} { exit 1 }; set sent 1; send -- "$pw\r"; exp_continue }
  eof
}
lassign [wait] pid spawnid oserr code
exit $code
EXP
      RW_SFTP_PW="$SFTP_PASSWORD" expect -f "$exp" sftp "${pw[@]}" -b "$batch" "${common[@]}" "$SFTP_USER@$SFTP_HOST"
      local rc=$?; rm -f "$exp"; return $rc
    else
      fail "Für Passwort-Anmeldung wird sshpass oder expect gebraucht."
    fi
  fi
}

# ---------- Nur Verbindung testen ----------
if [[ "$MODE" == check ]]; then
  load_env
  b="$(mktemp)"; trap 'rm -f "$b"' EXIT
  { echo "pwd"; echo "-ls -l $(bq "$SFTP_REMOTE_PATH")"; } >"$b"
  run_sftp "$b"
  exit $?
fi

# ---------- Seite prüfen ----------
say "Prüfe public/ …"
site_ok=1
check_site || site_ok=0
if [[ $site_ok == 1 ]]; then say "  ✓ Impressum und Datenschutz vollständig, keine externen Quellen"; fi
if [[ $site_ok == 0 && "$MODE" == upload ]]; then
  fail "Upload abgebrochen. Erst die Punkte oben beheben (Probelauf: scripts/deploy.sh --dry-run)."
fi

# ---------- Zugang laden (vor dem Batch, damit der Zielpfad feststeht) ----------
if [[ "$MODE" == upload ]]; then
  load_env
elif [[ -f "$ENV_FILE" ]]; then
  # shellcheck disable=SC1090
  set -a; source "$ENV_FILE"; set +a
fi

# ---------- Dateien sammeln ----------
STAGE="$(mktemp -d)"; BATCH="$(mktemp)"
trap 'rm -rf "$STAGE" "$BATCH"' EXIT
rsync -a --exclude '.DS_Store' --exclude '._*' "$PUBLIC/" "$STAGE/"

dirs=(); files=(); html=()
while IFS= read -r d; do dirs+=("$d"); done < <(cd "$STAGE" && find . -mindepth 1 -type d | sed 's|^\./||' | sort)
while IFS= read -r f; do
  if [[ "$f" == *.html ]]; then html+=("$f"); else files+=("$f"); fi
done < <(cd "$STAGE" && find . -type f | sed 's|^\./||' | sort)
# HTML zuletzt: dann sind Schriften und Skripte schon da, wenn die neue Seite live geht
all=("${files[@]}" "${html[@]}")

# ---------- Batch aufbauen ----------
remote="${SFTP_REMOTE_PATH:-}"; remote="${remote%/}"
if [[ -z "$remote" ]]; then
  [[ "$MODE" == dry ]] || fail "SFTP_REMOTE_PATH fehlt."
  remote="<Zielordner>"
fi
{
  echo "lcd $(bq "$STAGE")"
  # Zielordner Stück für Stück anlegen (mkdir -p)
  acc=""
  IFS='/' read -r -a parts <<<"${remote#/}"
  for p in "${parts[@]}"; do
    [[ -z "$p" ]] && continue
    if [[ -n "$acc" ]]; then acc="$acc/$p"; elif [[ "$remote" == /* ]]; then acc="/$p"; else acc="$p"; fi
    echo "-mkdir $(bq "$acc")"
  done
  for d in "${dirs[@]}"; do echo "-mkdir $(bq "$remote/$d")"; done
  for f in "${all[@]}"; do echo "put -p $(bq "$f") $(bq "$remote/$f")"; done
  echo "ls -l $(bq "$remote")"
} >"$BATCH"

if [[ "$MODE" == dry ]]; then
  say ""
  say "Probelauf – Ziel: ${SFTP_USER:-?}@${SFTP_HOST:-?}:${SFTP_REMOTE_PATH:-?}"
  say "${#all[@]} Dateien, $(du -sh "$STAGE" | cut -f1):"
  printf '  %s\n' "${all[@]}"
  say ""
  say "sftp-Befehle:"
  sed "s|$STAGE|<public>|; s/^/  /" "$BATCH"
  if [[ $site_ok == 0 ]]; then say ""; say "Hinweis: Ein echter Upload würde wegen der Punkte oben abgebrochen."; fi
  exit 0
fi

# ---------- Rückfrage ----------
if command -v git >/dev/null && git -C "$ROOT" rev-parse >/dev/null 2>&1; then
  if [[ -n "$(git -C "$ROOT" status --porcelain -- public)" ]]; then
    say "Achtung: public/ hat Änderungen, die noch nicht committet sind."
  fi
  rev="$(git -C "$ROOT" rev-parse --short HEAD 2>/dev/null || echo '?')"
else
  rev="?"
fi
say ""
say "Ziel:    $SFTP_USER@$SFTP_HOST:$SFTP_REMOTE_PATH (Port $SFTP_PORT, Anmeldung: $SFTP_AUTH)"
say "Inhalt:  ${#all[@]} Dateien aus public/, Stand $rev"
if [[ $ASSUME_YES == 0 ]]; then
  read -r -p "Jetzt hochladen? [j/N]: " a || true
  [[ "$a" =~ ^[jJyY] ]] || { say "Abgebrochen."; exit 0; }
fi

say "Lade hoch …"
# „remote mkdir … Failure“ heißt nur: Ordner gibt es schon – ausblenden
set +e
run_sftp "$BATCH" 2>&1 | grep --line-buffered -vE '^remote mkdir .*: Failure[[:space:]]*$'
rc=${PIPESTATUS[0]}
set -e
[[ $rc == 0 ]] || fail "Upload fehlgeschlagen (sftp-Code $rc)."
say "✓ Hochgeladen."

# ---------- Kurz prüfen, ob die Seite antwortet ----------
if [[ -n "${SITE_URL:-}" ]] && command -v curl >/dev/null; then
  base="${SITE_URL%/}"
  for p in "" impressum.html datenschutz.html assets/vendor/jspdf-2.5.1.umd.min.js; do
    code="$(curl -s -o /dev/null -w '%{http_code}' --max-time 15 "$base/$p" || echo 000)"
    if [[ "$code" == 200 ]]; then say "  ✓ $base/$p"; else say "  ✗ $base/$p antwortet mit $code"; fi
  done
  [[ "$base" == https://* ]] || say "  Hinweis: SITE_URL ist kein https – die Datenschutzerklärung verspricht HTTPS."
fi
