provider "azurerm" {
  features {}
}

resource "azurerm_resource_group" "rg" {
  name     = "alti-multi-rg-${var.environment}"
  location = "East US"
}

resource "azurerm_container_group" "app" {
  name                = "alti-aci-${var.environment}"
  location            = azurerm_resource_group.rg.location
  resource_group_name = azurerm_resource_group.rg.name
  ip_address_type     = "Public"
  dns_name_label      = "alti-multi-${var.environment}"
  os_type             = "Linux"

  container {
    name   = "alti-code-studio"
    image  = var.docker_image
    cpu    = "1.0"
    memory = "1.5"

    ports {
      port     = 3000
      protocol = "TCP"
    }

    environment_variables = {
      "KEYCLOAK_ISSUER"        = var.lco_keycloak_issuer
      "KEYCLOAK_CLIENT_ID"     = var.lco_keycloak_client_id
      "KEYCLOAK_CLIENT_SECRET" = var.lco_keycloak_client_secret
      "LCO_BILLING_API"        = var.lco_billing_api
    }
  }
}\n