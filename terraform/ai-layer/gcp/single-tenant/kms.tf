# GCP Single-Tenant Customer-Managed Encryption Key (CMEK)
resource "google_kms_key_ring" "tenant_keyring" {
  name     = "keyring-tenant-${var.tenant_id}"
  location = "us-central1"
}

resource "google_kms_crypto_key" "tenant_key" {
  name            = "key-tenant-${var.tenant_id}"
  key_ring        = google_kms_key_ring.tenant_keyring.id
  rotation_period = "2592000s" # 30 days
  
  labels = {
    tenant = var.tenant_id
    tier   = "single-tenant"
  }
}
