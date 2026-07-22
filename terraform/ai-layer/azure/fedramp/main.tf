# Azure Government Cloud Provider Restrictions
provider "azurerm" {
  features {}
  environment = "usgovernment" # Strictly lock to Azure Government
}

variable "tenant_id" {
  type        = string
  description = "Tenant ID for Azure Gov deployment"
}
