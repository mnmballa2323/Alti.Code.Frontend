# ==============================================================================
# ALTI CODE STUDIO: Google Cloud Run v2 Service Provisioning
# ==============================================================================

# ------------------------------------------------------------------------------
# 1. Dedicated Service Account for Cloud Run (Principle of Least Privilege)
# ------------------------------------------------------------------------------
resource "google_service_account" "cloud_run_sa" {
  account_id   = "alti-cloud-run-sa"
  display_name = "Alti Code Studio Cloud Run Service Account"
  description  = "Minimal-privilege service account for the backend Cloud Run service"
}

# Grant Cloud SQL Client role to the Cloud Run service account
resource "google_project_iam_member" "cloud_run_sql_client" {
  project = var.gcp_project_id
  role    = "roles/cloudsql.client"
  member  = "serviceAccount:${google_service_account.cloud_run_sa.email}"
}

# Grant Secret Manager accessor role to the Cloud Run service account
resource "google_project_iam_member" "cloud_run_secret_accessor" {
  project = var.gcp_project_id
  role    = "roles/secretmanager.secretAccessor"
  member  = "serviceAccount:${google_service_account.cloud_run_sa.email}"
}

# Grant Cloud KMS Encrypter/Decrypter for CMEK operations
resource "google_project_iam_member" "cloud_run_kms_accessor" {
  project = var.gcp_project_id
  role    = "roles/cloudkms.cryptoKeyEncrypterDecrypter"
  member  = "serviceAccount:${google_service_account.cloud_run_sa.email}"
}

# Grant Cloud Trace agent for distributed tracing
resource "google_project_iam_member" "cloud_run_trace_agent" {
  project = var.gcp_project_id
  role    = "roles/cloudtrace.agent"
  member  = "serviceAccount:${google_service_account.cloud_run_sa.email}"
}

# ------------------------------------------------------------------------------
# 2. Secret Manager Secrets (referenced by Cloud Run as env vars)
# ------------------------------------------------------------------------------
resource "google_secret_manager_secret" "database_url" {
  secret_id = "DATABASE_URL"
  replication {
    auto {}
  }
  labels = {
    environment = var.environment
    managed_by  = "terraform"
  }
}

resource "google_secret_manager_secret" "redis_url" {
  secret_id = "REDIS_URL"
  replication {
    auto {}
  }
  labels = {
    environment = var.environment
    managed_by  = "terraform"
  }
}

resource "google_secret_manager_secret" "jwt_access_token" {
  secret_id = "JWT_ACCESS_TOKEN"
  replication {
    auto {}
  }
  labels = {
    environment = var.environment
    managed_by  = "terraform"
  }
}

resource "google_secret_manager_secret" "stripe_secret_key" {
  secret_id = "STRIPE_SECRET_KEY"
  replication {
    auto {}
  }
  labels = {
    environment = var.environment
    managed_by  = "terraform"
  }
}

# ------------------------------------------------------------------------------
# 3. Cloud Run v2 Service — Backend API
# ------------------------------------------------------------------------------
resource "google_cloud_run_v2_service" "backend" {
  name     = "alti-backend"
  location = var.region
  ingress  = "INGRESS_TRAFFIC_INTERNAL_LOAD_BALANCER"

  template {
    service_account = google_service_account.cloud_run_sa.email

    scaling {
      min_instance_count = var.cloud_run_min_instances
      max_instance_count = var.cloud_run_max_instances
    }

    vpc_access {
      connector = google_vpc_access_connector.vpc_connector.id
      egress    = "PRIVATE_RANGES_ONLY"
    }

    volumes {
      name = "cloudsql"
      cloud_sql_instance {
        instances = [google_sql_database_instance.db_instance.connection_name]
      }
    }

    containers {
      image = "${var.region}-docker.pkg.dev/${var.gcp_project_id}/alti-code-studio/backend:latest"

      ports {
        container_port = 5000
      }

      resources {
        limits = {
          cpu    = var.cloud_run_cpu
          memory = var.cloud_run_memory
        }
        cpu_idle          = false  # Always-allocated CPU for consistent performance
        startup_cpu_boost = true   # Boost CPU during startup for faster cold starts
      }

      # Environment variables from Secret Manager
      env {
        name = "DATABASE_URL"
        value_source {
          secret_key_ref {
            secret  = google_secret_manager_secret.database_url.secret_id
            version = "latest"
          }
        }
      }

      env {
        name = "REDIS_URL"
        value_source {
          secret_key_ref {
            secret  = google_secret_manager_secret.redis_url.secret_id
            version = "latest"
          }
        }
      }

      env {
        name = "JWT_ACCESS_TOKEN"
        value_source {
          secret_key_ref {
            secret  = google_secret_manager_secret.jwt_access_token.secret_id
            version = "latest"
          }
        }
      }

      env {
        name = "STRIPE_SECRET_KEY"
        value_source {
          secret_key_ref {
            secret  = google_secret_manager_secret.stripe_secret_key.secret_id
            version = "latest"
          }
        }
      }

      # Static environment variables
      env {
        name  = "NODE_ENV"
        value = "production"
      }

      env {
        name  = "PORT"
        value = "5000"
      }

      # Cloud SQL Unix Socket mount
      volume_mounts {
        name       = "cloudsql"
        mount_path = "/cloudsql"
      }

      # Startup probe — generous timeout for initial DB migrations
      startup_probe {
        http_get {
          path = "/health"
          port = 5000
        }
        initial_delay_seconds = 5
        period_seconds        = 10
        timeout_seconds       = 5
        failure_threshold     = 12 # Up to 2 minutes for startup
      }

      # Liveness probe — ensure the service is responsive
      liveness_probe {
        http_get {
          path = "/health"
          port = 5000
        }
        period_seconds    = 30
        timeout_seconds   = 5
        failure_threshold = 3
      }
    }
  }

  labels = {
    environment = var.environment
    sovereignty = "commercial"
    managed_by  = "terraform"
  }

  lifecycle {
    ignore_changes = [
      template[0].containers[0].image, # Image is updated by CI/CD pipeline
    ]
  }
}

# ------------------------------------------------------------------------------
# 4. Cloud Run IAM — Allow unauthenticated access via load balancer
# ------------------------------------------------------------------------------
resource "google_cloud_run_v2_service_iam_member" "allow_unauthenticated" {
  count    = var.cloud_run_allow_unauthenticated ? 1 : 0
  project  = google_cloud_run_v2_service.backend.project
  location = google_cloud_run_v2_service.backend.location
  name     = google_cloud_run_v2_service.backend.name
  role     = "roles/run.invoker"
  member   = "allUsers"
}

# ------------------------------------------------------------------------------
# 5. Outputs
# ------------------------------------------------------------------------------
output "cloud_run_service_url" {
  value       = google_cloud_run_v2_service.backend.uri
  description = "The URL of the deployed Cloud Run backend service"
}

output "cloud_run_service_account_email" {
  value       = google_service_account.cloud_run_sa.email
  description = "The email of the Cloud Run service account"
}
