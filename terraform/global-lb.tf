# ==============================================================================
# ALTI CODE STUDIO: Global Load Balancer, CDN & Cloud Armor
# ==============================================================================

# -- Cloud Armor Security Policy --
resource "google_compute_security_policy" "alti_waf" {
  name    = "alti-waf-policy"
  project = var.gcp_project_id

  # Rate limiting
  rule {
    action   = "throttle"
    priority = 1000
    match {
      versioned_expr = "SRC_IPS_V1"
      config {
        src_ip_ranges = ["*"]
      }
    }
    rate_limit_options {
      conform_action = "allow"
      exceed_action  = "deny(429)"
      rate_limit_threshold {
        count        = 100
        interval_sec = 60
      }
    }
    description = "Rate limit: 100 req/min per IP"
  }

  # Block known bad actors
  rule {
    action   = "deny(403)"
    priority = 2000
    match {
      expr {
        expression = "evaluatePreconfiguredExpr('xss-v33-stable')"
      }
    }
    description = "Block XSS attacks"
  }

  rule {
    action   = "deny(403)"
    priority = 2001
    match {
      expr {
        expression = "evaluatePreconfiguredExpr('sqli-v33-stable')"
      }
    }
    description = "Block SQL injection"
  }

  # Default allow
  rule {
    action   = "allow"
    priority = 2147483647
    match {
      versioned_expr = "SRC_IPS_V1"
      config {
        src_ip_ranges = ["*"]
      }
    }
    description = "Default allow"
  }
}

# -- Serverless NEG for Cloud Run --
resource "google_compute_region_network_endpoint_group" "backend_neg" {
  name                  = "alti-backend-neg"
  project               = var.gcp_project_id
  region                = var.gcp_region
  network_endpoint_type = "SERVERLESS"

  cloud_run {
    service = var.cloud_run_service_name
  }
}

# -- Backend Service with CDN --
resource "google_compute_backend_service" "api_backend" {
  name                  = "alti-api-backend"
  project               = var.gcp_project_id
  protocol              = "HTTPS"
  load_balancing_scheme  = "EXTERNAL_MANAGED"
  security_policy        = google_compute_security_policy.alti_waf.id
  enable_cdn             = true
  
  cdn_policy {
    cache_mode                   = "CACHE_ALL_STATIC"
    default_ttl                  = 3600
    max_ttl                      = 86400
    negative_caching             = true
    serve_while_stale            = 86400
    signed_url_cache_max_age_sec = 3600
  }

  backend {
    group = google_compute_region_network_endpoint_group.backend_neg.id
  }

  log_config {
    enable      = true
    sample_rate = 1.0
  }
}

# -- URL Map --
resource "google_compute_url_map" "alti_url_map" {
  name            = "alti-url-map"
  project         = var.gcp_project_id
  default_service = google_compute_backend_service.api_backend.id
}

# -- Variables --
variable "cloud_run_service_name" {
  description = "Name of the Cloud Run service"
  type        = string
  default     = "alti-backend"
}
