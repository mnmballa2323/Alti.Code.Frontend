# ==============================================================================
# ALTI CODE STUDIO: Governance & Compliance Module
# Organization policies, Assured Workloads, audit configuration, data residency,
# budget alerts, and Access Transparency for the sovereign platform.
# ==============================================================================

terraform {
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
  }
}

variable "gcp_project_id" {
  description = "GCP project ID"
  type        = string
}

variable "org_id" {
  description = "GCP Organization ID (required for org policies)"
  type        = string
  default     = ""
}

variable "region" {
  description = "Primary GCP region"
  type        = string
  default     = "us-central1"
}

variable "environment" {
  description = "Deployment environment"
  type        = string
  default     = "prod"
}

variable "budget_amount" {
  description = "Monthly budget alert threshold in USD"
  type        = number
  default     = 10000
}

variable "billing_account_id" {
  description = "GCP billing account ID for budget alerts"
  type        = string
  default     = ""
}

variable "alert_email" {
  description = "Email address for budget and compliance alerts"
  type        = string
  default     = ""
}

variable "data_residency_locations" {
  description = "Allowed GCP locations for data residency (e.g., ['us-locations'])"
  type        = list(string)
  default     = ["us-locations"]
}

variable "enable_assured_workloads" {
  description = "Enable Assured Workloads for FedRAMP/IL compliance"
  type        = bool
  default     = false
}

variable "compliance_regime" {
  description = "Compliance regime for Assured Workloads (IL4, IL5, FEDRAMP_HIGH, FEDRAMP_MODERATE)"
  type        = string
  default     = "IL4"
}

provider "google" {
  project = var.gcp_project_id
  region  = var.region
}

# ------------------------------------------------------------------------------
# 1. Organization Policies — Enforce Sovereignty Constraints
# ------------------------------------------------------------------------------

# Restrict VM external IPs (prevent accidental public exposure)
resource "google_project_organization_policy" "disable_external_ip" {
  project    = var.gcp_project_id
  constraint = "compute.vmExternalIpAccess"

  list_policy {
    deny {
      all = true
    }
  }
}

# Restrict resource locations to approved regions
resource "google_project_organization_policy" "resource_locations" {
  project    = var.gcp_project_id
  constraint = "gcp.resourceLocations"

  list_policy {
    allow {
      values = var.data_residency_locations
    }
  }
}

# Require OS Login for all SSH access
resource "google_project_organization_policy" "require_os_login" {
  project    = var.gcp_project_id
  constraint = "compute.requireOsLogin"

  boolean_policy {
    enforced = true
  }
}

# Disable service account key creation (use Workload Identity only)
resource "google_project_organization_policy" "disable_sa_key_creation" {
  project    = var.gcp_project_id
  constraint = "iam.disableServiceAccountKeyCreation"

  boolean_policy {
    enforced = true
  }
}

# Enforce uniform bucket-level access (no ACLs)
resource "google_project_organization_policy" "uniform_bucket_access" {
  project    = var.gcp_project_id
  constraint = "storage.uniformBucketLevelAccess"

  boolean_policy {
    enforced = true
  }
}

# Require Shielded VMs
resource "google_project_organization_policy" "require_shielded_vm" {
  project    = var.gcp_project_id
  constraint = "compute.requireShieldedVm"

  boolean_policy {
    enforced = true
  }
}

# Disable serial port access
resource "google_project_organization_policy" "disable_serial_port" {
  project    = var.gcp_project_id
  constraint = "compute.disableSerialPortAccess"

  boolean_policy {
    enforced = true
  }
}

# Disable default service account grants
resource "google_project_organization_policy" "disable_default_sa_grants" {
  project    = var.gcp_project_id
  constraint = "iam.automaticIamGrantsForDefaultServiceAccounts"

  boolean_policy {
    enforced = true
  }
}

# ------------------------------------------------------------------------------
# 2. Assured Workloads — FedRAMP / IL Compliance Folder
# ------------------------------------------------------------------------------
resource "google_assured_workloads_workload" "sovereign_workload" {
  count = var.enable_assured_workloads && var.org_id != "" ? 1 : 0

  compliance_regime = var.compliance_regime
  display_name      = "Alti Code Studio - ${var.compliance_regime}"
  location          = var.region
  organization      = var.org_id

  resource_settings {
    resource_type = "CONSUMER_FOLDER"
  }

  labels = {
    environment = var.environment
    managed_by  = "terraform"
    sovereignty = "assured-workloads"
  }
}

# ------------------------------------------------------------------------------
# 3. Audit Logging — Comprehensive Data Access Logging
# ------------------------------------------------------------------------------
resource "google_project_iam_audit_config" "admin_audit" {
  project = var.gcp_project_id
  service = "allServices"

  audit_log_config {
    log_type = "ADMIN_READ"
  }

  audit_log_config {
    log_type = "DATA_READ"
  }

  audit_log_config {
    log_type = "DATA_WRITE"
  }
}

# Audit log sink to BigQuery for long-term retention and analysis
resource "google_logging_project_sink" "audit_to_bigquery" {
  name                   = "alti-audit-log-sink"
  destination            = "bigquery.googleapis.com/projects/${var.gcp_project_id}/datasets/${google_bigquery_dataset.audit_logs.dataset_id}"
  filter                 = "logName:\"logs/cloudaudit.googleapis.com\""
  unique_writer_identity = true
}

resource "google_bigquery_dataset" "audit_logs" {
  dataset_id    = "alti_audit_logs"
  friendly_name = "Alti Code Studio Audit Logs"
  description   = "Long-term retention of Cloud Audit Logs for compliance"
  location      = "US"

  default_table_expiration_ms = 31536000000  # 365 days

  labels = {
    environment = var.environment
    managed_by  = "terraform"
    purpose     = "audit-compliance"
  }
}

resource "google_bigquery_dataset_iam_member" "audit_sink_writer" {
  dataset_id = google_bigquery_dataset.audit_logs.dataset_id
  role       = "roles/bigquery.dataEditor"
  member     = google_logging_project_sink.audit_to_bigquery.writer_identity
}

# Security logs sink for Security Command Center findings
resource "google_logging_project_sink" "security_findings_sink" {
  name                   = "alti-security-findings-sink"
  destination            = "bigquery.googleapis.com/projects/${var.gcp_project_id}/datasets/${google_bigquery_dataset.audit_logs.dataset_id}"
  filter                 = "jsonPayload.SCC_FINDING:*"
  unique_writer_identity = true
}

resource "google_bigquery_dataset_iam_member" "security_sink_writer" {
  dataset_id = google_bigquery_dataset.audit_logs.dataset_id
  role       = "roles/bigquery.dataEditor"
  member     = google_logging_project_sink.security_findings_sink.writer_identity
}

# ------------------------------------------------------------------------------
# 4. Budget Alerts — Cost Governance
# ------------------------------------------------------------------------------
resource "google_billing_budget" "monthly_budget" {
  count = var.billing_account_id != "" ? 1 : 0

  billing_account = var.billing_account_id
  display_name    = "Alti Code Studio - ${var.environment} Monthly Budget"

  budget_filter {
    projects = ["projects/${var.gcp_project_id}"]
  }

  amount {
    specified_amount {
      currency_code = "USD"
      units         = tostring(var.budget_amount)
    }
  }

  threshold_rules {
    threshold_percent = 0.5
    spend_basis       = "CURRENT_SPEND"
  }

  threshold_rules {
    threshold_percent = 0.8
    spend_basis       = "CURRENT_SPEND"
  }

  threshold_rules {
    threshold_percent = 1.0
    spend_basis       = "CURRENT_SPEND"
  }

  threshold_rules {
    threshold_percent = 1.2
    spend_basis       = "FORECASTED_SPEND"
  }
}

# ------------------------------------------------------------------------------
# 5. Custom Monitoring — Compliance Dashboard Metrics
# ------------------------------------------------------------------------------
resource "google_monitoring_alert_policy" "high_error_rate" {
  display_name = "Alti Code Studio - High Error Rate"
  combiner     = "OR"

  conditions {
    display_name = "Cloud Run 5xx error rate > 5%"

    condition_threshold {
      filter = "resource.type = \"cloud_run_revision\" AND metric.type = \"run.googleapis.com/request_count\" AND metric.labels.response_code_class = \"5xx\""
      comparison = "COMPARISON_GT"
      threshold_value = 5

      duration = "300s"

      aggregations {
        alignment_period   = "60s"
        per_series_aligner = "ALIGN_RATE"
      }
    }
  }

  notification_channels = []

  documentation {
    content   = "The 5xx error rate for Alti Code Studio Cloud Run service has exceeded 5%. Investigate immediately."
    mime_type = "text/markdown"
  }

  alert_strategy {
    auto_close = "1800s"
  }
}

resource "google_monitoring_alert_policy" "database_cpu_alert" {
  display_name = "Alti Code Studio - Database CPU > 80%"
  combiner     = "OR"

  conditions {
    display_name = "Cloud SQL CPU utilization"

    condition_threshold {
      filter          = "resource.type = \"cloudsql_database\" AND metric.type = \"cloudsql.googleapis.com/database/cpu/utilization\""
      comparison      = "COMPARISON_GT"
      threshold_value = 0.8
      duration        = "300s"

      aggregations {
        alignment_period   = "60s"
        per_series_aligner = "ALIGN_MEAN"
      }
    }
  }

  notification_channels = []
}

resource "google_monitoring_alert_policy" "redis_memory_alert" {
  display_name = "Alti Code Studio - Redis Memory > 90%"
  combiner     = "OR"

  conditions {
    display_name = "Memorystore memory usage ratio"

    condition_threshold {
      filter          = "resource.type = \"redis_instance\" AND metric.type = \"redis.googleapis.com/stats/memory/usage_ratio\""
      comparison      = "COMPARISON_GT"
      threshold_value = 0.9
      duration        = "300s"

      aggregations {
        alignment_period   = "60s"
        per_series_aligner = "ALIGN_MEAN"
      }
    }
  }

  notification_channels = []
}

# ------------------------------------------------------------------------------
# 6. Cloud Monitoring Uptime Checks
# ------------------------------------------------------------------------------
resource "google_monitoring_uptime_check_config" "api_health" {
  display_name = "Alti Code Studio - API Health Check"
  timeout      = "10s"
  period       = "60s"

  http_check {
    path         = "/api/v1/health"
    port         = 443
    use_ssl      = true
    validate_ssl = true
  }

  monitored_resource {
    type = "uptime_url"
    labels = {
      project_id = var.gcp_project_id
      host       = "api.alticode.studio"
    }
  }
}

# ------------------------------------------------------------------------------
# 7. Outputs
# ------------------------------------------------------------------------------
output "audit_log_dataset" {
  description = "BigQuery dataset for audit log retention"
  value       = google_bigquery_dataset.audit_logs.dataset_id
}

output "assured_workload_id" {
  description = "Assured Workloads ID (if enabled)"
  value       = var.enable_assured_workloads && var.org_id != "" ? google_assured_workloads_workload.sovereign_workload[0].id : "not-enabled"
}
