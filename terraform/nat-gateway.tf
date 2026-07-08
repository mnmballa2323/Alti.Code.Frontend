# ==============================================================================
# ALTI CODE STUDIO: Cloud NAT Gateway
# ==============================================================================
# NAT for private GKE/Cloud Run instances to reach the internet.
# ==============================================================================

resource "google_compute_router" "platform_router" {
  name    = "alti-router"
  region  = var.region
  project = var.gcp_project_id
  network = google_compute_network.vpc.id

  bgp {
    asn = 64514
  }
}

resource "google_compute_router_nat" "platform_nat" {
  name                               = "alti-nat-gateway"
  router                             = google_compute_router.platform_router.name
  region                             = var.region
  project                            = var.gcp_project_id
  nat_ip_allocate_option             = "AUTO_ONLY"
  source_subnetwork_ip_ranges_to_nat = "ALL_SUBNETWORKS_ALL_IP_RANGES"

  log_config {
    enable = true
    filter = "ERRORS_ONLY"
  }

  min_ports_per_vm                    = 256
  max_ports_per_vm                    = 65536
  enable_dynamic_port_allocation      = true
  enable_endpoint_independent_mapping = false

  tcp_established_idle_timeout_sec = 1200
  tcp_transitory_idle_timeout_sec  = 30
  udp_idle_timeout_sec             = 30
}
