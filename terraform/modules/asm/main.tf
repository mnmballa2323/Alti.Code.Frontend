# -------------------------------------------------------------
# Anthos Service Mesh (Managed Istio)
# -------------------------------------------------------------

resource "google_gke_hub_feature" "servicemesh" {
  name     = "servicemesh"
  location = "global"
  project  = var.project_id
}

resource "google_gke_hub_feature_membership" "servicemesh_membership" {
  location = "global"
  feature  = google_gke_hub_feature.servicemesh.name
  membership = var.gke_hub_membership_id
  
  mesh {
    management = "MANAGEMENT_AUTOMATIC"
  }
}

# -------------------------------------------------------------
# Variables and Outputs
# -------------------------------------------------------------

variable "project_id" {
  type = string
}

variable "gke_hub_membership_id" {
  description = "The GKE Hub Membership ID of the cluster"
  type        = string
}

output "mesh_id" {
  value = google_gke_hub_feature_membership.servicemesh_membership.id
}
