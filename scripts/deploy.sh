#!/bin/bash
set -euo pipefail

log()  { echo "[$(date '+%H:%M:%S')] $*"; }
die()  { log "ERROR: $*" >&2; exit 1; }

[[ -f ".env" ]] || die ".env file not found. Copy .env.example and fill it in."

log "Loading environment..."
set -a; source .env; set +a

log "Building Docker images..."
docker compose build --no-cache

log "Stopping any running containers..."
docker compose down --remove-orphans

log "Starting containers..."
docker compose up -d

log "Waiting for app to become healthy (up to 60s)..."
for i in $(seq 1 12); do
  STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost/health 2>/dev/null || echo "000")
  if [[ "$STATUS" == "200" ]]; then
    log "App is healthy. Deployment complete."
    docker compose ps
    exit 0
  fi
  log "Attempt $i/12 — got HTTP $STATUS, retrying in 5s..."
  sleep 5
done

log "Health check failed after 60s. Printing logs:"
docker compose logs --tail=50
die "Deployment failed."