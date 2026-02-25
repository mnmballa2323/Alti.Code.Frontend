# -------------------------------------------------------------
# Enterprise Observability & SIEM Exporter
# -------------------------------------------------------------

# Create a Pub/Sub topic for streaming GKE/Auth logs to an external SIEM (e.g. Splunk, Datadog)
resource "google_pubsub_topic" "siem_export" {
  name = "alti-siem-export-${var.environment}"
}

# Create a Log Router Sink to push specific Audit & Security logs to the Pub/Sub topic
resource "google_logging_project_sink" "siem_sink" {
  name        = "alti-siem-sink-${var.environment}"
  destination = "pubsub.googleapis.com/projects/${var.project_id}/topics/${google_pubsub_topic.siem_export.name}"
  
  # Export high-severity GKE logs, Access Transparancy logs, and custom Application Audit logs
  filter = "resource.type=\"k8s_cluster\" OR logName:\"cloudaudit.googleapis.com\" OR severity>=WARNING"

  unique_writer_identity = true
}

# Grant the Log Sink writer permissions to publish to the Pub/Sub topic
resource "google_pubsub_topic_iam_member" "log_writer" {
  topic  = google_pubsub_topic.siem_export.name
  role   = "roles/pubsub.publisher"
  member = google_logging_project_sink.siem_sink.writer_identity
}

# -------------------------------------------------------------
# GKE Usage Metering for Tenant-Level Cost Attribution (FinOps)
# -------------------------------------------------------------

# Create a BigQuery Dataset for GKE Usage Metering
resource "google_bigquery_dataset" "kube_billing" {
  dataset_id                  = "alti_gke_billing_export_${var.environment}"
  friendly_name               = "GKE Billing Export"
  description                 = "Stores granular tenant-level pod billing and usage metrics."
  location                    = "US" # Should match project billing location
  default_table_expiration_ms = 31536000000 # 365 Days
}

# Grant GKE Service Account permissions to write to BigQuery
resource "google_project_iam_member" "bigquery_writer" {
  project = var.project_id
  role    = "roles/bigquery.dataEditor"
  # Replace with the actual GKE Service Account or standard Compute SA in production
  member  = "serviceAccount:service-${data.google_project.project.number}@container-engine-robot.iam.gserviceaccount.com"
}

data "google_project" "project" {}

# -------------------------------------------------------------
# Variables and Outputs
# -------------------------------------------------------------
variable "project_id" { type = string }
variable "environment" { type = string }

output "siem_pubsub_topic" {
  value = google_pubsub_topic.siem_export.id
}
output "bigquery_billing_dataset" {
  value = google_bigquery_dataset.kube_billing.dataset_id
}
