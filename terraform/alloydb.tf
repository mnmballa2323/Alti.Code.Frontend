# ==============================================================================
# ALTI CODE STUDIO: AlloyDB PostgreSQL-Compatible Database
# ==============================================================================
# AlloyDB provides 4x throughput and 10x lower latency vs standard PostgreSQL.
# Used as the primary production database for the platform.
#
# Features:
#   - Automated backups with PITR (14 days)
#   - Read pool for horizontal read scaling
#   - Private Service Access (no public IP)
#   - Encryption at rest with CMEK via Cloud KMS
# ==============================================================================

# AlloyDB Cluster
resource "google_alloydb_cluster" "primary" {
  count      = var.enable_alloydb ? 1 : 0
  cluster_id = "alti-alloydb-primary"
  location   = var.region
  project    = var.gcp_project_id

  network_config {
    network = google_compute_network.vpc_network.id
  }

  # Automated backups: daily, 14-day retention, encrypted
  automated_backup_policy {
    enabled          = true
    backup_window    = "1800s" # 30-minute backup window
    location         = var.region

    weekly_schedule {
      days_of_week = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"]

      start_times {
        hours   = 3
        minutes = 0
        seconds = 0
        nanos   = 0
      }
    }

    quantity_based_retention {
      count = 14
    }

    encryption_config {
      kms_key_name = google_kms_crypto_key.db_encryption_key.id
    }
  }

  # Continuous backup for Point-in-Time Recovery
  continuous_backup_config {
    enabled              = true
    recovery_window_days = 14

    encryption_config {
      kms_key_name = google_kms_crypto_key.db_encryption_key.id
    }
  }

  encryption_config {
    kms_key_name = google_kms_crypto_key.db_encryption_key.id
  }

  labels = {
    environment = var.environment
    tier        = "production"
    managed-by  = "terraform"
  }
}

# Primary Instance (Read-Write)
resource "google_alloydb_instance" "primary_writer" {
  count       = var.enable_alloydb ? 1 : 0
  cluster     = google_alloydb_cluster.primary[0].name
  instance_id = "alti-primary-writer"
  instance_type = "PRIMARY"

  machine_config {
    cpu_count = var.alloydb_cpu_count
  }

  database_flags = {
    "log_min_duration_statement" = "1000"   # Log queries > 1s
    "max_connections"            = "500"
    "shared_buffers"             = "262144" # 2GB
    "work_mem"                   = "65536"  # 512MB
    "pgaudit.log"                = "all"    # Full audit logging
  }

  labels = {
    role = "primary-writer"
  }
}

# Read Pool Instance (Horizontal Read Scaling)
resource "google_alloydb_instance" "read_pool" {
  count       = var.enable_alloydb ? 1 : 0
  cluster     = google_alloydb_cluster.primary[0].name
  instance_id = "alti-read-pool"
  instance_type = "READ_POOL"

  read_pool_config {
    node_count = var.alloydb_read_pool_nodes
  }

  machine_config {
    cpu_count = var.alloydb_cpu_count
  }

  labels = {
    role = "read-pool"
  }
}

# KMS Crypto Key for AlloyDB encryption (if not already defined)
resource "google_kms_crypto_key" "db_encryption_key" {
  name            = "alti-db-encryption-key"
  key_ring        = google_kms_key_ring.sovereign_keyring.id
  rotation_period = "7776000s" # 90 days

  lifecycle {
    prevent_destroy = true
  }
}

# ==============================================================================
# Variables
# ==============================================================================

variable "enable_alloydb" {
  description = "Enable AlloyDB as the primary production database"
  type        = bool
  default     = false
}

variable "alloydb_cpu_count" {
  description = "Number of vCPUs for AlloyDB instances"
  type        = number
  default     = 4
}

variable "alloydb_read_pool_nodes" {
  description = "Number of read pool nodes for horizontal scaling"
  type        = number
  default     = 2
}
