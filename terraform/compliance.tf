# ==============================================================================
# ALTI CODE STUDIO: Compliance & Audit Infrastructure
# ==============================================================================

# ── BigQuery Audit Sink ──
resource "google_bigquery_dataset" "audit_logs" {
  dataset_id    = "audit_logs"
  friendly_name = "Audit Logs"
  description   = "Immutable audit trail for SOC 2 compliance"
  project       = var.gcp_project_id
  location      = var.gcp_region

  default_table_expiration_ms = null  # Never expire

  access {
    role          = "OWNER"
    special_group = "projectOwners"
  }

  access {
    role          = "READER"
    special_group = "projectReaders"
  }

  labels = {
    purpose    = "compliance"
    retention  = "permanent"
    managed_by = "terraform"
  }
}

resource "google_logging_project_sink" "audit_to_bigquery" {
  name        = "audit-to-bigquery"
  project     = var.gcp_project_id
  destination = "bigquery.googleapis.com/projects/${var.gcp_project_id}/datasets/${google_bigquery_dataset.audit_logs.dataset_id}"

  filter = "jsonPayload.audit=true"

  unique_writer_identity = true

  bigquery_options {
    use_partitioned_tables = true
  }
}

# Grant the sink writer identity access to BigQuery
resource "google_bigquery_dataset_iam_member" "audit_sink_writer" {
  dataset_id = google_bigquery_dataset.audit_logs.dataset_id
  project    = var.gcp_project_id
  role       = "roles/bigquery.dataEditor"
  member     = google_logging_project_sink.audit_to_bigquery.writer_identity
}

# ── Data Loss Prevention Inspection Template ──
resource "google_data_loss_prevention_inspect_template" "pii_detector" {
  parent       = "projects/${var.gcp_project_id}"
  display_name = "PII Detector"
  description  = "Detects PII in API payloads for compliance"

  inspect_config {
    info_types {
      name = "EMAIL_ADDRESS"
    }
    info_types {
      name = "PHONE_NUMBER"
    }
    info_types {
      name = "CREDIT_CARD_NUMBER"
    }
    info_types {
      name = "US_SOCIAL_SECURITY_NUMBER"
    }
    info_types {
      name = "PERSON_NAME"
    }
    info_types {
      name = "STREET_ADDRESS"
    }

    min_likelihood = "LIKELY"

    limits {
      max_findings_per_request = 100
    }
  }
}

# ── Cloud KMS Keyring for CMEK ──
resource "google_kms_key_ring" "alti_keyring" {
  name     = "alti-keyring"
  project  = var.gcp_project_id
  location = var.gcp_region
}

resource "google_kms_crypto_key" "data_encryption_key" {
  name            = "data-encryption-key"
  key_ring        = google_kms_key_ring.alti_keyring.id
  rotation_period = "7776000s"  # 90 days
  purpose         = "ENCRYPT_DECRYPT"

  version_template {
    algorithm        = "GOOGLE_SYMMETRIC_ENCRYPTION"
    protection_level = "SOFTWARE"
  }

  labels = {
    purpose    = "cmek"
    managed_by = "terraform"
  }
}
