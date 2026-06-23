#!/bin/bash
# ==============================================================================
# ALTI CODE STUDIO: AZURE SOVEREIGN ENTERPRISE DEPLOYER
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

usage() {
    echo -e "Usage: ./deploy_enterprise.sh [options]"
    echo -e "Options:"
    echo -e "  --deployment-option <cloud|dedicated|government>  Target deployment tier (REQUIRED)"
    echo -e "  --customer <name>                                 Unique name of the enterprise tenant (default: enterprise-tenant)"
    echo -e "  --region <region>                                 Target Azure region for deployment"
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
        --dry-run) DRY_RUN=true ;;
        --help) usage ;;
        *) echo "Unknown parameter: $1"; usage ;;
    esac
    shift
done

# Interactive Mode Wizard if option not specified
if [ -z "$DEPLOY_OPTION" ]; then
    echo -e "${YELLOW}No deployment tier specified. Starting interactive deployment wizard...${NC}"
    echo -e "Please select your target deployment option:"
    echo -e "  [1] ${CYAN}Azure Cloud${NC}     - Commercial multi-tenant deployment (SaaS standard)"
    echo -e "  [2] ${CYAN}Azure Dedicated${NC} - Single-tenant deployment on physical Azure Dedicated Hosts"
    echo -e "  [3] ${CYAN}Azure Government${NC}- FedRAMP High & DoD Impact Level 5 compliance (usgovernment environment)"
    read -rp "Enter choice (1-3): " choice
    case $choice in
        1) DEPLOY_OPTION="cloud" ;;
        2) DEPLOY_OPTION="dedicated" ;;
        3) DEPLOY_OPTION="government" ;;
        *) echo -e "${RED}❌ ERROR: Invalid selection.${NC}"; exit 1 ;;
    esac
fi

# Validate options
if [ "$DEPLOY_OPTION" != "cloud" ] && [ "$DEPLOY_OPTION" != "dedicated" ] && [ "$DEPLOY_OPTION" != "government" ]; then
    echo -e "${RED}❌ ERROR: Invalid option '$DEPLOY_OPTION'. Must be: cloud, dedicated, or government.${NC}"
    exit 1
fi

# Set defaults for regions based on tier
case $DEPLOY_OPTION in
    cloud|dedicated)
        [ -z "$REGION" ] && REGION="eastus"
        TIER_NAME="Azure Commercial"
        ;;
    government)
        [ -z "$REGION" ] && REGION="usgovvirginia"
        TIER_NAME="Azure Government (FedRAMP High/DoD IL5)"
        ;;
esac

if [ "$DRY_RUN" = true ]; then
    echo -e "\n${YELLOW}[DRY RUN] Simulating Azure Sovereign deployment...${NC}"
    echo -e "=================================================================="
    echo -e "• Customer ID:      ${CYAN}${CUSTOMER}${NC}"
    echo -e "• Deployment Tier:  ${CYAN}${DEPLOY_OPTION} (${TIER_NAME})${NC}"
    echo -e "• Target Region:    ${CYAN}${REGION}${NC}"
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
    echo -e "    -var=\"azure_commercial_region=${REGION}\""
    echo -e "=================================================================="
    echo -e "${GREEN}✨ SOVEREIGN DEPLOYMENT DRY RUN SUCCESSFUL! ✨${NC}"
    echo -e "=================================================================="
    exit 0
fi

echo -e "\n[1/3] ${YELLOW}Validating Azure credentials for $DEPLOY_OPTION...${NC}"
if [ -z "$ARM_CLIENT_ID" ] || [ -z "$ARM_CLIENT_SECRET" ] || [ -z "$ARM_SUBSCRIPTION_ID" ] || [ -z "$ARM_TENANT_ID" ]; then
    echo -e "${RED}❌ ERROR: Azure ARM credentials missing in environment (ARM_CLIENT_ID, ARM_CLIENT_SECRET, ARM_SUBSCRIPTION_ID, ARM_TENANT_ID).${NC}"
    exit 1
fi
echo -e "${GREEN}✔ Credentials validated.${NC}"

echo -e "\n[2/3] ${YELLOW}Executing Terraform IaC for Azure $DEPLOY_OPTION...${NC}"
TF_DIR="terraform"
cd "$TF_DIR"

# Initialize Terraform configuration
terraform init

# Apply the appropriate configuration based on the chosen deployment option
case $DEPLOY_OPTION in
    cloud)
        terraform apply \
          -var="customer_id=$CUSTOMER" \
          -var="azure_commercial_region=$REGION" \
          -var="enable_azure_cloud=true" \
          -var="enable_azure_dedicated=false" \
          -var="enable_azure_government=false" \
          -auto-approve
        ;;
    dedicated)
        terraform apply \
          -var="customer_id=$CUSTOMER" \
          -var="azure_commercial_region=$REGION" \
          -var="enable_azure_cloud=false" \
          -var="enable_azure_dedicated=true" \
          -var="enable_azure_government=false" \
          -auto-approve
        ;;
    government)
        terraform apply \
          -var="customer_id=$CUSTOMER" \
          -var="azure_government_region=$REGION" \
          -var="enable_azure_cloud=false" \
          -var="enable_azure_dedicated=false" \
          -var="enable_azure_government=true" \
          -auto-approve
        ;;
esac

echo -e "\n[3/3] ${YELLOW}Azure Enterprise Deployment Summary${NC}"
echo -e "=================================================================="
echo -e "${GREEN}✨ AZURE ENTERPRISE DEPLOYMENT SUCCESSFUL! ✨${NC}"
echo -e "=================================================================="
echo -e "• Customer ID:    ${CYAN}${CUSTOMER}${NC}"
echo -e "• Deployment Tier: ${CYAN}${DEPLOY_OPTION} (${TIER_NAME})${NC}"
echo -e "• Region:         ${CYAN}${REGION}${NC}"
echo -e "• Inference API:  ${CYAN}Routed according to Azure Sovereign Policy${NC}"
echo -e "=================================================================="
cd ..

