# ==============================================================================
# ALTI CODE STUDIO: Cloud Monitoring Alert Policies
# ==============================================================================
# Production alert policies for SLO-based monitoring.
# ==============================================================================

# ── Notification Channel (Email) ──
resource "google_monitoring_notification_channel" "ops_email" {
  display_name = "Alti Ops Team"
  type         = "email"
  labels = {
    email_address = var.ops_alert_email
  }
  project = var.gcp_project_id
}

# ── Alert 1: Error Rate (5xx > 1% for 5 minutes) ──
resource "google_monitoring_alert_policy" "error_rate" {
  display_name = "[P1] Cloud Run 5xx Error Rate > 1%"
  combiner     = "OR"
  project      = var.gcp_project_id

  conditions {
    display_name = "5xx error rate exceeds 1%"
    condition_threshold {
      filter          = "metric.type=\"run.googleapis.com/request_count\" resource.type=\"cloud_run_revision\" metric.label.response_code_class=\"5xx\""
      duration        = "300s"
      comparison      = "COMPARISON_GT"
      threshold_value = 0.01
      aggregations {
        alignment_period   = "60s"
        per_series_aligner = "ALIGN_RATE"
      }
    }
  }

  notification_channels = [google_monitoring_notification_channel.ops_email.name]

  alert_strategy {
    auto_close = "1800s"
  }

  documentation {
    content   = "5xx error rate has exceeded 1% for 5 minutes. Check Cloud Run logs and runbook: docs/runbooks/database-down.md"
    mime_type = "text/markdown"
  }
}

# ── Alert 2: Latency P99 > 5 seconds ──
resource "google_monitoring_alert_policy" "latency_p99" {
  display_name = "[P2] Cloud Run Latency p99 > 5s"
  combiner     = "OR"
  project      = var.gcp_project_id

  conditions {
    display_name = "Request latency p99 exceeds 5s"
    condition_threshold {
      filter          = "metric.type=\"run.googleapis.com/request_latencies\" resource.type=\"cloud_run_revision\""
      duration        = "300s"
      comparison      = "COMPARISON_GT"
      threshold_value = 5000
      aggregations {
        alignment_period     = "60s"
        per_series_aligner   = "ALIGN_PERCENTILE_99"
        cross_series_reducer = "REDUCE_MEAN"
      }
    }
  }

  notification_channels = [google_monitoring_notification_channel.ops_email.name]

  documentation {
    content   = "p99 latency has exceeded 5 seconds. Check cold starts and database connections. Runbook: docs/runbooks/cold-start.md"
    mime_type = "text/markdown"
  }
}

# ── Alert 3: Memory Utilization > 85% ──
resource "google_monitoring_alert_policy" "memory_high" {
  display_name = "[P2] Cloud Run Memory > 85%"
  combiner     = "OR"
  project      = var.gcp_project_id

  conditions {
    display_name = "Memory utilization exceeds 85%"
    condition_threshold {
      filter          = "metric.type=\"run.googleapis.com/container/memory/utilizations\" resource.type=\"cloud_run_revision\""
      duration        = "300s"
      comparison      = "COMPARISON_GT"
      threshold_value = 0.85
      aggregations {
        alignment_period     = "60s"
        per_series_aligner   = "ALIGN_PERCENTILE_99"
        cross_series_reducer = "REDUCE_MAX"
      }
    }
  }

  notification_channels = [google_monitoring_notification_channel.ops_email.name]

  documentation {
    content   = "Container memory utilization is above 85%. Risk of OOM kill. Runbook: docs/runbooks/oom-kill.md"
    mime_type = "text/markdown"
  }
}

# ── Alert 4: Pub/Sub Backlog > 10,000 messages ──
resource "google_monitoring_alert_policy" "pubsub_backlog" {
  display_name = "[P2] Pub/Sub Backlog > 10k Messages"
  combiner     = "OR"
  project      = var.gcp_project_id

  conditions {
    display_name = "Undelivered messages exceed 10000"
    condition_threshold {
      filter          = "metric.type=\"pubsub.googleapis.com/subscription/num_undelivered_messages\" resource.type=\"pubsub_subscription\""
      duration        = "300s"
      comparison      = "COMPARISON_GT"
      threshold_value = 10000
      aggregations {
        alignment_period   = "60s"
        per_series_aligner = "ALIGN_MEAN"
      }
    }
  }

  notification_channels = [google_monitoring_notification_channel.ops_email.name]

  documentation {
    content   = "Pub/Sub subscription backlog exceeds 10,000 messages. Runbook: docs/runbooks/pubsub-backlog.md"
    mime_type = "text/markdown"
  }
}

# ── Alert 5: Cloud SQL CPU > 80% ──
resource "google_monitoring_alert_policy" "sql_cpu" {
  display_name = "[P2] Cloud SQL CPU > 80%"
  combiner     = "OR"
  project      = var.gcp_project_id

  conditions {
    display_name = "Database CPU utilization exceeds 80%"
    condition_threshold {
      filter          = "metric.type=\"cloudsql.googleapis.com/database/cpu/utilization\" resource.type=\"cloudsql_database\""
      duration        = "300s"
      comparison      = "COMPARISON_GT"
      threshold_value = 0.80
      aggregations {
        alignment_period   = "60s"
        per_series_aligner = "ALIGN_MEAN"
      }
    }
  }

  notification_channels = [google_monitoring_notification_channel.ops_email.name]

  documentation {
    content   = "Cloud SQL CPU exceeds 80%. Check slow queries and connection count. Runbook: docs/runbooks/database-down.md"
    mime_type = "text/markdown"
  }
}

# ── Alert 6: Vertex AI 429 Rate Limiting ──
resource "google_monitoring_alert_policy" "vertex_quota" {
  display_name = "[P1] Vertex AI Quota Exhaustion (429s)"
  combiner     = "OR"
  project      = var.gcp_project_id

  conditions {
    display_name = "Vertex AI returning 429 errors"
    condition_threshold {
      filter          = "metric.type=\"serviceruntime.googleapis.com/api/request_count\" resource.type=\"consumed_api\" resource.label.service=\"aiplatform.googleapis.com\" metric.label.response_code=\"429\""
      duration        = "60s"
      comparison      = "COMPARISON_GT"
      threshold_value = 5
      aggregations {
        alignment_period   = "60s"
        per_series_aligner = "ALIGN_RATE"
      }
    }
  }

  notification_channels = [google_monitoring_notification_channel.ops_email.name]

  documentation {
    content   = "Vertex AI quota exhaustion detected. Runbook: docs/runbooks/vertex-quota.md"
    mime_type = "text/markdown"
  }
}
