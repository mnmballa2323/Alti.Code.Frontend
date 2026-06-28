# Provision Google Cloud Armor Web Application Firewall (WAF) policies for edge shielding
resource "google_compute_security_policy" "waf_policy" {
  name        = "inso-production-waf-policy"
  description = "Enterprise Edge WAF shield policy blocking SQLi, XSS, and OWASP Top 10"

  # 1. Default Rule: Allow all traffic and filter incrementally
  rule {
    action   = "allow"
    priority = "2147483647" # Lowest priority rule
    match {
      versioned_expr = "SRC_IPS_V1"
      config {
        src_ip_ranges = ["*"]
      }
    }
    description = "Default allow rule"
  }

  # 2. Block SQL Injection (SQLi) attacks
  rule {
    action   = "deny(403)"
    priority = "1000"
    match {
      expr {
        expression = "evaluatePreconfiguredExpr('sqli-v33-stable')"
      }
    }
    description = "Block Preconfigured SQL Injection signatures"
  }

  # 3. Block Cross-Site Scripting (XSS) attacks
  rule {
    action   = "deny(403)"
    priority = "1010"
    match {
      expr {
        expression = "evaluatePreconfiguredExpr('xss-v33-stable')"
      }
    }
    description = "Block Preconfigured Cross-Site Scripting signatures"
  }

  # 4. Block Local File Inclusion (LFI)
  rule {
    action   = "deny(403)"
    priority = "1020"
    match {
      expr {
        expression = "evaluatePreconfiguredExpr('lfi-v33-stable')"
      }
    }
    description = "Block Local File Inclusion attacks"
  }

  # 5. Block Remote Code Execution (RCE)
  rule {
    action   = "deny(403)"
    priority = "1030"
    match {
      expr {
        expression = "evaluatePreconfiguredExpr('rce-v33-stable')"
      }
    }
    description = "Block Remote Code Execution attempts"
  }

  # 6. API Rate Limiting (Prevent Brute Force and Abuse on endpoints)
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
      exceed_action  = "deny(429)" # Return HTTP 429 Too Many Requests
      rate_limit_threshold {
        count        = var.waf_rate_limit_count
        interval_sec = var.waf_rate_limit_interval
      }
      enforce_on_key = "IP"
    }
    description = "Global IP-based rate limiting throttling rule"
  }
}
