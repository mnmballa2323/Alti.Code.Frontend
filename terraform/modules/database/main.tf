terraform {
  required_providers {}
}

# -------------------------------------------------------------
# Cloud SQL for PostgreSQL (PentAGI & Vector Embeddings)
# -------------------------------------------------------------
resource "google_sql_database_instance" "postgres" {
  name             = "alti-postgres-${var.environment}"
  database_version = "POSTGRES_15"
  region           = var.region

  settings {
    tier              = "db-custom-4-15360" # 4 vCPU, 15GB RAM
    availability_type = var.environment == "prod" ? "REGIONAL" : "ZONAL"
    
    backup_configuration {
      enabled                        = true
      point_in_time_recovery_enabled = true
      start_time                     = "02:00"
      transaction_log_retention_days = 7
    }

    ip_configuration {
      ipv4_enabled    = false
      private_network = var.network_id
    }
  }

  deletion_protection = var.environment == "prod" ? true : false
}

resource "google_sql_database" "pentagidb" {
  name     = "pentagidb"
  instance = google_sql_database_instance.postgres.name
}

resource "google_sql_user" "pentagi_user" {
  name     = "postgres"
  instance = google_sql_database_instance.postgres.name
  password = random_password.pg_password.result
}

resource "random_password" "pg_password" {
  length           = 16
  special          = true
  override_special = "!#$%&*()-_=+[]{}<>:?"
}

# -------------------------------------------------------------
# Cloud SQL Cross-Region Read Replica (Disaster Recovery)
# -------------------------------------------------------------
resource "google_sql_database_instance" "postgres_replica" {
  name                 = "alti-postgres-${var.environment}-replica"
  database_version     = "POSTGRES_15"
  region               = "us-east4" # Secondary Region
  master_instance_name = google_sql_database_instance.postgres.name

  settings {
    tier              = "db-custom-4-15360"
    availability_type = "REGIONAL"
    disk_autoresize   = true
  }
}

# -------------------------------------------------------------
# Memorystore for Redis (Synapse Cache & Memory)
# -------------------------------------------------------------
resource "google_redis_instance" "cache" {
  name               = "alti-redis-${var.environment}"
  tier               = var.environment == "prod" ? "STANDARD_HA" : "BASIC"
  memory_size_gb     = 5
  region             = var.region
  authorized_network = var.network_id
  redis_version      = "REDIS_7_0"

  # Auth string enabled for security
  auth_enabled = true
}

variable "environment" { type = string }
variable "region" { type = string }
variable "network_id" { type = string }

output "redis_host" { value = google_redis_instance.cache.host }
output "redis_port" { value = google_redis_instance.cache.port }
output "redis_auth_string" {
  value = google_redis_instance.cache.auth_string
  sensitive = true
}
output "pg_connection_name" { value = google_sql_database_instance.postgres.connection_name }
output "pg_password" {
  value = random_password.pg_password.result
  sensitive = true
}
