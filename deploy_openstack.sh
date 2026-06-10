#!/bin/bash
# ==============================================================================
# ALTI CODE STUDIO: ONE-CLICK SINGLE-TENANT VPC DEPLOYER (OPENSTACK)
# ==============================================================================
# Automates provisioning of isolated customer VPCs and CPU-only Compute nodes
# on Liberty Center One OpenStack private cloud. Uses Terraform workspaces
# to maintain complete state isolation per customer.
# ==============================================================================

set -e

# Color definitions
CYAN='\033[0;36m'
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${CYAN}================================================================${NC}"
echo -e "${CYAN} 🛡️  ALTI CODE STUDIO: SINGLE-TENANT OPENSTACK VPC DEPLOYER  🛡️  ${NC}"
echo -e "${CYAN}================================================================${NC}"

# Default variables
MODE="vm"
CUSTOMER="generic-tenant"
SUBNET_CIDR="10.240.0.0/24"
DOMAIN=""
DRY_RUN=false

# Helper usage instructions
usage() {
    echo -e "Usage: ./deploy_openstack.sh [options]"
    echo -e "Options:"
    echo -e "  --customer <name>   Unique name/id of the customer tenant (default: generic-tenant)"
    echo -e "  --subnet <cidr>     Private subnet CIDR range for this customer's VPC (default: 10.240.0.0/24)"
    echo -e "  --domain <name>     Custom domain mapping for TLS/SSL routing (default: <customer>.insocode.com)"
    echo -e "  --mode <vm|k8s>     vm (standalone docker-compose node) or k8s (Magnum cluster) (default: vm)"
    echo -e "  --dry-run           Validate configurations without deploying infrastructure"
    echo -e "  --help              Display this message"
    exit 1
}

# Parse command line options
while [[ "$#" -gt 0 ]]; do
    case $1 in
        --customer) CUSTOMER="$2"; shift ;;
        --subnet) SUBNET_CIDR="$2"; shift ;;
        --domain) DOMAIN="$2"; shift ;;
        --mode) MODE="$2"; shift ;;
        --dry-run) DRY_RUN=true ;;
        --help) usage ;;
        *) echo "Unknown parameter: $1"; usage ;;
    esac
    shift
done

# Set default domain if not provided
if [ -z "$DOMAIN" ]; then
    DOMAIN="${CUSTOMER}.insocode.com"
fi

# Validate Mode
if [ "$MODE" != "k8s" ] && [ "$MODE" != "vm" ]; then
    echo -e "${RED}ERROR: Invalid deployment mode: '$MODE'. Must be 'vm' or 'k8s'.${NC}"
    exit 1
fi

# 1. Validate OpenStack Environment Credentials
echo -e "\n[1/5] ${YELLOW}Validating OpenStack CLI Authentication...${NC}"
if [ -z "$OS_AUTH_URL" ] && [ ! -f ~/.config/openstack/clouds.yaml ]; then
    echo -e "${RED}❌ ERROR: No OpenStack credentials detected.${NC}"
    echo -e "Please source your Keystone keystonerc profile or make sure ~/.config/openstack/clouds.yaml exists."
    exit 1
fi
echo -e "${GREEN}✔ OpenStack credentials detected.${NC}"

# 2. Provision Isolated Infrastructure via Terraform
echo -e "\n[2/5] ${YELLOW}Executing Terraform IaC with State Isolation...${NC}"
cd terraform

if [ "$DRY_RUN" = true ]; then
    echo -e "${YELLOW}Running dry-run validation for Customer: ${CUSTOMER^^}...${NC}"
    terraform init -backend=false
    terraform validate
    echo -e "${GREEN}✔ Terraform configurations validated successfully (Dry-Run).${NC}"
    cd ..
    exit 0
fi

# Initialize Terraform
terraform init

# Create or select isolated workspace for the customer to prevent state conflicts
echo -e "Selecting Terraform workspace for customer: ${CYAN}${CUSTOMER}${NC}..."
terraform workspace select ${CUSTOMER} || terraform workspace new ${CUSTOMER}

# Deploy the infrastructure
echo -e "Applying customer VPC and Compute VM resource rules (Subnet: ${SUBNET_CIDR})..."
terraform apply -var="customer_id=${CUSTOMER}" \
                -var="customer_subnet_cidr=${SUBNET_CIDR}" \
                -var="customer_domain=${DOMAIN}" \
                -auto-approve

echo -e "${GREEN}✔ Customer-isolated VPC infrastructure provisioned successfully.${NC}"

# 3. Deploy Application Stack
if [ "$MODE" == "vm" ]; then
    # VM Deployment Pathway
    echo -e "\n[3/5] ${YELLOW}Extracting Compute Node IP...${NC}"
    VM_IP=$(terraform output -raw backend_vm_public_ip)
    echo -e "${GREEN}✔ Customer node floating IP allocated: ${VM_IP}${NC}"

    echo -e "\n[4/5] ${YELLOW}Bootstrapping VM Node Stack...${NC}"
    echo -e "• Bootstrapping script is executing in background on the server."
    echo -e "• It will install Docker, Docker-compose, clone the repository, and start services."

    echo -e "\n[5/5] ${YELLOW}Verification & URL Mapping${NC}"
    echo -e "=================================================================="
    echo -e "${GREEN}✨ ONE-CLICK CUSTOMER VPC DEPLOYMENT SUCCESSFUL! ✨${NC}"
    echo -e "=================================================================="
    echo -e "• Customer ID:    ${CYAN}${CUSTOMER}${NC}"
    echo -e "• VPC Subnet:     ${CYAN}${SUBNET_CIDR}${NC}"
    echo -e "• Target Domain:  ${CYAN}https://${DOMAIN}${NC}"
    echo -e "• Direct IP API:  ${CYAN}http://${VM_IP}:5000/api/v1/healthz${NC}"
    echo -e "• SSH Access:     ${CYAN}ssh -i <key> ubuntu@${VM_IP}${NC}"
    echo -e "• Next Steps:     Configure your DNS (e.g. GoDaddy) to point A Record"
    echo -e "                  for ${DOMAIN} to IP ${VM_IP}."
    echo -e "                  Caddy will automatically provision Let's Encrypt SSL."
    echo -e "=================================================================="

else
    # Kubernetes Deployment Pathway
    echo -e "\n[3/5] ${YELLOW}Acquiring Kubernetes COE Cluster Credentials...${NC}"
    openstack coe cluster config alti-sovereign-cluster
    echo -e "${GREEN}✔ kubectl context updated for cluster 'alti-sovereign-cluster'.${NC}"

    echo -e "\n[4/5] ${YELLOW}Building and Uploading Docker Container Images...${NC}"
    REGISTRY="registry.internal.libertycenterone.com"
    BACKEND_IMAGE="${REGISTRY}/alti-backend-${CUSTOMER}:latest"
    FRONTEND_IMAGE="${REGISTRY}/alti-frontend-${CUSTOMER}:latest"
    
    echo -e "Building backend image: ${BACKEND_IMAGE}..."
    docker build -t ${BACKEND_IMAGE} ../alti.code.studio.backend
    
    echo -e "Building frontend image: ${FRONTEND_IMAGE}..."
    docker build -t ${FRONTEND_IMAGE} ../alti.code.studio.frontend
    
    echo -e "Pushing images to private registry..."
    docker push ${BACKEND_IMAGE}
    docker push ${FRONTEND_IMAGE}
    echo -e "${GREEN}✔ Images pushed to registry.${NC}"

    echo -e "\n[5/5] ${YELLOW}Executing Helm Sovereign Deployment Chart...${NC}"
    cd ../alti.code.studio.backend/k8s
    # Install with customer-specific namespace and configuration environment variables
    REGISTRY="${REGISTRY}" CUSTOMER_ID="${CUSTOMER}" CUSTOMER_DOMAIN="${DOMAIN}" ./omni_sovereign_operator.sh openstack "alti-sovereign-${CUSTOMER}"
    
    echo -e "=================================================================="
    echo -e "${GREEN}✨ ONE-CLICK CUSTOMER KUBERNETES DEPLOYMENT COMPLETE! ✨${NC}"
    echo -e "=================================================================="
fi

cd ..
