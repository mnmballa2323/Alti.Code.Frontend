# GCP Single-Tenant Network Boundary
resource "google_compute_network" "tenant_vpc" {
  name                    = "vpc-tenant-${var.tenant_id}"
  auto_create_subnetworks = false
}

resource "google_compute_subnetwork" "tenant_subnet" {
  name          = "subnet-tenant-${var.tenant_id}"
  ip_cidr_range = "10.0.1.0/24"
  region        = "us-central1"
  network       = google_compute_network.tenant_vpc.id
  private_ip_google_access = true
}
