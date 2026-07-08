# ==============================================================================
# ALTI CODE STUDIO: Production Observability — Metrics, Uptime, Log Archival
# ==============================================================================
# This file provisions:
#   1. Log-based metrics (5xx errors, latency >5s, authentication failures)
#   2. Monitoring notification channel (email placeholder)
#   3. Uptime checks (/healthz, /api/v1/health)
#   4. Log sink to GCS for long-term retention
#   5. GCS bucket for log archival
#
# All resources use Google Cloud Operations Suite (formerly Stackdriver).
# ==============================================================================

# ------------------------------------------------------------------------------
# Variables
# ------------------------------------------------------------------------------
variable "observability_notification_email" {
  description = "Email address for monitoring alert notifications"
  type        = string
  default     = "ops@alticode.studio"
}

variable "uptime_check_host" {
  description = "Hostname for uptime check targets (must resolve to the load balancer)"
  type        = string
  default     = "app.alticode.studio"
}

variable "log_retention_days" {
  description = "Number of days to retain logs in the archive bucket before transitioning to Coldline"
  type        = number
  default     = 365
}

# ------------------------------------------------------------------------------
# 1. Log-Based Metrics
# ------------------------------------------------------------------------------

# Metric: 5xx Server Errors
# Tracks all HTTP 5xx responses from Cloud Run and load balancer
resource "google_logging_metric" "server_5xx_errors" {
  name        = "alti/server_5xx_errors"
  project     = var.gcp_project_id
  description = "Count of HTTP 5xx server error responses across all services"
  filter      = "resource.type=\"cloud_run_revision\" OR resource.type=\"http_load_balancer\" httpRequest.status>=500"

  metric_descriptor {
    metric_kind = "DELTA"
    value_type  = "INT64"
    unit        = "1"

    labels {
      key         = "service"
      value_type  = "STRING"
      description = "The service that returned the 5xx error"
    }
  }

  label_extractors = {
    "service" = "EXTRACT(resource.labels.service_name)"
  }
}

# Metric: High Latency Requests (>5s)
# Tracks requests where server latency exceeds 5 seconds
resource "google_logging_metric" "high_latency_requests" {
  name        = "alti/high_latency_gt_5s"
  project     = var.gcp_project_id
  description = "Count of requests with latency exceeding 5 seconds"
  filter      = "resource.type=\"http_load_balancer\" httpRequest.latency>\"5s\""

  metric_descriptor {
    metric_kind = "DELTA"
    value_type  = "INT64"
    unit        = "1"

    labels {
      key         = "url"
      value_type  = "STRING"
      description = "The request URL path with high latency"
    }
  }

  label_extractors = {
    "url" = "EXTRACT(httpRequest.requestUrl)"
  }
}

# Metric: Authentication Failures
# Tracks 401/403 responses indicating auth failures or unauthorized access attempts
resource "google_logging_metric" "auth_failures" {
  name        = "alti/auth_failures"
  project     = var.gcp_project_id
  description = "Count of authentication/authorization failures (HTTP 401 and 403)"
  filter      = "(resource.type=\"cloud_run_revision\" OR resource.type=\"http_load_balancer\") (httpRequest.status=401 OR httpRequest.status=403)"

  metric_descriptor {
    metric_kind = "DELTA"
    value_type  = "INT64"
    unit        = "1"

    labels {
      key         = "source_ip"
      value_type  = "STRING"
      description = "Source IP of the failed authentication attempt"
    }
  }

  label_extractors = {
    "source_ip" = "EXTRACT(httpRequest.remoteIp)"
  }
}

# ------------------------------------------------------------------------------
# 2. Monitoring Notification Channel — Email
# ------------------------------------------------------------------------------
# Placeholder email notification channel for alert policies.
# Replace with PagerDuty, Slack, or other channels as needed.
resource "google_monitoring_notification_channel" "email_ops" {
  display_name = "Alti Ops Email Channel"
  type         = "email"
  project      = var.gcp_project_id

  labels = {
    email_address = var.observability_notification_email
  }

  user_labels = {
    environment = var.environment
    managed_by  = "terraform"
  }
}

# ------------------------------------------------------------------------------
# 3. Uptime Checks
# ------------------------------------------------------------------------------

# Uptime Check: /healthz — basic liveness probe
resource "google_monitoring_uptime_check_config" "healthz" {
  display_name = "Alti Health Check — /healthz"
  project      = var.gcp_project_id
  timeout      = "10s"
  period       = "60s"

  http_check {
    path         = "/healthz"
    port         = 443
    use_ssl      = true
    validate_ssl = true
  }

  monitored_resource {
    type = "uptime_url"
    labels = {
      project_id = var.gcp_project_id
      host       = var.uptime_check_host
    }
  }

  content_matchers {
    content = "ok"
    matcher = "CONTAINS_STRING"
  }
}

# Uptime Check: /api/v1/health — full readiness probe (DB, cache, external deps)
resource "google_monitoring_uptime_check_config" "api_health" {
  display_name = "Alti API Health — /api/v1/health"
  project      = var.gcp_project_id
  timeout      = "15s"
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
      host       = var.uptime_check_host
    }
  }

  content_matchers {
    content = "\"status\":\"healthy\""
    matcher = "CONTAINS_STRING"
  }
}

# ------------------------------------------------------------------------------
# 4. GCS Bucket — Long-Term Log Archive
# ------------------------------------------------------------------------------
# Dedicated bucket for Cloud Logging exports. Uses lifecycle policies to
# transition logs to Coldline after the retention period and auto-delete
# after 3x the retention period.
resource "google_storage_bucket" "log_archive" {
  name     = "${var.gcp_project_id}-log-archive"
  location = var.region
  project  = var.gcp_project_id

  uniform_bucket_level_access = true
  force_destroy               = false

  # Transition to Coldline after retention period (default: 365 days)
  lifecycle_rule {
    condition {
      age = var.log_retention_days
    }
    action {
      type          = "SetStorageClass"
      storage_class = "COLDLINE"
    }
  }

  # Auto-delete after 3x retention period to cap storage costs
  lifecycle_rule {
    condition {
      age = var.log_retention_days * 3
    }
    action {
      type = "Delete"
    }
  }

  versioning {
    enabled = false
  }

  labels = {
    environment = var.environment
    managed_by  = "terraform"
    purpose     = "log-archive"
    sovereignty = "gcp-native"
  }
}

# ------------------------------------------------------------------------------
# 5. Log Sink — Export All Logs to GCS for Long-Term Retention
# ------------------------------------------------------------------------------
# Exports project-level logs to the archive bucket. The sink's service account
# is automatically granted write access to the destination bucket.
resource "google_logging_project_sink" "log_archive_sink" {
  name        = "alti-log-archive-sink"
  project     = var.gcp_project_id
  destination = "storage.googleapis.com/${google_storage_bucket.log_archive.name}"

  # Export all logs — adjust filter to limit scope if needed
  filter = ""

  # Use a unique writer identity (recommended for production)
  unique_writer_identity = true
}

# Grant the log sink's service account permission to write to the archive bucket
resource "google_storage_bucket_iam_member" "log_sink_writer" {
  bucket = google_storage_bucket.log_archive.name
  role   = "roles/storage.objectCreator"
  member = google_logging_project_sink.log_archive_sink.writer_identity
}

# ------------------------------------------------------------------------------
# Outputs
# ------------------------------------------------------------------------------
output "log_archive_bucket_name" {
  description = "GCS bucket name for long-term log archival"
  value       = google_storage_bucket.log_archive.name
}

output "notification_channel_id" {
  description = "Monitoring notification channel ID for alert policies"
  value       = google_monitoring_notification_channel.email_ops.name
}

output "uptime_check_healthz_id" {
  description = "Uptime check ID for /healthz endpoint"
  value       = google_monitoring_uptime_check_config.healthz.uptime_check_id
}

output "uptime_check_api_health_id" {
  description = "Uptime check ID for /api/v1/health endpoint"
  value       = google_monitoring_uptime_check_config.api_health.uptime_check_id
}
