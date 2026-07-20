provider "azurerm" {
  features {}
}

resource "azurerm_resource_group" "rg" {
  name     = "alti-single-aks-rg-${var.environment}"
  location = "East US"
}

resource "azurerm_kubernetes_cluster" "aks" {
  name                = "alti-single-aks-${var.environment}"
  location            = azurerm_resource_group.rg.location
  resource_group_name = azurerm_resource_group.rg.name
  dns_prefix          = "altisingle"

  default_node_pool {
    name       = "default"
    node_count = 3
    vm_size    = "Standard_D4_v2"
  }

  identity {
    type = "SystemAssigned"
  }
}\n