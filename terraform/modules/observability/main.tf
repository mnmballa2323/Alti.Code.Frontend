# ==============================================================================
# ALTI CODE STUDIO: GCP Cloud Operations Observability Module
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
# 1. Cloud Logging Bucket Configuration
# ------------------------------------------------------------------------------
resource "google_logging_project_bucket_config" "audit_bucket" {
  location       = var.region
  retention_days = var.environment == "prod" ? 90 : 30
  bucket_id      = "alti-audit-${var.customer_id}-${var.environment}"
}

# ------------------------------------------------------------------------------
# 2. Cloud Monitoring Dashboard (Simplified audit workspace equivalent)
# ------------------------------------------------------------------------------
resource "google_monitoring_dashboard" "dashboard" {
  dashboard_json = <<EOF
{
  "displayName": "Alti Sovereign Audit Dashboard (${var.environment})",
  "gridLayout": {
    "columns": "2",
    "widgets": [
      {
        "title": "Compute Instance CPU Utilization",
        "xyChart": {
          "dataSets": [
            {
              "timeSeriesQuery": {
                "timeSeriesFilter": {
                  "filter": "metric.type=\"compute.googleapis.com/instance/cpu/utilization\" resource.type=\"gce_instance\"",
                  "aggregation": {
                    "perSeriesAligner": "ALIGN_MEAN"
                  }
                }
              }
            }
          ]
        }
      }
    ]
  }
}
EOF
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

variable "region" {
  type        = string
  description = "GCP region where resources will be created"
}

variable "target_resource_ids" {
  type        = list(string)
  default     = []
  description = "List of GCP instance names to associate with diagnostics/metrics"
}

# ------------------------------------------------------------------------------
# Outputs
# ------------------------------------------------------------------------------
output "logging_bucket_name" {
  value       = google_logging_project_bucket_config.audit_bucket.id
  description = "The Resource Name of the Cloud Logging Bucket"
}

output "dashboard_name" {
  value       = google_monitoring_dashboard.dashboard.id
  description = "The Name of the Google Cloud Monitoring Dashboard"
}
