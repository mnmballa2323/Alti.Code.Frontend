# ==============================================================================
# ALTI CODE STUDIO: GCP Key Management Service (KMS) & CMEK Provisioning
# ==============================================================================

# 1. Cloud KMS Key Ring
resource "google_kms_key_ring" "keyring" {
  name     = "inso-${var.customer_id}-keyring"
  location = var.region
}

# 2. Cloud KMS Crypto Key for Database & Compute Disk CMEK
resource "google_kms_crypto_key" "db_disk_key" {
  name            = "db-disk-cmek"
  key_ring        = google_kms_key_ring.keyring.id
  rotation_period = "7776000s" # Automatic rotation every 90 days (security best practice)

  lifecycle {
    prevent_destroy = false
  }
}

# 3. Cloud KMS Crypto Key for Integrations Vault Envelope Encryption (KEK)
resource "google_kms_crypto_key" "vault_kek" {
  name            = "vault-envelope-kek"
  key_ring        = google_kms_key_ring.keyring.id
  rotation_period = "7776000s" # Automatic rotation every 90 days

  lifecycle {
    prevent_destroy = false
  }
}

# 4. Fetch GCP Project Details for Service Account Email Derivation
data "google_project" "project" {}

# 5. Grant Cloud SQL Service Agent access to use db_disk_key for CMEK
resource "google_kms_crypto_key_iam_member" "sql_kms_accessor" {
  crypto_key_id = google_kms_crypto_key.db_disk_key.id
  role          = "roles/cloudkms.cryptoKeyEncrypterDecrypter"
  member        = "serviceAccount:service-${data.google_project.project.number}@gcp-sa-cloud-sql.iam.gserviceaccount.com"
}

# 6. Grant Compute Engine Service Agent access to use db_disk_key for Disk Encryption
resource "google_kms_crypto_key_iam_member" "compute_kms_accessor" {
  crypto_key_id = google_kms_crypto_key.db_disk_key.id
  role          = "roles/cloudkms.cryptoKeyEncrypterDecrypter"
  member        = "serviceAccount:service-${data.google_project.project.number}@compute-system.iam.gserviceaccount.com"
}

# 7. Outputs for Backend Application KMS Configuration
output "kms_keyring_name" {
  value       = google_kms_key_ring.keyring.name
  description = "The name of the provisioned GCP KMS Key Ring"
}

output "vault_kek_self_link" {
  value       = google_kms_crypto_key.vault_kek.id
  description = "The resource ID/self-link of the Vault envelope encryption Key Encryption Key (KEK)"
}

output "db_disk_cmek_self_link" {
  value       = google_kms_crypto_key.db_disk_key.id
  description = "The resource ID/self-link of the Database & Compute Disk CMEK"
}
