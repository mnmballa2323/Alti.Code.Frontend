# ==============================================================================
# ALTI CODE STUDIO: AI-Layer Submodule Variables & Provider Configuration
# ==============================================================================
# This file defines the provider configuration and all input variables required
# by the ai-layer submodule (agent-builder.tf, genai.tf, vertex.tf).
# ==============================================================================

terraform {
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
  }
}

provider "google" {
  project = var.gcp_project_id
  region  = var.region
}

# ------------------------------------------------------------------------------
# Core Project Variables
# ------------------------------------------------------------------------------

variable "gcp_project_id" {
  description = "The target Google Cloud Project ID — required, no default"
  type        = string

  validation {
    condition     = can(regex("^[a-z][a-z0-9-]{4,28}[a-z0-9]$", var.gcp_project_id))
    error_message = "gcp_project_id must be a valid GCP project ID (6-30 chars, lowercase, hyphens allowed, must start with a letter)."
  }
}

variable "region" {
  description = "The primary GCP region for AI-layer resources"
  type        = string
  default     = "us-central1"
}

variable "environment" {
  description = "Deployment environment (prod, staging, dev)"
  type        = string
  default     = "prod"

  validation {
    condition     = contains(["prod", "staging", "dev"], var.environment)
    error_message = "environment must be one of: prod, staging, dev."
  }
}

variable "deployment_tier" {
  description = "The AI infrastructure deployment tier"
  type        = string
  default     = "multi-tenant"

  validation {
    condition     = contains(["multi-tenant", "single-tenant", "fedramp"], var.deployment_tier)
    error_message = "deployment_tier must be one of: multi-tenant, single-tenant, fedramp."
  }
}

# ------------------------------------------------------------------------------
# Vertex AI Search & Discovery Engine
# ------------------------------------------------------------------------------

variable "vertex_ai_search_datastore_id" {
  description = "Discovery Engine data store ID for code search RAG"
  type        = string
  default     = "alti-code-search"

  validation {
    condition     = can(regex("^[a-z][a-z0-9-]{0,62}$", var.vertex_ai_search_datastore_id))
    error_message = "vertex_ai_search_datastore_id must be a valid Discovery Engine data store ID."
  }
}

# ------------------------------------------------------------------------------
# Vertex AI Experiment Tracking
# ------------------------------------------------------------------------------

variable "vertex_ai_tensorboard_enabled" {
  description = "Enable Vertex AI Tensorboard for experiment tracking and model evaluation"
  type        = bool
  default     = true
}

# ------------------------------------------------------------------------------
# Vertex AI Feature Online Store (Bigtable-backed)
# ------------------------------------------------------------------------------

variable "vertex_ai_feature_store_min_nodes" {
  description = "Minimum Bigtable nodes for Feature Online Store auto-scaling"
  type        = number
  default     = 1

  validation {
    condition     = var.vertex_ai_feature_store_min_nodes >= 1
    error_message = "vertex_ai_feature_store_min_nodes must be at least 1."
  }
}

variable "vertex_ai_feature_store_max_nodes" {
  description = "Maximum Bigtable nodes for Feature Online Store auto-scaling"
  type        = number
  default     = 3

  validation {
    condition     = var.vertex_ai_feature_store_max_nodes >= 1
    error_message = "vertex_ai_feature_store_max_nodes must be at least 1."
  }
}


