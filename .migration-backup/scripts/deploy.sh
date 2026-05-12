#!/bin/bash
set -euo pipefail

# ============================================
# RZEX Platform — Deployment Script
# ============================================

ENVIRONMENT=${1:-"development"}
REGISTRY=${DOCKER_REGISTRY:-""}
TAG=${DOCKER_TAG:-"latest"}
KUBE_NAMESPACE=${KUBE_NAMESPACE:-"rzex"}

echo "=========================================="
echo "  RZEX Platform Deployment"
echo "  Environment: $ENVIRONMENT"
echo "=========================================="

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info()  { echo -e "${GREEN}[INFO]${NC}  $1"; }
log_warn()  { echo -e "${YELLOW}[WARN]${NC}  $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }
log_step()  { echo -e "${BLUE}[STEP]${NC}  $1"; }

SERVICES=(
  "api-gateway"
  "user-service"
  "trading-engine"
  "wallet-service"
  "market-data-service"
  "notification-service"
)

check_prerequisites() {
  local missing=0
  for cmd in docker; do
    if ! command -v "$cmd" &>/dev/null; then
      log_error "$cmd is required but not installed."
      missing=1
    fi
  done
  if ! docker compose version &>/dev/null 2>&1; then
    log_error "Docker Compose V2 is required."
    missing=1
  fi
  return $missing
}

wait_for_healthy() {
  local service=$1
  local max_attempts=${2:-30}
  local attempt=0

  while [ $attempt -lt $max_attempts ]; do
    if docker compose ps "$service" 2>/dev/null | grep -q "healthy"; then
      return 0
    fi
    attempt=$((attempt + 1))
    sleep 2
  done
  return 1
}

deploy_development() {
  log_step "Preparing development environment..."

  if [ ! -f .env ]; then
    cp .env.example .env
    log_info "Created .env from .env.example"
  fi

  log_step "Building and starting all services..."
  docker compose up --build -d

  log_step "Waiting for databases to be ready..."
  for db in postgres redis mongo; do
    if wait_for_healthy "$db"; then
      log_info "$db is healthy"
    else
      log_warn "$db health check timed out (may still be starting)"
    fi
  done

  sleep 5

  log_step "Checking service status..."
  docker compose ps

  echo ""
  echo "=========================================="
  echo "  RZEX Platform is Running!"
  echo "=========================================="
  echo ""
  echo "  Services:"
  echo "    Web UI:             http://localhost:3010"
  echo "    API Gateway:        http://localhost:3000"
  echo "    User Service:       http://localhost:3001"
  echo "    Trading Engine:     http://localhost:3002"
  echo "    Wallet Service:     http://localhost:3003"
  echo "    Market Data:        http://localhost:3004"
  echo "    Notification:       http://localhost:3005"
  echo ""
  echo "  Infrastructure:"
  echo "    PostgreSQL:         localhost:5432"
  echo "    Redis:              localhost:6379"
  echo "    MongoDB:            localhost:27017"
  echo "    Prometheus:         http://localhost:9090"
  echo "    Grafana:            http://localhost:3020 (admin/admin)"
  echo ""
  echo "  Commands:"
  echo "    View logs:          docker compose logs -f [service]"
  echo "    Stop all:           bash scripts/deploy.sh down"
  echo "    Clean (reset):      bash scripts/deploy.sh clean"
  echo "=========================================="
}

deploy_production() {
  log_step "Building production images..."

  for SERVICE in "${SERVICES[@]}"; do
    CONTEXT="./services/$SERVICE"
    IMAGE_NAME="${REGISTRY:+$REGISTRY/}rzex-$SERVICE:$TAG"

    log_info "Building $IMAGE_NAME..."
    docker build -t "$IMAGE_NAME" "$CONTEXT"

    if [ -n "$REGISTRY" ]; then
      log_info "Pushing $IMAGE_NAME..."
      docker push "$IMAGE_NAME"
    fi
  done

  # Build frontend
  FRONTEND_IMAGE="${REGISTRY:+$REGISTRY/}rzex-frontend:$TAG"
  log_info "Building $FRONTEND_IMAGE..."
  docker build -t "$FRONTEND_IMAGE" "./frontend/web"

  if [ -n "$REGISTRY" ]; then
    log_info "Pushing $FRONTEND_IMAGE..."
    docker push "$FRONTEND_IMAGE"
  fi

  log_info "All images built and pushed successfully!"

  # Deploy to Kubernetes if kubectl is available
  if command -v kubectl &>/dev/null; then
    log_step "Deploying to Kubernetes..."

    kubectl apply -f infra/kubernetes/namespace.yml
    kubectl apply -f infra/kubernetes/secrets.yml
    kubectl apply -f infra/kubernetes/databases.yml

    log_info "Waiting for databases..."
    sleep 30

    kubectl apply -f infra/kubernetes/api-gateway.yml
    kubectl apply -f infra/kubernetes/user-service.yml
    kubectl apply -f infra/kubernetes/trading-engine.yml
    kubectl apply -f infra/kubernetes/wallet-service.yml
    kubectl apply -f infra/kubernetes/market-data-service.yml
    kubectl apply -f infra/kubernetes/notification-service.yml
    kubectl apply -f infra/kubernetes/frontend.yml

    log_info "Kubernetes deployment complete!"
    kubectl get pods -n "$KUBE_NAMESPACE"
  else
    log_warn "kubectl not found. Skipping Kubernetes deployment."
    log_info "Images are built and ready for manual deployment."
  fi
}

stop_services() {
  log_step "Stopping all services..."
  docker compose down
  log_info "All services stopped."
}

clean_all() {
  log_warn "Removing all data volumes..."
  read -r -p "Are you sure? This will delete all data. [y/N] " confirm
  if [[ "$confirm" =~ ^[yY]$ ]]; then
    docker compose down -v --remove-orphans
    log_info "Cleanup complete."
  else
    log_info "Cancelled."
  fi
}

show_status() {
  log_step "Service Status:"
  docker compose ps
  echo ""
  log_step "Health Checks:"
  for port in 3000 3001 3002 3003 3004 3005; do
    if curl -s "http://localhost:$port/health" >/dev/null 2>&1; then
      response=$(curl -s "http://localhost:$port/health" | head -c 100)
      log_info "Port $port: $response"
    else
      log_warn "Port $port: Not responding"
    fi
  done
}

show_logs() {
  local service=${2:-""}
  if [ -n "$service" ]; then
    docker compose logs -f "$service"
  else
    docker compose logs -f
  fi
}

# Main
check_prerequisites || exit 1

case $ENVIRONMENT in
  development|dev)     deploy_development ;;
  staging|production)  deploy_production ;;
  down|stop)           stop_services ;;
  clean)               clean_all ;;
  status)              show_status ;;
  logs)                show_logs "$@" ;;
  *)
    echo "Usage: $0 {development|production|down|clean|status|logs [service]}"
    echo ""
    echo "Commands:"
    echo "  development    Start local development environment"
    echo "  production     Build and deploy production images"
    echo "  down           Stop all services"
    echo "  clean          Remove all data and volumes"
    echo "  status         Show service status and health"
    echo "  logs [svc]     View logs (optionally for specific service)"
    exit 1
    ;;
esac
