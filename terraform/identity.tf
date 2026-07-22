# ==============================================================================
# ALTI CODE STUDIO: Workload Identity Federation & IAM Bindings
# ==============================================================================

# ------------------------------------------------------------------------------
# 1. Workload Identity Pool for External CI/CD Providers
# ------------------------------------------------------------------------------
resource "google_iam_workload_identity_pool" "github_pool" {
  workload_identity_pool_id = "github-actions-pool"
  display_name              = "GitHub Actions Identity Pool"
  description               = "Workload Identity Pool for GitHub Actions CI/CD OIDC federation"
  disabled                  = false
}

# ------------------------------------------------------------------------------
# 2. OIDC Provider for GitHub Actions
# ------------------------------------------------------------------------------
resource "google_iam_workload_identity_pool_provider" "github_oidc" {
  workload_identity_pool_id          = google_iam_workload_identity_pool.github_pool.workload_identity_pool_id
  workload_identity_pool_provider_id = "github-oidc-provider"
  display_name                       = "GitHub Actions OIDC Provider"
  description                        = "OIDC identity provider for GitHub Actions workflows"

  # GitHub Actions OIDC configuration
  oidc {
    issuer_uri = "https://token.actions.githubusercontent.com"
  }

  # Map GitHub token claims to Google Cloud attributes
  attribute_mapping = {
    "google.subject"       = "assertion.sub"
    "attribute.actor"      = "assertion.actor"
    "attribute.repository" = "assertion.repository"
    "attribute.ref"        = "assertion.ref"
  }

  # Restrict to the specific GitHub repository for security
  attribute_condition = "assertion.repository == '${var.github_repository}'"
}

# ------------------------------------------------------------------------------
# 3. CI/CD Service Account for GitHub Actions Deployments
# ------------------------------------------------------------------------------
resource "google_service_account" "github_actions_sa" {
  account_id   = "github-actions-deployer"
  display_name = "GitHub Actions Deployer"
  description  = "Service account used by GitHub Actions for CI/CD deployments via Workload Identity Federation"
}

# Allow GitHub Actions to impersonate this service account via WIF
resource "google_service_account_iam_member" "wif_binding" {
  service_account_id = google_service_account.github_actions_sa.name
  role               = "roles/iam.workloadIdentityUser"
  member             = "principalSet://iam.googleapis.com/${google_iam_workload_identity_pool.github_pool.name}/attribute.repository/${var.github_repository}"
}

# ------------------------------------------------------------------------------
# 4. IAM Bindings for CI/CD Service Account
# ------------------------------------------------------------------------------

# Cloud Run Admin — deploy new revisions and manage traffic
resource "google_project_iam_member" "github_actions_run_admin" {
  project = var.gcp_project_id
  role    = "roles/run.admin"
  member  = "serviceAccount:${google_service_account.github_actions_sa.email}"
}

# Artifact Registry Writer — push container images
resource "google_project_iam_member" "github_actions_ar_writer" {
  project = var.gcp_project_id
  role    = "roles/artifactregistry.writer"
  member  = "serviceAccount:${google_service_account.github_actions_sa.email}"
}

# Cloud Build Editor — trigger and manage builds
resource "google_project_iam_member" "github_actions_build_editor" {
  project = var.gcp_project_id
  role    = "roles/cloudbuild.builds.editor"
  member  = "serviceAccount:${google_service_account.github_actions_sa.email}"
}

# Service Account User — act as the Cloud Run service account during deploy
resource "google_project_iam_member" "github_actions_sa_user" {
  project = var.gcp_project_id
  role    = "roles/iam.serviceAccountUser"
  member  = "serviceAccount:${google_service_account.github_actions_sa.email}"
}

# Storage Admin — deploy frontend assets to GCS bucket
resource "google_project_iam_member" "github_actions_storage_admin" {
  project = var.gcp_project_id
  role    = "roles/storage.admin"
  member  = "serviceAccount:${google_service_account.github_actions_sa.email}"
}

# ------------------------------------------------------------------------------
# 5. IAM Bindings for Cloud Run Service Account (referenced from cloud-run.tf)
# ------------------------------------------------------------------------------

# Cloud Run Invoker — allow internal invocation of the backend service
resource "google_project_iam_member" "cloud_run_invoker" {
  project = var.gcp_project_id
  role    = "roles/run.invoker"
  member  = "serviceAccount:${google_service_account.cloud_run_sa.email}"
}

# Logging Writer — structured logging to Cloud Logging
resource "google_project_iam_member" "cloud_run_logging" {
  project = var.gcp_project_id
  role    = "roles/logging.logWriter"
  member  = "serviceAccount:${google_service_account.cloud_run_sa.email}"
}

# Monitoring Metric Writer — emit custom metrics to Cloud Monitoring
resource "google_project_iam_member" "cloud_run_monitoring" {
  project = var.gcp_project_id
  role    = "roles/monitoring.metricWriter"
  member  = "serviceAccount:${google_service_account.cloud_run_sa.email}"
}

# ------------------------------------------------------------------------------
# 6. Outputs
# ------------------------------------------------------------------------------
output "workload_identity_pool_name" {
  value       = google_iam_workload_identity_pool.github_pool.name
  description = "The full resource name of the Workload Identity Pool"
}

output "workload_identity_provider_name" {
  value       = google_iam_workload_identity_pool_provider.github_oidc.name
  description = "The full resource name of the Workload Identity Pool OIDC Provider"
}

output "github_actions_service_account_email" {
  value       = google_service_account.github_actions_sa.email
  description = "The email of the GitHub Actions deployer service account"
}
