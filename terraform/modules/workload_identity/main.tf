# -------------------------------------------------------------
# Workload Identity Federation for GitHub Actions
# -------------------------------------------------------------

resource "google_iam_workload_identity_pool" "github_pool" {
  workload_identity_pool_id = "github-actions-pool"
  display_name              = "GitHub Actions Pool"
  description               = "Identity pool for GitHub Actions integrations"
  disabled                  = false
}

resource "google_iam_workload_identity_pool_provider" "github_provider" {
  workload_identity_pool_id          = google_iam_workload_identity_pool.github_pool.workload_identity_pool_id
  workload_identity_pool_provider_id = "github-actions-provider"
  display_name                       = "GitHub Actions Provider"
  
  attribute_mapping = {
    "google.subject"             = "assertion.sub"
    "attribute.actor"            = "assertion.actor"
    "attribute.repository"       = "assertion.repository"
    "attribute.repository_owner" = "assertion.repository_owner"
  }

  oidc {
    issuer_uri = "https://token.actions.githubusercontent.com"
  }
}

# -------------------------------------------------------------
# Service Account for CI/CD
# -------------------------------------------------------------

resource "google_service_account" "cicd_sa" {
  account_id   = "github-actions-deployer"
  display_name = "GitHub Actions Deployer"
}

# Grant the Service Account permissions to push to Artifact Registry
resource "google_project_iam_member" "artifact_registry_writer" {
  project = var.project_id
  role    = "roles/artifactregistry.writer"
  member  = "serviceAccount:${google_service_account.cicd_sa.email}"
}

# Grant the Service Account permissions to interact with GKE (for ArgoCD sync triggers or direct applies if needed)
resource "google_project_iam_member" "gke_developer" {
  project = var.project_id
  role    = "roles/container.developer"
  member  = "serviceAccount:${google_service_account.cicd_sa.email}"
}

# Grant Vertex AI API Permissions
resource "google_project_iam_member" "vertex_ai_user" {
  project = var.project_id
  role    = "roles/aiplatform.user"
  member  = "serviceAccount:${google_service_account.cicd_sa.email}"
}

# -------------------------------------------------------------
# Bind the GitHub Repository to the Service Account
# -------------------------------------------------------------

resource "google_service_account_iam_member" "workload_identity_user" {
  service_account_id = google_service_account.cicd_sa.name
  role               = "roles/iam.workloadIdentityUser"
  # This matches specifically the Alti.Code.Studio repository
  member             = "principalSet://iam.googleapis.com/${google_iam_workload_identity_pool.github_pool.name}/attribute.repository/${var.github_repository}"
}

# -------------------------------------------------------------
# Variables and Outputs
# -------------------------------------------------------------

variable "project_id" {
  type = string
}

variable "github_repository" {
  type        = string
  description = "The GitHub repository in format ORG/REPO (e.g., mnmballa2323/alti.code.studio)"
}

output "workload_identity_provider" {
  value = google_iam_workload_identity_pool_provider.github_provider.name
}

output "service_account_email" {
  value = google_service_account.cicd_sa.email
}
