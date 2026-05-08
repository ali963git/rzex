# 🚀 RZEX - منصة تداول العملات الرقمية الاحترافية

[![Node.js](https://img.shields.io/badge/Node.js-18+-green)](https://nodejs.org/)
[![Docker](https://img.shields.io/badge/Docker-Compose-blue)](https://www.docker.com/)
[![Kubernetes](https://img.shields.io/badge/Kubernetes-Ready-blueviolet)](https://kubernetes.io/)
[![License](https://img.shields.io/badge/License-MIT-yellow)](LICENSE)

## 📋 نظرة عامة

RZEX منصة تداول عملات رقمية احترافية مع معمارية Microservices حديثة وآمنة. تتضمن:

- ⚡ محرك تداول عالي الأداء
- 🔐 إدارة محافظ آمنة
- 📊 بيانات سوق حقيقية
- 🎨 واجهة مستخدم احترافية
- 📱 تطبيق جوال متقدم
- 🔄 CI/CD جاهز للإنتاج
- 📈 مراقبة وتحليلات شاملة

## 🏗️ البنية التقنية

```
RZEX/
├── backend/
│   ├── services/
│   │   ├── user-service/
│   │   ├── trading-engine/
│   │   ├── wallet-service/
│   │   ├── market-data/
│   │   └── notification/
│   ├── api-gateway/
│   ├── shared/
│   └── infra/
├── frontend/
├── mobile/
├── infrastructure/
├── docs/
└── scripts/
```

## 🚀 البدء السريع

### المتطلبات
- Docker & Docker Compose
- Node.js 18+
- Git
- PostgreSQL 15+
- Redis 7+

### التثبيت

```bash
# Clone the repository
git clone https://github.com/ali963git/rzex.git
cd rzex

# Setup environment
cp .env.example .env

# Start services
docker-compose up -d

# Initialize database
sh scripts/init-db.sh
```

### ��لوصول للخدمات

- 🌐 **API Gateway**: http://localhost:3000
- 📊 **User Service**: http://localhost:3001
- ⚡ **Trading Engine**: http://localhost:3002
- 📈 **Market Data**: http://localhost:3003
- 🔐 **Wallet Service**: http://localhost:3004
- 📱 **Web App**: http://localhost:3010
- 🎨 **Admin Dashboard**: http://localhost:3011

## 📚 الخدمات الرئيسية

### 1. User Service
إدارة المستخدمين والمصادقة والتحقق من الهوية

### 2. Trading Engine
محرك التداول عالي الأداء مع matching engine متقدم

### 3. Wallet Service
إدارة المحافظ والإيداعات والسحوبات

### 4. Market Data Service
بيانات السوق والأسعار والرسوم البيانية

## 🔐 الأمان

- ✅ JWT Authentication
- ✅ 2FA Support
- ✅ AES Encryption
- ✅ Rate Limiting
- ✅ DDoS Protection
- ✅ SQL Injection Prevention

## 📊 المراقبة

- Prometheus + Grafana
- ELK Stack
- Distributed Tracing
- Real-time Alerts

## 🧪 الاختبار

```bash
# Run all tests
npm run test

# Run with coverage
npm run test:coverage

# Run specific service tests
cd backend/services/trading-engine && npm test
```

## 📦 النشر

### محلي
```bash
docker-compose up -d
```

### Kubernetes
```bash
kubectl apply -f infrastructure/kubernetes/
```

### AWS
```bash
sh scripts/deploy-aws.sh
```

## 📖 التوثيق

- [API Documentation](./docs/API.md)
- [Architecture](./docs/ARCHITECTURE.md)
- [Setup Guide](./docs/SETUP.md)
- [Development Guide](./docs/DEVELOPMENT.md)

## 🤝 المساهمة

```bash
# Create feature branch
git checkout -b feature/your-feature

# Make changes and commit
git add .
git commit -m "feat: add your feature"

# Push and create PR
git push origin feature/your-feature
```

## 📄 الترخيص

هذا المشروع مرخص تحت MIT License - انظر [LICENSE](LICENSE) للتفاصيل.

## 📧 التواصل

- GitHub: [@ali963git](https://github.com/ali963git)
- Email: contact@rzex.io

---

**تم التطوير بـ ❤️ من قبل فريق RZEX**
