# RZEX Deployment Guide

## Local Development

### Prerequisites
- Docker Desktop or Docker Engine + Docker Compose V2
- Node.js >= 18 (for frontend development)

### Quick Start
```bash
git clone https://github.com/ali963git/rzex.git
cd rzex
bash scripts/deploy.sh development
```

### Individual Service Development
```bash
# Start only databases
docker compose up -d postgres redis mongo

# Run a specific service locally
cd services/user-service
npm install
npm run dev
```

---

## Production Deployment

### Docker Registry Setup

1. Set your registry:
```bash
export DOCKER_REGISTRY=your-registry.com/rzex
export DOCKER_TAG=v1.0.0
```

2. Build and push all images:
```bash
bash scripts/deploy.sh production
```

### Kubernetes Deployment

#### Prerequisites
- A Kubernetes cluster (EKS, GKE, AKS, or self-managed)
- `kubectl` configured to point to your cluster
- A container registry with your images

#### Steps

1. **Create namespace and secrets:**
```bash
kubectl apply -f infra/kubernetes/namespace.yml

# Edit secrets with real values before applying
vim infra/kubernetes/secrets.yml
kubectl apply -f infra/kubernetes/secrets.yml
```

2. **Deploy databases:**
```bash
kubectl apply -f infra/kubernetes/databases.yml
# Wait for databases to be ready
kubectl wait --for=condition=ready pod -l app=postgres -n rzex --timeout=120s
```

3. **Deploy services:**
```bash
kubectl apply -f infra/kubernetes/user-service.yml
kubectl apply -f infra/kubernetes/trading-engine.yml
kubectl apply -f infra/kubernetes/wallet-service.yml
kubectl apply -f infra/kubernetes/market-data-service.yml
kubectl apply -f infra/kubernetes/notification-service.yml
kubectl apply -f infra/kubernetes/api-gateway.yml
kubectl apply -f infra/kubernetes/frontend.yml
```

4. **Verify deployment:**
```bash
kubectl get pods -n rzex
kubectl get services -n rzex
```

### AWS EKS Deployment

```bash
# Create cluster
eksctl create cluster \
  --name rzex \
  --region us-east-1 \
  --nodegroup-name standard \
  --node-type t3.medium \
  --nodes 3

# Install ingress controller
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.8.2/deploy/static/provider/aws/deploy.yaml

# Deploy RZEX
bash scripts/deploy.sh production
```

---

## Configuration

### Environment Variables

See `.env.example` for all available variables. Key production variables:

| Variable | Description | Required |
|----------|-------------|----------|
| JWT_SECRET | Secret for JWT signing | Yes |
| POSTGRES_PASSWORD | Database password | Yes |
| REDIS_PASSWORD | Redis password | Recommended |
| MONGO_PASSWORD | MongoDB password | Yes |

### SSL/TLS

For production, configure TLS in the Kubernetes ingress:

1. Install cert-manager:
```bash
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.13.3/cert-manager.yaml
```

2. The ingress configuration in `infra/kubernetes/frontend.yml` already includes TLS settings.

---

## Monitoring

### Prometheus
- Automatically scrapes all service health endpoints
- Configuration: `infra/monitoring/prometheus/prometheus.yml`
- Access: http://localhost:9090 (dev) or via port-forward in K8s

### Grafana
- Pre-configured dashboards for system overview
- Default credentials: admin/admin (change in production!)
- Configuration: `infra/monitoring/grafana/dashboards/`

---

## Backup Strategy

### PostgreSQL
```bash
# Manual backup
docker exec rzex-postgres pg_dump -U rzex rzex > backup_$(date +%Y%m%d).sql

# Restore
cat backup.sql | docker exec -i rzex-postgres psql -U rzex rzex
```

### MongoDB
```bash
docker exec rzex-mongo mongodump --out /tmp/backup
docker cp rzex-mongo:/tmp/backup ./mongo-backup
```

---

## Troubleshooting

### Service not starting
```bash
# Check logs
docker compose logs -f <service-name>

# Check health
curl http://localhost:<port>/health
```

### Database connection issues
```bash
# Verify database is running
docker compose ps postgres redis mongo

# Test connection
docker exec rzex-postgres psql -U rzex -c "SELECT 1"
```

### Port conflicts
If ports are already in use, modify `docker-compose.yml` or set custom ports in `.env`.
