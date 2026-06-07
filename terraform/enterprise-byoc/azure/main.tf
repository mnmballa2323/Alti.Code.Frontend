terraform {
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.0"
    }
  }
}

# Provider points to the physically disconnected Azure Stack Hub appliance URL, not public Azure.
provider "azurerm" {
  features {}
  environment = "custom"
  metadata_host = "management.${var.stack_hub_domain}"
}

variable "location" {
  description = "The physical location of the Azure Stack Hub appliance (e.g., bunker-alpha)."
  type        = string
  default     = "local"
}

variable "customer_name" {
  description = "The name of the Enterprise customer."
  type        = string
}

variable "stack_hub_domain" {
  description = "The domain name assigned to the local Azure Stack Hub infrastructure."
  type        = string
}

data "azurerm_client_config" "current" {}

resource "azurerm_resource_group" "rg" {
  name     = "alti-enterprise-${var.customer_name}-rg"
  location = var.location
}

# ==========================================
# Disconnected Air-Gapped VNet
# ==========================================
resource "azurerm_virtual_network" "vnet" {
  name                = "alti-disconnected-vnet-${var.customer_name}"
  address_space       = ["10.0.0.0/16"]
  location            = azurerm_resource_group.rg.location
  resource_group_name = azurerm_resource_group.rg.name
}

resource "azurerm_subnet" "aks_subnet" {
  name                 = "aks-subnet"
  resource_group_name  = azurerm_resource_group.rg.name
  virtual_network_name = azurerm_virtual_network.vnet.name
  address_prefixes     = ["10.0.1.0/24"]
}

# ==========================================
# Disconnected Hardware Cryptography
# ==========================================
# In Azure Stack Hub, Key Vault runs locally on the disconnected hardware appliance.
resource "azurerm_key_vault" "local_kv" {
  name                        = "altikv${var.customer_name}"
  location                    = azurerm_resource_group.rg.location
  resource_group_name         = azurerm_resource_group.rg.name
  tenant_id                   = data.azurerm_client_config.current.tenant_id
  sku_name                    = "standard"
  purge_protection_enabled    = true
}

# ==========================================
# Azure Arc for Kubernetes (Control Plane Projection)
# ==========================================
# This projects the management of the disconnected cluster to Liberty Center One over a secure private link,
# without exposing the data plane workloads.
resource "azurerm_kubernetes_cluster_extension" "arc" {
  name           = "azure-arc"
  cluster_id     = azurerm_kubernetes_cluster.aks_stack.id
  extension_type = "microsoft.azurearc.data"
}

# ==========================================
# AKS on Azure Stack Hub (Disconnected Data Plane)
# ==========================================
resource "azurerm_kubernetes_cluster" "aks_stack" {
  name                = "alti-data-plane-${var.customer_name}"
  location            = azurerm_resource_group.rg.location
  resource_group_name = azurerm_resource_group.rg.name
  dns_prefix          = "alti-${var.customer_name}"

  default_node_pool {
    name           = "default"
    node_count     = 3
    vm_size        = "Standard_NC6s_v3" # Assumes GPU capacity exists on the local appliance
    vnet_subnet_id = azurerm_subnet.aks_subnet.id
  }

  identity { type = "SystemAssigned" }

  network_profile {
    network_plugin    = "azure"
    load_balancer_sku = "standard"
  }
}

# ==========================================
# Azure ExpressRoute Direct (Physical Fiber Bypass)
# ==========================================
# If the bunker needs to occasionally sync weights with Public Azure OpenAI, it bypasses the internet completely.
resource "azurerm_express_route_circuit" "erc" {
  name                  = "alti-expressroute-direct"
  resource_group_name   = azurerm_resource_group.rg.name
  location              = azurerm_resource_group.rg.location
  service_provider_name = "Equinix"
  peering_location      = "Silicon Valley"
  bandwidth_in_mbps     = 10000

  sku {
    tier   = "Premium"
    family = "MeteredData"
  }
}
