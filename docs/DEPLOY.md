# Inso Code Deployment Guide

## 🚀 Prerequisites
- Docker & Docker Compose
- Node.js 20+
- Redis instance (for caching and queues)
- Valid API keys for GCP Vertex AI, AWS Bedrock, or Azure Foundry

## 📦 Local Development

### Desktop Application
To launch the Inso Code desktop application (which bundles the Next.js frontend and Node.js backend):
```bash
cd Inso.Code.Desktop
npm run dev:desktop
```
*Note: This automatically handles port assignment, backend initialization, and Tauri boot.*

### Web Application (Standalone)
If running outside the desktop container:
```bash
# Backend (Port 5000/5001)
cd Inso.Code.Backend
npm run dev

# Frontend (Port 3001)
cd Inso.Code.Frontend
npm run dev
```

## 🌍 Production Deployment

### 1. Environment Configuration
Copy `.env.example` to `.env` in both `frontend` and `backend` directories. Ensure you configure your multi-cloud AI provider settings (`GCP_PROJECT_ID`, etc.).

### 2. Tri-Cloud Infrastructure
Inso Code supports deploying sovereign AI agent swarms across three major clouds. Use Terraform to provision your target environment:
- **GCP Vertex AI**: Requires `us-central1` regional endpoints.
- **AWS Bedrock**: Provision via the provided AWS CDK/Terraform scripts.
- **Azure Foundry**: Ensure VNet isolation is enabled for sovereign compliance.

### 3. Build & Run (Docker)
We use `docker-compose.prod.yml` for production deployments:
```bash
docker-compose -f docker-compose.prod.yml up --build -d
```

### 4. Verification
- Frontend Application: `http://localhost:3000` (Docker mapped port)
- Backend Health Check: `http://localhost:5000/healthz` (Standardized health endpoint)

## 🔄 CI/CD Pipeline
- **GitHub Actions**: Triggers automatically on push to `main`.
- **The Overseer**: Automates testing, linting, and license compliance checking before build.
