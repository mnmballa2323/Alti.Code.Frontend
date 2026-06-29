# Provision secure Google Cloud SQL for PostgreSQL (pgvector support included natively on GCP SQL v15+)
resource "google_sql_database_instance" "db_instance" {
  name             = "inso-production-db"
  database_version = "POSTGRES_15"
  region           = var.region

  depends_on = [google_service_networking_connection.private_vpc_connection]

  settings {
    tier              = var.pg_db_tier # Parameterized database tier/SKU
    availability_type = "REGIONAL"         # Enable High Availability (HA) failover across zones

    ip_configuration {
      ipv4_enabled                                  = false # Disable public IP address
      private_network                               = google_compute_network.private_network.id
      enable_private_path_for_google_cloud_services = true
      require_ssl                                   = true  # Enforce SSL/TLS connections for all clients
    }

    backup_configuration {
      enabled                        = true
      start_time                     = "03:00" # 3:00 AM UTC backup window
      location                       = "us"
      point_in_time_recovery_enabled = true # Point-in-time recovery for backup state
      transaction_log_retention_days = 7
    }

    # Enable pgvector and standard postgres extensions configuration flags
    database_flags {
      name  = "temp_file_limit"
      value = "2097152" # 2GB
    }
  }

  deletion_protection = true # Safeguard production database against accidental terraform destroy
}

resource "google_sql_database" "database" {
  name     = "alticodestudio"
  instance = google_sql_database_instance.db_instance.name
}

resource "google_sql_user" "db_user" {
  name     = "inso_admin"
  instance = google_sql_database_instance.db_instance.name
  password = var.db_password
}

variable "db_password" {
  type        = string
  sensitive   = true
  description = "Administrator password for Google Cloud SQL PostgreSQL database"
}
