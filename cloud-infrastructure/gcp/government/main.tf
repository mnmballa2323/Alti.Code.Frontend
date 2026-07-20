provider "google" {
  project = "alti-code-studio-gov"
  region  = "us-central1"
}

# Assured Workloads configuration for FedRAMP High
resource "google_assured_workloads_workload" "gov_workload" {
  compliance_regime = "FEDRAMP_HIGH"
  display_name      = "alti-gov-workload-${var.environment}"
  location          = "us-central1"
  organization      = "123456789012"
}

resource "google_compute_instance" "app" {
  name         = "alti-code-studio-gov-${var.environment}"
  machine_type = "e2-standard-4"
  zone         = "us-central1-a"

  boot_disk {
    initialize_params {
      image = "debian-cloud/debian-11"
    }
  }

  network_interface {
    network = "default"
    access_config {}
  }

  metadata_startup_script = <<-EOF
    #!/bin/bash
    apt-get update
    apt-get install -y docker.io
    docker run -d -p 80:3000 \
      -e KEYCLOAK_ISSUER="${var.lco_keycloak_issuer}" \
      -e KEYCLOAK_CLIENT_ID="${var.lco_keycloak_client_id}" \
      -e KEYCLOAK_CLIENT_SECRET="${var.lco_keycloak_client_secret}" \
      -e LCO_BILLING_API="${var.lco_billing_api}" \
      ${var.docker_image}
  EOF
}\n