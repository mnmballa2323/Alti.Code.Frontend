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
  region  = var.gcp_region
}

variable "gcp_project_id" {
  description = "The GCP Project ID to deploy the Alti Code Studio Data Plane."
  type        = string
}

variable "gcp_region" {
  description = "The GCP region."
  type        = string
  default     = "us-central1"
}

variable "customer_name" {
  description = "The name of the Enterprise customer."
  type        = string
}

# ==========================================
# Enterprise Security (KMS & Cloud Armor)
# ==========================================
resource "google_kms_key_ring" "keyring" {
  name     = "alti-keyring-${var.customer_name}"
  location = var.gcp_region
}

resource "google_kms_crypto_key" "gke_key" {
  name            = "gke-encryption-key"
  key_ring        = google_kms_key_ring.keyring.id
  rotation_period = "7776000s" # 90 days
}

resource "google_compute_security_policy" "cloud_armor" {
  name        = "alti-edge-security-policy"
  description = "Cloud Armor WAF for Alti Code Studio API"

  rule {
    action   = "allow"
    priority = "2147483647"
    match {
      versioned_expr = "SRC_IPS_V1"
      config {
        src_ip_ranges = ["*"]
      }
    }
    description = "default rule"
  }
}

# ==========================================
# VPC & Subnets (Zero-Trust)
# ==========================================
resource "google_compute_network" "vpc_network" {
  name                    = "alti-vpc-${var.customer_name}"
  auto_create_subnetworks = false
}

resource "google_compute_subnetwork" "subnet" {
  name          = "alti-subnet"
  ip_cidr_range = "10.0.0.0/16"
  region        = var.gcp_region
  network       = google_compute_network.vpc_network.id
  
  private_ip_google_access = true
}

# ==========================================
# VPC Service Controls (Absolute Isolation Perimeter)
# ==========================================
resource "google_access_context_manager_access_policy" "policy" {
  parent = "organizations/${var.gcp_org_id}"
  title  = "Alti Code Studio Perimeter Policy"
}

resource "google_access_context_manager_service_perimeter" "secure_perimeter" {
  parent = "accessPolicies/${google_access_context_manager_access_policy.policy.name}"
  name   = "accessPolicies/${google_access_context_manager_access_policy.policy.name}/servicePerimeters/alti_perimeter"
  title  = "Alti Data Plane Perimeter"
  
  status {
    restricted_services = ["aiplatform.googleapis.com", "container.googleapis.com"]
    
    resources = ["projects/${var.gcp_project_number}"]
    
    vpc_accessible_services {
      enable_restriction = true
      allowed_services   = ["RESTRICTED-SERVICES"]
    }
  }
}

variable "gcp_org_id" {
  type = string
}
variable "gcp_project_number" {
  type = string
}

# ==========================================
# GKE Autopilot Cluster (Customer Data Plane)
# ==========================================
resource "google_container_cluster" "gke" {
  name     = "alti-data-plane-${var.customer_name}"
  location = var.gcp_region

  enable_autopilot = true
  network          = google_compute_network.vpc_network.id
  subnetwork       = google_compute_subnetwork.subnet.id
  
  database_encryption {
    state    = "ENCRYPTED"
    key_name = google_kms_crypto_key.gke_key.id
  }

  workload_identity_config {
    workload_pool = "${var.gcp_project_id}.svc.id.goog"
  }
  
  private_cluster_config {
    enable_private_nodes    = true
    enable_private_endpoint = false
    master_ipv4_cidr_block  = "172.16.0.0/28"
  }
}

# ==========================================
# Workload Identity for Vertex AI Access
# ==========================================
resource "google_service_account" "vertex_sa" {
  account_id   = "alti-vertex-sa"
  display_name = "Alti Backend GCP Vertex Service Account"
}

resource "google_project_iam_member" "vertex_user" {
  project = var.gcp_project_id
  role    = "roles/aiplatform.user"
  member  = "serviceAccount:${google_service_account.vertex_sa.email}"
}

resource "google_service_account_iam_member" "workload_identity_binding" {
  service_account_id = google_service_account.vertex_sa.name
  role               = "roles/iam.workloadIdentityUser"
  member             = "serviceAccount:${var.gcp_project_id}.svc.id.goog[default/alti-backend-gcp]"
}
