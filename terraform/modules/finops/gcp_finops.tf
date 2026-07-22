# ==============================================================================
# ALTI CODE STUDIO: GCP FinOps Cost Controls Module
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
# Google Cloud Billing Budget
# ------------------------------------------------------------------------------
resource "google_billing_budget" "budget" {
  billing_account = var.billing_account_id
  display_name    = "alti-budget-${var.customer_id}-${var.environment}"

  budget_filter {
    projects = ["projects/${var.project_id}"]
  }

  amount {
    specified_amount {
      currency_code = "USD"
      units         = tostring(var.budget_amount)
    }
  }

  threshold_rules {
    threshold_percent = 0.8
    spend_basis       = "CURRENT_SPEND"
  }

  threshold_rules {
    threshold_percent = 1.0
    spend_basis       = "CURRENT_SPEND"
  }

  all_updates_rule {
    pubsub_topic                     = google_pubsub_topic.billing_notifications.id
    schema_version                   = "1.0"
    disable_default_iam_recipients   = false
  }
}

resource "google_pubsub_topic" "billing_notifications" {
  name = "alti-billing-alerts-${var.customer_id}-${var.environment}"
}

# ------------------------------------------------------------------------------
# Variables
# ------------------------------------------------------------------------------
variable "customer_id" {
  type        = string
  description = "Unique identifier for the customer/tenant to ensure naming uniqueness"
}
variable "environment" { type = string }
variable "project_id" { type = string }
variable "billing_account_id" {
  type        = string
  default     = "000000-000000-000000"
  description = "Google Cloud Billing Account ID"
}
variable "budget_amount" {
  type    = number
  default = 5000
}
