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

resource "azurerm_resource_group" "rg" {
  name     = "alti-enterprise-${var.customer_name}-rg"
  location = var.location
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

  network_profile {
    network_plugin    = "azure"
    load_balancer_sku = "standard"
  }
}

# ==========================================
# Azure OpenAI Cognitive Service Binding
# ==========================================
resource "azurerm_cognitive_account" "openai" {
  name                = "alti-openai-${var.customer_name}"
  location            = azurerm_resource_group.rg.location
  resource_group_name = azurerm_resource_group.rg.name
  kind                = "OpenAI"
  sku_name            = "S0"
}

resource "azurerm_role_assignment" "aks_to_openai" {
  scope                = azurerm_cognitive_account.openai.id
  role_definition_name = "Cognitive Services OpenAI User"
  principal_id         = azurerm_kubernetes_cluster.aks.kubelet_identity[0].object_id
}
