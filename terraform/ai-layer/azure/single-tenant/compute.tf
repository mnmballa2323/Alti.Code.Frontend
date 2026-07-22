# Azure Single-Tenant Compute (AKS isolated boundary)
resource "azurerm_kubernetes_cluster" "tenant_cluster" {
  name                = "aks-tenant-${var.tenant_id}"
  location            = "East US"
  resource_group_name = "rg-tenant-${var.tenant_id}"
  dns_prefix          = "aks-tenant-${var.tenant_id}"
  private_cluster_enabled = true

  default_node_pool {
    name           = "default"
    node_count     = 1
    vm_size        = "Standard_DS2_v2"
    vnet_subnet_id = azurerm_subnet.tenant_private_subnet.id
  }

  identity {
    type = "SystemAssigned"
  }

  tags = {
    Tenant = var.tenant_id
    Tier   = "single-tenant"
  }
}
