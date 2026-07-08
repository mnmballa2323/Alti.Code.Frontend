# ==============================================================================
# ALTI CODE STUDIO: Service Accounts & IAM Bindings
# ==============================================================================
# Least-privilege service accounts for each platform component.
# ==============================================================================

# Backend Cloud Run Service Account
resource "google_service_account" "backend_sa" {
  account_id   = "alti-backend-sa"
  display_name = "Alti Backend Service Account"
  description  = "Cloud Run backend — Vertex AI, Secret Manager, Pub/Sub, Firestore"
  project      = var.gcp_project_id
}

# Frontend Cloud Run Service Account
resource "google_service_account" "frontend_sa" {
  account_id   = "alti-frontend-sa"
  display_name = "Alti Frontend Service Account"
  description  = "Cloud Run frontend with minimal permissions"
  project      = var.gcp_project_id
}

# Worker/Background Jobs Service Account
resource "google_service_account" "worker_sa" {
  account_id   = "alti-worker-sa"
  display_name = "Alti Worker Service Account"
  description  = "Background workers — Cloud Tasks, Pub/Sub, BigQuery, Batch"
  project      = var.gcp_project_id
}

# CI/CD Build Service Account
resource "google_service_account" "cicd_build_sa" {
  account_id   = "alti-cicd-build-sa"
  display_name = "Alti CI/CD Build Service Account"
  description  = "Cloud Build — Artifact Registry, Cloud Run, Secret Manager"
  project      = var.gcp_project_id
}

# ── Backend IAM Bindings (Least Privilege) ──
resource "google_project_iam_member" "backend_roles" {
  for_each = toset([
    "roles/aiplatform.user",              # Vertex AI inference
    "roles/secretmanager.secretAccessor",  # Read secrets
    "roles/pubsub.publisher",             # Publish events
    "roles/pubsub.subscriber",            # Consume events
    "roles/datastore.user",               # Firestore read/write
    "roles/storage.objectUser",           # Cloud Storage
    "roles/logging.logWriter",            # Structured logs
    "roles/cloudtrace.agent",             # Distributed tracing
    "roles/cloudprofiler.agent",          # Continuous profiling
    "roles/errorreporting.writer",        # Error aggregation
    "roles/bigquery.dataEditor",          # Analytics writes
    "roles/dlp.user",                     # DLP scanning
    "roles/cloudsql.client",              # Cloud SQL / AlloyDB
    "roles/redis.editor",                 # Memorystore access
  ])

  project = var.gcp_project_id
  role    = each.key
  member  = "serviceAccount:${google_service_account.backend_sa.email}"
}

# ── Worker IAM Bindings ──
resource "google_project_iam_member" "worker_roles" {
  for_each = toset([
    "roles/cloudtasks.enqueuer",
    "roles/cloudtasks.viewer",
    "roles/pubsub.publisher",
    "roles/pubsub.subscriber",
    "roles/bigquery.dataEditor",
    "roles/storage.objectUser",
    "roles/logging.logWriter",
    "roles/batch.jobsEditor",
  ])

  project = var.gcp_project_id
  role    = each.key
  member  = "serviceAccount:${google_service_account.worker_sa.email}"
}

# ── CI/CD IAM Bindings ──
resource "google_project_iam_member" "cicd_roles" {
  for_each = toset([
    "roles/artifactregistry.writer",
    "roles/run.admin",
    "roles/secretmanager.secretAccessor",
    "roles/iam.serviceAccountUser",
    "roles/logging.logWriter",
  ])

  project = var.gcp_project_id
  role    = each.key
  member  = "serviceAccount:${google_service_account.cicd_build_sa.email}"
}

# ── Frontend IAM Bindings (Minimal) ──
resource "google_project_iam_member" "frontend_roles" {
  for_each = toset([
    "roles/logging.logWriter",
    "roles/cloudtrace.agent",
  ])

  project = var.gcp_project_id
  role    = each.key
  member  = "serviceAccount:${google_service_account.frontend_sa.email}"
}
