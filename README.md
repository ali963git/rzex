# RZEX - Cryptocurrency Trading Platform

Full-stack microservices platform with Gateway, Auth (2FA), Wallet, Matching Engine, Market Data, Security Monitoring, React Frontend, Terraform & Kubernetes deployment.

## Quick Start (Development)
1. docker-compose up --build
2. Open http://localhost:3000

## Production
- Terraform infrastructure in `terraform/`
- Kubernetes manifests in `k8s/`
- CI/CD: `.github/workflows/deploy.yml`