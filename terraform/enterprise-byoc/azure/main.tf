terraform {
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.0"
    }
  }
}

provider "azurerm" {
  features {}
}

variable "location" {
  description = "The Azure region to deploy the Alti Code Studio Data Plane."
  type        = string
  default     = "East US"
}

variable "customer_name" {
  description = "The name of the Enterprise customer."
  type        = string
}

data "azurerm_client_config" "current" {}

resource "azurerm_resource_group" "rg" {
  name     = "alti-enterprise-${var.customer_name}-rg"
  location = var.location
}

# ==========================================
# Enterprise Security (Key Vault & Defender)
# ==========================================
resource "azurerm_key_vault" "kv" {
  name                        = "altikv${var.customer_name}"
  location                    = azurerm_resource_group.rg.location
  resource_group_name         = azurerm_resource_group.rg.name
  tenant_id                   = data.azurerm_client_config.current.tenant_id
  sku_name                    = "premium"
  purge_protection_enabled    = true
}

resource "azurerm_security_center_subscription_pricing" "defender_containers" {
  tier          = "Standard"
  resource_type = "Containers"
}

# ==========================================
# VNet & Networking (Zero-Trust)
# ==========================================
resource "azurerm_virtual_network" "vnet" {
  name                = "alti-vnet-${var.customer_name}"
  address_space       = ["10.0.0.0/16"]
  location            = azurerm_resource_group.rg.location
  resource_group_name = azurerm_resource_group.rg.name
}

resource "azurerm_subnet" "aks_subnet" {
  name                 = "aks-subnet"
  resource_group_name  = azurerm_resource_group.rg.name
  virtual_network_name = azurerm_virtual_network.vnet.name
  address_prefixes     = ["10.0.1.0/24"]
  
  # Required for Private Endpoint
  private_endpoint_network_policies_enabled = true
}

resource "azurerm_subnet" "pe_subnet" {
  name                 = "private-endpoint-subnet"
  resource_group_name  = azurerm_resource_group.rg.name
  virtual_network_name = azurerm_virtual_network.vnet.name
  address_prefixes     = ["10.0.2.0/24"]
}

# ==========================================
# Edge Protection (Azure Front Door WAF)
# ==========================================
resource "azurerm_cdn_frontdoor_profile" "afd" {
  name                = "alti-frontdoor-${var.customer_name}"
  resource_group_name = azurerm_resource_group.rg.name
  sku_name            = "Premium_AzureFrontDoor"
}

resource "azurerm_cdn_frontdoor_firewall_policy" "waf" {
  name                              = "AltiWafPolicy"
  resource_group_name               = azurerm_resource_group.rg.name
  sku_name                          = azurerm_cdn_frontdoor_profile.afd.sku_name
  enabled                           = true
  mode                              = "Prevention"
}

# ==========================================
# AKS Cluster (Customer Data Plane)
# ==========================================
resource "azurerm_kubernetes_cluster" "aks" {
  name                = "alti-data-plane-${var.customer_name}"
  location            = azurerm_resource_group.rg.location
  resource_group_name = azurerm_resource_group.rg.name
  dns_prefix          = "alti-${var.customer_name}"

  default_node_pool {
    name           = "default"
    node_count     = 3
    vm_size        = "Standard_NC6s_v3" # GPU enabled for inference
    vnet_subnet_id = azurerm_subnet.aks_subnet.id
  }

  identity {
    type = "SystemAssigned"
  }

  key_vault_secrets_provider {
    secret_rotation_enabled = true
  }

  network_profile {
    network_plugin    = "azure"
    load_balancer_sku = "standard"
  }
}

# ==========================================
# Azure OpenAI Cognitive Service & Private Link
# ==========================================
resource "azurerm_cognitive_account" "openai" {
  name                = "alti-openai-${var.customer_name}"
  location            = azurerm_resource_group.rg.location
  resource_group_name = azurerm_resource_group.rg.name
  kind                = "OpenAI"
  sku_name            = "S0"
  
  # Lock down public access
  public_network_access_enabled = false
}

resource "azurerm_private_endpoint" "openai_pe" {
  name                = "openai-private-endpoint"
  location            = azurerm_resource_group.rg.location
  resource_group_name = azurerm_resource_group.rg.name
  subnet_id           = azurerm_subnet.pe_subnet.id

  private_service_connection {
    name                           = "openai-privatelink"
    private_connection_resource_id = azurerm_cognitive_account.openai.id
    subresource_names              = ["account"]
    is_manual_connection           = false
  }
}

resource "azurerm_role_assignment" "aks_to_openai" {
  scope                = azurerm_cognitive_account.openai.id
  role_definition_name = "Cognitive Services OpenAI User"
  principal_id         = azurerm_kubernetes_cluster.aks.kubelet_identity[0].object_id
}
