# GCP FIPS 140-2 Enforcement
# Note: When inside an Assured Workload FEDRAMP_HIGH folder, GCP automatically 
# enforces FIPS 140-2 validated encryption and restricts services to compliant ones.

resource "google_compute_security_policy" "fedramp_waf" {
  name = "waf-fedramp"

  rule {
    action   = "deny(403)"
    priority = "1000"
    match {
      versioned_expr = "SRC_IPS_V1"
      config {
        src_ip_ranges = ["*"]
      }
    }
    description = "Deny all public internet traffic by default"
  }
}
