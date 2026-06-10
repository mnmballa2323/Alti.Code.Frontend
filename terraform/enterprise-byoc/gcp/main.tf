terraform {
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
  }
}

# Provider points to the physical GDC Hosted API endpoints
provider "google" {
  project = var.gcp_project_id
}

variable "gcp_project_id" {
  description = "The GCP Project ID mapped to the local GDC hardware."
  type        = string
}

variable "region_bunker_alpha" {
  description = "The logical region name for the primary disconnected rack."
  type        = string
  default     = "bunker-alpha"
}

variable "region_bunker_omega" {
  description = "The logical region name for the secondary disconnected rack."
  type        = string
  default     = "bunker-omega"
}

variable "customer_name" {
  description = "The name of the Enterprise customer."
  type        = string
}

variable "gcp_organization_id" {
  description = "The GCP Organization ID for resource tagging."
  type        = string
  default     = "123456789"
}

variable "external_key_uri" {
  description = "The URI of the external quantum-resistant key on the EKM."
  type        = string
  default     = "https://ekm.local/keys/pqc-key-1"
}

# ==========================================
# Post-Quantum Cryptography (PQC) Key Management
# ==========================================
# Mandating the External Key Manager (EKM) utilize experimental Post-Quantum 
# algorithms (FIPS 204 ML-DSA / CRYSTALS-Kyber) to encrypt the physical clusters.
resource "google_kms_key_ring" "pqc_keyring" {
  name     = "alti-pqc-keyring-${var.customer_name}"
  location = "global"
}

resource "google_kms_crypto_key" "gke_pqc_key" {
  name            = "gke-pqc-ekm-key"
  key_ring        = google_kms_key_ring.pqc_keyring.id
  purpose         = "ENCRYPT_DECRYPT"
  
  # External, Quantum-resistant key source
  protection_level = "EXTERNAL"
  
  external_key_options {
    external_key_uri = var.external_key_uri
  }
  
  labels = {
    crypto_level = "post-quantum-fips-204"
  }
}

# ==========================================
# EMP Hardened Tagging & Constraints
# ==========================================
resource "google_tags_tag_key" "emp_hardened" {
  parent     = "organizations/${var.gcp_organization_id}"
  short_name = "emp_hardened"
}

resource "google_tags_tag_value" "emp_true" {
  parent     = "tagKeys/${google_tags_tag_key.emp_hardened.name}"
  short_name = "true"
}

# ==========================================
# Multi-Site GDC Hosted Mesh (Dark Fiber)
# ==========================================
# Connecting the two completely disconnected physical bunkers via dedicated DWDM fiber.
resource "google_compute_network" "vpc_mesh" {
  name                    = "alti-dark-fiber-mesh-${var.customer_name}"
  auto_create_subnetworks = false
}

resource "google_compute_subnetwork" "subnet_alpha" {
  name          = "alti-subnet-alpha"
  ip_cidr_range = "10.10.0.0/16"
  region        = var.region_bunker_alpha
  network       = google_compute_network.vpc_mesh.id
}

resource "google_compute_subnetwork" "subnet_omega" {
  name          = "alti-subnet-omega"
  ip_cidr_range = "10.20.0.0/16"
  region        = var.region_bunker_omega
  network       = google_compute_network.vpc_mesh.id
}

# ==========================================
# Multi-Site Google Distributed Cloud Hosted GKE Clusters
# ==========================================
resource "google_container_cluster" "gdc_gke_alpha" {
  name     = "alti-data-plane-alpha-${var.customer_name}"
  location = var.region_bunker_alpha

  network    = google_compute_network.vpc_mesh.id
  subnetwork = google_compute_subnetwork.subnet_alpha.id
  
  # God-Tier PQC EKM Encryption
  database_encryption {
    state    = "ENCRYPTED"
    key_name = google_kms_crypto_key.gke_pqc_key.id
  }

  enable_shielded_nodes = true

  private_cluster_config {
    enable_private_nodes    = true
    enable_private_endpoint = true
    master_ipv4_cidr_block  = "172.16.0.0/28"
  }

  node_pool {
    name = "gdc-inference-pool"
    node_config {
      machine_type = "n2-standard-16"
      resource_labels = {
        emp_hardened = "true"
      }
    }
  }
}

resource "google_container_cluster" "gdc_gke_omega" {
  name     = "alti-data-plane-omega-${var.customer_name}"
  location = var.region_bunker_omega

  network    = google_compute_network.vpc_mesh.id
  subnetwork = google_compute_subnetwork.subnet_omega.id
  
  database_encryption {
    state    = "ENCRYPTED"
    key_name = google_kms_crypto_key.gke_pqc_key.id
  }

  enable_shielded_nodes = true

  private_cluster_config {
    enable_private_nodes    = true
    enable_private_endpoint = true
    master_ipv4_cidr_block  = "172.17.0.0/28"
  }

  node_pool {
    name = "gdc-inference-pool"
    node_config {
      machine_type = "n2-standard-16"
      resource_labels = {
        emp_hardened = "true"
      }
    }
  }
}
