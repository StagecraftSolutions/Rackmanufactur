#!/usr/bin/env bash
# Rack Manufaktur – uploads the folder public/ to the server via SFTP.
# Credentials come from .env (set up with scripts/deploy-setup.sh).
#
#   scripts/deploy.sh            check, ask, upload
#   scripts/deploy.sh --yes      upload without asking
#   scripts/deploy.sh --dry-run  only check and show what would be uploaded
#   scripts/deploy.sh --check    only test the connection
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
    *) echo "Unknown option: $arg" >&2; exit 2 ;;
  esac
done

say()  { printf '%s\n' "$*"; }
fail() { printf 'Error: %s\n' "$*" >&2; exit 1; }

# ---------- Site checks ----------
check_site() {
  local problems=0
  [[ -f "$PUBLIC/index.html" ]] || fail "public/index.html missing."
  for f in impressum.html datenschutz.html; do
    [[ -f "$PUBLIC/$f" ]] || { say "  ✗ public/$f missing"; problems=1; }
  done
  # open placeholders in the legal notice / privacy policy
  local ph
  ph="$(grep -rn '⟦' "$PUBLIC" --include='*.html' || true)"
  if [[ -n "$ph" ]]; then
    say "  ✗ Open placeholders (complete the legal notice/privacy policy):"
    printf '%s\n' "$ph" | sed -E "s|^$PUBLIC/||; s|<[^>]+>||g; s/^/      /" | cut -c1-140
    problems=1
  fi
  # no third-party services (Google Fonts, CDNs) – otherwise the privacy policy would be wrong
  local ext
  ext="$(grep -rnE 'fonts\.googleapis|fonts\.gstatic|cdnjs\.|jsdelivr|unpkg\.com|googletagmanager|google-analytics|(src|href)="(https?:)?//' "$PUBLIC" --include='*.html' --include='*.css' || true)"
  if [[ -n "$ext" ]]; then
    say "  ✗ External sources found (host locally or update the privacy policy):"
    printf '%s\n' "$ext" | sed -E "s|^$PUBLIC/||; s/^/      /" | cut -c1-140
    problems=1
  fi
  return $problems
}

# ---------- Access ----------
load_env() {
  [[ -f "$ENV_FILE" ]] || fail ".env missing. Set up first: scripts/deploy-setup.sh"
  if [[ "$(stat -f '%Lp' "$ENV_FILE" 2>/dev/null || stat -c '%a' "$ENV_FILE")" != 600 ]]; then
    chmod 600 "$ENV_FILE"
  fi
  # shellcheck disable=SC1090
  set -a; source "$ENV_FILE"; set +a
  : "${SFTP_HOST:?SFTP_HOST fehlt in .env}" "${SFTP_USER:?SFTP_USER fehlt in .env}" "${SFTP_REMOTE_PATH:?SFTP_REMOTE_PATH fehlt in .env}"
  SFTP_PORT="${SFTP_PORT:-22}"; SFTP_AUTH="${SFTP_AUTH:-password}"
  SFTP_REMOTE_PATH="${SFTP_REMOTE_PATH%/}"
  [[ -s "$KH_FILE" ]] || fail "Host key missing (.deploy/known_hosts). Run scripts/deploy-setup.sh again."
  if [[ "$SFTP_AUTH" == key ]]; then
    [[ -f "${SFTP_KEY:-}" ]] || fail "SSH key ${SFTP_KEY:-(empty)} not found."
  else
    [[ -n "${SFTP_PASSWORD:-}" ]] || fail "SFTP_PASSWORD missing in .env."
  fi
}

# quote a path for the sftp batch file
bq() { local s="${1//\\/\\\\}"; s="${s//\"/\\\"}"; printf '"%s"' "$s"; }

run_sftp() { # $1 = batch file
  local batch="$1"
  local common=(-P "$SFTP_PORT" -o UserKnownHostsFile="$KH_FILE" -o StrictHostKeyChecking=yes
                -o ConnectTimeout=15 -o ServerAliveInterval=15 -o LogLevel=ERROR)
  if [[ "$SFTP_AUTH" == key ]]; then
    sftp -b "$batch" "${common[@]}" -o BatchMode=yes -o IdentitiesOnly=yes -i "$SFTP_KEY" "$SFTP_USER@$SFTP_HOST"
  else
    local pw=(-o BatchMode=no -o PubkeyAuthentication=no -o PreferredAuthentications=password,keyboard-interactive -o NumberOfPasswordPrompts=1)
    if command -v sshpass >/dev/null; then
      # password via the environment, not the command line (not visible in ps)
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
      fail "Password login needs sshpass or expect."
    fi
  fi
}

# ---------- Connection test only ----------
if [[ "$MODE" == check ]]; then
  load_env
  b="$(mktemp)"; trap 'rm -f "$b"' EXIT
  { echo "pwd"; echo "-ls -l $(bq "$SFTP_REMOTE_PATH")"; } >"$b"
  run_sftp "$b"
  exit $?
fi

# ---------- Check the site ----------
say "Checking public/ …"
site_ok=1
check_site || site_ok=0
if [[ $site_ok == 1 ]]; then say "  ✓ Legal notice and privacy policy complete, no external sources"; fi
if [[ $site_ok == 0 && "$MODE" == upload ]]; then
  fail "Upload cancelled. Fix the points above first (dry run: scripts/deploy.sh --dry-run)."
fi

# ---------- Load access (before the batch, so the target path is known) ----------
if [[ "$MODE" == upload ]]; then
  load_env
elif [[ -f "$ENV_FILE" ]]; then
  # shellcheck disable=SC1090
  set -a; source "$ENV_FILE"; set +a
fi

# ---------- Collect files ----------
STAGE="$(mktemp -d)"; BATCH="$(mktemp)"
trap 'rm -rf "$STAGE" "$BATCH"' EXIT
rsync -a --exclude '.DS_Store' --exclude '._*' "$PUBLIC/" "$STAGE/"
# write the git revision into the page (footer: "Version <commit>" linking to GitHub); "+" = uncommitted changes in public/
if sha="$(git -C "$ROOT" rev-parse HEAD 2>/dev/null)"; then
  short="${sha:0:7}"; cdate="$(git -C "$ROOT" show -s --format=%cs HEAD)"
  git -C "$ROOT" diff --quiet HEAD -- public 2>/dev/null || short="$short+"
  sed -i.bak "s|__GIT_COMMIT__|$sha|g; s|__GIT_SHORT__|$short|g; s|__GIT_DATE__|$cdate|g" "$STAGE/index.html" && rm -f "$STAGE/index.html.bak"
fi

dirs=(); files=(); html=()
while IFS= read -r d; do dirs+=("$d"); done < <(cd "$STAGE" && find . -mindepth 1 -type d | sed 's|^\./||' | sort)
while IFS= read -r f; do
  if [[ "$f" == *.html ]]; then html+=("$f"); else files+=("$f"); fi
done < <(cd "$STAGE" && find . -type f | sed 's|^\./||' | sort)
# HTML last: fonts and scripts are already there when the new page goes live
all=("${files[@]}" "${html[@]}")

# ---------- Build the batch ----------
remote="${SFTP_REMOTE_PATH:-}"; remote="${remote%/}"
if [[ -z "$remote" ]]; then
  [[ "$MODE" == dry ]] || fail "SFTP_REMOTE_PATH missing."
  remote="<Zielordner>"
fi
{
  echo "lcd $(bq "$STAGE")"
  # create the target folder step by step (mkdir -p)
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
  say "Dry run – target: ${SFTP_USER:-?}@${SFTP_HOST:-?}:${SFTP_REMOTE_PATH:-?}"
  say "${#all[@]} files, $(du -sh "$STAGE" | cut -f1):"
  printf '  %s\n' "${all[@]}"
  say ""
  say "sftp commands:"
  sed "s|$STAGE|<public>|; s/^/  /" "$BATCH"
  if [[ $site_ok == 0 ]]; then say ""; say "Note: a real upload would be cancelled because of the points above."; fi
  exit 0
fi

# ---------- Confirmation ----------
if command -v git >/dev/null && git -C "$ROOT" rev-parse >/dev/null 2>&1; then
  if [[ -n "$(git -C "$ROOT" status --porcelain -- public)" ]]; then
    say "Warning: public/ has uncommitted changes."
  fi
  rev="$(git -C "$ROOT" rev-parse --short HEAD 2>/dev/null || echo '?')"
else
  rev="?"
fi
say ""
say "Target:  $SFTP_USER@$SFTP_HOST:$SFTP_REMOTE_PATH (port $SFTP_PORT, login: $SFTP_AUTH)"
say "Content: ${#all[@]} files from public/, revision $rev"
if [[ $ASSUME_YES == 0 ]]; then
  read -r -p "Upload now? [y/N]: " a || true
  [[ "$a" =~ ^[jJyY] ]] || { say "Cancelled."; exit 0; }
fi

say "Uploading …"
# "remote mkdir … Failure" only means: folder exists – hide it
set +e
run_sftp "$BATCH" 2>&1 | grep --line-buffered -vE '^remote mkdir .*: Failure[[:space:]]*$'
rc=${PIPESTATUS[0]}
set -e
[[ $rc == 0 ]] || fail "Upload failed (sftp code $rc)."
say "✓ Uploaded."

# ---------- Quick check that the site responds ----------
if [[ -n "${SITE_URL:-}" ]] && command -v curl >/dev/null; then
  base="${SITE_URL%/}"
  for p in "" impressum.html datenschutz.html assets/vendor/jspdf-2.5.1.umd.min.js; do
    code="$(curl -s -o /dev/null -w '%{http_code}' --max-time 15 "$base/$p" || echo 000)"
    if [[ "$code" == 200 ]]; then say "  ✓ $base/$p"; else say "  ✗ $base/$p responds with $code"; fi
  done
  [[ "$base" == https://* ]] || say "  Note: SITE_URL is not https – the privacy policy promises HTTPS."
fi
