# Azure Single-Tenant Network Boundary
resource "azurerm_virtual_network" "tenant_vnet" {
  name                = "vnet-tenant-${var.tenant_id}"
  address_space       = ["10.0.0.0/16"]
  location            = "East US"
  resource_group_name = "rg-tenant-${var.tenant_id}"
  tags = {
    Tenant = var.tenant_id
    Tier   = "single-tenant"
  }
}

resource "azurerm_subnet" "tenant_private_subnet" {
  name                 = "subnet-private-tenant-${var.tenant_id}"
  resource_group_name  = "rg-tenant-${var.tenant_id}"
  virtual_network_name = azurerm_virtual_network.tenant_vnet.name
  address_prefixes     = ["10.0.1.0/24"]
}
