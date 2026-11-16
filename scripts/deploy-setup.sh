#!/usr/bin/env bash
# Rack Manufaktur – set up SFTP access.
# Asks for server, path and credentials in the terminal and writes them to .env (readable only by you, not in git).
# Checks the server's host key and tests the connection.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
ENV_FILE="$ROOT/.env"
KH_DIR="$ROOT/.deploy"
KH_FILE="$KH_DIR/known_hosts"

say()  { printf '%s\n' "$*"; }
ask()  { # ask VAR "Question" "Default"
  local __v="$1" __q="$2" __d="${3:-}" __a
  if [[ -n "$__d" ]]; then read -r -p "$__q [$__d]: " __a || true; __a="${__a:-$__d}"
  else read -r -p "$__q: " __a || true; fi
  printf -v "$__v" '%s' "$__a"
}
yes_no() { local a; read -r -p "$1 [y/N]: " a || true; [[ "$a" =~ ^[jJyY] ]]; }
q() { # single-quote a value for .env
  local s="${1//\'/\'\\\'\'}"; printf "'%s'" "$s"
}

say "Rack Manufaktur · set up SFTP access"
say "The values are stored in $ENV_FILE (mode 600, listed in .gitignore)."
say ""

if [[ -f "$ENV_FILE" ]]; then
  yes_no ".env already exists. Overwrite?" || { say "Cancelled, nothing changed."; exit 0; }
  # previous values as defaults
  # shellcheck disable=SC1090
  set -a; source "$ENV_FILE"; set +a
fi

# ask for the server and check it right away – on a typo ask again without re-entering everything
mkdir -p "$KH_DIR"; chmod 700 "$KH_DIR"
tmp_kh="$(mktemp)"; trap 'rm -f "$tmp_kh"' EXIT
while true; do
  ask SFTP_HOST "Server (host, e.g. ssh.example.com)" "${SFTP_HOST:-}"
  [[ -n "$SFTP_HOST" ]] || { say "Server missing."; exit 1; }
  ask SFTP_PORT "Port" "${SFTP_PORT:-22}"
  [[ "$SFTP_PORT" =~ ^[0-9]+$ ]] || { say "Port must be a number."; SFTP_PORT=22; continue; }
  say "Checking $SFTP_HOST:$SFTP_PORT …"
  if ssh-keyscan -p "$SFTP_PORT" -T 10 "$SFTP_HOST" 2>/dev/null >"$tmp_kh" && [[ -s "$tmp_kh" ]]; then break; fi
  say "Server not reachable or no SSH on port $SFTP_PORT. Please check host and port."
  yes_no "Nochmal eingeben?" || exit 1
done
say "Server fingerprints:"
ssh-keygen -lf "$tmp_kh" | sed 's/^/  /'
say "Compare them with the information from your hosting provider (customer area or support)."
yes_no "Do the fingerprints match?" || { say "Cancelled. Nothing saved."; exit 1; }
say ""
ask SFTP_USER "User name" "${SFTP_USER:-}"
[[ -n "$SFTP_USER" ]] || { say "User name missing."; exit 1; }
ask SFTP_REMOTE_PATH "Target folder on the server (e.g. /html/rackwerk or rackwerk)" "${SFTP_REMOTE_PATH:-}"
[[ -n "$SFTP_REMOTE_PATH" ]] || { say "Target folder missing."; exit 1; }
SFTP_REMOTE_PATH="${SFTP_REMOTE_PATH%/}"
ask SITE_URL "Site URL (optional, e.g. https://rackwerk.example.com)" "${SITE_URL:-}"

say ""
say "Login:"
say "  1) Password"
say "  2) SSH key (recommended)"
ask auth_choice "Choice" "$([[ "${SFTP_AUTH:-password}" == key ]] && echo 2 || echo 1)"
SFTP_PASSWORD=""; SFTP_KEY=""
if [[ "$auth_choice" == 2 ]]; then
  SFTP_AUTH=key
  ask SFTP_KEY "Path to the private key" "${SFTP_KEY:-$HOME/.ssh/id_ed25519}"
  SFTP_KEY="${SFTP_KEY/#\~/$HOME}"
  [[ -f "$SFTP_KEY" ]] || { say "Key $SFTP_KEY not found. Create one with: ssh-keygen -t ed25519"; exit 1; }
else
  SFTP_AUTH=password
  read -r -s -p "Password (input hidden): " SFTP_PASSWORD || true; echo
  [[ -n "$SFTP_PASSWORD" ]] || { say "Password missing."; exit 1; }
  if ! command -v sshpass >/dev/null && ! command -v expect >/dev/null; then
    say "Password login needs sshpass or expect (brew install hudochenkov/sshpass/sshpass)."; exit 1
  fi
fi

cp "$tmp_kh" "$KH_FILE"; chmod 600 "$KH_FILE"

# write .env
umask 077
{
  echo "# Rack Manufaktur – SFTP access. Do not commit, do not share."
  echo "# Created with scripts/deploy-setup.sh on $(date '+%Y-%m-%d %H:%M')"
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
say "Saved to $ENV_FILE."

# Verbindung testen
say ""
say "Testing the connection …"
if "$ROOT/scripts/deploy.sh" --check; then
  say "Connection works."
else
  say "Connection failed. Check the values and run this script again."; exit 1
fi

# Optional: upload automatically on git push to main
HOOK="$ROOT/.git/hooks/pre-push"
if [[ -d "$ROOT/.git" ]]; then
  say ""
  if yes_no "Upload automatically on every 'git push' to main?"; then
    cat >"$HOOK" <<'HOOK'
#!/usr/bin/env bash
# Rack Manufaktur: uploads public/ via SFTP when main is pushed (installed by scripts/deploy-setup.sh).
# A failed upload does not stop the push.
ROOT="$(git rev-parse --show-toplevel)"
while read -r local_ref local_sha remote_ref remote_sha; do
  if [[ "$remote_ref" == "refs/heads/main" && "$local_sha" != 0000000000000000000000000000000000000000 ]]; then
    echo "Rack Manufaktur: uploading public/ to the server …"
    "$ROOT/scripts/deploy.sh" --yes || echo "Rack Manufaktur: upload failed – retry later with scripts/deploy.sh." >&2
  fi
done
exit 0
HOOK
    chmod +x "$HOOK"
    say "Installed: .git/hooks/pre-push"
  elif [[ -f "$HOOK" ]] && grep -qE 'Rack Manufaktur: (lädt|uploads) public/' "$HOOK"; then
    rm -f "$HOOK"; say "Automatic upload removed."
  fi
fi

say ""
say "Done. Upload with: scripts/deploy.sh"
