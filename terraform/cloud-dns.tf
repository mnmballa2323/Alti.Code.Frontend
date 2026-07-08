# ==============================================================================
# ALTI CODE STUDIO: Cloud DNS
# ==============================================================================
# Managed DNS zone with A records for frontend and backend.
# ==============================================================================

resource "google_dns_managed_zone" "platform_zone" {
  name        = "alti-platform-zone"
  dns_name    = "${var.domain_name}."
  description = "Alti Code Studio DNS zone"
  project     = var.gcp_project_id
  visibility  = "public"

  dnssec_config {
    state = "on"
  }

  labels = {
    environment = var.environment
    managed-by  = "terraform"
  }
}

# Frontend A record → Global HTTPS Load Balancer IP
resource "google_dns_record_set" "frontend_a" {
  name         = "${var.domain_name}."
  type         = "A"
  ttl          = 300
  managed_zone = google_dns_managed_zone.platform_zone.name
  project      = var.gcp_project_id

  rrdatas = [var.frontend_lb_ip]
}

# API subdomain → Backend Cloud Run
resource "google_dns_record_set" "api_a" {
  name         = "api.${var.domain_name}."
  type         = "A"
  ttl          = 300
  managed_zone = google_dns_managed_zone.platform_zone.name
  project      = var.gcp_project_id

  rrdatas = [var.backend_lb_ip]
}

# SPF record for email deliverability
resource "google_dns_record_set" "spf" {
  name         = "${var.domain_name}."
  type         = "TXT"
  ttl          = 3600
  managed_zone = google_dns_managed_zone.platform_zone.name
  project      = var.gcp_project_id

  rrdatas = ["\"v=spf1 include:_spf.google.com ~all\""]
}
