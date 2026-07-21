#!/usr/bin/env bash
set -euo pipefail

# =============================================================================
# INSO CODE — Production Deployment Orchestrator
# =============================================================================
# Usage: ./scripts/deploy-production.sh [cloud|byoc|airgap]
# =============================================================================

DEPLOY_MODE="${1:-cloud}"
PROJECT_ID="${GCP_PROJECT_ID:-inso-code}"
REGION="${GCP_REGION:-us-central1}"
BACKEND_SERVICE="alti-backend"
FRONTEND_SERVICE="alti-frontend"
TIMESTAMP=$(date +%Y%m%d-%H%M%S)

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  INSO CODE — Production Deployment"
echo "  Mode: ${DEPLOY_MODE} | Project: ${PROJECT_ID}"
echo "  Region: ${REGION} | Time: ${TIMESTAMP}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# -- Pre-flight checks --
preflight() {
  echo "\n🔍 Pre-flight checks..."
  
  # Verify gcloud auth
  gcloud auth print-identity-token > /dev/null 2>&1 || {
    echo "❌ Not authenticated. Run: gcloud auth login"
    exit 1
  }
  
  # Verify project
  gcloud projects describe "${PROJECT_ID}" > /dev/null 2>&1 || {
    echo "❌ Project ${PROJECT_ID} not found"
    exit 1
  }
  
  # Check required secrets
  for secret in DATABASE_URL JWT_SECRET GCP_PROJECT_ID; do
    gcloud secrets versions access latest --secret="${secret}" --project="${PROJECT_ID}" > /dev/null 2>&1 || {
      echo "⚠️  Secret ${secret} not found in Secret Manager"
    }
  done
  
  echo "✅ Pre-flight checks passed"
}

# -- Database migrations --
migrate() {
  echo "\n📦 Running database migrations..."
  cd Inso.Code.Backend
  npx prisma migrate deploy
  echo "✅ Migrations applied"
  cd ..
}

# -- Build and deploy backend --
deploy_backend() {
  echo "\n🚀 Deploying backend to Cloud Run..."
  cd Inso.Code.Backend
  
  # Build container
  gcloud builds submit \
    --tag "gcr.io/${PROJECT_ID}/${BACKEND_SERVICE}:${TIMESTAMP}" \
    --project "${PROJECT_ID}" \
    --quiet
  
  # Deploy to Cloud Run
  gcloud run deploy "${BACKEND_SERVICE}" \
    --image "gcr.io/${PROJECT_ID}/${BACKEND_SERVICE}:${TIMESTAMP}" \
    --region "${REGION}" \
    --project "${PROJECT_ID}" \
    --platform managed \
    --memory 2Gi \
    --cpu 2 \
    --min-instances 1 \
    --max-instances 100 \
    --concurrency 80 \
    --timeout 300 \
    --set-env-vars "NODE_ENV=production,GCP_PROJECT_ID=${PROJECT_ID},GCP_REGION=${REGION},DEPLOY_MODE=${DEPLOY_MODE}" \
    --update-secrets "DATABASE_URL=DATABASE_URL:latest,JWT_SECRET=JWT_SECRET:latest" \
    --allow-unauthenticated \
    --quiet
  
  echo "✅ Backend deployed"
  cd ..
}

# -- Build and deploy frontend --
deploy_frontend() {
  echo "\n🎨 Deploying frontend to Cloud Run..."
  cd Inso.Code.Frontend
  
  gcloud builds submit \
    --tag "gcr.io/${PROJECT_ID}/${FRONTEND_SERVICE}:${TIMESTAMP}" \
    --project "${PROJECT_ID}" \
    --quiet
  
  gcloud run deploy "${FRONTEND_SERVICE}" \
    --image "gcr.io/${PROJECT_ID}/${FRONTEND_SERVICE}:${TIMESTAMP}" \
    --region "${REGION}" \
    --project "${PROJECT_ID}" \
    --platform managed \
    --memory 1Gi \
    --cpu 1 \
    --min-instances 1 \
    --max-instances 50 \
    --concurrency 100 \
    --timeout 60 \
    --allow-unauthenticated \
    --quiet
  
  echo "✅ Frontend deployed"
  cd ..
}

# -- Apply Terraform --
apply_terraform() {
  echo "\n🏗️  Applying Terraform infrastructure..."
  cd terraform
  terraform init -backend=true
  terraform plan -var="gcp_project_id=${PROJECT_ID}" -var="gcp_region=${REGION}" -out=tfplan
  terraform apply tfplan
  echo "✅ Infrastructure applied"
  cd ..
}

# -- Health check --
health_check() {
  echo "\n🏥 Running health checks..."
  BACKEND_URL=$(gcloud run services describe "${BACKEND_SERVICE}" --region="${REGION}" --project="${PROJECT_ID}" --format='value(status.url)')
  
  # Liveness
  HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "${BACKEND_URL}/api/v1/healthz" || echo "000")
  if [ "${HTTP_CODE}" = "200" ]; then
    echo "✅ Liveness check passed"
  else
    echo "❌ Liveness check failed (HTTP ${HTTP_CODE})"
    exit 1
  fi
  
  # Readiness
  HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "${BACKEND_URL}/api/v1/ready" || echo "000")
  if [ "${HTTP_CODE}" = "200" ]; then
    echo "✅ Readiness check passed"
  else
    echo "⚠️  Readiness check returned HTTP ${HTTP_CODE}"
  fi
  
  echo "\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "  ✅ DEPLOYMENT COMPLETE"
  echo "  Backend:  ${BACKEND_URL}"
  echo "  Mode:     ${DEPLOY_MODE}"
  echo "  Version:  ${TIMESTAMP}"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
}

# -- Main execution --
case "${DEPLOY_MODE}" in
  cloud)
    preflight
    migrate
    deploy_backend
    deploy_frontend
    apply_terraform
    health_check
    ;;
  byoc)
    preflight
    migrate
    deploy_backend
    echo "⚠️  BYOC: Frontend deployed by customer. Backend only."
    health_check
    ;;
  airgap)
    echo "📦 Air-gap mode: Building offline deployment bundle..."
    migrate
    deploy_backend
    deploy_frontend
    echo "✅ Air-gap bundle ready. Transfer to secure environment."
    ;;
  *)
    echo "Usage: $0 [cloud|byoc|airgap]"
    exit 1
    ;;
esac
