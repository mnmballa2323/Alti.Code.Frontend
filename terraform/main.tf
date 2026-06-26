# ==============================================================================
# ALTI CODE STUDIO: GCP Sovereign Cloud Networks & Resource Management
# ==============================================================================

terraform {
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
    google-beta = {
      source  = "hashicorp/google-beta"
      version = "~> 5.0"
    }
  }

  # ----------------------------------------------------------------------------
  # Remote State Configuration (Google Cloud Storage Backend)
  # ----------------------------------------------------------------------------
  # backend "gcs" {
  #   bucket  = "alti-tfstate-bucket"
  #   prefix  = "terraform/state"
  # }
}

provider "google" {
  project = var.gcp_project_id
}

provider "google-beta" {
  project = var.gcp_project_id
}

locals {
  deploy_commercial = var.enable_gcp_cloud || var.enable_gcp_dedicated
  commercial_vm_names = concat(
    var.enable_gcp_cloud ? [google_compute_instance.commercial_node[0].name] : [],
    var.enable_gcp_dedicated ? [google_compute_instance.dedicated_node[0].name] : []
  )
}

# ==============================================================================
# GCP Commercial Cloud Infrastructure
# ==============================================================================

resource "google_compute_network" "commercial_vpc" {
  count                   = local.deploy_commercial ? 1 : 0
  name                    = "alti-${var.customer_id}-commercial-vpc"
  auto_create_subnetworks = false
}

resource "google_compute_subnetwork" "commercial_subnet" {
  count         = local.deploy_commercial ? 1 : 0
  name          = "commercial-subnet"
  ip_cidr_range = "10.100.1.0/24"
  region        = var.gcp_region_commercial
  network       = google_compute_network.commercial_vpc[0].id
}

# Private IP Allocation and Service Connection for Cloud SQL Private Access
resource "google_compute_global_address" "private_ip_alloc" {
  count         = local.deploy_commercial ? 1 : 0
  name          = "private-ip-alloc"
  purpose       = "VPC_PEERING"
  address_type  = "INTERNAL"
  prefix_length = 16
  network       = google_compute_network.commercial_vpc[0].id
}

resource "google_service_networking_connection" "private_vpc_connection" {
  count                   = local.deploy_commercial ? 1 : 0
  network                 = google_compute_network.commercial_vpc[0].id
  service                 = "servicenetworking.googleapis.com"
  reserved_peering_ranges = [google_compute_global_address.private_ip_alloc[0].name]
}

# Firewall Rules for Inbound Ingress
resource "google_compute_firewall" "commercial_firewall_rules" {
  count   = local.deploy_commercial ? 1 : 0
  name    = "alti-${var.customer_id}-commercial-fw"
  network = google_compute_network.commercial_vpc[0].name

  allow {
    protocol = "tcp"
    ports    = ["22"] # SSH Inbound
  }

  allow {
    protocol = "tcp"
    ports    = ["80", "443"] # HTTP/HTTPS Inbound
  }

  source_ranges = [var.admin_source_ip_range]
}

# ==============================================================================
# GCP Government Cloud Infrastructure
# ==============================================================================

resource "google_compute_network" "government_vpc" {
  count                   = var.enable_gcp_government ? 1 : 0
  name                    = "alti-${var.customer_id}-government-vpc"
  auto_create_subnetworks = false
}

resource "google_compute_subnetwork" "government_subnet" {
  count         = var.enable_gcp_government ? 1 : 0
  name          = "government-subnet"
  ip_cidr_range = "10.200.1.0/24"
  region        = var.gcp_region_government
  network       = google_compute_network.government_vpc[0].id
}

resource "google_compute_global_address" "gov_private_ip_alloc" {
  count         = var.enable_gcp_government ? 1 : 0
  name          = "gov-private-ip-alloc"
  purpose       = "VPC_PEERING"
  address_type  = "INTERNAL"
  prefix_length = 16
  network       = google_compute_network.government_vpc[0].id
}

resource "google_service_networking_connection" "gov_private_vpc_connection" {
  count                   = var.enable_gcp_government ? 1 : 0
  network                 = google_compute_network.government_vpc[0].id
  service                 = "servicenetworking.googleapis.com"
  reserved_peering_ranges = [google_compute_global_address.gov_private_ip_alloc[0].name]
}

resource "google_compute_firewall" "government_firewall_rules" {
  count   = var.enable_gcp_government ? 1 : 0
  name    = "alti-${var.customer_id}-government-fw"
  network = google_compute_network.government_vpc[0].name

  # Deny public access, allow internal network VM connectivity only
  allow {
    protocol = "tcp"
    ports    = ["22"]
  }

  source_ranges = ["10.200.0.0/16"]
}

# ==============================================================================
# Commercial Sovereign Services Module Instantiations
# ==============================================================================

module "secrets_commercial" {
  count       = local.deploy_commercial ? 1 : 0
  source      = "./modules/secrets"
  customer_id = var.customer_id
  environment = var.environment
  secrets = {
    "pg-admin-password" = var.pg_admin_password
  }
}

module "database_commercial" {
  count          = local.deploy_commercial ? 1 : 0
  source         = "./modules/database"
  customer_id    = var.customer_id
  environment    = var.environment
  region         = var.gcp_region_commercial
  network_id     = google_compute_network.commercial_vpc[0].id
  admin_username = var.pg_admin_username
  admin_password = var.pg_admin_password
  db_tier        = var.pg_db_tier
  redis_tier     = var.redis_tier
  redis_size     = var.redis_memory_size_gb
  
  depends_on = [
    google_service_networking_connection.private_vpc_connection
  ]
}

module "observability_commercial" {
  count               = local.deploy_commercial ? 1 : 0
  source              = "./modules/observability"
  customer_id         = var.customer_id
  environment         = var.environment
  region              = var.gcp_region_commercial
  target_resource_ids = local.commercial_vm_names
}

# ==============================================================================
# Government Sovereign Services Module Instantiations
# ==============================================================================

module "secrets_government" {
  count       = var.enable_gcp_government ? 1 : 0
  source      = "./modules/secrets"
  customer_id = var.customer_id
  environment = var.environment
  secrets = {
    "pg-admin-password" = var.pg_admin_password
  }
}

module "database_government" {
  count          = var.enable_gcp_government ? 1 : 0
  source         = "./modules/database"
  customer_id    = var.customer_id
  environment    = var.environment
  region         = var.gcp_region_government
  network_id     = google_compute_network.government_vpc[0].id
  admin_username = var.pg_admin_username
  admin_password = var.pg_admin_password
  db_tier        = var.pg_db_tier
  redis_tier     = var.redis_tier
  redis_size     = var.redis_memory_size_gb
  
  depends_on = [
    google_service_networking_connection.gov_private_vpc_connection
  ]
}

module "observability_government" {
  count               = var.enable_gcp_government ? 1 : 0
  source              = "./modules/observability"
  customer_id         = var.customer_id
  environment         = var.environment
  region              = var.gcp_region_government
  target_resource_ids = var.enable_gcp_government ? [google_compute_instance.government_node[0].name] : []
}

# ==============================================================================
# Advanced Sovereign Controls (FinOps and Workload Identity)
# ==============================================================================

module "finops_commercial" {
  count         = local.deploy_commercial ? 1 : 0
  source        = "./modules/finops"
  customer_id   = var.customer_id
  environment   = var.environment
  project_id    = var.gcp_project_id
  budget_amount = 3500
}

module "workload_identity_commercial" {
  count             = local.deploy_commercial ? 1 : 0
  source            = "./modules/workload_identity"
  customer_id       = var.customer_id
  environment       = var.environment
  github_repository = var.github_repository
}

module "finops_government" {
  count         = var.enable_gcp_government ? 1 : 0
  source        = "./modules/finops"
  customer_id   = var.customer_id
  environment   = var.environment
  project_id    = var.gcp_project_id
  budget_amount = 5000
}

module "workload_identity_government" {
  count             = var.enable_gcp_government ? 1 : 0
  source            = "./modules/workload_identity"
  customer_id       = var.customer_id
  environment       = var.environment
  github_repository = var.github_repository
}
