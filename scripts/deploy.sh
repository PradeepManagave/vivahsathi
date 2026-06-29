#!/usr/bin/env bash
# ============================================================================
# M-Plus Matrimony - Production Deployment Script
# ============================================================================
# Usage: ./scripts/deploy.sh [staging|production]
# Prerequisites:
#   - Docker & Docker Compose installed
#   - .env file present with production secrets
#   - SSH access to the server (for remote deploy)
# ============================================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$PROJECT_ROOT"

ENV="${1:-production}"
COMPOSE_FILES="-f docker-compose.yml"

case "$ENV" in
  staging)
    COMPOSE_FILES="$COMPOSE_FILES -f docker-compose.staging.yml"
    ENV_FILE=".env.staging"
    ;;
  production)
    COMPOSE_FILES="$COMPOSE_FILES -f docker-compose.prod.yml"
    ENV_FILE=".env"
    ;;
  *)
    echo "Usage: $0 [staging|production]"
    exit 1
    ;;
esac

echo "=== Deploying to $ENV ==="

# Check prerequisites
command -v docker >/dev/null 2>&1 || { echo "Docker is required"; exit 1; }
command -v docker-compose >/dev/null 2>&1 || command -v docker >/dev/null 2>&1 || { echo "Docker Compose is required"; exit 1; }

# Load environment
if [ -f "$ENV_FILE" ]; then
  set -a
  source "$ENV_FILE"
  set +a
else
  echo "Warning: $ENV_FILE not found, using existing environment"
fi

# Deploy
echo "Pulling latest images..."
docker compose $COMPOSE_FILES pull

echo "Starting services..."
docker compose $COMPOSE_FILES up -d --force-recreate --remove-orphans

echo "Waiting for health checks..."
for i in $(seq 1 30); do
  if docker compose $COMPOSE_FILES exec backend wget -qO- http://localhost:4000/health > /dev/null 2>&1; then
    echo "Backend healthy"
    break
  fi
  sleep 2
done

echo "Cleaning up old images..."
docker image prune -f

echo "=== Deployment to $ENV complete ==="
