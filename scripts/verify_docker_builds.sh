#!/usr/bin/env bash
# ==============================================================================
# INSO CODE - LOCAL CI/CD DOCKER BUILD VERIFICATION
# ==============================================================================
# This script simulates the CI/CD pipeline building the container images
# for the frontend and backend using the new branding.

set -e

echo "🚀 Starting Inso Code CI/CD Docker Build Verification..."

# 1. Build Backend
echo "📦 Building Backend Image (inso-code-backend:latest)..."
docker build -t inso-code-backend:latest -f Inso.Code.Backend/Dockerfile .

# 2. Build Frontend
echo "📦 Building Frontend Image (inso-code-frontend:latest)..."
docker build -t inso-code-frontend:latest -f Inso.Code.Frontend/Dockerfile Inso.Code.Frontend/

echo "✅ Docker builds completed successfully!"
echo "Next step: Push to Sovereign Container Registry."
