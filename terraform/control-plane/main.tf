# ==============================================================================
# ALTI CODE STUDIO: SaaS Control Plane Infrastructure
# Multi-tenant management layer for provisioning and monitoring customer tenants.
# ==============================================================================

terraform {
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
  }
}

variable "gcp_project_id" {
  description = "GCP project for the control plane"
  type        = string
}

variable "region" {
  description = "GCP region"
  type        = string
  default     = "us-central1"
}

variable "environment" {
  description = "Deployment environment"
  type        = string
  default     = "prod"
}

variable "control_plane_image" {
  description = "Container image for the control plane API"
  type        = string
}

variable "control_plane_domain" {
  description = "Domain for the control plane management API"
  type        = string
  default     = "control.alticode.studio"
}

provider "google" {
  project = var.gcp_project_id
  region  = var.region
}

# ------------------------------------------------------------------------------
# 1. Control Plane Database — Multi-tenant Cloud SQL
# ------------------------------------------------------------------------------
resource "google_sql_database_instance" "control_plane_db" {
  name             = "alti-control-plane-db"
  database_version = "POSTGRES_15"
  region           = var.region

  settings {
    tier              = "db-custom-4-16384"
    availability_type = "REGIONAL"

    ip_configuration {
      ipv4_enabled    = false
      private_network = google_compute_network.control_plane_vpc.id
      require_ssl     = true
    }

    backup_configuration {
      enabled                        = true
      start_time                     = "02:00"
      location                       = var.region
      point_in_time_recovery_enabled = true
      transaction_log_retention_days = 14
    }

    insights_config {
      query_insights_enabled  = true
      query_string_length     = 4096
      record_application_tags = true
    }

    database_flags {
      name  = "log_min_duration_statement"
      value = "1000"
    }
  }

  deletion_protection = true
}

resource "google_sql_database" "tenants_db" {
  name     = "alti_control_plane"
  instance = google_sql_database_instance.control_plane_db.name
}

# ------------------------------------------------------------------------------
# 2. Networking — Control Plane VPC
# ------------------------------------------------------------------------------
resource "google_compute_network" "control_plane_vpc" {
  name                    = "alti-control-plane-vpc"
  auto_create_subnetworks = false
}

resource "google_compute_subnetwork" "control_plane_subnet" {
  name                     = "alti-control-plane-subnet"
  ip_cidr_range            = "10.200.0.0/24"
  region                   = var.region
  network                  = google_compute_network.control_plane_vpc.id
  private_ip_google_access = true
}

resource "google_compute_global_address" "cp_private_ip" {
  name          = "alti-cp-private-ip"
  purpose       = "VPC_PEERING"
  address_type  = "INTERNAL"
  prefix_length = 16
  network       = google_compute_network.control_plane_vpc.id
}

resource "google_service_networking_connection" "cp_private_connection" {
  network                 = google_compute_network.control_plane_vpc.id
  service                 = "servicenetworking.googleapis.com"
  reserved_peering_ranges = [google_compute_global_address.cp_private_ip.name]
}

resource "google_vpc_access_connector" "cp_connector" {
  name          = "alti-cp-connector"
  region        = var.region
  ip_cidr_range = "10.201.0.0/28"
  network       = google_compute_network.control_plane_vpc.name
}

# ------------------------------------------------------------------------------
# 3. Pub/Sub — Tenant Event Bus
# ------------------------------------------------------------------------------
resource "google_pubsub_topic" "tenant_events" {
  name = "alti-tenant-events"

  message_retention_duration = "604800s" # 7 days

  labels = {
    environment = var.environment
    managed_by  = "terraform"
  }
}

resource "google_pubsub_subscription" "tenant_provisioner" {
  name  = "alti-tenant-provisioner-sub"
  topic = google_pubsub_topic.tenant_events.id

  ack_deadline_seconds = 120

  retry_policy {
    minimum_backoff = "10s"
    maximum_backoff = "600s"
  }

  dead_letter_policy {
    dead_letter_topic     = google_pubsub_topic.tenant_dlq.id
    max_delivery_attempts = 5
  }

  labels = {
    environment = var.environment
    purpose     = "tenant-provisioning"
  }
}

resource "google_pubsub_topic" "tenant_dlq" {
  name = "alti-tenant-events-dlq"
}

resource "google_pubsub_topic" "tenant_billing" {
  name = "alti-tenant-billing-events"

  message_retention_duration = "604800s"
}

resource "google_pubsub_topic" "tenant_health" {
  name = "alti-tenant-health-checks"
}

# ------------------------------------------------------------------------------
# 4. Cloud Scheduler — Periodic Health Checks & Billing
# ------------------------------------------------------------------------------
resource "google_cloud_scheduler_job" "tenant_health_check" {
  name        = "alti-tenant-health-check"
  description = "Periodic health check across all tenants"
  schedule    = "*/5 * * * *"
  time_zone   = "UTC"
  region      = var.region

  pubsub_target {
    topic_name = google_pubsub_topic.tenant_health.id
    data       = base64encode("{\"action\": \"health_check_all\"}")
  }
}

resource "google_cloud_scheduler_job" "daily_billing_sync" {
  name        = "alti-daily-billing-sync"
  description = "Daily billing aggregation and invoice generation"
  schedule    = "0 6 * * *"
  time_zone   = "UTC"
  region      = var.region

  pubsub_target {
    topic_name = google_pubsub_topic.tenant_billing.id
    data       = base64encode("{\"action\": \"daily_billing_sync\"}")
  }
}

resource "google_cloud_scheduler_job" "weekly_security_scan" {
  name        = "alti-weekly-security-scan"
  description = "Weekly security posture scan across all tenants"
  schedule    = "0 3 * * 0"
  time_zone   = "UTC"
  region      = var.region

  pubsub_target {
    topic_name = google_pubsub_topic.tenant_events.id
    data       = base64encode("{\"action\": \"security_scan_all\"}")
  }
}

# ------------------------------------------------------------------------------
# 5. Cloud Tasks — Async Tenant Provisioning
# ------------------------------------------------------------------------------
resource "google_cloud_tasks_queue" "tenant_provisioning" {
  name     = "alti-tenant-provisioning"
  location = var.region

  rate_limits {
    max_concurrent_dispatches = 5
    max_dispatches_per_second = 2
  }

  retry_config {
    max_attempts       = 10
    max_retry_duration = "3600s"
    min_backoff        = "10s"
    max_backoff        = "300s"
    max_doublings      = 5
  }
}

resource "google_cloud_tasks_queue" "tenant_cleanup" {
  name     = "alti-tenant-cleanup"
  location = var.region

  rate_limits {
    max_concurrent_dispatches = 2
    max_dispatches_per_second = 1
  }

  retry_config {
    max_attempts = 5
    min_backoff  = "30s"
    max_backoff  = "600s"
  }
}

# ------------------------------------------------------------------------------
# 6. Service Account — Control Plane Runner
# ------------------------------------------------------------------------------
resource "google_service_account" "control_plane_sa" {
  account_id   = "alti-control-plane-sa"
  display_name = "Alti Code Studio Control Plane"
}

resource "google_project_iam_member" "cp_roles" {
  for_each = toset([
    "roles/cloudsql.client",
    "roles/pubsub.publisher",
    "roles/pubsub.subscriber",
    "roles/cloudtasks.enqueuer",
    "roles/cloudscheduler.admin",
    "roles/secretmanager.secretAccessor",
    "roles/cloudtrace.agent",
    "roles/logging.logWriter",
    "roles/monitoring.metricWriter",
    "roles/iam.serviceAccountTokenCreator",
  ])

  project = var.gcp_project_id
  role    = each.value
  member  = "serviceAccount:${google_service_account.control_plane_sa.email}"
}

# ------------------------------------------------------------------------------
# 7. Cloud Run — Control Plane API Service
# ------------------------------------------------------------------------------
resource "google_cloud_run_v2_service" "control_plane" {
  name     = "alti-control-plane"
  location = var.region

  template {
    service_account = google_service_account.control_plane_sa.email

    vpc_access {
      connector = google_vpc_access_connector.cp_connector.id
      egress    = "ALL_TRAFFIC"
    }

    scaling {
      min_instance_count = 2
      max_instance_count = 20
    }

    containers {
      image = var.control_plane_image

      ports {
        container_port = 5000
      }

      env {
        name  = "NODE_ENV"
        value = "production"
      }

      env {
        name  = "DEPLOYMENT_MODE"
        value = "control-plane"
      }

      env {
        name  = "GCP_PROJECT_ID"
        value = var.gcp_project_id
      }

      env {
        name  = "TENANT_EVENTS_TOPIC"
        value = google_pubsub_topic.tenant_events.id
      }

      env {
        name  = "BILLING_TOPIC"
        value = google_pubsub_topic.tenant_billing.id
      }

      env {
        name  = "PROVISIONING_QUEUE"
        value = google_cloud_tasks_queue.tenant_provisioning.id
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
    component   = "control-plane"
  }
}

# ------------------------------------------------------------------------------
# 8. Outputs
# ------------------------------------------------------------------------------
output "control_plane_url" {
  description = "Control plane API URL"
  value       = google_cloud_run_v2_service.control_plane.uri
}

output "tenant_events_topic" {
  description = "Pub/Sub topic for tenant lifecycle events"
  value       = google_pubsub_topic.tenant_events.id
}

output "provisioning_queue" {
  description = "Cloud Tasks queue for tenant provisioning"
  value       = google_cloud_tasks_queue.tenant_provisioning.id
}

output "control_plane_db_connection" {
  description = "Control plane database connection name"
  value       = google_sql_database_instance.control_plane_db.connection_name
}
