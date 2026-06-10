# Generated Terraform configuration for stack: gcp-isolated

provider "google" {
  project = var.project_id
  region  = "us-central1"
}

variable "project_id" {
  description = "The GCP Project ID."
  type        = string
}

resource "google_compute_network" "vpc_network" {
  name = "gcp-isolated-vpc"
  auto_create_subnetworks = false
}

resource "google_compute_subnetwork" "subnet" {
  name          = "gcp-isolated-subnet"
  ip_cidr_range = "10.0.1.0/24"
  region        = "us-central1"
  network       = google_compute_network.vpc_network.id
}