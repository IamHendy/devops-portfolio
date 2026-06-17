#!/bin/bash
set -euo pipefail

log() { echo "[$(date '+%H:%M:%S')] $*"; }
die() { log "ERROR: $*" >&2; exit 1; }

# ─── Config ───────────────────────────────────────────────────────────────────
APP_IMAGE="devops-portfolio-app:latest"
K3S_KUBECONFIG="/etc/rancher/k3s/k3s.yaml"
NAMESPACE="production"
HELM_RELEASE="users-api"
HELM_CHART="./helm/users-api"
DOMAIN="devopsportfolio.strangled.net"

# ─── Preflight checks ─────────────────────────────────────────────────────────
[[ -f ".env" ]] || die ".env file not found. Copy .env.example and fill it in."
command -v docker   >/dev/null 2>&1 || die "docker not installed"
command -v kubectl  >/dev/null 2>&1 || die "kubectl not installed"
command -v helm     >/dev/null 2>&1 || die "helm not installed"

log "Loading environment..."
set -a; source .env; set +a

export KUBECONFIG="$K3S_KUBECONFIG"

# ─── Step 1: Build Docker image ───────────────────────────────────────────────
log "Building Docker image..."
docker build -t "$APP_IMAGE" ./app

# ─── Step 2: Import image into k3s containerd ─────────────────────────────────
# k3s uses containerd which has a SEPARATE image store from Docker.
# Without this step k3s throws ErrImageNeverPull.
log "Importing image into k3s containerd..."
docker save "$APP_IMAGE" -o /tmp/users-api.tar
k3s ctr images import /tmp/users-api.tar
rm -f /tmp/users-api.tar
log "Image imported successfully."

# ─── Step 3: Verify k3s can see the image ─────────────────────────────────────
k3s ctr images list | grep "devops-portfolio-app" \
  || die "Image not found in k3s after import"

# ─── Step 4: Deploy via Helm ──────────────────────────────────────────────────
log "Deploying via Helm..."
if helm status "$HELM_RELEASE" -n "$NAMESPACE" >/dev/null 2>&1; then
  log "Release exists — upgrading..."
  helm upgrade "$HELM_RELEASE" "$HELM_CHART" \
    --namespace "$NAMESPACE" \
    --set image.tag=latest \
    --set domain="$DOMAIN" \
    --wait \
    --timeout 120s
else
  log "Release not found — installing..."
  helm install "$HELM_RELEASE" "$HELM_CHART" \
    --namespace "$NAMESPACE" \
    --create-namespace \
    --set image.tag=latest \
    --set domain="$DOMAIN" \
    --wait \
    --timeout 120s
fi

# ─── Step 5: Restart pods to pick up new image ────────────────────────────────
log "Restarting pods to pick up new image..."
kubectl rollout restart deployment/"$HELM_RELEASE" -n "$NAMESPACE"
kubectl rollout status deployment/"$HELM_RELEASE" -n "$NAMESPACE" --timeout=120s

# ─── Step 6: Health check ─────────────────────────────────────────────────────
log "Waiting for app to become healthy (up to 60s)..."
for i in $(seq 1 12); do
  STATUS=$(curl -s -o /dev/null -w "%{http_code}" \
    "http://${DOMAIN}/health" 2>/dev/null || echo "000")
  if [[ "$STATUS" == "200" ]]; then
    log "App is healthy. Deployment complete."
    echo ""
    log "Live at: http://${DOMAIN}"
    kubectl get all -n "$NAMESPACE"
    exit 0
  fi
  log "Attempt $i/12 — got HTTP $STATUS, retrying in 5s..."
  sleep 5
done

log "Health check failed. Printing pod logs:"
kubectl logs -n "$NAMESPACE" deployment/"$HELM_RELEASE" --tail=50
die "Deployment failed."