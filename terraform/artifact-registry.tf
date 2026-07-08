# ==============================================================================
# ALTI CODE STUDIO: Google Artifact Registry — Docker Image Repository
# ==============================================================================

# ------------------------------------------------------------------------------
# 1. Docker Repository for Container Images
# ------------------------------------------------------------------------------
resource "google_artifact_registry_repository" "docker_repo" {
  location      = var.region
  repository_id = "alti-code-studio"
  description   = "Production Docker image repository for Alti Code Studio services"
  format        = "DOCKER"
  mode          = "STANDARD_REPOSITORY"

  # Enable vulnerability scanning for all pushed images
  docker_config {
    immutable_tags = false # Allow :latest tag updates from CI/CD
  }

  # Cleanup policy — retain only the last 10 tagged images per package
  cleanup_policies {
    id     = "keep-last-10-versions"
    action = "KEEP"
    most_recent_versions {
      keep_count = 10
    }
  }

  # Cleanup policy — delete untagged images older than 7 days
  cleanup_policies {
    id     = "delete-stale-untagged"
    action = "DELETE"
    condition {
      tag_state  = "UNTAGGED"
      older_than = "604800s" # 7 days in seconds
    }
  }

  cleanup_policy_dry_run = false

  labels = {
    environment = var.environment
    sovereignty = "commercial"
    managed_by  = "terraform"
  }
}

# ------------------------------------------------------------------------------
# 2. Outputs
# ------------------------------------------------------------------------------
output "artifact_registry_url" {
  value       = "${google_artifact_registry_repository.docker_repo.location}-docker.pkg.dev/${var.gcp_project_id}/${google_artifact_registry_repository.docker_repo.repository_id}"
  description = "The full Docker registry URL for pushing and pulling images"
}

output "artifact_registry_id" {
  value       = google_artifact_registry_repository.docker_repo.id
  description = "The resource ID of the Artifact Registry repository"
}
