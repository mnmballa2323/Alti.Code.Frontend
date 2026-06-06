terraform {
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
  }
}

provider "google" {
  project = var.gcp_project_id
  region  = var.gcp_region
}

variable "gcp_project_id" {
  description = "The GCP Project ID to deploy the Alti Code Studio Data Plane."
  type        = string
}

variable "gcp_region" {
  description = "The GCP region."
  type        = string
  default     = "us-central1"
}

variable "customer_name" {
  description = "The name of the Enterprise customer."
  type        = string
}

# ==========================================
# God-Tier Hardware Cryptography (EKM)
# ==========================================
resource "google_kms_key_ring" "keyring" {
  name     = "alti-keyring-${var.customer_name}"
  location = var.gcp_region
}

resource "google_kms_crypto_key" "gke_ekm_key" {
  name            = "gke-ekm-key"
  key_ring        = google_kms_key_ring.keyring.id
  purpose         = "ENCRYPT_DECRYPT"
  
  # The actual master key is hosted outside Google (e.g. Liberty Center One)
  protection_level = "EXTERNAL"
}

# ==========================================
# Assured Workloads (IL4 / FedRAMP High Boundary)
# ==========================================
resource "google_assured_workloads_workload" "workload" {
  billing_account = var.gcp_billing_account
  compliance_regime = "IL4"
  display_name    = "alti-assured-workload"
  location        = var.gcp_region
  organization    = var.gcp_org_id

  kms_settings {
    next_rotation_time = "2027-01-01T00:00:00Z"
    rotation_period    = "7776000s"
  }
}

variable "gcp_billing_account" { type = string }
variable "gcp_org_id" { type = string }
variable "gcp_project_number" { type = string }

# ==========================================
# VPC & Subnets (Cloud NAT + Private Service Connect)
# ==========================================
resource "google_compute_network" "vpc_network" {
  name                    = "alti-vpc-${var.customer_name}"
  auto_create_subnetworks = false
}

resource "google_compute_subnetwork" "subnet" {
  name          = "alti-subnet"
  ip_cidr_range = "10.0.0.0/16"
  region        = var.gcp_region
  network       = google_compute_network.vpc_network.id
  private_ip_google_access = true
}

resource "google_compute_router" "router" {
  name    = "alti-router"
  region  = var.gcp_region
  network = google_compute_network.vpc_network.id
}

resource "google_compute_router_nat" "nat" {
  name                               = "alti-cloud-nat"
  router                             = google_compute_router.router.name
  region                             = var.gcp_region
  nat_ip_allocate_option             = "AUTO_ONLY"
  source_subnetwork_ip_ranges_to_nat = "ALL_SUBNETWORKS_ALL_IP_RANGES"
}

# ==========================================
# VPC Service Controls (Absolute Isolation Perimeter)
# ==========================================
resource "google_access_context_manager_access_policy" "policy" {
  parent = "organizations/${var.gcp_org_id}"
  title  = "Alti Code Studio Perimeter Policy"
}

resource "google_access_context_manager_service_perimeter" "secure_perimeter" {
  parent = "accessPolicies/${google_access_context_manager_access_policy.policy.name}"
  name   = "accessPolicies/${google_access_context_manager_access_policy.policy.name}/servicePerimeters/alti_perimeter"
  title  = "Alti Data Plane Perimeter"
  
  status {
    restricted_services = ["aiplatform.googleapis.com", "container.googleapis.com"]
    resources           = ["projects/${var.gcp_project_number}"]
    vpc_accessible_services {
      enable_restriction = true
      allowed_services   = ["RESTRICTED-SERVICES"]
    }
  }
}

# ==========================================
# Binary Authorization (Cryptographic Enforcement)
# ==========================================
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

# ==========================================
# Sole Tenant Nodes (Physical Hardware Isolation)
# ==========================================
resource "google_compute_node_template" "sole_tenant" {
  name      = "alti-sole-tenant-template"
  region    = var.gcp_region
  node_type = "n2-node-80-512"
}

resource "google_compute_node_group" "nodes" {
  name          = "alti-sole-tenant-group"
  zone          = "${var.gcp_region}-a"
  node_template = google_compute_node_template.sole_tenant.id
  size          = 1
}

# ==========================================
# Confidential Computing GKE (AMD SEV Memory Encryption)
# ==========================================
resource "google_container_cluster" "gke" {
  name     = "alti-data-plane-${var.customer_name}"
  location = var.gcp_region

  network    = google_compute_network.vpc_network.id
  subnetwork = google_compute_subnetwork.subnet.id
  
  # God-Tier: EKM Encryption
  database_encryption {
    state    = "ENCRYPTED"
    key_name = google_kms_crypto_key.gke_ekm_key.id
  }

  binary_authorization {
    evaluation_mode = "PROJECT_SINGLETON_POLICY_ENFORCE"
  }

  workload_identity_config {
    workload_pool = "${var.gcp_project_id}.svc.id.goog"
  }
  
  private_cluster_config {
    enable_private_nodes    = true
    enable_private_endpoint = false
    master_ipv4_cidr_block  = "172.16.0.0/28"
  }

  # God-Tier: AMD SEV Memory Encryption & Sole Tenant execution
  node_pool {
    name = "confidential-pool"
    node_config {
      machine_type = "n2d-standard-16"
      
      confidential_nodes {
        enabled = true
      }
      
      node_affinity {
        key      = "compute.googleapis.com/node-group-name"
        operator = "IN"
        values   = [google_compute_node_group.nodes.name]
      }
    }
  }
}
