# -------------------------------------------------------------
# GCP Secret Manager
# -------------------------------------------------------------

resource "google_secret_manager_secret" "secrets" {
  for_each = var.secrets

  secret_id = "${each.key}-${var.environment}"
  
  replication {
    auto {} # Automatic replication across regions
  }
}

resource "google_secret_manager_secret_version" "secret_versions" {
  for_each = var.secrets

  secret      = google_secret_manager_secret.secrets[each.key].id
  secret_data = each.value
}

variable "environment" {
  type = string
}

variable "secrets" {
  description = "A map of secret names to their values"
  type        = map(string)
  sensitive   = true
}

output "secret_ids" {
  value = {
    for k, v in google_secret_manager_secret.secrets : k => v.id
  }
}
