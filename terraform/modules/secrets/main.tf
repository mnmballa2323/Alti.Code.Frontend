# ==============================================================================
# ALTI CODE STUDIO: Azure Key Vault Secret Management Module
# ==============================================================================

terraform {
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.0"
    }
  }
}

# ------------------------------------------------------------------------------
# Azure Key Vault
# ------------------------------------------------------------------------------
resource "azurerm_key_vault" "vault" {
  name                        = "alti-vault-${var.environment}"
  location                    = var.location
  resource_group_name         = var.resource_group_name
  enabled_for_disk_encryption = true
  tenant_id                   = var.tenant_id
  soft_delete_retention_days  = 7
  purge_protection_enabled    = false

  sku_name = "standard"

  # Access policies can be added dynamically or managed via RBAC
  network_acls {
    default_action = "Allow"
    bypass         = "AzureServices"
  }
}

# ------------------------------------------------------------------------------
# Key Vault Secrets
# ------------------------------------------------------------------------------
resource "azurerm_key_vault_secret" "secret" {
  for_each     = var.secrets
  name         = each.key
  value        = each.value
  key_vault_id = azurerm_key_vault.vault.id
}

# ------------------------------------------------------------------------------
# Variables
# ------------------------------------------------------------------------------
variable "environment" {
  type        = string
  description = "Deployment environment (e.g. prod, staging)"
}

variable "location" {
  type        = string
  description = "Azure region where resources will be created"
}

variable "resource_group_name" {
  type        = string
  description = "Name of the resource group"
}

variable "tenant_id" {
  type        = string
  description = "The Azure Active Directory Tenant ID"
}

variable "secrets" {
  description = "A map of secret names to their values"
  type        = map(string)
  sensitive   = true
}

# ------------------------------------------------------------------------------
# Outputs
# ------------------------------------------------------------------------------
output "key_vault_id" {
  value       = azurerm_key_vault.vault.id
  description = "The Resource ID of the Azure Key Vault"
}

output "key_vault_uri" {
  value       = azurerm_key_vault.vault.vault_uri
  description = "The URI of the Azure Key Vault"
}

output "secret_uris" {
  value = {
    for k, v in azurerm_key_vault_secret.secret : k => v.id
  }
  description = "Map of secret names to their corresponding secret version URIs"
}
