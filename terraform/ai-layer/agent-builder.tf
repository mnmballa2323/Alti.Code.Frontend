# ==============================================================================
# ALTI CODE STUDIO: Vertex AI Agent Builder & Discovery Engine
# RAG-powered code search, agent orchestration, and knowledge datastores.
# ==============================================================================

# ------------------------------------------------------------------------------
# 1. Discovery Engine Data Store — Code Search Corpus
# ------------------------------------------------------------------------------
resource "google_discovery_engine_data_store" "code_search" {
  location                    = "global"
  data_store_id               = var.vertex_ai_search_datastore_id
  display_name                = "Alti Code Studio - Code Search Corpus"
  industry_vertical           = "GENERIC"
  content_config              = "CONTENT_REQUIRED"
  solution_types              = ["SOLUTION_TYPE_SEARCH"]

  document_processing_config {
    default_parsing_config {
      digital_parsing_config {}
    }
  }
}

# ------------------------------------------------------------------------------
# 2. Discovery Engine Search Engine — Code Search with LLM Enhancement
# ------------------------------------------------------------------------------
resource "google_discovery_engine_search_engine" "code_engine" {
  engine_id     = "alti-code-engine"
  collection_id = "default_collection"
  location      = google_discovery_engine_data_store.code_search.location
  display_name  = "Alti Code Studio - Code Search Engine"
  data_store_ids = [google_discovery_engine_data_store.code_search.data_store_id]

  search_engine_config {
    search_tier    = "SEARCH_TIER_ENTERPRISE"
    search_add_ons = ["SEARCH_ADD_ON_LLM"]
  }
}

# ------------------------------------------------------------------------------
# 3. GCS Bucket for Agent Builder Data Ingestion
# ------------------------------------------------------------------------------
resource "google_storage_bucket" "agent_builder_data" {
  name     = "${var.gcp_project_id}-agent-builder-data"
  location = var.region

  uniform_bucket_level_access = true
  force_destroy               = false

  versioning {
    enabled = true
  }

  lifecycle_rule {
    condition {
      age = 90
    }
    action {
      type          = "SetStorageClass"
      storage_class = "NEARLINE"
    }
  }

  lifecycle_rule {
    condition {
      age = 365
    }
    action {
      type          = "SetStorageClass"
      storage_class = "COLDLINE"
    }
  }

  labels = {
    environment = var.environment
    managed_by  = "terraform"
    purpose     = "agent-builder-ingestion"
    sovereignty = "gcp-native"
  }
}

# ------------------------------------------------------------------------------
# 4. Outputs
# ------------------------------------------------------------------------------
output "discovery_engine_datastore_id" {
  description = "Discovery Engine data store ID for code search"
  value       = google_discovery_engine_data_store.code_search.data_store_id
}

output "discovery_engine_engine_id" {
  description = "Discovery Engine search engine ID"
  value       = google_discovery_engine_search_engine.code_engine.engine_id
}

output "agent_builder_data_bucket" {
  description = "GCS bucket for Agent Builder data ingestion"
  value       = google_storage_bucket.agent_builder_data.name
}
