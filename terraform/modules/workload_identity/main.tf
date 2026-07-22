# ==============================================================================
# ALTI CODE STUDIO: GCP Workload Identity Federation Module
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
# 1. Google Cloud Service Account for GitHub Actions CI/CD
# ------------------------------------------------------------------------------
resource "google_service_account" "cicd_sa" {
  account_id   = "alti-git-${var.customer_id}-${var.environment}"
  display_name = "Alti GitHub CI/CD Service Account for ${var.environment}"
}

# ------------------------------------------------------------------------------
# 2. Workload Identity Pool
# ------------------------------------------------------------------------------
resource "google_iam_workload_identity_pool" "github_pool" {
  workload_identity_pool_id = "alti-git-pool-${var.customer_id}-${var.environment}"
  display_name              = "Alti GitHub CI/CD Pool"
  description               = "Identity pool for GitHub Actions OIDC"
}

# ------------------------------------------------------------------------------
# 3. Workload Identity Pool Provider
# ------------------------------------------------------------------------------
resource "google_iam_workload_identity_pool_provider" "github_provider" {
  workload_identity_pool_id          = google_iam_workload_identity_pool.github_pool.workload_identity_pool_id
  workload_identity_pool_provider_id = "github-actions-provider"
  display_name                       = "GitHub Actions Provider"

  attribute_mapping = {
    "google.subject"       = "assertion.sub"
    "attribute.actor"      = "assertion.actor"
    "attribute.repository" = "assertion.repository"
  }

  oidc {
    issuer_uri = "https://token.actions.githubusercontent.com"
  }
}

# ------------------------------------------------------------------------------
# 4. IAM Binding to allow GitHub Actions provider to impersonate the service account
# ------------------------------------------------------------------------------
resource "google_service_account_iam_member" "github_impersonation" {
  service_account_id = google_service_account.cicd_sa.name
  role               = "roles/iam.workloadIdentityUser"
  member             = "principalSet://iam.googleapis.com/${google_iam_workload_identity_pool.github_pool.name}/attribute.repository/${var.github_repository}"
}

# ------------------------------------------------------------------------------
# Variables
# ------------------------------------------------------------------------------
variable "customer_id" {
  type        = string
  description = "Unique identifier for the customer/tenant to ensure naming uniqueness"
}

variable "environment" {
  type        = string
  description = "Deployment environment (e.g. prod, staging)"
}

variable "github_repository" {
  type        = string
  description = "The GitHub repository path in format ORG/REPO (e.g., mnmballa2323/alti.code.studio)"
}

# ------------------------------------------------------------------------------
# Outputs
# ------------------------------------------------------------------------------
output "service_account_email" {
  value       = google_service_account.cicd_sa.email
  description = "The email of the Google Service Account for CI/CD"
}

output "workload_identity_provider_name" {
  value       = google_iam_workload_identity_pool_provider.github_provider.name
  description = "The full identifier name of the Workload Identity Provider"
}
