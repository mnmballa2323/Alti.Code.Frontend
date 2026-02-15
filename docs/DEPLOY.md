# Alti.Code.Studio Deployment Guide

## 🚀 Prerequisites
-   Docker & Docker Compose
-   Node.js 20+
-   Redis instance

## 📦 Deployment Steps

### 1. Update Submodules
Ensure you are deploying the latest stable commits.
```bash
git submodule update --init --recursive
```

### 2. Environment Configuration
Copy `.env.example` to `.env` in both `frontend` and `backend` directories and populate secrets.

### 3. Build & Run (Docker)
```bash
docker-compose up --build -d
```

### 4. Verification
-   Frontend: `http://localhost:3000`
-   Backend Health: `http://localhost:5000/health` (or equivalent endpoint)

## 🔄 CI/CD Pipeline
-   **GitHub Actions**: Triggers on push to `main`.
-   **The Overseer**: Automates testing and linting before build.
