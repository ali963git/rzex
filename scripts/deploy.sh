#!/bin/bash
set -euo pipefail

# ============================================
# RZEX Deployment Script
# ============================================

ENVIRONMENT=${1:-"development"}
REGISTRY=${DOCKER_REGISTRY:-""}
TAG=${DOCKER_TAG:-"latest"}

echo "🚀 RZEX Deployment — Environment: $ENVIRONMENT"
echo "================================================"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log_info() { echo -e "${GREEN}[INFO]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# Check prerequisites
command -v docker >/dev/null 2>&1 || { log_error "Docker is required"; exit 1; }
command -v docker compose >/dev/null 2>&1 || { log_error "Docker Compose is required"; exit 1; }

case $ENVIRONMENT in
  development)
    log_info "Starting development environment..."
    cp .env.example .env 2>/dev/null || true
    docker compose up --build -d
    log_info "Waiting for services to be healthy..."
    sleep 15
    docker compose ps
    echo ""
    log_info "RZEX Platform is running!"
    echo "  - Web UI:      http://localhost:3010"
    echo "  - API Gateway: http://localhost:3000"
    echo "  - Grafana:     http://localhost:3020 (admin/admin)"
    echo "  - Prometheus:  http://localhost:9090"
    ;;

  staging|production)
    log_info "Building production images..."

    SERVICES=(
      "api-gateway"
      "user-service"
      "trading-engine"
      "wallet-service"
      "market-data-service"
      "notification-service"
      "web"
    )

    for SERVICE in "${SERVICES[@]}"; do
      if [ "$SERVICE" = "web" ]; then
        CONTEXT="./frontend/web"
      else
        CONTEXT="./services/$SERVICE"
      fi

      IMAGE_NAME="${REGISTRY:+$REGISTRY/}rzex-$SERVICE:$TAG"
      log_info "Building $IMAGE_NAME..."
      docker build -t "$IMAGE_NAME" "$CONTEXT"

      if [ -n "$REGISTRY" ]; then
        log_info "Pushing $IMAGE_NAME..."
        docker push "$IMAGE_NAME"
      fi
    done

    log_info "All images built successfully!"
    ;;

  down)
    log_info "Stopping all services..."
    docker compose down
    log_info "All services stopped."
    ;;

  clean)
    log_warn "Removing all data volumes..."
    docker compose down -v
    log_info "Cleanup complete."
    ;;

  *)
    echo "Usage: $0 {development|staging|production|down|clean}"
    exit 1
    ;;
esac
