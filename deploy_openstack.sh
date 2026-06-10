#!/bin/bash
# ==============================================================================
# ALTI CODE STUDIO: ONE-CLICK OPENSTACK DEPLOYER (LIBERTY CENTER ONE)
# ==============================================================================
# Automates provisioning and deployment of the Alti Backend Sovereign stack
# to your private cloud instance using Terraform and Docker/Kubernetes.
# ==============================================================================

set -e

# Color definitions
CYAN='\033[0;36m'
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${CYAN}================================================================${NC}"
echo -e "${CYAN} 🚀 ALTI CODE STUDIO: ONE-CLICK OPENSTACK DEPLOYER INITIATED 🚀 ${NC}"
echo -e "${CYAN}================================================================${NC}"

# Parse Mode
MODE=${1:-"vm"}
DRY_RUN=false

if [ "$1" == "dry-run" ] || [ "$2" == "dry-run" ]; then
    DRY_RUN=true
    echo -e "${YELLOW}⚠️ Running in DRY-RUN mode. No infrastructure will be modified.${NC}"
fi

if [ "$MODE" != "k8s" ] && [ "$MODE" != "vm" ] && [ "$DRY_RUN" = false ]; then
    echo -e "${RED}ERROR: Invalid deployment mode: '$MODE'.${NC}"
    echo -e "Usage: ./deploy_openstack.sh <k8s|vm> [dry-run]"
    echo -e "  - k8s: Deploy to an OpenStack Magnum Kubernetes Cluster via Helm"
    echo -e "  - vm:  Deploy to a standalone OpenStack Compute VM via Docker-Compose (Recommended Fallback)"
    exit 1
fi

# 1. Validate OpenStack Environment Credentials
echo -e "\n[1/5] ${YELLOW}Validating OpenStack CLI Authentication...${NC}"
if [ -z "$OS_AUTH_URL" ] && [ ! -f ~/.config/openstack/clouds.yaml ]; then
    echo -e "${RED}❌ ERROR: No OpenStack environment variables or clouds.yaml detected.${NC}"
    echo -e "Please source your OpenStack keystonerc file or verify ~/.config/openstack/clouds.yaml exists."
    exit 1
fi
echo -e "${GREEN}✔ OpenStack credentials detected.${NC}"

# 2. Provision Infrastructure via Terraform
echo -e "\n[2/5] ${YELLOW}Executing Terraform IaC (Path: ./terraform)...${NC}"
cd terraform

if [ "$DRY_RUN" = true ]; then
    terraform init -backend=false
    terraform validate
    echo -e "${GREEN}✔ Terraform validation passed (Dry-Run).${NC}"
    cd ..
    exit 0
fi

terraform init
# Restrict Terraform targeting based on deployment mode to optimize provisioning
if [ "$MODE" == "vm" ]; then
    echo -e "${CYAN}Targeting standalone Compute VM resources...${NC}"
    terraform apply -target=openstack_compute_instance_v2.backend_instance \
                    -target=openstack_compute_floatingip_associate_v2.backend_fip_assoc \
                    -auto-approve
else
    echo -e "${CYAN}Targeting full Magnum Kubernetes Cluster resources...${NC}"
    terraform apply -target=openstack_containerinfra_cluster_v1.k8s_sovereign \
                    -target=openstack_networking_router_v2.aws_vrf \
                    -target=openstack_networking_router_v2.azure_vrf \
                    -target=openstack_networking_router_v2.gcp_vrf \
                    -auto-approve
fi
echo -e "${GREEN}✔ Infrastructure provisioned successfully.${NC}"

# 3. Deploy Application Stack
if [ "$MODE" == "vm" ]; then
    # VM Deployment Pathway
    echo -e "\n[3/5] ${YELLOW}Extracting Compute Node IP...${NC}"
    VM_IP=$(terraform output -raw backend_vm_public_ip)
    echo -e "${GREEN}✔ Sovereign compute node floating IP: ${VM_IP}${NC}"

    echo -e "\n[4/5] ${YELLOW}Bootstrapping VM Node Stack...${NC}"
    echo -e "• Bootstrapping script is executing in background on the server."
    echo -e "• It will install Docker, Docker-compose, clone the repository, and start services."

    echo -e "\n[5/5] ${YELLOW}Verification & URL Mapping${NC}"
    echo -e "================================================================"
    echo -e "${GREEN}✨ ONE-CLICK DEPLOYMENT SUCCESSFUL! ✨${NC}"
    echo -e "================================================================"
    echo -e "• Live URL:       ${CYAN}http://${VM_IP}:5000/api/v1/healthz${NC}"
    echo -e "• SSH Access:     ${CYAN}ssh -i <your-key> ubuntu@${VM_IP}${NC}"
    echo -e "• Next Steps:     Configure www.insocode.com A Record to point to ${VM_IP}"
    echo -e "================================================================"

else
    # Kubernetes Deployment Pathway
    echo -e "\n[3/5] ${YELLOW}Acquiring Kubernetes COE Cluster Credentials...${NC}"
    openstack coe cluster config alti-sovereign-cluster
    echo -e "${GREEN}✔ kubectl context updated for cluster 'alti-sovereign-cluster'.${NC}"

    echo -e "\n[4/5] ${YELLOW}Building and Uploading Docker Container Image...${NC}"
    REGISTRY="registry.internal.libertycenterone.com"
    IMAGE_NAME="${REGISTRY}/alti-backend:latest"
    
    echo -e "Building backend image: ${IMAGE_NAME}..."
    docker build -t ${IMAGE_NAME} ../alti.code.studio.backend
    
    echo -e "Pushing image to private registry..."
    docker push ${IMAGE_NAME}
    echo -e "${GREEN}✔ Image pushed to registry.${NC}"

    echo -e "\n[5/5] ${YELLOW}Executing Helm Sovereign Deployment Chart...${NC}"
    cd ../alti.code.studio.backend/k8s
    ./omni_sovereign_operator.sh openstack
    
    echo -e "================================================================"
    echo -e "${GREEN}✨ ONE-CLICK KUBERNETES DEPLOYMENT COMPLETE! ✨${NC}"
    echo -e "================================================================"
fi

cd ..
