# ==============================================================================
# ALTI CODE STUDIO: GCP FPGA Cryptographic Accelerator Module
# ==============================================================================

terraform {
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
  }
}

resource "google_compute_instance" "fpga_crypto_accelerator" {
  name         = "alti-fpga-crypto-${var.environment}"
  machine_type = var.instance_type
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
    access_config {}
  }

  metadata = {
    ssh-keys = "${var.admin_username}:${file(var.ssh_public_key_path)}"
  }

  metadata_startup_script = <<-EOF
    #!/bin/bash
    echo "Initializing GCP Cryptographic Node..."
    mkdir -p /opt/crypto-fpga
    echo "GCP Cryptographic Node Ready." > /opt/crypto-fpga/status.txt
  EOF

  service_account {
    scopes = ["cloud-platform"]
  }

  labels = {
    name        = "np-crypto-accelerator"
    role        = "hardware-acceleration"
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
variable "instance_type" {
  type    = string
  default = "n2-standard-4"
}

# ------------------------------------------------------------------------------
# Outputs
# ------------------------------------------------------------------------------
output "fpga_instance_id" {
  value = google_compute_instance.fpga_crypto_accelerator.id
}

output "fpga_instance_private_ip" {
  value = google_compute_instance.fpga_crypto_accelerator.network_interface[0].network_ip
}
