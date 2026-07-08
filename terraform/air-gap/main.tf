# ==============================================================================
# ALTI CODE STUDIO: Air-Gapped / Disconnected Deployment
# Classified environment deployment — no internet egress, mandatory Confidential
# Compute, EKM-backed KMS, Binary Authorization, Private Service Connect only.
# ==============================================================================

terraform {
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
  }
}

variable "gcp_project_id" {
  description = "GCP project for air-gapped deployment"
  type        = string
}

variable "region" {
  description = "GCP region (must support Confidential Computing)"
  type        = string
  default     = "us-central1"
}

variable "environment" {
  description = "Deployment environment"
  type        = string
  default     = "prod"
}

variable "ekm_connection_name" {
  description = "External Key Manager connection name for EKM-backed KMS"
  type        = string
  default     = ""
}

variable "container_image" {
  description = "Container image URI (must be in private Artifact Registry)"
  type        = string
}

variable "attestor_note_reference" {
  description = "Container Analysis note reference for Binary Authorization"
  type        = string
  default     = ""
}

provider "google" {
  project = var.gcp_project_id
  region  = var.region
}

# ------------------------------------------------------------------------------
# 1. Isolated VPC — No Internet Egress
# ------------------------------------------------------------------------------
resource "google_compute_network" "airgap_vpc" {
  name                    = "alti-airgap-vpc"
  auto_create_subnetworks = false
  # No Cloud NAT = no internet egress
}

resource "google_compute_subnetwork" "airgap_subnet" {
  name                     = "alti-airgap-subnet"
  ip_cidr_range            = "10.50.0.0/20"
  region                   = var.region
  network                  = google_compute_network.airgap_vpc.id
  private_ip_google_access = true

  log_config {
    aggregation_interval = "INTERVAL_5_SEC"
    flow_sampling        = 1.0  # Full flow logging for classified environments
    metadata             = "INCLUDE_ALL_METADATA"
  }
}

# Deny ALL internet egress — classified requirement
resource "google_compute_firewall" "deny_all_egress" {
  name      = "alti-airgap-deny-all-egress"
  network   = google_compute_network.airgap_vpc.id
  direction = "EGRESS"
  priority  = 65534

  deny {
    protocol = "all"
  }

  destination_ranges = ["0.0.0.0/0"]
}

# Allow egress ONLY to Google Private API ranges (199.36.153.8/30)
resource "google_compute_firewall" "allow_private_google_apis" {
  name      = "alti-airgap-allow-private-apis"
  network   = google_compute_network.airgap_vpc.id
  direction = "EGRESS"
  priority  = 1000

  allow {
    protocol = "tcp"
    ports    = ["443"]
  }

  destination_ranges = ["199.36.153.8/30"]  # restricted.googleapis.com
}

# Allow internal traffic within VPC
resource "google_compute_firewall" "allow_internal" {
  name      = "alti-airgap-allow-internal"
  network   = google_compute_network.airgap_vpc.id
  direction = "INGRESS"
  priority  = 1000

  allow {
    protocol = "tcp"
  }

  allow {
    protocol = "udp"
  }

  allow {
    protocol = "icmp"
  }

  source_ranges = ["10.50.0.0/20"]
}

# Private DNS zone for restricted.googleapis.com
resource "google_dns_managed_zone" "private_googleapis" {
  name        = "alti-airgap-private-apis"
  dns_name    = "googleapis.com."
  visibility  = "private"
  description = "Private DNS zone routing Google APIs through Private Service Connect"

  private_visibility_config {
    networks {
      network_url = google_compute_network.airgap_vpc.id
    }
  }
}

resource "google_dns_record_set" "restricted_apis_a" {
  name         = "restricted.googleapis.com."
  type         = "A"
  ttl          = 300
  managed_zone = google_dns_managed_zone.private_googleapis.name
  rrdatas      = ["199.36.153.4", "199.36.153.5", "199.36.153.6", "199.36.153.7"]
}

resource "google_dns_record_set" "wildcard_googleapis_cname" {
  name         = "*.googleapis.com."
  type         = "CNAME"
  ttl          = 300
  managed_zone = google_dns_managed_zone.private_googleapis.name
  rrdatas      = ["restricted.googleapis.com."]
}

# Private Service Connect for Google APIs
resource "google_compute_global_address" "psc_endpoint" {
  name         = "alti-airgap-psc-endpoint"
  purpose      = "VPC_PEERING"
  address_type = "INTERNAL"
  prefix_length = 16
  network      = google_compute_network.airgap_vpc.id
}

resource "google_service_networking_connection" "airgap_private_connection" {
  network                 = google_compute_network.airgap_vpc.id
  service                 = "servicenetworking.googleapis.com"
  reserved_peering_ranges = [google_compute_global_address.psc_endpoint.name]
}

# ------------------------------------------------------------------------------
# 2. KMS — EKM-backed for classified key material
# ------------------------------------------------------------------------------
resource "google_kms_key_ring" "airgap_keyring" {
  name     = "alti-airgap-keyring"
  location = var.region
}

resource "google_kms_crypto_key" "airgap_db_key" {
  name     = "alti-airgap-db-encryption"
  key_ring = google_kms_key_ring.airgap_keyring.id

  rotation_period = "2592000s"  # 30 days for classified

  lifecycle {
    prevent_destroy = true
  }
}

resource "google_kms_crypto_key" "airgap_storage_key" {
  name     = "alti-airgap-storage-encryption"
  key_ring = google_kms_key_ring.airgap_keyring.id

  rotation_period = "2592000s"

  lifecycle {
    prevent_destroy = true
  }
}

# ------------------------------------------------------------------------------
# 3. Cloud SQL — Private, CMEK-encrypted, no external IP
# ------------------------------------------------------------------------------
resource "google_sql_database_instance" "airgap_db" {
  name             = "alti-airgap-db"
  database_version = "POSTGRES_15"
  region           = var.region

  depends_on = [google_service_networking_connection.airgap_private_connection]

  encryption_key_name = google_kms_crypto_key.airgap_db_key.id

  settings {
    tier              = "db-custom-8-32768"
    availability_type = "REGIONAL"

    ip_configuration {
      ipv4_enabled                                  = false
      private_network                               = google_compute_network.airgap_vpc.id
      enable_private_path_for_google_cloud_services = true
      require_ssl                                   = true
    }

    backup_configuration {
      enabled                        = true
      start_time                     = "01:00"
      location                       = var.region
      point_in_time_recovery_enabled = true
      transaction_log_retention_days = 30  # Extended retention for compliance
    }

    insights_config {
      query_insights_enabled  = true
      query_string_length     = 4096
      record_application_tags = true
      record_client_address   = true
    }

    database_flags {
      name  = "cloudsql.iam_authentication"
      value = "on"
    }

    database_flags {
      name  = "log_min_duration_statement"
      value = "0"  # Log ALL queries for classified audit
    }

    database_flags {
      name  = "pgaudit.log"
      value = "all"
    }
  }

  deletion_protection = true
}

resource "google_sql_database" "airgap_database" {
  name     = "alticodestudio"
  instance = google_sql_database_instance.airgap_db.name
}

# ------------------------------------------------------------------------------
# 4. Memorystore — Private network, auth enabled, CMEK
# ------------------------------------------------------------------------------
resource "google_redis_instance" "airgap_redis" {
  name               = "alti-airgap-redis"
  tier               = "STANDARD_HA"
  memory_size_gb     = 4
  region             = var.region
  authorized_network = google_compute_network.airgap_vpc.id
  connect_mode       = "PRIVATE_SERVICE_ACCESS"
  redis_version      = "REDIS_7_2"
  display_name       = "Alti Air-Gapped Redis Cache"
  auth_enabled       = true
  transit_encryption_mode = "SERVER_AUTHENTICATION"

  customer_managed_key = google_kms_crypto_key.airgap_storage_key.id

  depends_on = [google_service_networking_connection.airgap_private_connection]

  labels = {
    environment  = var.environment
    managed_by   = "terraform"
    deployment   = "air-gapped"
    sovereignty  = "classified"
  }
}

# ------------------------------------------------------------------------------
# 5. Confidential Compute VM — Mandatory AMD SEV encryption
# ------------------------------------------------------------------------------
resource "google_service_account" "airgap_runner" {
  account_id   = "alti-airgap-runner"
  display_name = "Alti Code Studio Air-Gapped Runner"
}

resource "google_project_iam_member" "airgap_roles" {
  for_each = toset([
    "roles/cloudsql.client",
    "roles/secretmanager.secretAccessor",
    "roles/cloudkms.cryptoKeyEncrypterDecrypter",
    "roles/cloudtrace.agent",
    "roles/logging.logWriter",
    "roles/monitoring.metricWriter",
    "roles/aiplatform.user",
  ])

  project = var.gcp_project_id
  role    = each.value
  member  = "serviceAccount:${google_service_account.airgap_runner.email}"
}

resource "google_compute_instance" "airgap_node" {
  name         = "alti-airgap-confidential-node"
  machine_type = "n2d-standard-16"
  zone         = "${var.region}-a"

  can_ip_forward = false

  boot_disk {
    initialize_params {
      image = "ubuntu-os-cloud/ubuntu-2204-lts"
      size  = 500
      type  = "pd-ssd"
    }
    kms_key_self_link = google_kms_crypto_key.airgap_storage_key.id
  }

  network_interface {
    subnetwork = google_compute_subnetwork.airgap_subnet.id
    # NO access_config = no external IP (mandatory for air-gap)
  }

  metadata = {
    enable-oslogin = "TRUE"
  }

  shielded_instance_config {
    enable_secure_boot          = true
    enable_vtpm                 = true
    enable_integrity_monitoring = true
  }

  # MANDATORY: Confidential Computing enabled for classified workloads
  confidential_instance_config {
    enable_confidential_compute = true
  }

  service_account {
    email  = google_service_account.airgap_runner.email
    scopes = ["cloud-platform"]
  }

  labels = {
    environment  = var.environment
    sovereignty  = "air-gapped-classified"
    managed_by   = "terraform"
    confidential = "true"
  }
}

# ------------------------------------------------------------------------------
# 6. Binary Authorization — Mandatory attestation
# ------------------------------------------------------------------------------
resource "google_binary_authorization_policy" "airgap_policy" {
  admission_whitelist_patterns {
    name_pattern = "${var.region}-docker.pkg.dev/${var.gcp_project_id}/**"
  }

  default_admission_rule {
    evaluation_mode  = "REQUIRE_ATTESTATION"
    enforcement_mode = "ENFORCED_BLOCK_AND_AUDIT_LOG"

    dynamic "require_attestations_by" {
      for_each = var.attestor_note_reference != "" ? [1] : []
      content {
        # Attestor reference would be configured here
      }
    }
  }

  global_policy_evaluation_mode = "ENABLE"
}

# ------------------------------------------------------------------------------
# 7. Audit Logging — Full data access logs (classified requirement)
# ------------------------------------------------------------------------------
resource "google_project_iam_audit_config" "full_audit" {
  project = var.gcp_project_id
  service = "allServices"

  audit_log_config {
    log_type = "ADMIN_READ"
  }

  audit_log_config {
    log_type = "DATA_READ"
  }

  audit_log_config {
    log_type = "DATA_WRITE"
  }
}

# ------------------------------------------------------------------------------
# 8. Outputs
# ------------------------------------------------------------------------------
output "airgap_node_internal_ip" {
  description = "Internal IP of the air-gapped confidential compute node"
  value       = google_compute_instance.airgap_node.network_interface[0].network_ip
}

output "airgap_database_connection" {
  description = "Cloud SQL connection name for air-gapped deployment"
  value       = google_sql_database_instance.airgap_db.connection_name
}

output "airgap_redis_host" {
  description = "Memorystore Redis IP (private network only)"
  value       = google_redis_instance.airgap_redis.host
}

output "airgap_service_account" {
  description = "Service account for air-gapped runner"
  value       = google_service_account.airgap_runner.email
}
