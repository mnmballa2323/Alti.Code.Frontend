# ==============================================================================
# ALTI CODE STUDIO: Production Security — Cloud Armor WAF & VPC Service Controls
# ==============================================================================
# This file provisions:
#   1. Cloud Armor Security Policy (OWASP WAF rules, rate limiting, adaptive DDoS)
#   2. VPC Service Controls Access Level (conditional on var.enable_vpc_sc)
#
# References:
#   - Cloud Armor preconfigured rules: https://cloud.google.com/armor/docs/rule-tuning
#   - VPC SC access levels: https://cloud.google.com/access-context-manager/docs
# ==============================================================================

# ------------------------------------------------------------------------------
# Variable: VPC Service Controls Toggle
# ------------------------------------------------------------------------------
variable "enable_vpc_sc" {
  description = "Enable VPC Service Controls access level for sovereign API perimeter"
  type        = bool
  default     = false
}

variable "vpc_sc_allowed_ip_ranges" {
  description = "IP CIDR ranges allowed through VPC Service Controls access level (e.g., corporate egress IPs)"
  type        = list(string)
  default     = []
}

variable "vpc_sc_allowed_members" {
  description = "IAM members allowed through VPC SC access level (e.g., 'user:admin@example.com')"
  type        = list(string)
  default     = []
}

# ------------------------------------------------------------------------------
# 1. Cloud Armor Security Policy — Production WAF
# ------------------------------------------------------------------------------
# Comprehensive Cloud Armor policy with:
#   - OWASP ModSecurity Core Rule Set (CRS) v3.3 stable rules
#   - Per-IP rate limiting (100 req/min threshold)
#   - ML-based Adaptive Protection for L7 DDoS defense
#   - Default allow rule (lowest priority)
# ------------------------------------------------------------------------------
resource "google_compute_security_policy" "production_waf" {
  name        = "alti-production-waf-policy"
  description = "Production Cloud Armor WAF: OWASP CRS v3.3, rate limiting, adaptive DDoS protection"
  project     = var.gcp_project_id

  # ---------------------------------------------------------------------------
  # Adaptive Protection — ML-based L7 DDoS defense
  # ---------------------------------------------------------------------------
  adaptive_protection_config {
    layer_7_ddos_defense_config {
      enable          = true
      rule_visibility = "STANDARD"
    }
  }

  # ---------------------------------------------------------------------------
  # Rule 1: Block SQL Injection (SQLi) — OWASP CRS v3.3
  # Priority: 1000
  # ---------------------------------------------------------------------------
  rule {
    action   = "deny(403)"
    priority = "1000"
    match {
      expr {
        expression = "evaluatePreconfiguredExpr('sqli-v33-stable')"
      }
    }
    description = "OWASP CRS: Block SQL Injection attacks (sqli-v33-stable)"
  }

  # ---------------------------------------------------------------------------
  # Rule 2: Block Cross-Site Scripting (XSS) — OWASP CRS v3.3
  # Priority: 1010
  # ---------------------------------------------------------------------------
  rule {
    action   = "deny(403)"
    priority = "1010"
    match {
      expr {
        expression = "evaluatePreconfiguredExpr('xss-v33-stable')"
      }
    }
    description = "OWASP CRS: Block Cross-Site Scripting attacks (xss-v33-stable)"
  }

  # ---------------------------------------------------------------------------
  # Rule 3: Block Remote File Inclusion (RFI) — OWASP CRS v3.3
  # Priority: 1020
  # ---------------------------------------------------------------------------
  rule {
    action   = "deny(403)"
    priority = "1020"
    match {
      expr {
        expression = "evaluatePreconfiguredExpr('rfi-v33-stable')"
      }
    }
    description = "OWASP CRS: Block Remote File Inclusion attacks (rfi-v33-stable)"
  }

  # ---------------------------------------------------------------------------
  # Rule 4: Per-IP Rate Limiting — 100 requests/minute
  # Priority: 900 (evaluated before OWASP rules)
  # Exceeding clients receive HTTP 429 Too Many Requests
  # ---------------------------------------------------------------------------
  rule {
    action   = "throttle"
    priority = "900"
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
      enforce_on_key = "IP"
    }
    description = "Rate limiting: 100 requests per minute per source IP"
  }

  # ---------------------------------------------------------------------------
  # Rule 5: Default Allow — catch-all at lowest priority
  # Priority: 2147483647 (maximum, evaluated last)
  # ---------------------------------------------------------------------------
  rule {
    action   = "allow"
    priority = "2147483647"
    match {
      versioned_expr = "SRC_IPS_V1"
      config {
        src_ip_ranges = ["*"]
      }
    }
    description = "Default rule: allow all traffic not matched by higher-priority WAF rules"
  }
}

# ------------------------------------------------------------------------------
# 2. VPC Service Controls — Access Level (Conditional)
# ------------------------------------------------------------------------------
# Creates an Access Context Manager access level that defines the conditions
# under which traffic is allowed through the VPC Service Controls perimeter.
# This is a prerequisite for the service perimeter defined elsewhere.
#
# Prerequisites:
#   - var.enable_vpc_sc must be true
#   - var.access_policy_id must be set (org-level Access Context Manager policy)
#   - At least one of vpc_sc_allowed_ip_ranges or vpc_sc_allowed_members set
# ------------------------------------------------------------------------------
resource "google_access_context_manager_access_level" "alti_access_level" {
  count  = var.enable_vpc_sc ? 1 : 0
  parent = "accessPolicies/${var.access_policy_id}"
  name   = "accessPolicies/${var.access_policy_id}/accessLevels/alti_production_access"
  title  = "Alti Code Studio Production Access Level"

  basic {
    # IP-based condition: allow traffic from trusted corporate networks
    dynamic "conditions" {
      for_each = length(var.vpc_sc_allowed_ip_ranges) > 0 ? [1] : []
      content {
        ip_subnetworks = var.vpc_sc_allowed_ip_ranges
      }
    }

    # Member-based condition: allow specific IAM identities
    dynamic "conditions" {
      for_each = length(var.vpc_sc_allowed_members) > 0 ? [1] : []
      content {
        members = var.vpc_sc_allowed_members
      }
    }
  }
}

# ------------------------------------------------------------------------------
# Outputs
# ------------------------------------------------------------------------------
output "cloud_armor_policy_id" {
  description = "Cloud Armor security policy ID for attaching to backend services"
  value       = google_compute_security_policy.production_waf.id
}

output "cloud_armor_policy_name" {
  description = "Cloud Armor security policy name"
  value       = google_compute_security_policy.production_waf.name
}

output "vpc_sc_access_level_name" {
  description = "VPC Service Controls access level name (empty if disabled)"
  value       = var.enable_vpc_sc ? google_access_context_manager_access_level.alti_access_level[0].name : ""
}
