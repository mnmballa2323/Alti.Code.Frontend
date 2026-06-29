#!/bin/bash
# ==============================================================================
# ALTI CODE STUDIO: GCP IAM & WORKLOAD IDENTITY FEDERATION SETUP
# ==============================================================================
# Automates the setup of Google Cloud IAM permissions, Service Accounts,
# and Workload Identity Federation for GitHub Actions deployments.
# ==============================================================================

set -e

# Color definitions
CYAN='\033[0;36m'
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${CYAN}================================================================${NC}"
echo -e "${CYAN} 🔐 ALTI CODE STUDIO: GCP IAM & WORKLOAD IDENTITY AUTO-SETUP     🔐 ${NC}"
echo -e "${CYAN}================================================================${NC}"

# Read GCP Project ID
PROJECT_ID=$(gcloud config get-value project 2>/dev/null || echo "")
if [ -z "$PROJECT_ID" ]; then
  read -rp "Enter target Google Cloud Project ID: " PROJECT_ID
fi

if [ -z "$PROJECT_ID" ]; then
  echo -e "${RED}❌ Error: Project ID is required. Exiting.${NC}"
  exit 1
fi

# Define naming variables
SERVICE_ACCOUNT_NAME="github-actions-deployer"
SERVICE_ACCOUNT_EMAIL="${SERVICE_ACCOUNT_NAME}@${PROJECT_ID}.iam.gserviceaccount.com"
POOL_NAME="github-actions-pool"
PROVIDER_NAME="github-actions-provider"
REPO_PATH="mnmballa2323/alti.code.studio" # Target Repository

echo -e "\n[1/5] ${YELLOW}Enabling Google Cloud IAM Credentials & STS APIs...${NC}"
gcloud services enable iamcredentials.googleapis.com --project="$PROJECT_ID"
gcloud services enable sts.googleapis.com --project="$PROJECT_ID"
echo -e "${GREEN}✔ Service APIs enabled successfully.${NC}"

echo -e "\n[2/5] ${YELLOW}Provisioning Deployer Service Account [${SERVICE_ACCOUNT_NAME}]...${NC}"
if gcloud iam service-accounts describe "$SERVICE_ACCOUNT_EMAIL" --project="$PROJECT_ID" &>/dev/null; then
  echo -e "${GREEN}✔ Service account already exists.${NC}"
else
  gcloud iam service-accounts create "$SERVICE_ACCOUNT_NAME" \
      --description="Deployer for Alti Code Studio via GitHub Actions" \
      --display-name="GitHub Actions Deployer" \
      --project="$PROJECT_ID"
  echo -e "${GREEN}✔ Service account created successfully.${NC}"
fi

echo -e "\n[3/5] ${YELLOW}Binding Administrator IAM Roles...${NC}"
ROLES=(
  "roles/compute.admin"
  "roles/cloudsql.admin"
  "roles/redis.admin"
  "roles/securesourcemanager.admin"
  "roles/cloudkms.admin"
  "roles/iam.serviceAccountUser"
  "roles/securityAdmin"
)

for role in "${ROLES[@]}"; do
  echo -e "Binding role: ${CYAN}$role${NC}..."
  gcloud projects add-iam-policy-binding "$PROJECT_ID" \
      --member="serviceAccount:$SERVICE_ACCOUNT_EMAIL" \
      --role="$role" \
      --no-user-output-enabled &>/dev/null
done
echo -e "${GREEN}✔ All IAM roles successfully bound to service account.${NC}"

echo -e "\n[4/5] ${YELLOW}Configuring Workload Identity Pool and Provider...${NC}"

# Create Workload Identity Pool
if gcloud iam workload-identity-pools describe "$POOL_NAME" --location="global" --project="$PROJECT_ID" &>/dev/null; then
  echo -e "${GREEN}✔ Workload Identity Pool [${POOL_NAME}] already exists.${NC}"
else
  gcloud iam workload-identity-pools create "$POOL_NAME" \
      --location="global" \
      --description="GitHub Actions Identity Pool" \
      --display-name="GitHub Actions Pool" \
      --project="$PROJECT_ID"
  echo -e "${GREEN}✔ Workload Identity Pool created successfully.${NC}"
fi

# Get Pool ID
POOL_ID=$(gcloud iam workload-identity-pools describe "$POOL_NAME" \
    --location="global" \
    --project="$PROJECT_ID" \
    --format="value(name)")

# Create Workload Identity Provider
if gcloud iam workload-identity-pools providers describe "$PROVIDER_NAME" \
    --workload-identity-pool="$POOL_NAME" \
    --location="global" \
    --project="$PROJECT_ID" &>/dev/null; then
  echo -e "${GREEN}✔ Workload Identity Provider [${PROVIDER_NAME}] already exists.${NC}"
else
  gcloud iam workload-identity-pools providers create-oidc "$PROVIDER_NAME" \
      --workload-identity-pool="$POOL_NAME" \
      --location="global" \
      --issuer-uri="https://token.actions.githubusercontent.com" \
      --attribute-mapping="google.subject=assertion.sub,attribute.actor=assertion.actor,attribute.repository=assertion.repository" \
      --attribute-condition="assertion.repository == '$REPO_PATH'" \
      --display-name="GitHub Actions Provider" \
      --project="$PROJECT_ID"
  echo -e "${GREEN}✔ Workload Identity Provider created successfully.${NC}"
fi

# Get Provider ID
PROVIDER_ID=$(gcloud iam workload-identity-pools providers describe "$PROVIDER_NAME" \
    --workload-identity-pool="$POOL_NAME" \
    --location="global" \
    --project="$PROJECT_ID" \
    --format="value(name)")

echo -e "\n[5/5] ${YELLOW}Binding OIDC Identity Policy to Service Account...${NC}"
gcloud iam service-accounts add-iam-policy-binding "$SERVICE_ACCOUNT_EMAIL" \
    --role="roles/iam.workloadIdentityUser" \
    --member="principalSet://iam.googleapis.com/${POOL_ID}/attribute.repository/${REPO_PATH}" \
    --project="$PROJECT_ID" \
    --no-user-output-enabled
echo -e "${GREEN}✔ OIDC workload identity policy successfully bound.${NC}"

echo -e "\n${GREEN}🎉 GCP SOVEREIGN DEPLOYMENT ENVIRONMENT READY!${NC}"
echo -e "Copy the following parameter configurations into your GitHub repository secrets and workflow config:"
echo -e "--------------------------------------------------------------------------------"
echo -e "  Workload Provider: ${CYAN}${PROVIDER_ID}${NC}"
echo -e "  Service Account:   ${CYAN}${SERVICE_ACCOUNT_EMAIL}${NC}"
echo -e "--------------------------------------------------------------------------------"
