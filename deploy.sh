#!/usr/bin/env bash
set -euo pipefail

BACKEND_DIR="${BACKEND_DIR:-/opt/1panel/www/sites/sanguogame/backend}"
FRONTEND_DIR="${FRONTEND_DIR:-/opt/1panel/www/sites/sanguogame/index}"
PM2_NAME="${PM2_NAME:-sanguo-backend}"
HEALTH_URL="${HEALTH_URL:-http://127.0.0.1:3001/api/health}"

log() {
  printf '\n[%s] %s\n' "$(date '+%Y-%m-%d %H:%M:%S')" "$1"
}

require_command() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "Missing command: $1"
    exit 1
  fi
}

require_path() {
  if [ ! -e "$1" ]; then
    echo "Missing required path: $1"
    exit 1
  fi
}

require_command git
require_command node
require_command pm2

log "Entering repository: $BACKEND_DIR"
cd "$BACKEND_DIR"

require_path ".git"
require_path "index.html"
require_path "css"
require_path "js"
require_path "assets"
require_path "影像素材"
require_path "server/index.mjs"

log "Pulling latest code from GitHub"
git pull --ff-only

log "Syncing frontend static files to: $FRONTEND_DIR"
mkdir -p "$FRONTEND_DIR"
rm -rf "$FRONTEND_DIR/css" "$FRONTEND_DIR/js" "$FRONTEND_DIR/assets" "$FRONTEND_DIR/影像素材"
cp index.html "$FRONTEND_DIR/"
cp -R css "$FRONTEND_DIR/"
cp -R js "$FRONTEND_DIR/"
cp -R assets "$FRONTEND_DIR/"
cp -R "影像素材" "$FRONTEND_DIR/"

log "Restarting backend with PM2"
if pm2 describe "$PM2_NAME" >/dev/null 2>&1; then
  pm2 restart "$PM2_NAME"
else
  pm2 start server/index.mjs --name "$PM2_NAME"
fi
pm2 save

if command -v curl >/dev/null 2>&1; then
  log "Checking backend health"
  curl -fsS "$HEALTH_URL"
  printf '\n'
fi

log "Deploy complete"
