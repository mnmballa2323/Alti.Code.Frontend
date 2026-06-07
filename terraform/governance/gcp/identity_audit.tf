# GCP Enterprise Governance
# - BeyondCorp Enterprise (Zero Trust Context-Aware Access)
# - Cloud Storage Bucket Lock for Immutable Audit Logs

provider "google" {
  project = "alti-code-studio-prod"
  region  = "us-central1"
}

# ==========================================
# BeyondCorp Enterprise (Zero Trust)
# ==========================================
# Validates the physical security posture of the employee's device
resource "google_access_context_manager_access_level" "corporate_secure_device" {
  parent = "accessPolicies/123456789012" # Organization Policy ID
  name   = "accessPolicies/123456789012/accessLevels/secure_device_access"
  title  = "Secure Corporate Devices Only"
  
  basic {
    conditions {
      device_policy {
        require_screenlock    = true
        require_admin_approval= true
        require_corp_owned    = true
        os_constraints {
          os_type = "DESKTOP_MAC"
          minimum_version = "14.0.0"
        }
      }
    }
  }
}

# ==========================================
# Immutable Forensic Auditing (Bucket Lock)
# ==========================================
# Create a GCS bucket to hold audit logs
resource "google_storage_bucket" "audit_vault" {
  name          = "alti-forensic-audit-vault-secure"
  location      = "US"
  force_destroy = false
  
  # Crucial for SEC compliance: Uniform bucket-level access
  uniform_bucket_level_access = true

  # The Bucket Lock retention policy
  retention_policy {
    retention_period = 220752000 # 7 years in seconds
    is_locked        = true      # Irrevocable WORM lock
  }
}

# Route all Cloud Audit Logs to the locked bucket
resource "google_logging_project_sink" "audit_log_routing" {
  name                   = "alti-enterprise-audit-sink"
  destination            = "storage.googleapis.com/${google_storage_bucket.audit_vault.name}"
  
  # Capture all Admin Activity, Data Access, and System Event logs
  filter                 = "logName:(\"logs/cloudaudit.googleapis.com%2Factivity\" OR \"logs/cloudaudit.googleapis.com%2Fdata_access\" OR \"logs/cloudaudit.googleapis.com%2Fsystem_event\")"
  
  unique_writer_identity = true
}

# Grant the sink permission to write to the locked bucket
resource "google_project_iam_binding" "sink_writer" {
  project = "alti-code-studio-prod"
  role    = "roles/storage.objectCreator"
  
  members = [
    google_logging_project_sink.audit_log_routing.writer_identity,
  ]
}
