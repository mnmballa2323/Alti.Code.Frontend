# ==============================================================================
# ALTI CODE STUDIO: Identity Platform & API Gateway Infrastructure
# ==============================================================================
# Enterprise identity management and API gateway for external consumers.
# ==============================================================================

# ── Identity Platform (GCIP) ──
resource "google_identity_platform_config" "default" {
  count   = var.enable_identity_platform ? 1 : 0
  project = var.gcp_project_id

  sign_in {
    allow_duplicate_emails = false

    email {
      enabled           = true
      password_required = true
    }
  }

  # Multi-Factor Authentication
  mfa {
    provider_configs {
      state = "ENABLED"
      totp_provider_config {
        adjacent_intervals = 1
      }
    }
  }

  # Block suspicious login attempts
  blocking_functions {
    triggers {
      event_type   = "beforeSignIn"
      function_uri = "https://${var.region}-${var.gcp_project_id}.cloudfunctions.net/auth-before-sign-in"
    }
  }
}

# Identity Platform OAuth IDP Config (Google Sign-In)
resource "google_identity_platform_default_supported_idp_config" "google_signin" {
  count        = var.enable_identity_platform ? 1 : 0
  project      = var.gcp_project_id
  enabled      = true
  idp_id       = "google.com"
  client_id    = var.google_oauth_client_id
  client_secret = var.google_oauth_client_secret
}

# ── API Gateway ──
resource "google_api_gateway_api" "platform_api" {
  count    = var.enable_api_gateway ? 1 : 0
  provider = google
  api_id   = "alti-code-studio-api"
  project  = var.gcp_project_id

  labels = {
    environment = var.environment
    managed-by  = "terraform"
  }
}

resource "google_api_gateway_api_config" "platform_api_config" {
  count         = var.enable_api_gateway ? 1 : 0
  provider      = google
  api           = google_api_gateway_api.platform_api[0].api_id
  api_config_id = "alti-api-config-v1"
  project       = var.gcp_project_id

  openapi_documents {
    document {
      path     = "openapi.yaml"
      contents = base64encode(<<-EOF
        swagger: "2.0"
        info:
          title: "Alti Code Studio API"
          version: "1.0.0"
        host: "api.alticode.studio"
        schemes:
          - "https"
        paths:
          /api/v1/health:
            get:
              operationId: health
              responses:
                200:
                  description: OK
          /api/v1/**:
            get:
              operationId: api-proxy
              x-google-backend:
                address: "https://alti-code-studio-backend-${var.region}.run.app"
              responses:
                200:
                  description: OK
      EOF
      )
    }
  }

  gateway_config {
    backend_config {
      google_service_account = "alti-api-gateway-sa@${var.gcp_project_id}.iam.gserviceaccount.com"
    }
  }
}

resource "google_api_gateway_gateway" "platform_gateway" {
  count      = var.enable_api_gateway ? 1 : 0
  provider   = google
  gateway_id = "alti-api-gateway"
  api_config = google_api_gateway_api_config.platform_api_config[0].id
  project    = var.gcp_project_id
  region     = var.region

  labels = {
    environment = var.environment
  }
}

# ── Workload Identity Federation (Keyless CI/CD) ──
resource "google_iam_workload_identity_pool" "github_pool" {
  count                     = var.enable_workload_identity ? 1 : 0
  workload_identity_pool_id = "github-actions-pool"
  project                   = var.gcp_project_id
  display_name              = "GitHub Actions Pool"
  description               = "Workload Identity Pool for GitHub Actions CI/CD (keyless auth)"
}

resource "google_iam_workload_identity_pool_provider" "github_provider" {
  count                              = var.enable_workload_identity ? 1 : 0
  workload_identity_pool_id          = google_iam_workload_identity_pool.github_pool[0].workload_identity_pool_id
  workload_identity_pool_provider_id = "github-provider"
  project                            = var.gcp_project_id
  display_name                       = "GitHub OIDC Provider"

  attribute_mapping = {
    "google.subject"       = "assertion.sub"
    "attribute.actor"      = "assertion.actor"
    "attribute.repository" = "assertion.repository"
  }

  attribute_condition = "assertion.repository_owner == '${var.github_org}'"

  oidc {
    issuer_uri = "https://token.actions.githubusercontent.com"
  }
}

# Service account for CI/CD
resource "google_service_account" "cicd_sa" {
  count        = var.enable_workload_identity ? 1 : 0
  account_id   = "alti-cicd-sa"
  display_name = "Alti CI/CD Service Account"
  project      = var.gcp_project_id
}

# Allow GitHub Actions to impersonate the CI/CD service account
resource "google_service_account_iam_member" "cicd_workload_identity" {
  count              = var.enable_workload_identity ? 1 : 0
  service_account_id = google_service_account.cicd_sa[0].name
  role               = "roles/iam.workloadIdentityUser"
  member             = "principalSet://iam.googleapis.com/${google_iam_workload_identity_pool.github_pool[0].name}/attribute.repository/${var.github_org}/${var.github_repo}"
}

# ==============================================================================
# Variables
# ==============================================================================

variable "enable_identity_platform" {
  description = "Enable Google Cloud Identity Platform for enterprise SSO/MFA"
  type        = bool
  default     = false
}

variable "enable_api_gateway" {
  description = "Enable Cloud API Gateway for external API management"
  type        = bool
  default     = false
}

variable "enable_workload_identity" {
  description = "Enable Workload Identity Federation for keyless CI/CD"
  type        = bool
  default     = false
}

variable "google_oauth_client_id" {
  description = "Google OAuth 2.0 Client ID for Identity Platform"
  type        = string
  default     = ""
  sensitive   = true
}

variable "google_oauth_client_secret" {
  description = "Google OAuth 2.0 Client Secret for Identity Platform"
  type        = string
  default     = ""
  sensitive   = true
}

variable "github_org" {
  description = "GitHub organization for Workload Identity Federation"
  type        = string
  default     = "alticodestudio"
}

variable "github_repo" {
  description = "GitHub repository for Workload Identity Federation"
  type        = string
  default     = "alti.code.studio"
}
