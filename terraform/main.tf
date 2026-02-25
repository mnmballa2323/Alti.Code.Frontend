terraform {
  required_version = ">= 1.5.0"
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
    mongodbatlas = {
      source  = "mongodb/mongodbatlas"
      version = "~> 1.10"
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

provider "mongodbatlas" {
  public_key  = var.atlas_public_key
  private_key = var.atlas_private_key
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
  atlas_project_id = var.atlas_project_id
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
    "MONGO_URI"                 = module.database.mongo_uri
    "MONGO_PASSWORD"            = module.database.mongo_password
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
# Outputs
# -------------------------------------------------------------
output "gke_cluster_endpoint" { value = module.gke.cluster_endpoint }
output "redis_host" { value = module.database.redis_host }
output "mongo_uri_base" { value = module.database.mongo_uri }
output "workload_identity_provider" { value = module.workload_identity.workload_identity_provider }
output "service_account_email" { value = module.workload_identity.service_account_email }
