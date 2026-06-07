# Azure Global Active-Active Architecture
# - Azure Front Door for global load balancing and edge caching
# - Azure Cosmos DB with Multi-Region Writes for active-active data scale

provider "azurerm" {
  features {}
}

# ==========================================
# Azure Cosmos DB (Multi-Region Writes)
# ==========================================
resource "azurerm_cosmosdb_account" "alti_global_db" {
  name                = "alti-global-control-plane"
  location            = "eastus"
  resource_group_name = "alti-control-plane-rg"
  offer_type          = "Standard"
  kind                = "GlobalDocumentDB"

  enable_automatic_failover = true
  enable_multiple_write_locations = true # TRUE ACTIVE-ACTIVE

  consistency_policy {
    consistency_level       = "Session"
    max_interval_in_seconds = 5
    max_staleness_prefix    = 100
  }

  geo_location {
    location          = "eastus"
    failover_priority = 0
  }

  geo_location {
    location          = "westeurope"
    failover_priority = 1
  }
}

# ==========================================
# Azure Front Door (Global Load Balancer)
# ==========================================
resource "azurerm_frontdoor" "alti_global" {
  name                = "alti-control-plane-fd"
  resource_group_name = "alti-control-plane-rg"

  routing_rule {
    name               = "default-route"
    accepted_protocols = ["Http", "Https"]
    patterns_to_match  = ["/*"]
    frontend_endpoints = ["default-frontend"]
    forwarding_configuration {
      forwarding_protocol = "HttpsOnly"
      backend_pool_name   = "alti-global-backend"
    }
  }

  backend_pool_load_balancing {
    name = "default-lb"
    sample_size = 4
    successful_samples_required = 2
  }

  backend_pool_health_probe {
    name = "default-probe"
    path = "/healthz"
    protocol = "Https"
    interval_in_seconds = 30
  }

  backend_pool {
    name = "alti-global-backend"
    
    backend {
      host_header = "eastus.api.alticodestudio.com"
      address     = "eastus.api.alticodestudio.com"
      http_port   = 80
      https_port  = 443
      priority    = 1
      weight      = 50
    }

    backend {
      host_header = "westeurope.api.alticodestudio.com"
      address     = "westeurope.api.alticodestudio.com"
      http_port   = 80
      https_port  = 443
      priority    = 1
      weight      = 50
    }

    load_balancing_name = "default-lb"
    health_probe_name   = "default-probe"
  }

  frontend_endpoint {
    name      = "default-frontend"
    host_name = "alti-control-plane-fd.azurefd.net"
  }
}
