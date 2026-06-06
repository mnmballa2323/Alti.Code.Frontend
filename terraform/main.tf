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
  auth_url    = var.openstack_auth_url
  tenant_id   = var.openstack_tenant_id
  region      = var.openstack_region
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
# Core Infrastructure (OpenStack Private Cloud)
# -------------------------------------------------------------

# Network
resource "openstack_networking_network_v2" "alti_network" {
  name           = "alti-network-${var.environment}"
  admin_state_up = true
}

resource "openstack_networking_subnet_v2" "alti_subnet" {
  name       = "alti-subnet-${var.environment}"
  network_id = openstack_networking_network_v2.alti_network.id
  cidr       = "10.0.0.0/16"
  ip_version = 4
}

resource "openstack_networking_router_v2" "alti_router" {
  name                = "alti-router-${var.environment}"
  admin_state_up      = true
  external_network_id = data.openstack_networking_network_v2.ext_net.id
}

resource "openstack_networking_router_interface_v2" "alti_router_interface" {
  router_id = openstack_networking_router_v2.alti_router.id
  subnet_id = openstack_networking_subnet_v2.alti_subnet.id
}

data "openstack_networking_network_v2" "ext_net" {
  name     = "public"
  external = true
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
  name        = "alti-cluster-sg-${var.environment}"
  description = "Strict firewall rules for the Alti Code Studio Magnum Cluster"
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

# Magnum Kubernetes Cluster
resource "openstack_containerinfra_cluster_v1" "k8s_cluster" {
  name                = "alti-k8s-${var.environment}"
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
  master_flavor         = "m1.medium"
  flavor                = "m1.large"
  image                 = "fedora-coreos-latest"
  external_network_id   = data.openstack_networking_network_v2.ext_net.id
  
  # Highly Secure: Master nodes are private, no floating IPs exposed
  floating_ip_enabled   = false

  labels = {
    kube_tag                       = "v1.28.0"
    octavia_ingress_controller_tag = "1.23.0"
    octavia_provider               = "amphora"
    cinder_csi_enabled             = "true"
    manila_csi_enabled             = "true"
    master_lb_enabled              = "true"
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
# App Deployment (Stateful Backing Services via Helm)
# -------------------------------------------------------------

resource "helm_release" "postgresql" {
  name       = "alti-postgres"
  repository = "https://charts.bitnami.com/bitnami"
  chart      = "postgresql"
  version    = "12.12.10"
  namespace  = "default"

  set {
    name  = "global.postgresql.auth.postgresPassword"
    value = openstack_keymanager_secret_v1.global_db_secret.payload
  }
  set {
    name  = "primary.persistence.enabled"
    value = "true"
  }
  set {
    name  = "primary.persistence.size"
    value = "50Gi"
  }
}

resource "helm_release" "redis" {
  name       = "alti-redis"
  repository = "https://charts.bitnami.com/bitnami"
  chart      = "redis"
  version    = "18.1.5"
  namespace  = "default"

  set {
    name  = "auth.password"
    value = openstack_keymanager_secret_v1.global_db_secret.payload
  }
  set {
    name  = "architecture"
    value = "standalone"
  }
  set {
    name  = "master.persistence.enabled"
    value = "true"
  }
  set {
    name  = "master.persistence.size"
    value = "10Gi"
  }
}

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
