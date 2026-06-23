# ==============================================================================
# ALTI CODE STUDIO: Azure Database & Cache Provisioning Module
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
# 1. Azure Database for PostgreSQL Flexible Server
# ------------------------------------------------------------------------------
resource "azurerm_postgresql_flexible_server" "postgres" {
  name                   = "alti-pg-${var.customer_id}-${var.environment}"
  resource_group_name    = var.resource_group_name
  location               = var.location
  version                = "15"
  delegated_subnet_id    = var.subnet_id
  
  administrator_login    = var.admin_username
  administrator_password = var.admin_password

  storage_mb = 131072 # 128 GB

  sku_name = "GP_Standard_D4ds_v5" # General Purpose VM instance

  backup_retention_days        = var.environment == "prod" ? 30 : 7
  geo_redundant_backup_enabled = var.environment == "prod" ? true : false

  lifecycle {
    ignore_changes = [
      zone,
      high_availability,
    ]
  }
}

resource "azurerm_postgresql_flexible_server_database" "pentagidb" {
  name      = "pentagidb"
  server_id = azurerm_postgresql_flexible_server.postgres.id
  colormap  = "SQL_Latin1_General_CP1_CI_AS"
  charset   = "UTF8"
}

# ------------------------------------------------------------------------------
# 2. Azure Cache for Redis
# ------------------------------------------------------------------------------
resource "azurerm_redis_cache" "cache" {
  name                = "alti-redis-${var.customer_id}-${var.environment}"
  location            = var.location
  resource_group_name = var.resource_group_name
  capacity            = 1
  family              = "C"
  sku_name            = "Standard"
  enable_non_ssl_port = false
  minimum_tls_version = "1.2"

  redis_configuration {
    enable_authentication = true
  }
}

# ------------------------------------------------------------------------------
# Variables
# ------------------------------------------------------------------------------
variable "customer_id" {
  type        = string
  description = "Unique identifier for the customer/tenant to ensure naming uniqueness"
}

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

variable "subnet_id" {
  type        = string
  description = "The ID of the delegated subnet for PostgreSQL integration"
}

variable "admin_username" {
  type        = string
  description = "PostgreSQL administrator login name"
}

variable "admin_password" {
  type        = string
  description = "PostgreSQL administrator login password"
  sensitive   = true
}

# ------------------------------------------------------------------------------
# Outputs
# ------------------------------------------------------------------------------
output "postgres_fqdn" {
  value       = azurerm_postgresql_flexible_server.postgres.fqdn
  description = "Fully qualified domain name of the PostgreSQL server"
}

output "postgres_server_id" {
  value       = azurerm_postgresql_flexible_server.postgres.id
  description = "ID of the PostgreSQL flexible server"
}

output "redis_hostname" {
  value       = azurerm_redis_cache.cache.hostname
  description = "The hostname of the Redis instance"
}

output "redis_ssl_port" {
  value       = azurerm_redis_cache.cache.ssl_port
  description = "The SSL port of the Redis instance"
}

output "redis_primary_access_key" {
  value       = azurerm_redis_cache.cache.primary_access_key
  sensitive   = true
  description = "The primary access key for the Redis cache"
}
