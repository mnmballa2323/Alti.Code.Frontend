# ==============================================================================
# ALTI CODE STUDIO: Cloud Logging Sinks & Log Router
# ==============================================================================

# Long-term log archival to GCS (90-day retention)
resource "google_storage_bucket" "log_archive" {
  name          = "${var.gcp_project_id}-log-archive"
  location      = var.region
  project       = var.gcp_project_id
  storage_class = "COLDLINE"
  force_destroy = false

  lifecycle_rule {
    condition {
      age = 365
    }
    action {
      type = "Delete"
    }
  }

  labels = {
    environment = var.environment
    managed-by  = "terraform"
    purpose     = "log-archive"
  }
}

# Sink: Route all audit logs to GCS
resource "google_logging_project_sink" "audit_to_gcs" {
  name        = "alti-audit-log-archive"
  destination = "storage.googleapis.com/${google_storage_bucket.log_archive.name}"
  project     = var.gcp_project_id
  filter      = "logName:\"cloudaudit.googleapis.com\""

  unique_writer_identity = true
}

# Grant the log sink service account write access to the bucket
resource "google_storage_bucket_iam_member" "log_sink_writer" {
  bucket = google_storage_bucket.log_archive.name
  role   = "roles/storage.objectCreator"
  member = google_logging_project_sink.audit_to_gcs.writer_identity
}

# Sink: Route security findings to BigQuery for analytics
resource "google_logging_project_sink" "security_to_bigquery" {
  name        = "alti-security-log-analytics"
  destination = "bigquery.googleapis.com/projects/${var.gcp_project_id}/datasets/security_logs"
  project     = var.gcp_project_id
  filter      = "severity>=WARNING AND resource.type=\"cloud_run_revision\""

  unique_writer_identity = true
}

# BigQuery dataset for security log analytics
resource "google_bigquery_dataset" "security_logs" {
  dataset_id = "security_logs"
  project    = var.gcp_project_id
  location   = var.region

  default_table_expiration_ms = 7776000000  # 90 days

  labels = {
    environment = var.environment
    managed-by  = "terraform"
  }
}
