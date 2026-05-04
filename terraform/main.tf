terraform {
  required_version = ">= 1.5.0"
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.5"
    }
  }

  backend "gcs" {
    bucket = "alti-code-studio-tf-state-prod"
    prefix = "terraform/state"
  }
}

provider "google" {
  project = var.project_id
  region  = var.region
}

# -------------------------------------------------------------
# Google Cloud APIs
# -------------------------------------------------------------
resource "google_project_service" "vertex_ai_api" {
  project = var.project_id
  service = "aiplatform.googleapis.com"
  disable_on_destroy = false
}

resource "google_project_service" "gemini_api" {
  project = var.project_id
  service = "generativelanguage.googleapis.com"
  disable_on_destroy = false
}

resource "google_project_service" "cloud_ai_companion_api" {
  project = var.project_id
  service = "cloudaicompanion.googleapis.com"
  disable_on_destroy = false
}

# -------------------------------------------------------------
# Networking (VPC)
# -------------------------------------------------------------
module "network" {
  source  = "terraform-google-modules/network/google"
  version = "~> 9.0"

  project_id   = var.project_id
  network_name = "alti-vpc-${var.environment}"

  subnets = [
    {
      subnet_name   = "alti-subnet-${var.environment}"
      subnet_ip     = "10.0.0.0/16"
      subnet_region = var.region
    }
  ]
}

# -------------------------------------------------------------
# GKE Autopilot Cluster
# -------------------------------------------------------------
module "gke" {
  source = "./modules/gke"

  environment   = var.environment
  region        = var.region
  network_id    = module.network.network_name
  subnetwork_id = module.network.subnets["${var.region}/alti-subnet-${var.environment}"].name
}

# -------------------------------------------------------------
# Managed Databases
# -------------------------------------------------------------
module "database" {
  source = "./modules/database"

  environment      = var.environment
  region           = var.region
  network_id       = module.network.network_name
}

# -------------------------------------------------------------
# Secret Manager
# -------------------------------------------------------------
module "secrets" {
  source = "./modules/secrets"

  environment = var.environment
  secrets = {
    "STRIPE_SECRET_KEY"         = var.stripe_secret_key
    "STRIPE_WEBHOOK_SECRET_KEY" = var.stripe_webhook_secret_key
    "REDIS_URL"                 = "redis://default:${module.database.redis_auth_string}@${module.database.redis_host}:${module.database.redis_port}"
    "PENTAGI_DB_PASSWORD"       = module.database.pg_password
  }
}

# -------------------------------------------------------------
# Workload Identity Federation (GitHub Actions)
# -------------------------------------------------------------
module "workload_identity" {
  source = "./modules/workload_identity"

  project_id        = var.project_id
  github_repository = var.github_repository
}

# -------------------------------------------------------------
# Vertex AI Context Storage (Multimodal Inputs)
# -------------------------------------------------------------
resource "google_storage_bucket" "gemini_context" {
  name          = "alti-gemini-context-${var.environment}"
  location      = var.region
  force_destroy = true
  
  uniform_bucket_level_access = true
}

# -------------------------------------------------------------
# Agentic Swarm Event Bus (Pub/Sub)
# -------------------------------------------------------------
resource "google_pubsub_topic" "swarm_events" {
  name = "alti-swarm-events-${var.environment}"
}

# -------------------------------------------------------------
# Outputs
# -------------------------------------------------------------
output "gke_cluster_endpoint" { value = module.gke.cluster_endpoint }
output "redis_host" { value = module.database.redis_host }
output "workload_identity_provider" { value = module.workload_identity.workload_identity_provider }
output "service_account_email" { value = module.workload_identity.service_account_email }
output "gemini_context_bucket" { value = google_storage_bucket.gemini_context.name }
output "swarm_events_topic" { value = google_pubsub_topic.swarm_events.name }
