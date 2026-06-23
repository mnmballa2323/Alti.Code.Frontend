#!/bin/bash
# ==============================================================================
# ALTI CODE STUDIO: AZURE SOVEREIGN ENTERPRISE DEPLOYER (ADVANCED)
# ==============================================================================
# Provisions Enterprise deployments exclusively on Microsoft Azure.
# Supports Azure Cloud (Commercial), Azure Dedicated, and Azure Government (IL5).
# ==============================================================================

set -e

# Color definitions
CYAN='\033[0;36m'
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${CYAN}================================================================${NC}"
echo -e "${CYAN} 🌍 ALTI CODE STUDIO: AZURE SOVEREIGN ENTERPRISE DEPLOYER      🌍 ${NC}"
echo -e "${CYAN}================================================================${NC}"

# Default variables
DEPLOY_OPTION=""
CUSTOMER="enterprise-tenant"
REGION=""
DRY_RUN=false
SSH_KEY_PATH="~/.ssh/id_rsa.pub"
PLAN_ONLY=false
AUTO_APPROVE=false

usage() {
    echo -e "Usage: ./deploy_enterprise.sh [options]"
    echo -e "Options:"
    echo -e "  --deployment-option <cloud|dedicated|government>  Target deployment tier"
    echo -e "  --customer <name>                                 Unique name of the enterprise tenant"
    echo -e "  --region <region>                                 Target Azure region for deployment"
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
    # Export all variables from .env
    set -a
    source .env
    set +a
fi

# Pre-flight check: SSH key validation & auto-generation
eval SSH_KEY_PATH_EXPANDED="$SSH_KEY_PATH"
if [ ! -f "$SSH_KEY_PATH_EXPANDED" ] && [ "$DRY_RUN" != true ]; then
    echo -e "\n${YELLOW}⚠️ WARNING: SSH Public Key not found at $SSH_KEY_PATH${NC}"
    echo -e "Choose an option:"
    echo -e "  [1] Auto-generate a new 4096-bit RSA SSH key pair (Recommended)"
    echo -e "  [2] Enter a custom path to your existing SSH public key"
    echo -e "  [3] Skip key check (Terraform may fail during plan/apply if key is missing)"
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

# Interactive Mode: Select Deployment Tier
if [ -z "$DEPLOY_OPTION" ]; then
    echo -e "\n${YELLOW}Please select your target deployment option:${NC}"
    echo -e "  [1] ${CYAN}Azure Cloud${NC}     - Commercial multi-tenant deployment"
    echo -e "  [2] ${CYAN}Azure Dedicated${NC} - Single-tenant deployment on physical Dedicated Hosts"
    echo -e "  [3] ${CYAN}Azure Government${NC}- FedRAMP High & DoD Impact Level 5 compliance"
    read -rp "Enter choice (1-3): " choice
    case $choice in
        1) DEPLOY_OPTION="cloud" ;;
        2) DEPLOY_OPTION="dedicated" ;;
        3) DEPLOY_OPTION="government" ;;
        *) echo -e "${RED}❌ ERROR: Invalid selection.${NC}"; exit 1 ;;
    esac
fi

# Validate deployment option
if [ "$DEPLOY_OPTION" != "cloud" ] && [ "$DEPLOY_OPTION" != "dedicated" ] && [ "$DEPLOY_OPTION" != "government" ]; then
    echo -e "${RED}❌ ERROR: Invalid deployment tier '$DEPLOY_OPTION'. Must be: cloud, dedicated, or government.${NC}"
    exit 1
fi

# Interactive Mode: Custom Customer ID
if [ "$CUSTOMER" = "enterprise-tenant" ] && [ "$DRY_RUN" != true ]; then
    read -rp "Enter custom Customer/Tenant ID [default: enterprise-tenant]: " input_cust
    if [ -n "$input_cust" ]; then
        CUSTOMER="$input_cust"
    fi
fi

# Interactive Mode: Select Region
if [ -z "$REGION" ]; then
    case $DEPLOY_OPTION in
        cloud|dedicated)
            echo -e "\n${YELLOW}Select Azure Commercial Region:${NC}"
            echo -e "  [1] East US (default)"
            echo -e "  [2] West US 2"
            echo -e "  [3] North Europe"
            echo -e "  [4] Southeast Asia"
            echo -e "  [5] Enter a custom region name"
            read -rp "Selection (1-5): " reg_choice
            case $reg_choice in
                1) REGION="eastus" ;;
                2) REGION="westus2" ;;
                3) REGION="northeurope" ;;
                4) REGION="southeastasia" ;;
                5) read -rp "Enter Azure region code (e.g., westus3): " REGION ;;
                *) REGION="eastus" ;;
            esac
            TIER_NAME="Azure Commercial"
            ;;
        government)
            echo -e "\n${YELLOW}Select Azure Government Region:${NC}"
            echo -e "  [1] US Gov Virginia (default)"
            echo -e "  [2] US Gov Texas"
            echo -e "  [3] US Gov Arizona"
            echo -e "  [4] Enter a custom region name"
            read -rp "Selection (1-4): " reg_choice
            case $reg_choice in
                1) REGION="usgovvirginia" ;;
                2) REGION="usgovtexas" ;;
                3) REGION="usgovarizona" ;;
                4) read -rp "Enter Azure Government region code: " REGION ;;
                *) REGION="usgovvirginia" ;;
            esac
            TIER_NAME="Azure Government (FedRAMP High/DoD IL5)"
            ;;
    esac
else
    case $DEPLOY_OPTION in
        cloud|dedicated) TIER_NAME="Azure Commercial" ;;
        government) TIER_NAME="Azure Government" ;;
    esac
fi

# Initialize logging
LOG_DIR="deployments"
mkdir -p "$LOG_DIR"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
LOG_FILE="$LOG_DIR/deployment_${CUSTOMER}_${DEPLOY_OPTION}_${TIMESTAMP}.log"

echo -e "\n📝 Logging output to: ${CYAN}$LOG_FILE${NC}"
# Redirect stdout and stderr to the log file while printing to stdout
exec > >(tee -i "$LOG_FILE") 2>&1

if [ "$DRY_RUN" = true ]; then
    echo -e "\n${YELLOW}[DRY RUN] Simulating Azure Sovereign deployment...${NC}"
    echo -e "=================================================================="
    echo -e "• Customer ID:      ${CYAN}${CUSTOMER}${NC}"
    echo -e "• Deployment Tier:  ${CYAN}${DEPLOY_OPTION} (${TIER_NAME})${NC}"
    echo -e "• Target Region:    ${CYAN}${REGION}${NC}"
    echo -e "• SSH Key Path:     ${CYAN}${SSH_KEY_PATH}${NC}"
    echo -e "=================================================================="
    echo -e "• Simulating: terraform init"
    echo -e "• Simulating: terraform apply with vars:"
    case $DEPLOY_OPTION in
        cloud)
            echo -e "    -var=\"enable_azure_cloud=true\""
            echo -e "    -var=\"enable_azure_dedicated=false\""
            echo -e "    -var=\"enable_azure_government=false\""
            ;;
        dedicated)
            echo -e "    -var=\"enable_azure_cloud=false\""
            echo -e "    -var=\"enable_azure_dedicated=true\""
            echo -e "    -var=\"enable_azure_government=false\""
            ;;
        government)
            echo -e "    -var=\"enable_azure_cloud=false\""
            echo -e "    -var=\"enable_azure_dedicated=false\""
            echo -e "    -var=\"enable_azure_government=true\""
            ;;
    esac
    echo -e "    -var=\"customer_id=${CUSTOMER}\""
    echo -e "    -var=\"ssh_public_key_path=${SSH_KEY_PATH}\""
    if [ "$DEPLOY_OPTION" = "government" ]; then
        echo -e "    -var=\"azure_government_region=${REGION}\""
    else
        echo -e "    -var=\"azure_commercial_region=${REGION}\""
    fi
    echo -e "=================================================================="
    echo -e "${GREEN}✨ SOVEREIGN DEPLOYMENT DRY RUN SUCCESSFUL! ✨${NC}"
    echo -e "=================================================================="
    exit 0
fi

# Pre-flight check: Azure Credentials
echo -e "\n[1/3] ${YELLOW}Validating Azure credentials for $DEPLOY_OPTION...${NC}"
PROMPT_CREDS=false

# Helper to check if credentials are set in environment
check_env_creds() {
    [ -n "$ARM_SUBSCRIPTION_ID" ] && [ -n "$ARM_TENANT_ID" ] && [ -n "$ARM_CLIENT_ID" ] && [ -n "$ARM_CLIENT_SECRET" ]
}

if ! check_env_creds; then
    # Try fallback to Azure CLI integration
    if command -v az &> /dev/null; then
        echo -e "No ARM_* env variables. Checking Azure CLI status..."
        if az account show &> /dev/null; then
            # Verify Cloud Environment match
            ACTIVE_CLOUD=$(az cloud show --query name -o tsv 2>/dev/null || echo "AzureCloud")
            if [ "$DEPLOY_OPTION" = "government" ] && [ "$ACTIVE_CLOUD" != "AzureUSGovernment" ]; then
                echo -e "${YELLOW}⚠️ WARNING: You are deploying to Azure Government, but Azure CLI is active on: ${RED}$ACTIVE_CLOUD${NC}"
                echo -e "Please run the following to switch environments:"
                echo -e "  ${CYAN}az cloud set --name AzureUSGovernment && az login${NC}"
                echo -e "----------------------------------------------------"
            elif [ "$DEPLOY_OPTION" != "government" ] && [ "$ACTIVE_CLOUD" = "AzureUSGovernment" ]; then
                echo -e "${YELLOW}⚠️ WARNING: You are deploying to Azure Commercial, but Azure CLI is active on: ${RED}$ACTIVE_CLOUD${NC}"
                echo -e "Please run the following to switch environments:"
                echo -e "  ${CYAN}az cloud set --name AzureCloud && az login${NC}"
                echo -e "----------------------------------------------------"
            fi

            echo -e "${GREEN}✔ Logged in via Azure CLI. Fetching active Subscription & Tenant...${NC}"
            ARM_SUBSCRIPTION_ID=$(az account show --query id -o tsv)
            ARM_TENANT_ID=$(az account show --query tenantId -o tsv)
            export ARM_SUBSCRIPTION_ID
            export ARM_TENANT_ID
            if [ "$DEPLOY_OPTION" = "government" ]; then
                export ARM_ENVIRONMENT="usgovernment"
            else
                export ARM_ENVIRONMENT="public"
            fi
            echo -e "• Subscription ID: ${CYAN}$ARM_SUBSCRIPTION_ID${NC}"
            echo -e "• Tenant ID:       ${CYAN}$ARM_TENANT_ID${NC}"
            echo -e "• Cloud Instance:  ${CYAN}$ACTIVE_CLOUD${NC}"
            echo -e "${GREEN}✔ Configured to authenticate via Azure CLI login session.${NC}"
        else
            PROMPT_CREDS=true
        fi
    else
        PROMPT_CREDS=true
    fi

    if [ "$PROMPT_CREDS" = true ]; then
        echo -e "${YELLOW}⚠️ Azure credentials missing. Please input details to configure a local session:${NC}"
        read -rp "Enter Subscription ID: " ARM_SUBSCRIPTION_ID
        read -rp "Enter Tenant ID: " ARM_TENANT_ID
        read -rp "Enter Client/App ID: " ARM_CLIENT_ID
        read -sp "Enter Client Secret: " ARM_CLIENT_SECRET
        echo -e "\n"

        export ARM_SUBSCRIPTION_ID
        export ARM_TENANT_ID
        export ARM_CLIENT_ID
        export ARM_CLIENT_SECRET

        read -rp "Save credentials to local git-ignored .env file for future runs? (y/n): " save_choice
        if [[ "$save_choice" =~ ^[Yy]$ ]]; then
            echo "ARM_SUBSCRIPTION_ID=\"$ARM_SUBSCRIPTION_ID\"" > .env
            echo "ARM_TENANT_ID=\"$ARM_TENANT_ID\"" >> .env
            echo "ARM_CLIENT_ID=\"$ARM_CLIENT_ID\"" >> .env
            echo "ARM_CLIENT_SECRET=\"$ARM_CLIENT_SECRET\"" >> .env
            echo -e "${GREEN}✔ Credentials saved to .env${NC}"
            
            # Auto-ensure .env is in .gitignore
            if ! grep -q "^\.env$" .gitignore 2>/dev/null; then
                echo -e "\n.env" >> .gitignore
                echo -e "${GREEN}✔ Added .env to .gitignore${NC}"
            fi
        fi
    fi
else
    echo -e "${GREEN}✔ Azure ARM environment credentials detected.${NC}"
fi

echo -e "\n[2/3] ${YELLOW}Executing Terraform IaC for Azure $DEPLOY_OPTION...${NC}"
TF_DIR="terraform"
cd "$TF_DIR"

terraform init

# Build variables array
TF_VARS=(
  -var="customer_id=$CUSTOMER"
  -var="ssh_public_key_path=$SSH_KEY_PATH"
)

if [ "$DEPLOY_OPTION" = "government" ]; then
    TF_VARS+=(
      -var="azure_government_region=$REGION"
      -var="enable_azure_cloud=false"
      -var="enable_azure_dedicated=false"
      -var="enable_azure_government=true"
    )
elif [ "$DEPLOY_OPTION" = "cloud" ]; then
    TF_VARS+=(
      -var="azure_commercial_region=$REGION"
      -var="enable_azure_cloud=true"
      -var="enable_azure_dedicated=false"
      -var="enable_azure_government=false"
    )
elif [ "$DEPLOY_OPTION" = "dedicated" ]; then
    TF_VARS+=(
      -var="azure_commercial_region=$REGION"
      -var="enable_azure_cloud=false"
      -var="enable_azure_dedicated=true"
      -var="enable_azure_government=false"
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


echo -e "\n[3/3] ${YELLOW}Azure Enterprise Deployment Summary${NC}"
echo -e "=================================================================="
echo -e "${GREEN}✨ AZURE ENTERPRISE DEPLOYMENT SUCCESSFUL! ✨${NC}"
echo -e "=================================================================="
echo -e "• Customer ID:      ${CYAN}${CUSTOMER}${NC}"
echo -e "• Deployment Tier:  ${CYAN}${DEPLOY_OPTION} (${TIER_NAME})${NC}"
echo -e "• Active Region:    ${CYAN}${REGION}${NC}"
echo -e "• Key Authorized:   ${CYAN}${SSH_KEY_PATH}${NC}"
echo -e "• Logs Archived:    ${CYAN}${LOG_FILE}${NC}"
echo -e "=================================================================="
cd ..
