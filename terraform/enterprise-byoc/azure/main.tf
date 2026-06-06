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
# God-Tier Hardware Cryptography (Managed HSM)
# ==========================================
resource "azurerm_key_vault_managed_hardware_security_module" "mhsm" {
  name                       = "altimhsm${var.customer_name}"
  resource_group_name        = azurerm_resource_group.rg.name
  location                   = azurerm_resource_group.rg.location
  tenant_id                  = data.azurerm_client_config.current.tenant_id
  sku_name                   = "Standard_B1"
  purge_protection_enabled   = true
  soft_delete_retention_days = 90
  
  admin_object_ids = [data.azurerm_client_config.current.object_id]
}

# ==========================================
# VNet & Networking (DDoS Standard)
# ==========================================
resource "azurerm_network_ddos_protection_plan" "ddos" {
  name                = "alti-ddos-protection"
  location            = azurerm_resource_group.rg.location
  resource_group_name = azurerm_resource_group.rg.name
}

resource "azurerm_virtual_network" "vnet" {
  name                = "alti-vnet-${var.customer_name}"
  address_space       = ["10.0.0.0/16"]
  location            = azurerm_resource_group.rg.location
  resource_group_name = azurerm_resource_group.rg.name
  
  ddos_protection_plan {
    id     = azurerm_network_ddos_protection_plan.ddos.id
    enable = true
  }
}

resource "azurerm_subnet" "aks_subnet" {
  name                 = "aks-subnet"
  resource_group_name  = azurerm_resource_group.rg.name
  virtual_network_name = azurerm_virtual_network.vnet.name
  address_prefixes     = ["10.0.1.0/24"]
  private_endpoint_network_policies_enabled = true
}

resource "azurerm_subnet" "pe_subnet" {
  name                 = "private-endpoint-subnet"
  resource_group_name  = azurerm_resource_group.rg.name
  virtual_network_name = azurerm_virtual_network.vnet.name
  address_prefixes     = ["10.0.2.0/24"]
}

# ==========================================
# Dedicated Host (Physical Hardware Isolation)
# ==========================================
resource "azurerm_dedicated_host_group" "dhg" {
  name                = "alti-host-group"
  resource_group_name = azurerm_resource_group.rg.name
  location            = azurerm_resource_group.rg.location
  platform_fault_domain_count = 1
}

resource "azurerm_dedicated_host" "dh" {
  name                    = "alti-physical-host"
  location                = azurerm_resource_group.rg.location
  dedicated_host_group_id = azurerm_dedicated_host_group.dhg.id
  sku_name                = "DCsv3-Type1"
}

# ==========================================
# Confidential Computing AKS (Intel SGX Memory Encryption)
# ==========================================
resource "azurerm_kubernetes_cluster" "aks" {
  name                = "alti-data-plane-${var.customer_name}"
  location            = azurerm_resource_group.rg.location
  resource_group_name = azurerm_resource_group.rg.name
  dns_prefix          = "alti-${var.customer_name}"

  # God-Tier: Intel SGX hardware memory encryption VMs
  default_node_pool {
    name           = "confpool"
    node_count     = 3
    vm_size        = "Standard_DC4s_v3" # Intel SGX enabled
    vnet_subnet_id = azurerm_subnet.aks_subnet.id
    host_group_id  = azurerm_dedicated_host_group.dhg.id
  }

  confidential_computing {
    sgx_quote_helper_enabled = true
  }

  identity { type = "SystemAssigned" }

  network_profile {
    network_plugin    = "azure"
    load_balancer_sku = "standard"
  }
}

# ==========================================
# Active Threat Hunting & SIEM
# ==========================================
resource "azurerm_security_center_subscription_pricing" "defender_containers" {
  tier          = "Standard"
  resource_type = "Containers"
}

resource "azurerm_log_analytics_workspace" "law" {
  name                = "alti-sentinel-law-${var.customer_name}"
  location            = azurerm_resource_group.rg.location
  resource_group_name = azurerm_resource_group.rg.name
  sku                 = "PerGB2018"
}

resource "azurerm_sentinel_log_analytics_workspace_onboarding" "sentinel" {
  workspace_id = azurerm_log_analytics_workspace.law.id
}

# ==========================================
# Azure OpenAI Cognitive Service & Private Link
# ==========================================
resource "azurerm_cognitive_account" "openai" {
  name                          = "alti-openai-${var.customer_name}"
  location                      = azurerm_resource_group.rg.location
  resource_group_name           = azurerm_resource_group.rg.name
  kind                          = "OpenAI"
  sku_name                      = "S0"
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
