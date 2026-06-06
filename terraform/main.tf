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
  }

  # Keeping state in GCS for now as agreed
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
  name     = "public" # Standard external network name in OpenStack
  external = true
}

# Magnum Kubernetes Cluster
resource "openstack_containerinfra_cluster_v1" "k8s_cluster" {
  name                = "alti-k8s-${var.environment}"
  cluster_template_id = openstack_containerinfra_clustertemplate_v1.k8s_template.id
  master_count        = 3
  node_count          = 5
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
  floating_ip_enabled   = true
}

# Note: Redis, PostgreSQL, and RabbitMQ will be deployed into the Magnum cluster via Helm 
# rather than native managed services to maintain true self-hosted private cloud neutrality.

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
          # This should be replaced with the actual OIDC provider URL from the OpenStack cluster
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
