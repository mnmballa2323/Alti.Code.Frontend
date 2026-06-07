# GCP Global Active-Active Architecture
# - Google Cloud Global External HTTP(S) Load Balancer (Anycast IP)
# - Cloud Spanner (Globally distributed, strongly consistent SQL database)

provider "google" {
  project = "alti-code-studio-prod"
}

# ==========================================
# Google Cloud Spanner (Global Scale Database)
# ==========================================
resource "google_spanner_instance" "alti_global_db" {
  name             = "alti-global-control-plane"
  config           = "nam-eur-asia1" # Multi-continent configuration
  display_name     = "Alti Global Spanner Instance"
  processing_units = 1000
}

resource "google_spanner_database" "database" {
  instance = google_spanner_instance.alti_global_db.name
  name     = "alticontrol"
  version_retention_period = "3d"
  deletion_protection      = true
}

# ==========================================
# Google Cloud Global HTTP(S) Load Balancer
# ==========================================
resource "google_compute_global_address" "default" {
  name = "alti-global-anycast-ip"
}

resource "google_compute_global_forwarding_rule" "default" {
  name       = "alti-global-rule"
  target     = google_compute_target_https_proxy.default.id
  port_range = "443"
  ip_address = google_compute_global_address.default.id
}

resource "google_compute_target_https_proxy" "default" {
  name             = "alti-global-https-proxy"
  url_map          = google_compute_url_map.default.id
  ssl_certificates = [google_compute_managed_ssl_certificate.default.id]
}

resource "google_compute_managed_ssl_certificate" "default" {
  name = "alti-global-cert"

  managed {
    domains = ["api.alticodestudio.com"]
  }
}

resource "google_compute_url_map" "default" {
  name            = "alti-global-url-map"
  default_service = google_compute_backend_service.default.id
}

resource "google_compute_backend_service" "default" {
  name                  = "alti-global-backend"
  protocol              = "HTTP"
  load_balancing_scheme = "EXTERNAL_MANAGED"
  health_checks         = [google_compute_health_check.default.id]
  
  # Backend 1: US East
  backend {
    group = "https://www.googleapis.com/compute/v1/projects/alti-code-studio-prod/regions/us-east4/networkEndpointGroups/us-east-neg"
    balancing_mode = "RATE"
    max_rate_per_endpoint = 100
  }

  # Backend 2: Europe West
  backend {
    group = "https://www.googleapis.com/compute/v1/projects/alti-code-studio-prod/regions/europe-west4/networkEndpointGroups/eu-west-neg"
    balancing_mode = "RATE"
    max_rate_per_endpoint = 100
  }
}

resource "google_compute_health_check" "default" {
  name               = "alti-global-health-check"
  check_interval_sec = 10
  timeout_sec        = 5

  http_health_check {
    port         = 80
    request_path = "/healthz"
  }
}
