# Subnets for the commercial and government VMs
resource "google_compute_subnetwork" "commercial_subnet" {
  count         = var.enable_gcp_cloud || var.enable_gcp_dedicated ? 1 : 0
  name          = "inso-commercial-subnet"
  ip_cidr_range = "10.0.1.0/24"
  region        = var.gcp_region_commercial
  network       = google_compute_network.private_network.id
}

resource "google_compute_subnetwork" "government_subnet" {
  count         = var.enable_gcp_government ? 1 : 0
  name          = "inso-government-subnet"
  ip_cidr_range = "10.0.2.0/24"
  region        = var.gcp_region_government
  network       = google_compute_network.private_network.id
}
