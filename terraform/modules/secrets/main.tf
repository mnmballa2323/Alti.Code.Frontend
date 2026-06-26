# ==============================================================================
# ALTI CODE STUDIO: GCP Secret Manager Module
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
# Secret Manager Secrets
# ------------------------------------------------------------------------------
resource "google_secret_manager_secret" "secret" {
  for_each  = var.secrets
  secret_id = "alti-sec-${var.customer_id}-${var.environment}-${each.key}"

  replication {
    auto {}
  }
}

resource "google_secret_manager_secret_version" "secret_version" {
  for_each    = var.secrets
  secret      = google_secret_manager_secret.secret[each.key].id
  secret_data = each.value
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

variable "secrets" {
  description = "A map of secret names to their values"
  type        = map(string)
  sensitive   = true
}

# ------------------------------------------------------------------------------
# Outputs
# ------------------------------------------------------------------------------
output "secret_ids" {
  value = {
    for k, v in google_secret_manager_secret.secret : k => v.id
  }
  description = "Map of secret names to their corresponding secret IDs"
}
