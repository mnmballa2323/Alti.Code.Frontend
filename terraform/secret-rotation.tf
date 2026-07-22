# ==============================================================================
# ALTI CODE STUDIO: Secret Manager — Automatic Rotation
# ==============================================================================

resource "google_secret_manager_secret" "database_url" {
  secret_id = "database-url"
  project   = var.gcp_project_id

  replication {
    auto {}
  }

  rotation {
    rotation_period    = "2592000s"  # 30 days
    next_rotation_time = timeadd(timestamp(), "720h")
  }

  labels = {
    environment = var.environment
    managed-by  = "terraform"
    auto-rotate = "true"
  }
}

resource "google_secret_manager_secret" "jwt_access_token" {
  secret_id = "jwt-access-token"
  project   = var.gcp_project_id

  replication {
    auto {}
  }

  rotation {
    rotation_period    = "7776000s"  # 90 days
    next_rotation_time = timeadd(timestamp(), "2160h")
  }

  labels = {
    environment = var.environment
    managed-by  = "terraform"
    auto-rotate = "true"
  }
}

resource "google_secret_manager_secret" "redis_auth" {
  secret_id = "redis-auth-string"
  project   = var.gcp_project_id

  replication {
    auto {}
  }

  labels = {
    environment = var.environment
    managed-by  = "terraform"
  }
}

resource "google_secret_manager_secret" "kms_signing_key_id" {
  secret_id = "kms-signing-key-id"
  project   = var.gcp_project_id

  replication {
    auto {}
  }

  labels = {
    environment = var.environment
    managed-by  = "terraform"
  }
}
