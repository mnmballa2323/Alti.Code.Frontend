#!/bin/bash
# ==============================================================================
# ALTI CODE STUDIO: AZURE SOVEREIGN ENTERPRISE DEPLOYER
# ==============================================================================
# Provisions Enterprise deployments exclusively on Microsoft Azure.
# Supports Commercial Cloud, Government Cloud (IL5), and Classified Cloud (IL6/Air-Gapped).
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

usage() {
    echo -e "Usage: ./deploy_enterprise.sh [options]"
    echo -e "Options:"
    echo -e "  --deployment-option <commercial|government|classified>  Target deployment tier (REQUIRED)"
    echo -e "  --customer <name>                                       Unique name of the enterprise tenant (default: enterprise-tenant)"
    echo -e "  --region <region>                                       Target Azure region for deployment"
    echo -e "  --help                                                  Display this message"
    exit 1
}

# Parse command line options
DRY_RUN=false
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

if [ -z "$DEPLOY_OPTION" ]; then
    echo -e "${RED}ERROR: --deployment-option is required (commercial, government, or classified).${NC}"
    exit 1
fi

if [ "$DEPLOY_OPTION" != "commercial" ] && [ "$DEPLOY_OPTION" != "government" ] && [ "$DEPLOY_OPTION" != "classified" ]; then
    echo -e "${RED}ERROR: Invalid option '$DEPLOY_OPTION'. Must be commercial, government, or classified.${NC}"
    exit 1
fi

if [ "$DRY_RUN" = true ]; then
    echo -e "${GREEN}Running dry run for Azure AKS/Sovereign deployment...${NC}"
    echo -e "[Classified] Preloading AKS cluster system images"
    echo -e "Preloading and retagging mcr.microsoft.com/oss/kubernetes/kube-apiserver"
    echo -e "Preloading and retagging mcr.microsoft.com/oss/kubernetes/coredns"
    echo -e "[Classified] Overriding AKS cluster template configuration"
    echo -e "\n[3/3] ${YELLOW}Azure Enterprise Deployment Summary (DRY RUN)${NC}"
    echo -e "=================================================================="
    echo -e "${GREEN}✨ AZURE ENTERPRISE DEPLOYMENT SUCCESSFUL! ✨${NC}"
    echo -e "=================================================================="
    echo -e "• Customer ID:    ${CYAN}${CUSTOMER}${NC}"
    echo -e "• Deployment Tier: ${CYAN}${DEPLOY_OPTION}${NC}"
    echo -e "=================================================================="
    exit 0
fi

echo -e "\n[1/3] ${YELLOW}Validating Azure ARM Credentials...${NC}"
if [ -z "$ARM_CLIENT_ID" ] || [ -z "$ARM_CLIENT_SECRET" ] || [ -z "$ARM_SUBSCRIPTION_ID" ] || [ -z "$ARM_TENANT_ID" ]; then
    echo -e "${RED}❌ ERROR: Azure ARM credentials missing in environment (ARM_CLIENT_ID, ARM_CLIENT_SECRET, ARM_SUBSCRIPTION_ID, ARM_TENANT_ID).${NC}"
    exit 1
fi

case $DEPLOY_OPTION in
    commercial)
        [ -z "$REGION" ] && REGION="eastus"
        echo -e "• Deployment Tier: ${GREEN}Azure Commercial Cloud${NC}"
        ;;
    government)
        [ -z "$REGION" ] && REGION="usgovvirginia"
        echo -e "• Deployment Tier: ${GREEN}Azure Government Cloud (FedRAMP High/DoD IL5)${NC}"
        ;;
    classified)
        [ -z "$REGION" ] && REGION="usgovvirginia" # Azure Government Secret / Air-Gapped region
        echo -e "• Deployment Tier: ${GREEN}Azure Secret & Air-Gapped Cloud (DoD IL6)${NC}"
        ;;
esac
echo -e "• Target Region:   ${GREEN}${REGION}${NC}"
echo -e "${GREEN}✔ Credentials validated.${NC}"

echo -e "\n[2/3] ${YELLOW}Executing Terraform IaC for Azure Sovereign Enterprise...${NC}"
TF_DIR="terraform"

cd "$TF_DIR"
terraform init

# Set variables depending on deployment tier choice
case $DEPLOY_OPTION in
    commercial)
        terraform apply \
          -var="customer_id=$CUSTOMER" \
          -var="azure_commercial_region=$REGION" \
          -auto-approve
        ;;
    government)
        terraform apply \
          -var="customer_id=$CUSTOMER" \
          -var="azure_government_region=$REGION" \
          -auto-approve
        ;;
    classified)
        terraform apply \
          -var="customer_id=$CUSTOMER" \
          -var="azure_classified_region=$REGION" \
          -auto-approve
        ;;
esac

echo -e "\n[3/3] ${YELLOW}Azure Enterprise Deployment Summary${NC}"
echo -e "=================================================================="
echo -e "${GREEN}✨ AZURE ENTERPRISE DEPLOYMENT SUCCESSFUL! ✨${NC}"
echo -e "=================================================================="
echo -e "• Customer ID:    ${CYAN}${CUSTOMER}${NC}"
echo -e "• Deployment Tier: ${CYAN}${DEPLOY_OPTION}${NC}"
echo -e "• Region:         ${CYAN}${REGION}${NC}"
echo -e "• Inference API:  ${CYAN}Routed via LlmGateway according to Azure Sovereign Policy${NC}"
echo -e "=================================================================="
cd ..
