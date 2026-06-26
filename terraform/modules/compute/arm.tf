# ==============================================================================
# ALTI CODE STUDIO: GCP ARM64 VM Provisioning Module
# ==============================================================================

terraform {
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
  }
}

resource "google_compute_instance" "arm_node" {
  name         = "alti-arm-node-${var.environment}"
  machine_type = "t2a-standard-4" # GCP ARM64 machine type (Ampere Altra)
  zone         = var.zone

  boot_disk {
    initialize_params {
      image = "ubuntu-os-cloud/ubuntu-2204-lts-arm64"
      size  = 128
      type  = "pd-ssd"
    }
  }

  network_interface {
    subnetwork = var.subnet_id
    access_config {}
  }

  metadata = {
    ssh-keys = "${var.admin_username}:${file(var.ssh_public_key_path)}"
  }

  service_account {
    scopes = ["cloud-platform"]
  }

  labels = {
    architecture = "arm64"
    environment  = var.environment
  }
}

# ------------------------------------------------------------------------------
# Variables
# ------------------------------------------------------------------------------
variable "environment" { type = string }
variable "zone" {
  type    = string
  default = "us-central1-a"
}
variable "location" {
  type    = string
  default = ""
}
variable "resource_group_name" {
  type    = string
  default = ""
}
variable "subnet_id" { type = string }
variable "admin_username" { type = string }
variable "ssh_public_key_path" { type = string }

# ------------------------------------------------------------------------------
# Outputs
# ------------------------------------------------------------------------------
output "arm_vm_id" {
  value = google_compute_instance.arm_node.id
}
