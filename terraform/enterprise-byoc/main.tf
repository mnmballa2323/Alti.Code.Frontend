# ==============================================================================
# ALTI CODE STUDIO: Enterprise BYOC (Bring Your Own Cloud) Module
# Deploy Alti Code Studio into a customer's own GCP project with full isolation.
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
# Variables — Customer provides their own project, region, and network
# ------------------------------------------------------------------------------
variable "customer_project_id" {
  description = "The customer's GCP project ID where Alti Code Studio will be deployed"
  type        = string
}

variable "region" {
  description = "GCP region for all resources"
  type        = string
  default     = "us-central1"
}

variable "environment" {
  description = "Deployment environment (prod, staging, dev)"
  type        = string
  default     = "prod"
}

variable "customer_vpc_id" {
  description = "Self-link of the customer's existing VPC network (null to create a new one)"
  type        = string
  default     = null
}

variable "customer_subnet_cidr" {
  description = "CIDR range for the Alti subnet within the customer's VPC"
  type        = string
  default     = "10.100.0.0/24"
}

variable "cloud_run_image" {
  description = "The Artifact Registry container image URI for the backend"
  type        = string
}

variable "cloud_sql_tier" {
  description = "Cloud SQL machine type"
  type        = string
  default     = "db-custom-4-16384"
}

variable "redis_memory_size_gb" {
  description = "Memorystore Redis memory in GB"
  type        = number
  default     = 2
}

variable "enable_cmek" {
  description = "Enable Customer-Managed Encryption Keys for all data at rest"
  type        = bool
  default     = true
}

variable "allowed_ingress_cidrs" {
  description = "CIDR ranges allowed to access the Cloud Run service (customer's corporate network)"
  type        = list(string)
  default     = ["0.0.0.0/0"]
}

# ------------------------------------------------------------------------------
# Provider — Targets the customer's project
# ------------------------------------------------------------------------------
provider "google" {
  project = var.customer_project_id
  region  = var.region
}

# ------------------------------------------------------------------------------
# 1. Networking — Isolated VPC or use customer's existing VPC
# ------------------------------------------------------------------------------
resource "google_compute_network" "byoc_vpc" {
  count                   = var.customer_vpc_id == null ? 1 : 0
  name                    = "alti-byoc-vpc"
  auto_create_subnetworks = false
}

locals {
  vpc_id = var.customer_vpc_id != null ? var.customer_vpc_id : google_compute_network.byoc_vpc[0].id
}

resource "google_compute_subnetwork" "byoc_subnet" {
  name                     = "alti-byoc-subnet"
  ip_cidr_range            = var.customer_subnet_cidr
  region                   = var.region
  network                  = local.vpc_id
  private_ip_google_access = true

  log_config {
    aggregation_interval = "INTERVAL_5_SEC"
    flow_sampling        = 0.5
    metadata             = "INCLUDE_ALL_METADATA"
  }
}

resource "google_compute_global_address" "byoc_private_ip" {
  name          = "alti-byoc-private-ip"
  purpose       = "VPC_PEERING"
  address_type  = "INTERNAL"
  prefix_length = 16
  network       = local.vpc_id
}

resource "google_service_networking_connection" "byoc_private_connection" {
  network                 = local.vpc_id
  service                 = "servicenetworking.googleapis.com"
  reserved_peering_ranges = [google_compute_global_address.byoc_private_ip.name]
}

resource "google_vpc_access_connector" "byoc_connector" {
  name          = "alti-byoc-connector"
  region        = var.region
  ip_cidr_range = "10.101.0.0/28"
  network       = local.vpc_id
}

# ------------------------------------------------------------------------------
# 2. KMS — Customer-managed encryption keys
# ------------------------------------------------------------------------------
resource "google_kms_key_ring" "byoc_keyring" {
  count    = var.enable_cmek ? 1 : 0
  name     = "alti-byoc-keyring"
  location = var.region
}

resource "google_kms_crypto_key" "byoc_db_key" {
  count    = var.enable_cmek ? 1 : 0
  name     = "alti-byoc-db-encryption"
  key_ring = google_kms_key_ring.byoc_keyring[0].id

  rotation_period = "7776000s" # 90 days

  lifecycle {
    prevent_destroy = true
  }
}

resource "google_kms_crypto_key" "byoc_storage_key" {
  count    = var.enable_cmek ? 1 : 0
  name     = "alti-byoc-storage-encryption"
  key_ring = google_kms_key_ring.byoc_keyring[0].id

  rotation_period = "7776000s"

  lifecycle {
    prevent_destroy = true
  }
}

# ------------------------------------------------------------------------------
# 3. Cloud SQL — Isolated PostgreSQL for customer
# ------------------------------------------------------------------------------
resource "google_sql_database_instance" "byoc_db" {
  name             = "alti-byoc-db"
  database_version = "POSTGRES_15"
  region           = var.region

  depends_on = [google_service_networking_connection.byoc_private_connection]

  encryption_key_name = var.enable_cmek ? google_kms_crypto_key.byoc_db_key[0].id : null

  settings {
    tier              = var.cloud_sql_tier
    availability_type = "REGIONAL"

    ip_configuration {
      ipv4_enabled                                  = false
      private_network                               = local.vpc_id
      enable_private_path_for_google_cloud_services = true
      require_ssl                                   = true
    }

    backup_configuration {
      enabled                        = true
      start_time                     = "03:00"
      location                       = var.region
      point_in_time_recovery_enabled = true
      transaction_log_retention_days = 14
    }

    insights_config {
      query_insights_enabled  = true
      query_string_length     = 4096
      record_application_tags = true
      record_client_address   = true
    }

    database_flags {
      name  = "cloudsql.iam_authentication"
      value = "on"
    }
  }

  deletion_protection = true
}

resource "google_sql_database" "byoc_database" {
  name     = "alticodestudio"
  instance = google_sql_database_instance.byoc_db.name
}

# ------------------------------------------------------------------------------
# 4. Memorystore — Isolated Redis cache
# ------------------------------------------------------------------------------
resource "google_redis_instance" "byoc_redis" {
  name               = "alti-byoc-redis"
  tier               = "STANDARD_HA"
  memory_size_gb     = var.redis_memory_size_gb
  region             = var.region
  authorized_network = local.vpc_id
  connect_mode       = "PRIVATE_SERVICE_ACCESS"
  redis_version      = "REDIS_7_2"
  display_name       = "Alti BYOC Redis Cache"
  auth_enabled       = true
  transit_encryption_mode = "SERVER_AUTHENTICATION"

  depends_on = [google_service_networking_connection.byoc_private_connection]

  maintenance_policy {
    weekly_maintenance_window {
      day = "SUNDAY"
      start_time {
        hours   = 2
        minutes = 0
        seconds = 0
        nanos   = 0
      }
    }
  }

  labels = {
    environment = var.environment
    managed_by  = "terraform"
    deployment  = "byoc"
  }
}

# ------------------------------------------------------------------------------
# 5. Service Account — Least-privilege for Cloud Run
# ------------------------------------------------------------------------------
resource "google_service_account" "byoc_runner" {
  account_id   = "alti-byoc-runner"
  display_name = "Alti Code Studio BYOC Runner"
}

resource "google_project_iam_member" "byoc_runner_roles" {
  for_each = toset([
    "roles/cloudsql.client",
    "roles/secretmanager.secretAccessor",
    "roles/cloudkms.cryptoKeyEncrypterDecrypter",
    "roles/cloudtrace.agent",
    "roles/logging.logWriter",
    "roles/monitoring.metricWriter",
    "roles/aiplatform.user",
    "roles/storage.objectViewer",
  ])

  project = var.customer_project_id
  role    = each.value
  member  = "serviceAccount:${google_service_account.byoc_runner.email}"
}

# ------------------------------------------------------------------------------
# 6. Cloud Run — Backend service in customer's VPC
# ------------------------------------------------------------------------------
resource "google_cloud_run_v2_service" "byoc_backend" {
  name     = "alti-byoc-backend"
  location = var.region

  template {
    service_account = google_service_account.byoc_runner.email

    vpc_access {
      connector = google_vpc_access_connector.byoc_connector.id
      egress    = "ALL_TRAFFIC"
    }

    scaling {
      min_instance_count = 1
      max_instance_count = 10
    }

    containers {
      image = var.cloud_run_image

      ports {
        container_port = 5000
      }

      env {
        name  = "NODE_ENV"
        value = "production"
      }

      env {
        name  = "GCP_PROJECT_ID"
        value = var.customer_project_id
      }

      env {
        name  = "GCP_REGION"
        value = var.region
      }

      env {
        name  = "GCP_REDIS_HOST"
        value = google_redis_instance.byoc_redis.host
      }

      env {
        name  = "DEPLOYMENT_MODE"
        value = "byoc"
      }

      resources {
        limits = {
          cpu    = "4"
          memory = "4Gi"
        }
      }

      startup_probe {
        http_get {
          path = "/api/v1/health"
        }
        initial_delay_seconds = 10
        period_seconds        = 5
        failure_threshold     = 10
      }

      liveness_probe {
        http_get {
          path = "/api/v1/health"
        }
        period_seconds = 30
      }
    }
  }

  labels = {
    environment = var.environment
    managed_by  = "terraform"
    deployment  = "byoc"
  }
}

# ------------------------------------------------------------------------------
# 7. Outputs
# ------------------------------------------------------------------------------
output "byoc_service_url" {
  description = "The Cloud Run service URL"
  value       = google_cloud_run_v2_service.byoc_backend.uri
}

output "byoc_database_connection" {
  description = "Cloud SQL connection name"
  value       = google_sql_database_instance.byoc_db.connection_name
}

output "byoc_redis_host" {
  description = "Memorystore Redis IP address"
  value       = google_redis_instance.byoc_redis.host
}

output "byoc_redis_port" {
  description = "Memorystore Redis port"
  value       = google_redis_instance.byoc_redis.port
}

output "byoc_service_account" {
  description = "Service account email for the BYOC deployment"
  value       = google_service_account.byoc_runner.email
}
