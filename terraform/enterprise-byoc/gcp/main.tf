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

  workload_identity_config {
    workload_pool = "${var.gcp_project_id}.svc.id.goog"
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
