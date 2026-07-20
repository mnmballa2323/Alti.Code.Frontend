provider "google" {
  project = "alti-code-studio"
  region  = "us-central1"
}

resource "google_cloud_run_service" "app" {
  name     = "alti-code-studio-multi-${var.environment}"
  location = "us-central1"

  template {
    spec {
      containers {
        image = var.docker_image
        env {
          name  = "KEYCLOAK_ISSUER"
          value = var.lco_keycloak_issuer
        }
        env {
          name  = "KEYCLOAK_CLIENT_ID"
          value = var.lco_keycloak_client_id
        }
        env {
          name  = "KEYCLOAK_CLIENT_SECRET"
          value = var.lco_keycloak_client_secret
        }
        env {
          name  = "LCO_BILLING_API"
          value = var.lco_billing_api
        }
        ports {
          container_port = 3000
        }
      }
    }
  }

  traffic {
    percent         = 100
    latest_revision = true
  }
}\n