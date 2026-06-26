# ==============================================================================
# ALTI CODE STUDIO: GCP FPGA VM (Emulator) Provisioning Module
# ==============================================================================

terraform {
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
  }
}

resource "google_compute_instance" "fpga_node" {
  name         = "alti-fpga-node-${var.environment}"
  machine_type = "n2-standard-4" # Standard VM representing FPGA Emulator
  zone         = var.zone

  boot_disk {
    initialize_params {
      image = "ubuntu-os-cloud/ubuntu-2204-lts"
      size  = 250
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
    hardware    = "fpga-emulator"
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
output "fpga_vm_id" {
  value = google_compute_instance.fpga_node.id
}
