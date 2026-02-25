# -------------------------------------------------------------
# Multi-Region GKE Autopilot Fleet
# -------------------------------------------------------------

resource "google_container_cluster" "primary" {
  for_each = var.regions

  name     = "alti-gke-${var.environment}-${each.key}"
  location = each.value

  # Enable Autopilot
  enable_autopilot = true

  # Networking
  network    = var.network_id
  subnetwork = var.subnetwork_ids[each.key]

  private_cluster_config {
    enable_private_nodes    = true
    enable_private_endpoint = false
    master_ipv4_cidr_block  = cidrsubnet("172.16.0.0/28", 4, index(keys(var.regions), each.key))
  }

  release_channel {
    channel = "REGULAR"
  }

  ip_allocation_policy {
    cluster_ipv4_cidr_block  = ""
    services_ipv4_cidr_block = ""
  }

  # Register with Anthos / GKE Hub for Multi-Cluster Ingress
  fleet {
    project = var.project_id
  }
}

# -------------------------------------------------------------
# Variables
# -------------------------------------------------------------

variable "project_id" {
  type = string
}

variable "environment" {
  type = string
}

variable "network_id" {
  type        = string
  description = "The VPC network ID."
}

variable "regions" {
  type        = map(string)
  description = "A map of logical region names to actual GCP regions (e.g., { primary = 'us-central1', eu = 'europe-west1' })"
}

variable "subnetwork_ids" {
  type        = map(string)
  description = "A map of logical region names to their corresponding subnetwork self_links"
}

# -------------------------------------------------------------
# Outputs
# -------------------------------------------------------------

output "cluster_endpoints" {
  description = "Map of region names to their cluster endpoints"
  value = {
    for k, v in google_container_cluster.primary : k => v.endpoint
  }
}
