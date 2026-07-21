#!/usr/bin/env bash
# ==============================================================================
# INSO CODE: Production Deployment Script
# ==============================================================================
# Deploys the platform to one of three GCP deployment tiers:
#   1. cloud   — Cloud Run SaaS (multi-tenant)
#   2. byoc    — Customer-owned GCP project (enterprise)
#   3. airgap  — Air-gapped / classified (no internet egress)
#
# Usage:
#   ./scripts/deploy.sh cloud   [--project PROJECT_ID] [--region REGION]
#   ./scripts/deploy.sh byoc    [--project PROJECT_ID] [--region REGION]
#   ./scripts/deploy.sh airgap  [--project PROJECT_ID] [--region REGION]
#
# Prerequisites:
#   - gcloud CLI authenticated
#   - Docker installed
#   - Artifact Registry repository exists
#   - Service account with required permissions
# ==============================================================================

set -euo pipefail

# ── Defaults ──
DEPLOYMENT_MODE="${1:-cloud}"
PROJECT_ID="${GCP_PROJECT_ID:-}"
REGION="${GCP_REGION:-us-central1}"
REGISTRY="us-central1-docker.pkg.dev"
REPO="alti-registry"
IMAGE_NAME="alti-backend"
TAG="${GITHUB_SHA:-$(git rev-parse --short HEAD 2>/dev/null || echo 'latest')}"
BUILD_DATE=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

# ── Parse flags ──
shift || true
while [[ $# -gt 0 ]]; do
  case $1 in
    --project) PROJECT_ID="$2"; shift 2 ;;
    --region)  REGION="$2"; shift 2 ;;
    --tag)     TAG="$2"; shift 2 ;;
    *) echo "Unknown flag: $1"; exit 1 ;;
  esac
done

if [[ -z "$PROJECT_ID" ]]; then
  echo "❌ GCP_PROJECT_ID is required. Set it via env or --project flag."
  exit 1
fi

FULL_IMAGE="${REGISTRY}/${PROJECT_ID}/${REPO}/${IMAGE_NAME}:${TAG}"

echo "═══════════════════════════════════════════════════════"
echo "  🚀 INSO CODE: Production Deployment"
echo "  📍 Mode:    ${DEPLOYMENT_MODE}"
echo "  📍 Project: ${PROJECT_ID}"
echo "  📍 Region:  ${REGION}"
echo "  📍 Image:   ${FULL_IMAGE}"
echo "  📍 Date:    ${BUILD_DATE}"
echo "═══════════════════════════════════════════════════════"

# ── Step 1: Authenticate ──
echo "🔐 Step 1: Configuring Docker authentication..."
gcloud auth configure-docker "${REGISTRY}" --quiet

# ── Step 2: Build ──
echo "🔨 Step 2: Building production Docker image..."
docker build \
  --build-arg BUILD_SHA="${TAG}" \
  --build-arg BUILD_DATE="${BUILD_DATE}" \
  -t "${FULL_IMAGE}" \
  -f Inso.Code.Backend/Dockerfile \
  .

# ── Step 3: Push to Artifact Registry ──
echo "📦 Step 3: Pushing to Artifact Registry..."
docker push "${FULL_IMAGE}"

# ── Step 4: Deploy based on mode ──
case "${DEPLOYMENT_MODE}" in
  cloud)
    echo "☁️  Step 4: Deploying to Cloud Run (SaaS multi-tenant)..."
    gcloud run deploy inso-code-backend \
      --image "${FULL_IMAGE}" \
      --region "${REGION}" \
      --project "${PROJECT_ID}" \
      --platform managed \
      --port 5000 \
      --cpu 4 \
      --memory 8Gi \
      --min-instances 1 \
      --max-instances 100 \
      --concurrency 80 \
      --timeout 300 \
      --execution-environment gen2 \
      --set-env-vars "NODE_ENV=production,GCP_PROJECT_ID=${PROJECT_ID},GCP_REGION=${REGION},DEPLOYMENT_MODE=cloud,GCP_ENABLE_TRACING=true,GCP_ENABLE_PROFILING=true,GCP_ENABLE_ERROR_REPORTING=true" \
      --vpc-connector "projects/${PROJECT_ID}/locations/${REGION}/connectors/alti-vpc-connector" \
      --vpc-egress private-ranges-only \
      --cpu-boost \
      --session-affinity \
      --allow-unauthenticated \
      --quiet
    ;;

  byoc)
    echo "🏢 Step 4: Deploying to BYOC (enterprise customer project)..."
    # BYOC uses GKE for full control
    echo "   Applying Terraform for customer-isolated infrastructure..."
    cd terraform/enterprise-byoc
    terraform init -input=false
    terraform apply -auto-approve \
      -var="gcp_project_id=${PROJECT_ID}" \
      -var="region=${REGION}" \
      -var="deployment_mode=byoc"
    cd ../..

    echo "   Deploying to GKE cluster..."
    gcloud container clusters get-credentials alti-byoc-cluster \
      --region "${REGION}" \
      --project "${PROJECT_ID}"

    kubectl set image deployment/alti-backend \
      alti-backend="${FULL_IMAGE}" \
      --namespace alti-system

    kubectl rollout status deployment/alti-backend \
      --namespace alti-system \
      --timeout=300s
    ;;

  airgap)
    echo "🔒 Step 4: Deploying to Air-Gap (classified, no egress)..."
    echo "   Applying Terraform for air-gapped infrastructure..."
    cd terraform/air-gap
    terraform init -input=false
    terraform apply -auto-approve \
      -var="gcp_project_id=${PROJECT_ID}" \
      -var="region=${REGION}" \
      -var="deployment_mode=airgap" \
      -var="enable_confidential_compute=true"
    cd ../..

    echo "   Deploying to isolated GKE cluster (private endpoint)..."
    gcloud container clusters get-credentials alti-airgap-cluster \
      --region "${REGION}" \
      --project "${PROJECT_ID}" \
      --internal-ip

    kubectl set image deployment/alti-backend \
      alti-backend="${FULL_IMAGE}" \
      --namespace alti-system

    kubectl rollout status deployment/alti-backend \
      --namespace alti-system \
      --timeout=600s
    ;;

  *)
    echo "❌ Unknown deployment mode: ${DEPLOYMENT_MODE}"
    echo "   Valid modes: cloud, byoc, airgap"
    exit 1
    ;;
esac

# ── Step 5: Post-deploy verification ──
echo "✅ Step 5: Running post-deployment health check..."
sleep 10

case "${DEPLOYMENT_MODE}" in
  cloud)
    SERVICE_URL=$(gcloud run services describe inso-code-backend \
      --region "${REGION}" \
      --project "${PROJECT_ID}" \
      --format="value(status.url)")
    HEALTH_URL="${SERVICE_URL}/healthz"
    ;;
  byoc|airgap)
    HEALTH_URL="http://localhost:5000/healthz"
    echo "   (Health check requires port-forward or internal access)"
    ;;
esac

if [[ -n "${HEALTH_URL:-}" ]]; then
  HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "${HEALTH_URL}" 2>/dev/null || echo "000")
  if [[ "${HTTP_STATUS}" == "200" ]]; then
    echo "✅ Health check passed (HTTP ${HTTP_STATUS})"
  else
    echo "⚠️  Health check returned HTTP ${HTTP_STATUS} — verify manually"
  fi
fi

echo ""
echo "═══════════════════════════════════════════════════════"
echo "  ✅ Deployment complete!"
echo "  📍 Mode:    ${DEPLOYMENT_MODE}"
echo "  📍 Image:   ${FULL_IMAGE}"
echo "  📍 Region:  ${REGION}"
echo "═══════════════════════════════════════════════════════"
