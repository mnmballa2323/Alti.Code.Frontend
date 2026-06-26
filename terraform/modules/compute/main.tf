# ==============================================================================
# ALTI CODE STUDIO: Standard GCP VM Provisioning Module
# ==============================================================================

terraform {
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
  }
}

resource "google_compute_instance" "node" {
  name         = "alti-node-${var.environment}"
  machine_type = var.vm_size
  zone         = var.zone

  boot_disk {
    initialize_params {
      image = "ubuntu-os-cloud/ubuntu-2204-lts"
      size  = 128
      type  = "pd-ssd"
    }
  }

  network_interface {
    subnetwork = var.subnet_id
    # Ephemeral public IP allocation (can be omitted if purely internal)
    access_config {}
  }

  metadata = {
    ssh-keys = "${var.admin_username}:${file(var.ssh_public_key_path)}"
  }

  service_account {
    scopes = ["cloud-platform"]
  }

  labels = {
    environment = var.environment
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
variable "resource_group_name" {
  type    = string
  default = ""
}
variable "location" {
  type    = string
  default = ""
}
variable "vm_size" { type = string }
variable "subnet_id" { type = string }
variable "admin_username" { type = string }
variable "ssh_public_key_path" { type = string }

# ------------------------------------------------------------------------------
# Outputs
# ------------------------------------------------------------------------------
output "vm_id" {
  value = google_compute_instance.node.id
}

output "vm_name" {
  value = google_compute_instance.node.name
}

output "private_ip" {
  value = google_compute_instance.node.network_interface[0].network_ip
}
