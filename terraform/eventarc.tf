# ==============================================================================
# ALTI CODE STUDIO: Eventarc — Event-Driven Architecture
# ==============================================================================

# Cloud Audit Log trigger → Cloud Run
resource "google_eventarc_trigger" "audit_log_trigger" {
  name     = "alti-audit-log-trigger"
  location = var.region
  project  = var.gcp_project_id

  matching_criteria {
    attribute = "type"
    value     = "google.cloud.audit.log.v1.written"
  }

  matching_criteria {
    attribute = "serviceName"
    value     = "secretmanager.googleapis.com"
  }

  matching_criteria {
    attribute = "methodName"
    value     = "google.cloud.secretmanager.v1.SecretManagerService.AccessSecretVersion"
  }

  destination {
    cloud_run_service {
      service = "alti-code-studio-backend"
      region  = var.region
    }
  }

  labels = {
    environment = var.environment
    managed-by  = "terraform"
  }
}

# Pub/Sub message trigger → Cloud Run
resource "google_eventarc_trigger" "pubsub_trigger" {
  name     = "alti-pubsub-trigger"
  location = var.region
  project  = var.gcp_project_id

  matching_criteria {
    attribute = "type"
    value     = "google.cloud.pubsub.topic.v1.messagePublished"
  }

  transport {
    pubsub {
      topic = "projects/${var.gcp_project_id}/topics/alti-events"
    }
  }

  destination {
    cloud_run_service {
      service = "alti-code-studio-backend"
      region  = var.region
    }
  }

  labels = {
    environment = var.environment
    managed-by  = "terraform"
  }
}
