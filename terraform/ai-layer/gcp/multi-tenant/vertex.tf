# ==============================================================================
# ALTI CODE STUDIO: Vertex AI Vector Search (AI Layer)
# ==============================================================================
#
# HARD LAW COMPLIANCE: All model inference runs exclusively on Google Cloud
# Vertex AI. No other inference providers are permitted. See GEMINI.md.
# ==============================================================================

terraform {
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
  }
}

locals {
  is_gcp_single_tenant = var.deployment_tier == "single-tenant"
  is_gcp_fedramp       = var.deployment_tier == "fedramp"
  gcp_sovereignty      = local.is_gcp_fedramp ? "assured-workloads" : "commercial"
}

# Inherit provider configuration from root module
variable "gcp_project_id" {
  type        = string
  description = "The target Google Cloud Project ID"
}

variable "region" {
  type        = string
  default     = "us-central1"
  description = "The primary GCP region for Vertex AI resources"
}

variable "environment" {
  type        = string
  default     = "prod"
  description = "Deployment environment"
}

variable "vertex_ai_dimensions" {
  type        = number
  default     = 768
  description = "Embedding dimension size for the vector search index (768 for text-embedding-005)"
}

variable "vertex_ai_shard_size" {
  type        = string
  default     = "SHARD_SIZE_MEDIUM"
  description = "Shard size for the vector index (SHARD_SIZE_SMALL, SHARD_SIZE_MEDIUM, SHARD_SIZE_LARGE)"

  validation {
    condition     = contains(["SHARD_SIZE_SMALL", "SHARD_SIZE_MEDIUM", "SHARD_SIZE_LARGE"], var.vertex_ai_shard_size)
    error_message = "vertex_ai_shard_size must be one of: SHARD_SIZE_SMALL, SHARD_SIZE_MEDIUM, SHARD_SIZE_LARGE"
  }
}

variable "vertex_ai_distance_measure" {
  type        = string
  default     = "DOT_PRODUCT_DISTANCE"
  description = "Distance measure for nearest neighbor search"

  validation {
    condition     = contains(["DOT_PRODUCT_DISTANCE", "COSINE_DISTANCE", "SQUARED_L2_DISTANCE"], var.vertex_ai_distance_measure)
    error_message = "vertex_ai_distance_measure must be one of: DOT_PRODUCT_DISTANCE, COSINE_DISTANCE, SQUARED_L2_DISTANCE"
  }
}

# ------------------------------------------------------------------------------
# 1. Vertex AI Vector Search Index
# ------------------------------------------------------------------------------
resource "google_vertex_ai_index" "code_embeddings" {
  region       = var.region
  display_name = "alti-code-embeddings-index"
  description  = "Vector search index for code intelligence, semantic search, and RAG workflows"

  metadata {
    contents_delta_uri = "gs://${var.gcp_project_id}-vertex-ai-data/embeddings"

    config {
      dimensions                  = var.vertex_ai_dimensions
      approximate_neighbors_count = 150
      shard_size                  = var.vertex_ai_shard_size
      distance_measure_type       = var.vertex_ai_distance_measure

      algorithm_config {
        tree_ah_config {
          leaf_node_embedding_count    = 1000
          leaf_nodes_to_search_percent = 10
        }
      }
    }
  }

  index_update_method = "STREAM_UPDATE" # Enable real-time index updates

  labels = {
    environment = var.environment
    sovereignty = local.gcp_sovereignty
    managed_by  = "terraform"
    component   = "ai-layer"
    tenant_mode = var.deployment_tier
  }
}

# ------------------------------------------------------------------------------
# 2. Vertex AI Index Endpoint (Serving Infrastructure)
# ------------------------------------------------------------------------------
resource "google_vertex_ai_index_endpoint" "code_search" {
  display_name = "alti-code-search-endpoint"
  description  = "Serving endpoint for code intelligence vector search queries"
  region       = var.region
  network      = "projects/${var.gcp_project_id}/global/networks/inso-production-vpc"

  labels = {
    environment = var.environment
    sovereignty = local.gcp_sovereignty
    managed_by  = "terraform"
    component   = "ai-layer"
    tenant_mode = var.deployment_tier
  }
}

# ------------------------------------------------------------------------------
# 3. GCS Bucket for Vertex AI Data (Embeddings, Model Artifacts)
# ------------------------------------------------------------------------------
resource "google_storage_bucket" "vertex_ai_data" {
  name     = "${var.gcp_project_id}-vertex-ai-data"
  location = var.region

  uniform_bucket_level_access = true
  force_destroy               = false

  versioning {
    enabled = true
  }

  lifecycle_rule {
    condition {
      age = 90 # Clean up old embedding versions after 90 days
    }
    action {
      type = "Delete"
    }
  }

  labels = {
    environment = var.environment
    managed_by  = "terraform"
    component   = "ai-layer"
  }
}

# ------------------------------------------------------------------------------
# 4. Outputs
# ------------------------------------------------------------------------------
output "vertex_ai_index_id" {
  value       = google_vertex_ai_index.code_embeddings.id
  description = "The resource ID of the Vertex AI vector search index"
}

output "vertex_ai_index_name" {
  value       = google_vertex_ai_index.code_embeddings.name
  description = "The full resource name of the Vertex AI vector search index"
}

output "vertex_ai_endpoint_id" {
  value       = google_vertex_ai_index_endpoint.code_search.id
  description = "The resource ID of the Vertex AI index endpoint"
}

output "vertex_ai_endpoint_name" {
  value       = google_vertex_ai_index_endpoint.code_search.name
  description = "The full resource name of the Vertex AI index endpoint"
}

output "vertex_ai_data_bucket" {
  value       = google_storage_bucket.vertex_ai_data.name
  description = "The GCS bucket for Vertex AI embeddings and model data"
}
