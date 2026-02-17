resource "google_compute_instance" "app_server" {
  name         = "alti-code-studio-backend-${var.environment}"
  machine_type = var.machine_type
  zone         = var.zone
  project      = var.project_id

  tags = ["http-server", "https-server"]

  boot_disk {
    initialize_params {
      image = "debian-cloud/debian-11"
    }
  }

  network_interface {
    network = "default"

    access_config {
      # Ephemeral public IP
    }
  }

  metadata_startup_script = <<-EOF
    #! /bin/bash
    echo "Installing Docker..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    
    echo "Starting Docker container..."
    # In a real scenario, this would pull from GCR (gcr.io/PROJECT_ID/image)
    docker run -d -p 80:5000 --name backend inso-backend:latest
  EOF
  
  metadata = {
    environment = var.environment
    managed_by  = "terraform"
  }
}

variable "project_id" {}
variable "environment" {}
variable "machine_type" {}
variable "zone" {}
