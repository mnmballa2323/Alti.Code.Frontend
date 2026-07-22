locals {
  is_azure_single_tenant = var.deployment_tier == "single-tenant"
  is_azure_fedramp       = var.deployment_tier == "fedramp"
  
  # Force GovCloud region and environment if FedRAMP tier is selected
  azure_effective_location = var.deployment_tier == "fedramp" ? "usgovvirginia" : var.azure_location
  azure_environment        = var.deployment_tier == "fedramp" ? "usgovernment" : "public"
  
  # Deployment SKU logic
  azure_sku_name     = local.is_azure_single_tenant ? "ProvisionedManaged" : "Standard"
  azure_sku_capacity = local.is_azure_single_tenant ? 100 : 10 # PTUs vs Tokens/min
}

provider "azurerm" {
  features {}
  subscription_id = var.azure_subscription_id
  environment     = local.azure_environment
}

resource "azurerm_resource_group" "ai_foundry_rg" {
  name     = "AltiCodeStudio-AIFoundry-RG-${var.environment}"
  location = local.azure_effective_location
}

# ------------------------------------------------------------------------------
# Azure OpenAI Cognitive Account
# ------------------------------------------------------------------------------

resource "azurerm_cognitive_account" "openai" {
  name                = "alticodestudio-openai-${var.environment}"
  location            = azurerm_resource_group.ai_foundry_rg.location
  resource_group_name = azurerm_resource_group.ai_foundry_rg.name
  kind                = "OpenAI"
  sku_name            = "S0"
}

# ------------------------------------------------------------------------------
# Azure OpenAI GPT Deployments (Multi-Tenant & Single-Tenant PTU)
# ------------------------------------------------------------------------------

resource "azurerm_cognitive_deployment" "gpt_4o" {
  name                 = "gpt-4o"
  cognitive_account_id = azurerm_cognitive_account.openai.id

  model {
    format  = "OpenAI"
    name    = "gpt-4o"
    version = "2024-05-13"
  }

  sku {
    name     = local.azure_sku_name
    capacity = local.azure_sku_capacity
  }
}
