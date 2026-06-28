#!/bin/bash
# ==============================================================================
# ALTI CODE STUDIO: GCP SOVEREIGN ENTERPRISE DEPLOYER (ADVANCED)
# ==============================================================================
# Provisions Enterprise deployments exclusively on Google Cloud Platform (GCP).
# Supports GCP Commercial, GCP Dedicated (Sole-Tenant), and GCP Government.
# ==============================================================================

set -e

# Color definitions
CYAN='\033[0;36m'
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${CYAN}================================================================${NC}"
echo -e "${CYAN} 🌍 ALTI CODE STUDIO: GCP SOVEREIGN ENTERPRISE DEPLOYER        🌍 ${NC}"
echo -e "${CYAN}================================================================${NC}"

# Default variables
DEPLOY_OPTION=""
CUSTOMER="enterprise-tenant"
REGION=""
DRY_RUN=false
SSH_KEY_PATH="~/.ssh/id_rsa.pub"
PLAN_ONLY=false
AUTO_APPROVE=false
GCP_PROJECT=""

usage() {
  echo -e "Usage: ./deploy_enterprise.sh [options]"
  echo -e "Options:"
  echo -e "  --deployment-option <cloud|dedicated|government>  Target deployment tier"
  echo -e "  --customer <name>                                 Unique name of the enterprise tenant"
  echo -e "  --region <region>                                 Target GCP region for deployment"
  echo -e "  --project <project_id>                            Google Cloud Project ID"
  echo -e "  --ssh-key-path <path>                             Path to public SSH key (default: ~/.ssh/id_rsa.pub)"
  echo -e "  --plan-only                                       Run terraform plan without applying changes"
  echo -e "  --auto-approve                                    Bypass interactive prompts during apply"
  echo -e "  --dry-run                                         Simulate deployment steps without calling APIs"
  echo -e "  --help                                            Display this message"
  exit 1
}

# Parse command line options
while [[ "$#" -gt 0 ]]; do
  case $1 in
    --deployment-option) DEPLOY_OPTION="$2"; shift ;;
    --customer) CUSTOMER="$2"; shift ;;
    --region) REGION="$2"; shift ;;
    --project) GCP_PROJECT="$2"; shift ;;
    --ssh-key-path) SSH_KEY_PATH="$2"; shift ;;
    --plan-only) PLAN_ONLY=true ;;
    --auto-approve) AUTO_APPROVE=true ;;
    --dry-run) DRY_RUN=true ;;
    --help) usage ;;
    *) echo "Unknown parameter: $1"; usage ;;
  esac
  shift
done

# Load environment file if exists
if [ -f .env ]; then
  echo -e "${GREEN}✔ Loading credentials from local git-ignored .env file...${NC}"
  set -a
  source .env
  set +a
fi

# Pre-flight check: SSH key validation & auto-generation
eval SSH_KEY_PATH_EXPANDED="$SSH_KEY_PATH"

if [ ! -f "$SSH_KEY_PATH_EXPANDED" ] && [ "$DRY_RUN" != true ]; then
  if [ "$AUTO_APPROVE" = true ]; then
    echo -e "${YELLOW}⚠️ SSH Public Key not found. Auto-generating new SSH key pair...${NC}"
    mkdir -p "$(dirname "$SSH_KEY_PATH_EXPANDED")"
    ssh-keygen -t rsa -b 4096 -f "${SSH_KEY_PATH_EXPANDED%.pub}" -N "" -q
    echo -e "${GREEN}✔ SSH Key successfully generated at $SSH_KEY_PATH${NC}"
  else
    echo -e "\n${YELLOW}⚠️ WARNING: SSH Public Key not found at $SSH_KEY_PATH${NC}"
    echo -e "Choose an option:"
    echo -e "  [1] Auto-generate a new 4096-bit RSA SSH key pair (Recommended)"
    echo -e "  [2] Enter a custom path to your existing SSH public key"
    echo -e "  [3] Skip key check"
    read -rp "Selection (1-3): " key_choice
    case $key_choice in
      1)
        echo -e "Generating SSH key pair..."
        mkdir -p "$(dirname "$SSH_KEY_PATH_EXPANDED")"
        ssh-keygen -t rsa -b 4096 -f "${SSH_KEY_PATH_EXPANDED%.pub}" -N "" -q
        echo -e "${GREEN}✔ SSH Key successfully generated at $SSH_KEY_PATH${NC}"
        ;;
      2)
        read -rp "Enter path to SSH public key: " custom_key_path
        eval custom_key_path_expanded="$custom_key_path"
        if [ -f "$custom_key_path_expanded" ]; then
          SSH_KEY_PATH="$custom_key_path"
          SSH_KEY_PATH_EXPANDED="$custom_key_path_expanded"
          echo -e "${GREEN}✔ Using key: $SSH_KEY_PATH${NC}"
        else
          echo -e "${RED}❌ ERROR: File not found. Proceeding with default path.${NC}"
        fi
        ;;
      *)
        echo -e "Proceeding without generating key."
        ;;
    esac
  fi
fi

# Determine Deployment Option interactively if not provided
if [ -z "$DEPLOY_OPTION" ]; then
  if [ "$AUTO_APPROVE" = true ]; then
    echo -e "${YELLOW}⚠️ No deployment option specified. Defaulting to 'cloud' (Commercial Cloud)...${NC}"
    DEPLOY_OPTION="cloud"
  else
    echo -e "\n${YELLOW}Select Enterprise Deployment Option:${NC}"
    echo -e "  [1] ${CYAN}GCP Cloud${NC}     - Commercial multi-tenant deployment"
    echo -e "  [2] ${CYAN}GCP Dedicated${NC} - Single-tenant deployment on physical Sole-Tenant Hosts"
    echo -e "  [3] ${CYAN}GCP Government${NC}- FedRAMP High / Assured Workloads compliance"
    read -rp "Selection (1-3): " option_choice
    case $option_choice in
      1) DEPLOY_OPTION="cloud" ;;
      2) DEPLOY_OPTION="dedicated" ;;
      3) DEPLOY_OPTION="government" ;;
      *) echo -e "${RED}Invalid selection. Exiting.${NC}"; exit 1 ;;
    esac
  fi
fi

# Determine GCP Region interactively if not provided
if [ -z "$REGION" ]; then
  if [ "$AUTO_APPROVE" = true ]; then
    if [ "$DEPLOY_OPTION" = "government" ]; then
      REGION="us-gov-west1"
    else
      REGION="us-central1"
    fi
    echo -e "${YELLOW}⚠️ No region specified. Defaulting to '$REGION'...${NC}"
  else
    if [ "$DEPLOY_OPTION" = "government" ]; then
      echo -e "\n${YELLOW}Select GCP Government/Assured Region:${NC}"
      echo -e "  [1] us-gov-west1 (Oregon)"
      echo -e "  [2] us-east4 (Virginia)"
      echo -e "  [3] us-central1 (Iowa)"
      echo -e "  [4] Custom Gov Region"
      read -rp "Selection (1-4): " reg_choice
      case $reg_choice in
        1) REGION="us-gov-west1" ;;
        2) REGION="us-east4" ;;
        3) REGION="us-central1" ;;
        4) read -rp "Enter GCP region code: " REGION ;;
        *) echo -e "${RED}Invalid selection. Exiting.${NC}"; exit 1 ;;
      esac
    else
      echo -e "\n${YELLOW}Select GCP Commercial Region:${NC}"
      echo -e "  [1] us-central1 (Iowa)"
      echo -e "  [2] us-east1 (South Carolina)"
      echo -e "  [3] europe-west1 (Belgium)"
      echo -e "  [4] asia-east1 (Taiwan)"
      echo -e "  [5] Custom Region"
      read -rp "Selection (1-5): " reg_choice
      case $reg_choice in
        1) REGION="us-central1" ;;
        2) REGION="us-east1" ;;
        3) REGION="europe-west1" ;;
        4) REGION="asia-east1" ;;
        5) read -rp "Enter GCP region code: " REGION ;;
        *) echo -e "${RED}Invalid selection. Exiting.${NC}"; exit 1 ;;
      esac
    fi
  fi
fi

# Set display names
case $DEPLOY_OPTION in
  cloud) TIER_NAME="GCP Commercial Cloud" ;;
  dedicated) TIER_NAME="GCP Dedicated (Sole-Tenant)" ;;
  government) TIER_NAME="GCP Government (Assured Workloads)" ;;
esac

# Pre-flight Check: Google Cloud Credentials
if [ "$DRY_RUN" = true ]; then
  echo -e "\n${YELLOW}[DRY RUN] Simulating GCP Sovereign deployment...${NC}"
  echo -e "Parameters to pass to Terraform:"
  echo -e "  -var=\"customer_id=${CUSTOMER}\""
  echo -e "  -var=\"gcp_project_id=${GCP_PROJECT:-gcp-project-placeholder}\""
  echo -e "  -var=\"ssh_public_key_path=${SSH_KEY_PATH}\""
  if [ "$DEPLOY_OPTION" = "government" ]; then
    echo -e "  -var=\"gcp_region_government=${REGION}\""
    echo -e "  -var=\"enable_gcp_cloud=false\""
    echo -e "  -var=\"enable_gcp_dedicated=false\""
    echo -e "  -var=\"enable_gcp_government=true\""
    echo -e "  -var=\"pg_db_tier=db-custom-4-16384\""
    echo -e "  -var=\"redis_tier=STANDARD_HA\""
    echo -e "  -var=\"redis_memory_size_gb=5\""
    echo -e "  -var=\"waf_rate_limit_count=1000\""
    echo -e "  -var=\"waf_rate_limit_interval=60\""
    echo -e "  -var=\"enable_confidential_compute=true\""
  elif [ "$DEPLOY_OPTION" = "cloud" ]; then
    echo -e "  -var=\"gcp_region_commercial=${REGION}\""
    echo -e "  -var=\"enable_gcp_cloud=true\""
    echo -e "  -var=\"enable_gcp_dedicated=false\""
    echo -e "  -var=\"enable_gcp_government=false\""
    echo -e "  -var=\"pg_db_tier=db-custom-2-7680\""
    echo -e "  -var=\"redis_tier=BASIC\""
    echo -e "  -var=\"redis_memory_size_gb=1\""
    echo -e "  -var=\"waf_rate_limit_count=100\""
    echo -e "  -var=\"waf_rate_limit_interval=60\""
    echo -e "  -var=\"enable_confidential_compute=false\""
  elif [ "$DEPLOY_OPTION" = "dedicated" ]; then
    echo -e "  -var=\"gcp_region_commercial=${REGION}\""
    echo -e "  -var=\"enable_gcp_cloud=false\""
    echo -e "  -var=\"enable_gcp_dedicated=true\""
    echo -e "  -var=\"enable_gcp_government=false\""
    echo -e "  -var=\"pg_db_tier=db-custom-4-16384\""
    echo -e "  -var=\"redis_tier=STANDARD_HA\""
    echo -e "  -var=\"redis_memory_size_gb=5\""
    echo -e "  -var=\"waf_rate_limit_count=1000\""
    echo -e "  -var=\"waf_rate_limit_interval=60\""
    echo -e "  -var=\"enable_confidential_compute=true\""
  fi
  exit 0
fi

echo -e "\n[1/3] ${YELLOW}Validating Google Cloud credentials for $DEPLOY_OPTION...${NC}"

# Verify active project and credentials
if [ -z "$GCP_PROJECT" ]; then
  # Try to read default project from gcloud configuration
  GCP_PROJECT=$(gcloud config get-value project 2>/dev/null || echo "")
  if [ -z "$GCP_PROJECT" ]; then
    read -rp "Enter target Google Cloud Project ID: " GCP_PROJECT
  fi
fi

if [ -n "$GOOGLE_APPLICATION_CREDENTIALS" ]; then
  echo -e "${GREEN}✔ GOOGLE_APPLICATION_CREDENTIALS detected. Using environment service account authentication.${NC}"
else
  # Verify CLI login
  ACTIVE_ACCOUNT=$(gcloud auth list --filter=status=ACTIVE --format="value(account)" 2>/dev/null || echo "")
  if [ -z "$ACTIVE_ACCOUNT" ]; then
    echo -e "${YELLOW}⚠️ No active Google Cloud account detected. Initiating login...${NC}"
    gcloud auth login
  else
    echo -e "${GREEN}✔ Authenticated as GCP Account: ${CYAN}$ACTIVE_ACCOUNT${NC}"
  fi
fi

echo -e "${GREEN}✔ Target Project ID configured: ${CYAN}$GCP_PROJECT${NC}"

echo -e "\n[2/3] ${YELLOW}Executing Terraform IaC for GCP $DEPLOY_OPTION...${NC}"
TF_DIR="terraform"
cd "$TF_DIR"

terraform init

# Build variables array
TF_VARS=(
  -var="customer_id=$CUSTOMER"
  -var="gcp_project_id=$GCP_PROJECT"
  -var="ssh_public_key_path=$SSH_KEY_PATH"
)

if [ "$DEPLOY_OPTION" = "government" ]; then
  TF_VARS+=(
    -var="gcp_region_government=$REGION"
    -var="enable_gcp_cloud=false"
    -var="enable_gcp_dedicated=false"
    -var="enable_gcp_government=true"
    -var="pg_db_tier=db-custom-4-16384"
    -var="redis_tier=STANDARD_HA"
    -var="redis_memory_size_gb=5"
    -var="waf_rate_limit_count=1000"
    -var="waf_rate_limit_interval=60"
    -var="enable_confidential_compute=true"
  )
elif [ "$DEPLOY_OPTION" = "cloud" ]; then
  TF_VARS+=(
    -var="gcp_region_commercial=$REGION"
    -var="enable_gcp_cloud=true"
    -var="enable_gcp_dedicated=false"
    -var="enable_gcp_government=false"
    -var="pg_db_tier=db-custom-2-7680"
    -var="redis_tier=BASIC"
    -var="redis_memory_size_gb=1"
    -var="waf_rate_limit_count=100"
    -var="waf_rate_limit_interval=60"
    -var="enable_confidential_compute=false"
  )
elif [ "$DEPLOY_OPTION" = "dedicated" ]; then
  TF_VARS+=(
    -var="gcp_region_commercial=$REGION"
    -var="enable_gcp_cloud=false"
    -var="enable_gcp_dedicated=true"
    -var="enable_gcp_government=false"
    -var="pg_db_tier=db-custom-4-16384"
    -var="redis_tier=STANDARD_HA"
    -var="redis_memory_size_gb=5"
    -var="waf_rate_limit_count=1000"
    -var="waf_rate_limit_interval=60"
    -var="enable_confidential_compute=true"
  )
fi

if [ "$PLAN_ONLY" = true ]; then
  echo -e "\n${CYAN}Running Terraform Plan...${NC}"
  terraform plan "${TF_VARS[@]}"
  cd ..
  exit 0
fi

if [ "$AUTO_APPROVE" != true ]; then
  echo -e "\n${CYAN}Running Terraform Plan for preview...${NC}"
  terraform plan "${TF_VARS[@]}"
  
  echo -e "\n${YELLOW}⚠️ Review the plan above.${NC}"
  read -rp "Do you want to apply these changes? (y/N): " confirm_apply
  if [[ ! "$confirm_apply" =~ ^[Yy]$ ]]; then
    echo -e "\n${YELLOW}Deployment cancelled by user.${NC}"
    cd ..
    exit 0
  fi
fi

echo -e "\n${GREEN}Applying Terraform changes...${NC}"
terraform apply "${TF_VARS[@]}" -auto-approve

echo -e "\n[3/4] ${YELLOW}Post-Deployment Database Bootstrapping...${NC}"
POSTGRES_IP=$(terraform output -raw commercial_postgres_ip 2>/dev/null || echo "")

if [ -z "$POSTGRES_IP" ] || [ "$POSTGRES_IP" = "null" ]; then
  POSTGRES_IP=$(terraform output -raw government_postgres_ip 2>/dev/null || echo "")
fi

MIGRATION_STATUS="Skipped (No database host discovered)"
if [ -n "$POSTGRES_IP" ] && [ "$POSTGRES_IP" != "null" ]; then
  echo -e "${GREEN}✔ PostgreSQL database host discovered at private IP: ${CYAN}$POSTGRES_IP${NC}"
  echo -e "Configuring backend database connection string..."
  
  export DATABASE_URL="postgresql://${pg_admin_username:-altipgadmin}:${pg_admin_password:-P@ssw0rd1234!}@${POSTGRES_IP}:5432/pentagidb?schema=public"
  
  # Navigate to the backend directory and run prisma schema synchronization
  cd ../alti.code.studio.backend
  if [ "$DRY_RUN" != true ]; then
    echo -e "Executing Prisma db push to sync database schema..."
    if npx prisma db push --accept-data-loss; then
      MIGRATION_STATUS="Success (Schema synced via Prisma)"
      echo -e "${GREEN}✔ Database schema successfully bootstrapped!${NC}"
    else
      MIGRATION_STATUS="Warning (Connection timed out / Private IP inaccessible from local runner)"
      echo -e "${YELLOW}⚠️ Database schema synchronization warning. Make sure you have private route access to the Database IP.${NC}"
    fi
  else
    MIGRATION_STATUS="Skipped (Dry Run Mode)"
    echo -e "${YELLOW}[DRY RUN] Simulating prisma db push...${NC}"
  fi
  cd ../terraform
fi

echo -e "\n[4/4] ${YELLOW}GCP Enterprise Deployment Summary${NC}"
echo -e "=================================================================="
echo -e "${GREEN}✨ GCP ENTERPRISE DEPLOYMENT SUCCESSFUL! ✨${NC}"
echo -e "=================================================================="
echo -e "• Customer ID:      ${CYAN}${CUSTOMER}${NC}"
echo -e "• Target Project:   ${CYAN}${GCP_PROJECT}${NC}"
echo -e "• Deployment Tier:  ${CYAN}${DEPLOY_OPTION} (${TIER_NAME})${NC}"
echo -e "• Active Region:    ${CYAN}${REGION}${NC}"
echo -e "• Key Authorized:   ${CYAN}${SSH_KEY_PATH}${NC}"
if [ -n "$POSTGRES_IP" ] && [ "$POSTGRES_IP" != "null" ]; then
  echo -e "• Database Server:  ${CYAN}${POSTGRES_IP}:5432${NC}"
fi
echo -e "• Database Sync:    ${CYAN}${MIGRATION_STATUS}${NC}"
echo -e "=================================================================="
cd ..
