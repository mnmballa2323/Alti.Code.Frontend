# ==============================================================================
# ALTI CODE STUDIO: Production CDN, HTTPS Load Balancer & SSL Certificate
# ==============================================================================
# This file provisions the full production-grade CDN and load balancing stack:
#   1. GCS Bucket for frontend static assets (SPA)
#   2. Backend Bucket with Cloud CDN for static content
#   3. Cloud Run NEG + Backend Service for API routing
#   4. URL Map for frontend/backend path-based routing
#   5. Google-Managed SSL Certificate
#   6. HTTPS Target Proxy
#   7. Global Forwarding Rule (port 443)
#   8. HTTP → HTTPS Redirect (port 80 → 443)
#
# All resources use hashicorp/google provider — 100% Google Cloud.
# ==============================================================================

# ------------------------------------------------------------------------------
# 1. GCS Bucket for Frontend Static Assets
# ------------------------------------------------------------------------------
resource "google_storage_bucket" "frontend_assets" {
  name     = "${var.gcp_project_id}-frontend-assets"
  location = var.region
  project  = var.gcp_project_id

  uniform_bucket_level_access = true
  force_destroy               = false

  # SPA routing: serve index.html for all paths (client-side router handles it)
  website {
    main_page_suffix = "index.html"
    not_found_page   = "index.html"
  }

  cors {
    origin          = var.cdn_cors_origins
    method          = ["GET", "HEAD", "OPTIONS"]
    response_header = ["Content-Type", "Cache-Control", "ETag"]
    max_age_seconds = 3600
  }

  labels = {
    environment = var.environment
    sovereignty = "gcp-native"
    managed_by  = "terraform"
    purpose     = "frontend-static-assets"
  }
}

# Allow public read access for frontend assets served via CDN
resource "google_storage_bucket_iam_member" "frontend_public_read" {
  bucket = google_storage_bucket.frontend_assets.name
  role   = "roles/storage.objectViewer"
  member = "allUsers"
}

# ------------------------------------------------------------------------------
# 2. Backend Bucket with Cloud CDN — Static Frontend Content
# ------------------------------------------------------------------------------
resource "google_compute_backend_bucket" "frontend_cdn" {
  name        = "alti-frontend-cdn-backend"
  bucket_name = google_storage_bucket.frontend_assets.name
  project     = var.gcp_project_id
  description = "Cloud CDN backend bucket for frontend static assets"
  enable_cdn  = true

  cdn_policy {
    cache_mode                   = "CACHE_ALL_STATIC"
    default_ttl                  = 3600   # 1 hour default TTL
    max_ttl                      = 86400  # 24 hours max TTL
    client_ttl                   = 3600   # 1 hour client-side cache
    signed_url_cache_max_age_sec = 0      # No signed URLs by default
    serve_while_stale            = 86400  # Serve stale during revalidation (24h)

    negative_caching = true
    negative_caching_policy {
      code = 404
      ttl  = 60  # Cache 404s for 1 minute to prevent origin hammering
    }
  }
}

# ------------------------------------------------------------------------------
# 3. Cloud Run Serverless NEG + Backend Service — API Backend
# ------------------------------------------------------------------------------

# Network Endpoint Group pointing to the Cloud Run service
resource "google_compute_region_network_endpoint_group" "cloud_run_neg" {
  name                  = "alti-cloud-run-neg"
  network_endpoint_type = "SERVERLESS"
  region                = var.region
  project               = var.gcp_project_id

  cloud_run {
    service = google_cloud_run_v2_service.backend.name
  }
}

# Backend Service with Cloud Armor WAF and request logging
resource "google_compute_backend_service" "api_backend" {
  name        = "alti-api-backend-service"
  project     = var.gcp_project_id
  protocol    = "HTTPS"
  timeout_sec = 30
  description = "Backend service routing API traffic to Cloud Run via serverless NEG"

  backend {
    group = google_compute_region_network_endpoint_group.cloud_run_neg.id
  }

  # Attach Cloud Armor WAF policy for OWASP protection + rate limiting
  security_policy = google_compute_security_policy.production_waf.id

  # API responses should not be cached by CDN
  cdn_policy {
    cache_mode  = "CACHE_ALL_STATIC"
    default_ttl = 0
    max_ttl     = 0
    client_ttl  = 0
  }

  log_config {
    enable      = true
    sample_rate = 1.0  # Log 100% of requests for production observability
  }
}

# ------------------------------------------------------------------------------
# 4. URL Map — Path-Based Routing (Frontend CDN + API Backend)
# ------------------------------------------------------------------------------
resource "google_compute_url_map" "https_lb" {
  name            = "alti-https-url-map"
  project         = var.gcp_project_id
  default_service = google_compute_backend_bucket.frontend_cdn.id
  description     = "Routes /api/*, /auth/*, /webhook/* to Cloud Run; all other paths to CDN"

  host_rule {
    hosts        = [var.cdn_domain]
    path_matcher = "alti-paths"
  }

  path_matcher {
    name            = "alti-paths"
    default_service = google_compute_backend_bucket.frontend_cdn.id

    # Route API, auth, and webhook traffic to Cloud Run backend
    path_rule {
      paths   = ["/api/*", "/auth/*", "/webhook/*"]
      service = google_compute_backend_service.api_backend.id
    }
  }
}

# ------------------------------------------------------------------------------
# 5. Google-Managed SSL Certificate
# ------------------------------------------------------------------------------
# Automatically provisions and renews a TLS certificate for the configured domain.
# DNS must be pointed to the load balancer IP for domain validation to succeed.
resource "google_compute_managed_ssl_certificate" "default" {
  name    = "alti-managed-ssl-cert"
  project = var.gcp_project_id

  managed {
    domains = [var.cdn_domain]
  }
}

# ------------------------------------------------------------------------------
# 6. HTTPS Target Proxy
# ------------------------------------------------------------------------------
resource "google_compute_target_https_proxy" "default" {
  name             = "alti-https-proxy"
  project          = var.gcp_project_id
  url_map          = google_compute_url_map.https_lb.id
  ssl_certificates = [google_compute_managed_ssl_certificate.default.id]
}

# ------------------------------------------------------------------------------
# 7. Global Forwarding Rule — HTTPS Entrypoint (Port 443)
# ------------------------------------------------------------------------------

# Reserve a static global IP for DNS A-record pointing
resource "google_compute_global_address" "lb_ip" {
  name    = "alti-global-lb-ip"
  project = var.gcp_project_id
}

# Forward all port 443 traffic to the HTTPS proxy
resource "google_compute_global_forwarding_rule" "https" {
  name                  = "alti-https-forwarding-rule"
  project               = var.gcp_project_id
  ip_protocol           = "TCP"
  load_balancing_scheme = "EXTERNAL_MANAGED"
  port_range            = "443"
  target                = google_compute_target_https_proxy.default.id
  ip_address            = google_compute_global_address.lb_ip.id
}

# ------------------------------------------------------------------------------
# 8. HTTP → HTTPS Redirect (Port 80 → 443)
# ------------------------------------------------------------------------------
# All HTTP traffic on port 80 is permanently redirected to HTTPS.
# No plaintext HTTP traffic is served.

resource "google_compute_url_map" "http_redirect" {
  name    = "alti-http-redirect"
  project = var.gcp_project_id

  default_url_redirect {
    https_redirect         = true
    redirect_response_code = "MOVED_PERMANENTLY_DEFAULT"
    strip_query            = false
  }
}

resource "google_compute_target_http_proxy" "http_redirect" {
  name    = "alti-http-redirect-proxy"
  project = var.gcp_project_id
  url_map = google_compute_url_map.http_redirect.id
}

resource "google_compute_global_forwarding_rule" "http_redirect" {
  name                  = "alti-http-redirect-rule"
  project               = var.gcp_project_id
  ip_protocol           = "TCP"
  load_balancing_scheme = "EXTERNAL_MANAGED"
  port_range            = "80"
  target                = google_compute_target_http_proxy.http_redirect.id
  ip_address            = google_compute_global_address.lb_ip.id
}

# ------------------------------------------------------------------------------
# Outputs
# ------------------------------------------------------------------------------
output "cdn_load_balancer_ip" {
  description = "Global static IP of the HTTPS load balancer — point your DNS A-record here"
  value       = google_compute_global_address.lb_ip.address
}

output "frontend_bucket_name" {
  description = "GCS bucket name for deploying frontend static assets"
  value       = google_storage_bucket.frontend_assets.name
}

output "ssl_certificate_id" {
  description = "Google-managed SSL certificate resource ID"
  value       = google_compute_managed_ssl_certificate.default.id
}

output "backend_service_id" {
  description = "Backend service ID for the Cloud Run API backend"
  value       = google_compute_backend_service.api_backend.id
}
