# ==============================================================================
# ALTI CODE STUDIO: Multi-Region Disaster Recovery
# ==============================================================================
# Cloud SQL read replicas, GCS dual-region, and Firestore multi-region.
# ==============================================================================

# ── Cloud SQL Read Replica ──
resource "google_sql_database_instance" "read_replica" {
  name                 = "alti-postgres-replica"
  project              = var.gcp_project_id
  region               = var.replica_region
  database_version     = "POSTGRES_16"
  master_instance_name = var.cloud_sql_instance_name
  deletion_protection  = true

  replica_configuration {
    failover_target = true
  }

  settings {
    tier              = "db-custom-4-16384"
    availability_type = "REGIONAL"

    ip_configuration {
      ipv4_enabled    = false
      private_network = var.vpc_network_id
    }

    backup_configuration {
      enabled                        = true
      point_in_time_recovery_enabled = true
      transaction_log_retention_days = 7
    }

    insights_config {
      query_insights_enabled  = true
      record_application_tags = true
      record_client_address   = true
    }
  }
}

# ── GCS Dual-Region Backup Bucket ──
resource "google_storage_bucket" "backup_dr" {
  name          = "${var.gcp_project_id}-db-backups-dr"
  project       = var.gcp_project_id
  location      = "US"  # Dual-region
  storage_class = "NEARLINE"
  force_destroy = false

  versioning {
    enabled = true
  }

  lifecycle_rule {
    condition {
      age = 90
    }
    action {
      type          = "SetStorageClass"
      storage_class = "COLDLINE"
    }
  }

  lifecycle_rule {
    condition {
      age = 365
    }
    action {
      type          = "SetStorageClass"
      storage_class = "ARCHIVE"
    }
  }

  uniform_bucket_level_access = true

  labels = {
    purpose     = "disaster-recovery"
    managed_by  = "terraform"
    environment = "production"
  }
}

# ── GCS Dual-Region Assets Bucket ──
resource "google_storage_bucket" "assets_dr" {
  name          = "${var.gcp_project_id}-assets-dr"
  project       = var.gcp_project_id
  location      = "US"  # Dual-region
  storage_class = "STANDARD"
  force_destroy = false

  versioning {
    enabled = true
  }

  cors {
    origin          = ["*"]
    method          = ["GET", "HEAD"]
    response_header = ["Content-Type"]
    max_age_seconds = 3600
  }

  uniform_bucket_level_access = true

  labels = {
    purpose     = "disaster-recovery"
    managed_by  = "terraform"
  }
}

# ── Variables ──
variable "replica_region" {
  description = "Region for read replica (DR)"
  type        = string
  default     = "us-east1"
}

variable "cloud_sql_instance_name" {
  description = "Name of the primary Cloud SQL instance"
  type        = string
  default     = "alti-postgres"
}

variable "vpc_network_id" {
  description = "VPC network ID for private networking"
  type        = string
  default     = ""
}
