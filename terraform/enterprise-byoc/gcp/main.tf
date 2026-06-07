terraform {
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
  }
}

# Provider points to the physical GDC Hosted rack API endpoint
provider "google" {
  project = var.gcp_project_id
  region  = var.gcp_region
  api_endpoint = "https://compute.${var.gdc_hosted_domain}/"
}

variable "gcp_project_id" {
  description = "The GCP Project ID mapped to the local GDC hardware."
  type        = string
}

variable "gcp_region" {
  description = "The logical region name for the disconnected rack."
  type        = string
  default     = "bunker-central1"
}

variable "customer_name" {
  description = "The name of the Enterprise customer."
  type        = string
}

variable "gdc_hosted_domain" {
  description = "The localized domain of the Google Distributed Cloud Hosted rack."
  type        = string
}

# ==========================================
# Titan Security Chips (Hardware Root of Trust)
# ==========================================
# Enforces that nodes boot utilizing the physical Titan chips embedded in the GDC Hosted hardware.
resource "google_compute_project_metadata" "titan_enforcement" {
  project = var.gcp_project_id
  metadata = {
    "enable-oslogin" = "TRUE"
    "require-shielded-vm" = "TRUE"
    "require-titan-root-of-trust" = "TRUE"
  }
}

# ==========================================
# Disconnected Air-Gapped VPC
# ==========================================
resource "google_compute_network" "vpc_network" {
  name                    = "alti-disconnected-vpc-${var.customer_name}"
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
# Google Distributed Cloud Hosted (GDC) GKE Cluster
# ==========================================
resource "google_container_cluster" "gdc_gke" {
  name     = "alti-data-plane-${var.customer_name}"
  location = var.gcp_region

  network    = google_compute_network.vpc_network.id
  subnetwork = google_compute_subnetwork.subnet.id
  
  # Ensure the cluster boots using Shielded Nodes backed by Titan chips
  enable_shielded_nodes = true

  binary_authorization {
    evaluation_mode = "PROJECT_SINGLETON_POLICY_ENFORCE"
  }
  
  private_cluster_config {
    enable_private_nodes    = true
    enable_private_endpoint = true # Absolute isolation: No public IP for the control plane
    master_ipv4_cidr_block  = "172.16.0.0/28"
  }

  node_pool {
    name = "gdc-inference-pool"
    node_config {
      machine_type = "n2-standard-16"
      
      shielded_instance_config {
        enable_secure_boot          = true
        enable_vtpm                 = true
        enable_integrity_monitoring = true
      }
    }
  }
}

# ==========================================
# Offline Binary Authorization (Cryptographic Enforcement)
# ==========================================
# Running entirely locally, enforcing signatures without contacting public Google endpoints.
resource "google_binary_authorization_policy" "policy" {
  global_policy_evaluation_mode = "ENABLE"
  default_admission_rule {
    evaluation_mode  = "REQUIRE_ATTESTATION"
    enforcement_mode = "ENFORCED_BLOCK_AND_AUDIT_LOG"
    require_attestations_by = [
      google_binary_authorization_attestor.alti_attestor.name
    ]
  }
}

resource "google_binary_authorization_attestor" "alti_attestor" {
  name = "alti-control-plane-attestor"
  attestation_authority_note {
    note_reference = "projects/${var.gcp_project_id}/notes/alti-attestor-note"
    public_keys {
      ascii_armored_pgp_public_key = var.alti_pgp_public_key
    }
  }
}

variable "alti_pgp_public_key" {
  description = "The PGP public key from the Liberty Center One Control Plane used to sign verified containers."
  type        = string
}
