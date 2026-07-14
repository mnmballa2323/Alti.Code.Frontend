# GCP Assured Workloads Audit Logging
resource "google_project_iam_audit_config" "fedramp_audit" {
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

resource "google_logging_project_sink" "audit_sink" {
  name                   = "fedramp-audit-sink"
  destination            = "storage.googleapis.com/${google_storage_bucket.audit_log_bucket.name}"
  filter                 = "logName:\"logs/cloudaudit.googleapis.com\""
  unique_writer_identity = true
}

resource "google_storage_bucket" "audit_log_bucket" {
  name          = "fedramp-audit-logs-${var.tenant_id}"
  location      = "US"
  force_destroy = false

  retention_policy {
    is_locked        = true
    retention_period = 31536000 # 1 year retention
  }
}

variable "gcp_project_id" {
  type = string
}
