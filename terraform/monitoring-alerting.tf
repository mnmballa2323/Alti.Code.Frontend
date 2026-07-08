# ==============================================================================
# ALTI CODE STUDIO: Cloud Monitoring & Alerting
# ==============================================================================
# Uptime checks, alert policies, notification channels, and custom dashboards.
# ==============================================================================

# ── Notification Channel (email) ──
resource "google_monitoring_notification_channel" "email_ops" {
  display_name = "Alti Ops Email"
  type         = "email"
  project      = var.gcp_project_id

  labels = {
    email_address = var.ops_email
  }
}

# ── Uptime Check: Backend Health ──
resource "google_monitoring_uptime_check_config" "backend_health" {
  display_name = "Alti Backend Health"
  project      = var.gcp_project_id
  timeout      = "10s"
  period       = "60s"

  http_check {
    path         = "/health"
    port         = 443
    use_ssl      = true
    validate_ssl = true
  }

  monitored_resource {
    type = "uptime_url"
    labels = {
      project_id = var.gcp_project_id
      host       = var.backend_domain
    }
  }
}

# ── Uptime Check: Frontend Health ──
resource "google_monitoring_uptime_check_config" "frontend_health" {
  display_name = "Alti Frontend Health"
  project      = var.gcp_project_id
  timeout      = "10s"
  period       = "60s"

  http_check {
    path         = "/"
    port         = 443
    use_ssl      = true
    validate_ssl = true
  }

  monitored_resource {
    type = "uptime_url"
    labels = {
      project_id = var.gcp_project_id
      host       = var.frontend_domain
    }
  }
}

# ── Alert: Backend Down ──
resource "google_monitoring_alert_policy" "backend_uptime_alert" {
  display_name = "Backend Uptime Failure"
  project      = var.gcp_project_id
  combiner     = "OR"

  conditions {
    display_name = "Backend uptime check failing"
    condition_threshold {
      filter          = "resource.type = \"uptime_url\" AND metric.type = \"monitoring.googleapis.com/uptime_check/check_passed\" AND metric.labels.check_id = \"${google_monitoring_uptime_check_config.backend_health.uptime_check_id}\""
      comparison      = "COMPARISON_GT"
      threshold_value = 1
      duration        = "300s"

      aggregations {
        alignment_period   = "60s"
        per_series_aligner = "ALIGN_NEXT_OLDER"
        cross_series_reducer = "REDUCE_COUNT_FALSE"
        group_by_fields    = ["resource.label.project_id"]
      }
    }
  }

  notification_channels = [google_monitoring_notification_channel.email_ops.name]

  alert_strategy {
    auto_close = "1800s"
  }
}

# ── Alert: High Error Rate (>5% of requests) ──
resource "google_monitoring_alert_policy" "high_error_rate" {
  display_name = "High Error Rate (>5%)"
  project      = var.gcp_project_id
  combiner     = "OR"

  conditions {
    display_name = "Cloud Run error rate > 5%"
    condition_threshold {
      filter          = "resource.type = \"cloud_run_revision\" AND metric.type = \"run.googleapis.com/request_count\" AND metric.labels.response_code_class = \"5xx\""
      comparison      = "COMPARISON_GT"
      threshold_value = 50
      duration        = "300s"

      aggregations {
        alignment_period   = "60s"
        per_series_aligner = "ALIGN_RATE"
      }
    }
  }

  notification_channels = [google_monitoring_notification_channel.email_ops.name]
}

# ── Alert: High Latency (p95 > 2s) ──
resource "google_monitoring_alert_policy" "high_latency" {
  display_name = "High Latency (p95 > 2s)"
  project      = var.gcp_project_id
  combiner     = "OR"

  conditions {
    display_name = "Cloud Run p95 latency > 2 seconds"
    condition_threshold {
      filter          = "resource.type = \"cloud_run_revision\" AND metric.type = \"run.googleapis.com/request_latencies\""
      comparison      = "COMPARISON_GT"
      threshold_value = 2000
      duration        = "300s"

      aggregations {
        alignment_period   = "60s"
        per_series_aligner = "ALIGN_PERCENTILE_95"
      }
    }
  }

  notification_channels = [google_monitoring_notification_channel.email_ops.name]
}

# ── Alert: Memory Usage > 80% ──
resource "google_monitoring_alert_policy" "high_memory" {
  display_name = "High Memory Usage (>80%)"
  project      = var.gcp_project_id
  combiner     = "OR"

  conditions {
    display_name = "Cloud Run memory > 80%"
    condition_threshold {
      filter          = "resource.type = \"cloud_run_revision\" AND metric.type = \"run.googleapis.com/container/memory/utilizations\""
      comparison      = "COMPARISON_GT"
      threshold_value = 0.8
      duration        = "300s"

      aggregations {
        alignment_period   = "60s"
        per_series_aligner = "ALIGN_MEAN"
      }
    }
  }

  notification_channels = [google_monitoring_notification_channel.email_ops.name]
}
