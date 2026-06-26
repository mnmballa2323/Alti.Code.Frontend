# ==============================================================================
# ALTI CODE STUDIO: GCP Database & Cache Provisioning Module
# ==============================================================================

terraform {
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
  }
}

# ------------------------------------------------------------------------------
# 1. Google Cloud SQL for PostgreSQL Database Instance
# ------------------------------------------------------------------------------
resource "google_sql_database_instance" "postgres" {
  name             = "alti-pg-${var.customer_id}-${var.environment}"
  database_version = "POSTGRES_15"
  region           = var.region

  settings {
    tier = var.db_tier

    ip_configuration {
      ipv4_enabled    = false
      private_network = var.network_id
    }

    backup_configuration {
      enabled    = true
      start_time = "02:00"
    }
  }

  deletion_protection = false # Set to true in prod if desired
}

resource "google_sql_database" "pentagidb" {
  name     = "pentagidb"
  instance = google_sql_database_instance.postgres.name
}

# ------------------------------------------------------------------------------
# 2. Google Cloud Memorystore for Redis
# ------------------------------------------------------------------------------
resource "google_redis_instance" "cache" {
  name               = "alti-redis-${var.customer_id}-${var.environment}"
  tier               = var.redis_tier
  memory_size_gb     = var.redis_size
  region             = var.region
  authorized_network = var.network_id

  redis_version = "REDIS_7_0"

  displayName = "Alti Cache Redis"
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

variable "region" {
  type        = string
  description = "GCP region where resources will be created"
}

variable "network_id" {
  type        = string
  description = "The ID of the VPC network where private service connection is configured"
}

variable "admin_username" {
  type        = string
  description = "PostgreSQL administrator login name (Note: Cloud SQL manages defaults, but parameter included for signature parity)"
  default     = "postgres"
}

variable "admin_password" {
  type        = string
  description = "PostgreSQL administrator login password"
  sensitive   = true
}

variable "db_tier" {
  type        = string
  description = "Cloud SQL database tier (e.g., db-f1-micro, db-custom-4-16384)"
}

variable "redis_tier" {
  type        = string
  description = "Redis tier (BASIC or STANDARD_HA)"
}

variable "redis_size" {
  type        = number
  description = "Redis memory size in GB"
}

# ------------------------------------------------------------------------------
# Outputs
# ------------------------------------------------------------------------------
output "postgres_ip" {
  value       = google_sql_database_instance.postgres.private_ip_address
  description = "Private IP address of the PostgreSQL database instance"
}

output "postgres_server_id" {
  value       = google_sql_database_instance.postgres.id
  description = "ID of the PostgreSQL database instance"
}

output "redis_hostname" {
  value       = google_redis_instance.cache.host
  description = "The hostname/IP of the Redis instance"
}

output "redis_port" {
  value       = google_redis_instance.cache.port
  description = "The port of the Redis instance"
}
