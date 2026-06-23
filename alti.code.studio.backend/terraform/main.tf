# ═══════════════════════════════════════════════════════════════
# Alti.Code.Studio — Azure Native Infrastructure as Code (Terraform)
# S&P 500 Enterprise Infrastructure — Non-Containerized
# ═══════════════════════════════════════════════════════════════

terraform {
  required_version = ">= 1.5.0"

  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.0"
    }
  }

  backend "azurerm" {
    resource_group_name  = "alti-code-studio-tfstate-rg"
    storage_account_name = "altitfstatesa"
    container_name       = "tfstate"
    key                  = "terraform.tfstate"
  }
}

provider "azurerm" {
  features {}
}

# ═══════════════════════════════════════════════
# Variables
# ═══════════════════════════════════════════════

variable "resource_group_name" {
  description = "The name of the resource group."
  type        = string
  default     = "alti-code-studio-rg"
}

variable "location" {
  description = "The Azure region to deploy resources."
  type        = string
  default     = "eastus2"
}

variable "environment" {
  description = "Deployment environment"
  type        = string
  default     = "production"
}

# ═══════════════════════════════════════════════
# Resource Group
# ═══════════════════════════════════════════════

resource "azurerm_resource_group" "rg" {
  name     = var.resource_group_name
  location = var.location

  tags = {
    Environment = var.environment
    Project     = "Alti.Code.Studio"
  }
}

# ═══════════════════════════════════════════════
# Virtual Network (VNet) & Subnets
# ═══════════════════════════════════════════════

resource "azurerm_virtual_network" "vnet" {
  name                = "alti-vnet"
  address_space       = ["10.0.0.0/16"]
  location            = azurerm_resource_group.rg.location
  resource_group_name = azurerm_resource_group.rg.name
}

resource "azurerm_subnet" "web_subnet" {
  name                 = "alti-web-subnet"
  resource_group_name  = azurerm_resource_group.rg.name
  virtual_network_name = azurerm_virtual_network.vnet.name
  address_prefixes     = ["10.0.1.0/24"]

  delegation {
    name = "web_app_delegation"
    service_delegation {
      name    = "Microsoft.Web/serverFarms"
      actions = ["Microsoft.Network/virtualNetworks/subnets/action"]
    }
  }
}

resource "azurerm_subnet" "db_subnet" {
  name                 = "alti-db-subnet"
  resource_group_name  = azurerm_resource_group.rg.name
  virtual_network_name = azurerm_virtual_network.vnet.name
  address_prefixes     = ["10.0.2.0/24"]
  service_endpoints    = ["Microsoft.Sql"]
}

# ═══════════════════════════════════════════════
# Azure Key Vault (Secrets Management)
# ═══════════════════════════════════════════════

data "azurerm_client_config" "current" {}

resource "azurerm_key_vault" "kv" {
  name                        = "alti-keyvault-${var.environment}"
  location                    = azurerm_resource_group.rg.location
  resource_group_name         = azurerm_resource_group.rg.name
  enabled_for_disk_encryption = true
  tenant_id                   = data.azurerm_client_config.current.tenant_id
  soft_delete_retention_days  = 7
  purge_protection_enabled    = false

  sku_name = "standard"

  access_policy {
    tenant_id = data.azurerm_client_config.current.tenant_id
    object_id = data.azurerm_client_config.current.object_id

    secret_permissions = [
      "Get", "List", "Set", "Delete", "Purge", "Recover"
    ]
  }
}

# ═══════════════════════════════════════════════
# Cosmos DB (MongoDB API)
# ═══════════════════════════════════════════════

resource "azurerm_cosmosdb_account" "cosmos" {
  name                = "alti-cosmosdb-${var.environment}"
  location            = azurerm_resource_group.rg.location
  resource_group_name = azurerm_resource_group.rg.name
  offer_type          = "Standard"
  kind                = "MongoDB"

  capabilities {
    name = "EnableMongo"
  }

  consistency_policy {
    consistency_level = "Session"
  }

  geo_location {
    location          = azurerm_resource_group.rg.location
    failover_priority = 0
  }
}

# ═══════════════════════════════════════════════
# Azure Database for PostgreSQL Flexible Server
# ═══════════════════════════════════════════════

resource "azurerm_postgresql_flexible_server" "postgres" {
  name                   = "alti-postgres-${var.environment}"
  resource_group_name    = azurerm_resource_group.rg.name
  location               = azurerm_resource_group.rg.location
  version                = "15"
  administrator_login    = "altiadm"
  administrator_password = "SecurePassword123!" # Replace with a Key Vault reference in prod
  storage_mb             = 32768
  sku_name               = "GP_Standard_D2s_v3"
}

# Allow connections from Azure services
resource "azurerm_postgresql_flexible_server_firewall_rule" "allow_azure_services" {
  name             = "allow-azure"
  server_id        = azurerm_postgresql_flexible_server.postgres.id
  start_ip_address = "0.0.0.0"
  end_ip_address   = "0.0.0.0"
}

# ═══════════════════════════════════════════════
# Azure Cache for Redis
# ═══════════════════════════════════════════════

resource "azurerm_redis_cache" "redis" {
  name                = "alti-redis-${var.environment}"
  location            = azurerm_resource_group.rg.location
  resource_group_name = azurerm_resource_group.rg.name
  capacity            = 1
  family              = "C"
  sku_name            = "Basic"
  enable_non_ssl_port = false
  minimum_tls_version = "1.2"
}

# ═══════════════════════════════════════════════
# Azure App Service (Express API Host)
# ═══════════════════════════════════════════════

resource "azurerm_service_plan" "asp" {
  name                = "alti-appservice-plan"
  resource_group_name = azurerm_resource_group.rg.name
  location            = azurerm_service_plan.asp.location
  os_type             = "Linux"
  sku_name            = "P1v2"
}

resource "azurerm_linux_web_app" "web" {
  name                = "alti-code-studio-backend"
  resource_group_name = azurerm_resource_group.rg.name
  location            = azurerm_resource_group.rg.location
  service_plan_id     = azurerm_service_plan.asp.id

  site_config {
    always_on = true
    
    application_stack {
      node_version = "node|18-lts"
    }
  }

  app_settings = {
    "NODE_ENV"             = var.environment
    "PORT"                 = "5000"
    "AZURE_KEYVAULT_NAME"  = azurerm_key_vault.kv.name
    "DATABASE_LOCAL"       = "postgresql://altiadm:SecurePassword123!@${azurerm_postgresql_flexible_server.postgres.fqdn}:5432/postgres?sslmode=require"
    "REDIS_URL"            = "rediss://:${azurerm_redis_cache.redis.primary_access_key}@${azurerm_redis_cache.redis.hostname}:${azurerm_redis_cache.redis.ssl_port}"
    "APPINSIGHTS_INSTRUMENTATIONKEY" = azurerm_application_insights.appinsights.instrumentation_key
  }
}

# ═══════════════════════════════════════════════
# Azure Monitor & Application Insights
# ═══════════════════════════════════════════════

resource "azurerm_log_analytics_workspace" "logworkspace" {
  name                = "alti-log-workspace"
  location            = azurerm_resource_group.rg.location
  resource_group_name = azurerm_resource_group.rg.name
  sku                 = "PerGB2018"
  retention_in_days   = 30
}

resource "azurerm_application_insights" "appinsights" {
  name                = "alti-appinsights"
  location            = azurerm_resource_group.rg.location
  resource_group_name = azurerm_resource_group.rg.name
  workspace_id        = azurerm_log_analytics_workspace.logworkspace.id
  application_type    = "web"
}
