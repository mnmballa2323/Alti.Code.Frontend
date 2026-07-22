# GCP Single-Tenant Compute (GKE isolated boundary)
resource "google_container_cluster" "tenant_cluster" {
  name     = "gke-tenant-${var.tenant_id}"
  location = "us-central1"
  network  = google_compute_network.tenant_vpc.id
  subnetwork = google_compute_subnetwork.tenant_subnet.id

  remove_default_node_pool = true
  initial_node_count       = 1

  private_cluster_config {
    enable_private_nodes    = true
    enable_private_endpoint = false
    master_ipv4_cidr_block  = "172.16.0.0/28"
  }

  master_auth {
    client_certificate_config {
      issue_client_certificate = false
    }
  }

  resource_labels = {
    tenant = var.tenant_id
    tier   = "single-tenant"
  }
}

resource "google_container_node_pool" "tenant_nodes" {
  name       = "pool-tenant-${var.tenant_id}"
  location   = "us-central1"
  cluster    = google_container_cluster.tenant_cluster.name
  node_count = 1

  node_config {
    machine_type = "e2-standard-4"
    service_account = google_service_account.tenant_sa.email
    oauth_scopes = [
      "https://www.googleapis.com/auth/cloud-platform"
    ]
    labels = {
      tenant = var.tenant_id
      tier   = "single-tenant"
    }
  }
}

resource "google_service_account" "tenant_sa" {
  account_id   = "sa-tenant-${var.tenant_id}"
  display_name = "Service Account for Tenant ${var.tenant_id}"
}
