terraform {
  required_providers {
    openstack = {
      source  = "terraform-provider-openstack/openstack"
      version = "~> 1.51.1"
    }
  }
}

provider "openstack" {
  cloud     = "liberty-center-one"
  auth_url  = var.openstack_auth_url
  tenant_id = var.openstack_tenant_id
  region    = var.openstack_region
}

# ==========================================
# Sovereign BGP VRFs (Virtual Routing/Forwarding)
# ==========================================

resource "openstack_networking_router_v2" "aws_vrf" {
  name                = "aws-direct-connect-vrf"
  admin_state_up      = true
  external_network_id = var.openstack_external_network_aws_id
}

resource "openstack_networking_router_v2" "azure_vrf" {
  name                = "azure-expressroute-vrf"
  admin_state_up      = true
  external_network_id = var.openstack_external_network_azure_id
}

resource "openstack_networking_router_v2" "gcp_vrf" {
  name                = "gcp-interconnect-vrf"
  admin_state_up      = true
  external_network_id = var.openstack_external_network_gcp_id
}

# ==========================================
# Physical Ironic Bare-Metal Node Groups
# ==========================================

resource "openstack_containerinfra_cluster_v1" "k8s_sovereign" {
  name                = "alti-sovereign-cluster"
  cluster_template_id = var.openstack_magnum_template_id
  master_count        = 3
  
  # Default node group (Control Plane / System Components)
  node_count = 3 
}

# AWS Physical Island
resource "openstack_containerinfra_nodegroup_v1" "aws_baremetal_nodes" {
  name       = "aws-baremetal-island"
  cluster_id = openstack_containerinfra_cluster_v1.k8s_sovereign.id
  node_count = 5
  flavor     = var.openstack_baremetal_flavor # Physical GPU nodes
  labels = {
    "sovereign.cloud/environment"  = "aws"
    "sovereign.cloud/vrf"          = "aws-direct-connect"
    "topology.kubernetes.io/zone"  = "aws-cage"
  }
}

# Azure Physical Island
resource "openstack_containerinfra_nodegroup_v1" "azure_baremetal_nodes" {
  name       = "azure-baremetal-island"
  cluster_id = openstack_containerinfra_cluster_v1.k8s_sovereign.id
  node_count = 5
  flavor     = var.openstack_baremetal_flavor
  labels = {
    "sovereign.cloud/environment"  = "azure"
    "sovereign.cloud/vrf"          = "azure-expressroute"
    "topology.kubernetes.io/zone"  = "azure-cage"
  }
}

# GCP Physical Island
resource "openstack_containerinfra_nodegroup_v1" "gcp_baremetal_nodes" {
  name       = "gcp-baremetal-island"
  cluster_id = openstack_containerinfra_cluster_v1.k8s_sovereign.id
  node_count = 5
  flavor     = var.openstack_baremetal_flavor
  labels = {
    "sovereign.cloud/environment"  = "gcp"
    "sovereign.cloud/vrf"          = "gcp-interconnect"
    "topology.kubernetes.io/zone"  = "gcp-cage"
  }
}

# ==========================================
# Sovereign Cinder Storage Enclaves (Barbican HSM)
# ==========================================

resource "openstack_blockstorage_volume_v3" "aws_storage" {
  name        = "aws-encrypted-enclave"
  size        = 1000
  volume_type = "hsm-encrypted-nvme"
  metadata = {
    environment = "aws"
  }
}

resource "openstack_blockstorage_volume_v3" "azure_storage" {
  name        = "azure-encrypted-enclave"
  size        = 1000
  volume_type = "hsm-encrypted-nvme"
  metadata = {
    environment = "azure"
  }
}

resource "openstack_blockstorage_volume_v3" "gcp_storage" {
  name        = "gcp-encrypted-enclave"
  size        = 1000
  volume_type = "hsm-encrypted-nvme"
  metadata = {
    environment = "gcp"
  }
}
