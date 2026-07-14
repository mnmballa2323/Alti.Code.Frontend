# Azure Single-Tenant Customer-Managed Encryption Key (CMEK)
resource "azurerm_key_vault" "tenant_vault" {
  name                        = "kv-tenant-${var.tenant_id}"
  location                    = "East US"
  resource_group_name         = "rg-tenant-${var.tenant_id}"
  tenant_id                   = var.azure_tenant_id
  sku_name                    = "premium"
  purge_protection_enabled    = true
  soft_delete_retention_days  = 7

  tags = {
    Tenant = var.tenant_id
    Tier   = "single-tenant"
  }
}

resource "azurerm_key_vault_key" "tenant_key" {
  name         = "key-tenant-${var.tenant_id}"
  key_vault_id = azurerm_key_vault.tenant_vault.id
  key_type     = "RSA"
  key_size     = 2048
  key_opts     = ["decrypt", "encrypt", "sign", "unwrapKey", "verify", "wrapKey"]
}
