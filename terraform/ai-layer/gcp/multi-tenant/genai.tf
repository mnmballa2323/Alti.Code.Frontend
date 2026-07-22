# ==============================================================================
# ALTI CODE STUDIO: Vertex AI GenAI Endpoints & Model Infrastructure
# Model serving endpoints, experiment tracking, feature store, and evaluation.
# ==============================================================================

# ------------------------------------------------------------------------------
# 1. Vertex AI Endpoint — Primary Gemini Model Serving
# ------------------------------------------------------------------------------
resource "google_vertex_ai_endpoint" "gemini_endpoint" {
  display_name = "alti-gemini-endpoint"
  location     = var.region
  description  = "Primary Vertex AI endpoint for Gemini model inference and agentic AI"

  labels = {
    environment = var.environment
    managed_by  = "terraform"
    sovereignty = "gcp-native"
    purpose     = "gemini-inference"
  }
}

# ------------------------------------------------------------------------------
# 2. Vertex AI Tensorboard — Experiment Tracking & Model Evaluation
# ------------------------------------------------------------------------------
resource "google_vertex_ai_tensorboard" "experiments" {
  count        = var.vertex_ai_tensorboard_enabled ? 1 : 0
  display_name = "alti-experiments"
  region       = var.region
  description  = "Experiment tracking for model evaluation, fine-tuning, and agent performance monitoring"

  labels = {
    environment = var.environment
    managed_by  = "terraform"
    sovereignty = "gcp-native"
  }
}

# ------------------------------------------------------------------------------
# 3. Vertex AI Feature Online Store — Real-Time Feature Serving
# ------------------------------------------------------------------------------
resource "google_vertex_ai_feature_online_store" "embedding_store" {
  name   = "alti-embedding-store"
  region = var.region

  bigtable {
    auto_scaling {
      min_node_count         = var.vertex_ai_feature_store_min_nodes
      max_node_count         = var.vertex_ai_feature_store_max_nodes
      cpu_utilization_target = 70
    }
  }

  labels = {
    environment = var.environment
    managed_by  = "terraform"
    sovereignty = "gcp-native"
    purpose     = "embedding-serving"
  }
}

# ------------------------------------------------------------------------------
# 4. Vertex AI Dataset — Evaluation Dataset for Model Quality Gates
# ------------------------------------------------------------------------------
resource "google_vertex_ai_dataset" "eval_dataset" {
  display_name        = "alti-eval-dataset"
  metadata_schema_uri = "gs://google-cloud-aiplatform/schema/dataset/metadata/text_1.0.0.yaml"
  region              = var.region

  labels = {
    environment = var.environment
    managed_by  = "terraform"
    sovereignty = "gcp-native"
    purpose     = "model-evaluation"
  }
}

# ------------------------------------------------------------------------------
# 5. GCS Bucket — Model Artifacts & Fine-Tuning Data
# ------------------------------------------------------------------------------
resource "google_storage_bucket" "model_artifacts" {
  name     = "${var.gcp_project_id}-model-artifacts"
  location = var.region

  uniform_bucket_level_access = true
  force_destroy               = false

  versioning {
    enabled = true
  }

  lifecycle_rule {
    condition {
      age = 180
    }
    action {
      type          = "SetStorageClass"
      storage_class = "NEARLINE"
    }
  }

  labels = {
    environment = var.environment
    managed_by  = "terraform"
    purpose     = "model-artifacts"
    sovereignty = "gcp-native"
  }
}

# ------------------------------------------------------------------------------
# 6. GCS Bucket — Context Cache Storage
# ------------------------------------------------------------------------------
resource "google_storage_bucket" "context_cache" {
  name     = "${var.gcp_project_id}-context-cache"
  location = var.region

  uniform_bucket_level_access = true

  lifecycle_rule {
    condition {
      age = 7
    }
    action {
      type = "Delete"
    }
  }

  labels = {
    environment = var.environment
    managed_by  = "terraform"
    purpose     = "context-caching"
    sovereignty = "gcp-native"
  }
}

# ------------------------------------------------------------------------------
# 7. Outputs
# ------------------------------------------------------------------------------
output "gemini_endpoint_id" {
  description = "Vertex AI Gemini endpoint ID"
  value       = google_vertex_ai_endpoint.gemini_endpoint.id
}

output "tensorboard_name" {
  description = "Vertex AI Tensorboard name for experiment tracking"
  value       = var.vertex_ai_tensorboard_enabled ? google_vertex_ai_tensorboard.experiments[0].name : "disabled"
}

output "feature_online_store_name" {
  description = "Vertex AI Feature Online Store name"
  value       = google_vertex_ai_feature_online_store.embedding_store.name
}

output "eval_dataset_id" {
  description = "Vertex AI evaluation dataset ID"
  value       = google_vertex_ai_dataset.eval_dataset.id
}

output "model_artifacts_bucket" {
  description = "GCS bucket for model artifacts"
  value       = google_storage_bucket.model_artifacts.name
}

output "context_cache_bucket" {
  description = "GCS bucket for Gemini context caching"
  value       = google_storage_bucket.context_cache.name
}
