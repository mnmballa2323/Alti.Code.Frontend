terraform {
  required_version = ">= 1.5.0"
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
  }
}

provider "google" {
  project = var.project_id
  region  = var.region
}

variable "project_id" {
  type        = string
  description = "The ID of the GCP Project"
}

variable "region" {
  type        = string
  default     = "us-central1"
  description = "The primary GCP region for resources"
}

# Private VPC Network for Secure DB/Cache Routing
resource "google_compute_network" "private_network" {
  name                    = "inso-production-vpc"
  auto_create_subnetworks = true
}

# Reserve Private IP Range for Google Private Service Access (Cloud SQL/Memorystore)
resource "google_compute_global_address" "private_ip_address" {
  name          = "private-ip-address"
  purpose       = "VPC_PEERING"
  address_type  = "INTERNAL"
  prefix_length = 16
  network       = google_compute_network.private_network.id
}

# Establish Private Connection (VPC Peering)
resource "google_service_networking_connection" "private_vpc_connection" {
  network                 = google_compute_network.private_network.id
  service                 = "servicenetworking.googleapis.com"
  reserved_peering_ranges = [google_compute_global_address.private_ip_address.name]
}

# Private VPC Access Connector for Serverless Google Cloud Run
resource "google_vpc_access_connector" "vpc_connector" {
  name          = "inso-vpc-conn"
  region        = var.region
  ip_cidr_range = "10.8.0.0/28"
  network       = google_compute_network.private_network.name
}
