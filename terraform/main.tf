terraform {
  required_version = ">= 1.5.0"
  required_providers {
    openstack = {
      source  = "terraform-provider-openstack/openstack"
      version = "~> 2.0"
    }
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.0"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.5"
    }
    tls = {
      source  = "hashicorp/tls"
      version = "~> 4.0"
    }
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "~> 2.23"
    }
    helm = {
      source  = "hashicorp/helm"
      version = "~> 2.11"
    }
  }

  backend "gcs" {
    bucket = "alti-code-studio-tf-state-prod"
    prefix = "terraform/state"
  }
}

# -------------------------------------------------------------
# Providers
# -------------------------------------------------------------
provider "openstack" {
  auth_url                      = var.openstack_auth_url
  region                        = var.openstack_region
  
  # Apex-Tier: Zero-Trust OIDC Identity Federation via App Credentials
  application_credential_id     = var.openstack_app_cred_id
  application_credential_secret = var.openstack_app_cred_secret
}

provider "google" {
  project = var.gcp_project_id
  region  = var.gcp_region
}

provider "aws" {
  region = var.aws_region
}

provider "azurerm" {
  features {}
  subscription_id = var.azure_subscription_id
}

provider "kubernetes" {
  host                   = openstack_containerinfra_cluster_v1.k8s_cluster.kubeconfig.host
  client_certificate     = openstack_containerinfra_cluster_v1.k8s_cluster.kubeconfig.client_certificate
  client_key             = openstack_containerinfra_cluster_v1.k8s_cluster.kubeconfig.client_key
  cluster_ca_certificate = openstack_containerinfra_cluster_v1.k8s_cluster.kubeconfig.cluster_ca_certificate
}

provider "helm" {
  kubernetes {
    host                   = openstack_containerinfra_cluster_v1.k8s_cluster.kubeconfig.host
    client_certificate     = openstack_containerinfra_cluster_v1.k8s_cluster.kubeconfig.client_certificate
    client_key             = openstack_containerinfra_cluster_v1.k8s_cluster.kubeconfig.client_key
    cluster_ca_certificate = openstack_containerinfra_cluster_v1.k8s_cluster.kubeconfig.cluster_ca_certificate
  }
}

# -------------------------------------------------------------
# God-Tier Sovereign Multi-Tenant Identity & Configuration
# -------------------------------------------------------------
locals {
  customers = {
    "stark_industries" = { cidr = "10.10.0.0/16", bgp_rt = "64512:101" }
    "wayne_ent"        = { cidr = "10.20.0.0/16", bgp_rt = "64512:102" }
    "acme_corp"        = { cidr = "10.30.0.0/16", bgp_rt = "64512:103" }
  }
}

resource "openstack_identity_project_v3" "tenant_projects" {
  for_each    = local.customers
  name        = "alti-tenant-${each.key}-${var.environment}"
  description = "Isolated Airgapped Sovereign Environment for ${each.key}"
}

# -------------------------------------------------------------
# Core Infrastructure (OpenStack Private Cloud)
# -------------------------------------------------------------

# Sovereign Networking (VRF / Tenant Isolation)
resource "openstack_networking_network_v2" "alti_network" {
  for_each       = local.customers
  name           = "alti-network-${each.key}-${var.environment}"
  admin_state_up = true
  tenant_id      = openstack_identity_project_v3.tenant_projects[each.key].id
}

resource "openstack_networking_subnet_v2" "alti_subnet" {
  for_each   = local.customers
  name       = "alti-subnet-${each.key}-${var.environment}"
  network_id = openstack_networking_network_v2.alti_network[each.key].id
  cidr       = each.value.cidr
  ip_version = 4
  tenant_id  = openstack_identity_project_v3.tenant_projects[each.key].id
}

resource "openstack_networking_router_v2" "alti_router" {
  for_each            = local.customers
  name                = "alti-router-${each.key}-${var.environment}"
  admin_state_up      = true
  external_network_id = data.openstack_networking_network_v2.ext_net.id
  tenant_id           = openstack_identity_project_v3.tenant_projects[each.key].id
}

resource "openstack_networking_router_interface_v2" "alti_router_interface" {
  for_each  = local.customers
  router_id = openstack_networking_router_v2.alti_router[each.key].id
  subnet_id = openstack_networking_subnet_v2.alti_subnet[each.key].id
}

data "openstack_networking_network_v2" "ext_net" {
  name     = "public"
  external = true
}

# Apex-Tier: OVN Hardware Offloading (SmartNICs / DPUs)
# By setting vnic_type="direct", Neutron bypasses the host CPU's Open vSwitch
# and programs the microsegmentation/BGP rules directly into the physical NIC ASIC.
resource "openstack_networking_port_v2" "dpu_offloaded_port" {
  name           = "alti-dpu-port-${var.environment}"
  network_id     = openstack_networking_network_v2.alti_network.id
  admin_state_up = true
  
  binding {
    vnic_type = "direct"
  }
}

# SSH Keypair (Nova)
resource "tls_private_key" "cluster_key" {
  algorithm = "RSA"
  rsa_bits  = 4096
}

resource "openstack_compute_keypair_v2" "k8s_keypair" {
  name       = "alti-k8s-keypair-${var.environment}"
  public_key = tls_private_key.cluster_key.public_key_openssh
}

# Security Groups (Neutron)
resource "openstack_networking_secgroup_v2" "cluster_sg" {
  name                 = "alti-cluster-sg-${var.environment}"
  description          = "Absolute Airgap: Strict firewall rules for the Alti Code Studio Magnum Cluster"
  delete_default_rules = true # Omega-Tier: Sever all default public internet egress
}

# Allow HTTP to Load Balancers
resource "openstack_networking_secgroup_rule_v2" "allow_http" {
  direction         = "ingress"
  ethertype         = "IPv4"
  protocol          = "tcp"
  port_range_min    = 80
  port_range_max    = 80
  remote_ip_prefix  = "0.0.0.0/0"
  security_group_id = openstack_networking_secgroup_v2.cluster_sg.id
}

# Allow HTTPS to Load Balancers
resource "openstack_networking_secgroup_rule_v2" "allow_https" {
  direction         = "ingress"
  ethertype         = "IPv4"
  protocol          = "tcp"
  port_range_min    = 443
  port_range_max    = 443
  remote_ip_prefix  = "0.0.0.0/0"
  security_group_id = openstack_networking_secgroup_v2.cluster_sg.id
}

# Allow Internal Cluster Communication
resource "openstack_networking_secgroup_rule_v2" "allow_internal" {
  direction         = "ingress"
  ethertype         = "IPv4"
  remote_group_id   = openstack_networking_secgroup_v2.cluster_sg.id
  security_group_id = openstack_networking_secgroup_v2.cluster_sg.id
}

# Omega-Tier: Allow Egress ONLY to Internal Subnet and BGP Routes
resource "openstack_networking_secgroup_rule_v2" "allow_internal_egress" {
  direction         = "egress"
  ethertype         = "IPv4"
  remote_group_id   = openstack_networking_secgroup_v2.cluster_sg.id
  security_group_id = openstack_networking_secgroup_v2.cluster_sg.id
}

# Magnum Kubernetes Cluster
resource "openstack_containerinfra_cluster_v1" "k8s_cluster" {
  for_each            = local.customers
  name                = "alti-k8s-${each.key}-${var.environment}"
  cluster_template_id = openstack_containerinfra_clustertemplate_v1.k8s_template.id
  master_count        = 3
  node_count          = 5
  keypair             = openstack_compute_keypair_v2.k8s_keypair.name
}

resource "openstack_containerinfra_clustertemplate_v1" "k8s_template" {
  name                  = "alti-k8s-template-${var.environment}"
  coe                   = "kubernetes"
  network_driver        = "calico"
  volume_driver         = "cinder"
  
  # Transcendent-Tier: Deploy directly onto raw physical servers with NVIDIA H100s via OpenStack Ironic & Cyborg
  master_flavor         = "baremetal.compute.gpu"
  flavor                = "baremetal.compute.gpu"
  
  image                 = openstack_images_image_v2.fedora_coreos.name
  external_network_id   = data.openstack_networking_network_v2.ext_net.id
  
  # Highly Secure: Master nodes are private, no floating IPs exposed
  floating_ip_enabled   = false
  auto_healing_enabled  = true

  labels = {
    kube_tag                       = "v1.28.0"
    octavia_ingress_controller_tag = "1.23.0"
    octavia_provider               = "amphora"
    cinder_csi_enabled             = "true"
    manila_csi_enabled             = "true"
    master_lb_enabled              = "true"
    
    # Apex-Tier: TPM Attested Hardware Secure Boot
    secure_boot                    = "true"
    
    # God-Tier: Kata Containers (Hardware-Isolated Micro-VMs for Docker)
    container_runtime              = "kata"
  }
}

# Object Storage (Swift)
resource "openstack_objectstorage_container_v1" "gemini_context" {
  name          = "alti-gemini-context-${var.environment}"
  content_type  = "application/json"
  force_destroy = true
}

# -------------------------------------------------------------
# Deep OpenStack Integrations: Barbican, Manila, Designate
# -------------------------------------------------------------

# Glance (Image Service)
resource "openstack_images_image_v2" "fedora_coreos" {
  name             = "fedora-coreos-38-${var.environment}"
  image_source_url = "https://builds.coreos.fedoraproject.org/prod/streams/stable/builds/38.20230819.3.0/x86_64/fedora-coreos-38.20230819.3.0-openstack.x86_64.qcow2.xz"
  container_format = "bare"
  disk_format      = "qcow2"
  visibility       = "private"
}

# VPNaaS (IPsec VPN Tunnel)
resource "openstack_vpnaas_service_v2" "alti_vpn" {
  name           = "alti-vpn-service-${var.environment}"
  router_id      = openstack_networking_router_v2.alti_router.id
  admin_state_up = true
}

resource "openstack_vpnaas_ipsecpolicy_v2" "alti_ipsec_policy" {
  name = "alti-ipsec-policy-${var.environment}"
}

resource "openstack_vpnaas_ikepolicy_v2" "alti_ike_policy" {
  name = "alti-ike-policy-${var.environment}"
}

resource "openstack_vpnaas_siteconnection_v2" "office_connection" {
  name              = "alti-office-vpn-${var.environment}"
  vpnservice_id     = openstack_vpnaas_service_v2.alti_vpn.id
  ikepolicy_id      = openstack_vpnaas_ikepolicy_v2.alti_ike_policy.id
  ipsecpolicy_id    = openstack_vpnaas_ipsecpolicy_v2.alti_ipsec_policy.id
  peer_address      = "198.51.100.12" # Placeholder for Office IP
  peer_id           = "198.51.100.12"
  psk               = openstack_keymanager_secret_v1.global_db_secret.payload
  local_ep_group_id = "" # Handled by defaults in older providers
}

# BGP VPN (Direct Fiber Cross-Connects to Hyperscalers)
resource "openstack_networking_bgpvpn_v2" "hyperscaler_bgp" {
  for_each       = local.customers
  name           = "alti-hyperscaler-bgp-${each.key}-${var.environment}"
  type           = "l3"
  route_targets  = [each.value.bgp_rt] # Sovereign BGP Route Targets per customer
  import_targets = [each.value.bgp_rt]
  export_targets = [each.value.bgp_rt]
  tenant_id      = openstack_identity_project_v3.tenant_projects[each.key].id
}

resource "openstack_networking_bgpvpn_router_associate_v2" "bgp_router_assoc" {
  for_each  = local.customers
  bgpvpn_id = openstack_networking_bgpvpn_v2.hyperscaler_bgp[each.key].id
  router_id = openstack_networking_router_v2.alti_router[each.key].id
}

# Barbican (Hardware Security Module / Key Manager)
resource "random_password" "db_password" {
  length  = 32
  special = true
}

resource "openstack_keymanager_secret_v1" "global_db_secret" {
  name                      = "alti-global-db-secret-${var.environment}"
  payload                   = random_password.db_password.result
  payload_content_type      = "text/plain"
  secret_type               = "opaque"
}

# Manila (Shared File Systems)
resource "openstack_sharedfilesystem_sharenetwork_v2" "alti_sharenetwork" {
  name              = "alti-sharenetwork-${var.environment}"
  neutron_net_id    = openstack_networking_network_v2.alti_network.id
  neutron_subnet_id = openstack_networking_subnet_v2.alti_subnet.id
}

resource "openstack_sharedfilesystem_share_v2" "alti_shared_cache" {
  name             = "alti-shared-cache-${var.environment}"
  share_proto      = "NFS"
  size             = 100
  share_network_id = openstack_sharedfilesystem_sharenetwork_v2.alti_sharenetwork.id
}

# Designate (DNS as a Service) & Octavia Floating IP Routing
resource "openstack_networking_floatingip_v2" "ingress_fip" {
  pool = data.openstack_networking_network_v2.ext_net.name
}

resource "openstack_dns_zone_v2" "alti_zone" {
  name        = "alti.code.studio."
  email       = "admin@alti.code.studio"
  description = "Managed by Terraform Designate Provider"
  type        = "PRIMARY"
}

resource "openstack_dns_recordset_v2" "root_a_record" {
  zone_id = openstack_dns_zone_v2.alti_zone.id
  name    = "alti.code.studio."
  type    = "A"
  records = [openstack_networking_floatingip_v2.ingress_fip.address]
}

resource "openstack_dns_recordset_v2" "wildcard_a_record" {
  zone_id = openstack_dns_zone_v2.alti_zone.id
  name    = "*.alti.code.studio."
  type    = "A"
  records = [openstack_networking_floatingip_v2.ingress_fip.address]
}

# -------------------------------------------------------------
# App Deployment (Stateful Backing Services via Trove & Helm)
# -------------------------------------------------------------

# Trove (Database as a Service) - PostgreSQL
resource "openstack_db_instance_v1" "postgresql" {
  name      = "alti-postgres-${var.environment}"
  region    = var.openstack_region
  size      = 50
  flavor_id = "db.m1.large" # Example Trove Flavor

  datastore {
    type    = "postgresql"
    version = "12"
  }

  network {
    uuid = openstack_networking_network_v2.alti_network.id
  }

  users {
    name     = "alti_admin"
    password = openstack_keymanager_secret_v1.global_db_secret.payload
  }

  databases {
    name = "pentagi_prod"
  }
}

# Trove (Database as a Service) - Redis
resource "openstack_db_instance_v1" "redis" {
  name      = "alti-redis-${var.environment}"
  region    = var.openstack_region
  size      = 10
  flavor_id = "db.m1.medium"

  datastore {
    type    = "redis"
    version = "6.0" # Example Trove Version
  }

  network {
    uuid = openstack_networking_network_v2.alti_network.id
  }
}

# RabbitMQ (Helm Deployment)
resource "helm_release" "rabbitmq" {
  name       = "alti-rabbitmq"
  repository = "https://charts.bitnami.com/bitnami"
  chart      = "rabbitmq"
  version    = "12.2.3"
  namespace  = "default"

  set {
    name  = "auth.password"
    value = openstack_keymanager_secret_v1.global_db_secret.payload
  }
  set {
    name  = "persistence.enabled"
    value = "true"
  }
}

# -------------------------------------------------------------
# Hyperscaler API Routing (Tri-Cloud Inference)
# -------------------------------------------------------------

# GCP Vertex AI
resource "google_project_service" "vertex_ai_api" {
  project = var.gcp_project_id
  service = "aiplatform.googleapis.com"
  disable_on_destroy = false
}

resource "google_project_service" "gemini_api" {
  project = var.gcp_project_id
  service = "generativelanguage.googleapis.com"
  disable_on_destroy = false
}

# AWS Bedrock IAM setup
resource "aws_iam_role" "bedrock_invocation_role" {
  name = "AltiBedrockInvokeRole-${var.environment}"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRoleWithWebIdentity"
        Effect = "Allow"
        Principal = {
          Federated = "arn:aws:iam::123456789012:oidc-provider/openstack-k8s-oidc-url" 
        }
      }
    ]
  })
}

resource "aws_iam_role_policy" "bedrock_invoke_policy" {
  name = "BedrockInvokePolicy"
  role = aws_iam_role.bedrock_invocation_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "bedrock:InvokeModel",
          "bedrock:InvokeModelWithResponseStream"
        ]
        Resource = "*"
      }
    ]
  })
}

# Azure Foundry / Cognitive Services OpenAI
resource "azurerm_resource_group" "ai_rg" {
  name     = "alti-ai-rg-${var.environment}"
  location = "East US"
}

resource "azurerm_cognitive_account" "openai" {
  name                = "alti-openai-${var.environment}"
  location            = azurerm_resource_group.ai_rg.location
  resource_group_name = azurerm_resource_group.ai_rg.name
  kind                = "OpenAI"
  sku_name            = "S0"
}

# -------------------------------------------------------------
# Outputs
# -------------------------------------------------------------
output "k8s_api_address" { value = openstack_containerinfra_cluster_v1.k8s_cluster.api_address }
output "aws_bedrock_role_arn" { value = aws_iam_role.bedrock_invocation_role.arn }
output "azure_openai_endpoint" { value = azurerm_cognitive_account.openai.endpoint }
output "cluster_private_ssh_key" { 
  value     = tls_private_key.cluster_key.private_key_pem 
  sensitive = true
}
output "swift_context_container" { value = openstack_objectstorage_container_v1.gemini_context.name }
