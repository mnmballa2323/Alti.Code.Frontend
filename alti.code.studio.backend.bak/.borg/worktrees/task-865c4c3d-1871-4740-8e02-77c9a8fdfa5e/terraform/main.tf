# ═══════════════════════════════════════════════════════════════
# Alti.Code.Studio — GCP Infrastructure as Code (Terraform)
# S&P 500 Enterprise Infrastructure
# ═══════════════════════════════════════════════════════════════

terraform {
  required_version = ">= 1.5.0"

  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
    google-beta = {
      source  = "hashicorp/google-beta"
      version = "~> 5.0"
    }
  }

  backend "gcs" {
    bucket = "alti-code-studio-tfstate"
    prefix = "terraform/state"
  }
}

# ═══════════════════════════════════════════════
# Variables
# ═══════════════════════════════════════════════

variable "project_id" {
  description = "GCP Project ID"
  type        = string
  default     = "alti-code-studio"
}

variable "region" {
  description = "Primary GCP region"
  type        = string
  default     = "us-central1"
}

variable "environment" {
  description = "Deployment environment"
  type        = string
  default     = "production"
}

variable "gke_node_count" {
  description = "Number of GKE nodes per zone"
  type        = number
  default     = 3
}

variable "gke_machine_type" {
  description = "Machine type for GKE nodes"
  type        = string
  default     = "e2-standard-4"
}

# ═══════════════════════════════════════════════
# Provider
# ═══════════════════════════════════════════════

provider "google" {
  project = var.project_id
  region  = var.region
}

provider "google-beta" {
  project = var.project_id
  region  = var.region
}

# ═══════════════════════════════════════════════
# VPC Network
# ═══════════════════════════════════════════════

resource "google_compute_network" "vpc" {
  name                    = "alti-vpc"
  auto_create_subnetworks = false
  routing_mode            = "GLOBAL"
}

resource "google_compute_subnetwork" "primary" {
  name          = "alti-subnet-primary"
  ip_cidr_range = "10.0.0.0/20"
  region        = var.region
  network       = google_compute_network.vpc.id

  secondary_ip_range {
    range_name    = "gke-pods"
    ip_cidr_range = "10.16.0.0/14"
  }

  secondary_ip_range {
    range_name    = "gke-services"
    ip_cidr_range = "10.20.0.0/20"
  }

  private_ip_google_access = true
}

# ── Firewall Rules ──

resource "google_compute_firewall" "allow_internal" {
  name    = "alti-allow-internal"
  network = google_compute_network.vpc.name

  allow {
    protocol = "tcp"
    ports    = ["0-65535"]
  }
  allow {
    protocol = "udp"
    ports    = ["0-65535"]
  }
  allow {
    protocol = "icmp"
  }

  source_ranges = ["10.0.0.0/8"]
}

resource "google_compute_firewall" "allow_health_checks" {
  name    = "alti-allow-health-checks"
  network = google_compute_network.vpc.name

  allow {
    protocol = "tcp"
    ports    = ["80", "443", "3000"]
  }

  source_ranges = ["35.191.0.0/16", "130.211.0.0/22"]
}

# ═══════════════════════════════════════════════
# GKE Cluster
# ═══════════════════════════════════════════════

resource "google_container_cluster" "primary" {
  provider = google-beta
  name     = "alti-gke-cluster"
  location = var.region

  # Autopilot for managed nodes
  enable_autopilot = false

  # VPC-native cluster
  network    = google_compute_network.vpc.name
  subnetwork = google_compute_subnetwork.primary.name

  ip_allocation_policy {
    cluster_secondary_range_name  = "gke-pods"
    services_secondary_range_name = "gke-services"
  }

  # Security
  workload_identity_config {
    workload_pool = "${var.project_id}.svc.id.goog"
  }

  # Monitoring
  monitoring_config {
    enable_components = ["SYSTEM_COMPONENTS", "APISERVER", "SCHEDULER", "CONTROLLER_MANAGER"]
    managed_prometheus {
      enabled = true
    }
  }

  logging_config {
    enable_components = ["SYSTEM_COMPONENTS", "WORKLOADS"]
  }

  # Network policy
  network_policy {
    enabled = true
  }

  # Binary authorization
  binary_authorization {
    evaluation_mode = "PROJECT_SINGLETON_POLICY_ENFORCE"
  }

  # Release channel
  release_channel {
    channel = "STABLE"
  }

  # Master authorized networks
  master_authorized_networks_config {
    cidr_blocks {
      cidr_block   = "0.0.0.0/0"
      display_name = "All (restrict in production)"
    }
  }

  # Maintenance window (Sunday 2-6 AM UTC)
  maintenance_policy {
    recurring_window {
      start_time = "2024-01-01T02:00:00Z"
      end_time   = "2024-01-01T06:00:00Z"
      recurrence = "FREQ=WEEKLY;BYDAY=SU"
    }
  }

  # Remove default node pool
  remove_default_node_pool = true
  initial_node_count       = 1
}

# ── API Server Node Pool ──

resource "google_container_node_pool" "api_pool" {
  name     = "api-pool"
  location = var.region
  cluster  = google_container_cluster.primary.name

  initial_node_count = var.gke_node_count

  autoscaling {
    min_node_count = 2
    max_node_count = 20
  }

  node_config {
    machine_type = var.gke_machine_type
    disk_size_gb = 100
    disk_type    = "pd-ssd"

    labels = {
      role        = "api"
      environment = var.environment
    }

    oauth_scopes = [
      "https://www.googleapis.com/auth/cloud-platform",
    ]

    workload_metadata_config {
      mode = "GKE_METADATA"
    }

    shielded_instance_config {
      enable_secure_boot          = true
      enable_integrity_monitoring = true
    }
  }

  management {
    auto_repair  = true
    auto_upgrade = true
  }
}

# ── Worker Node Pool (GPU-capable for AI workloads) ──

resource "google_container_node_pool" "worker_pool" {
  name     = "worker-pool"
  location = var.region
  cluster  = google_container_cluster.primary.name

  initial_node_count = var.gke_node_count

  autoscaling {
    min_node_count = 3
    max_node_count = 50
  }

  node_config {
    machine_type = "e2-standard-8"
    disk_size_gb = 200
    disk_type    = "pd-ssd"

    labels = {
      role        = "worker"
      environment = var.environment
    }

    taint {
      key    = "workload"
      value  = "agent"
      effect = "NO_SCHEDULE"
    }

    oauth_scopes = [
      "https://www.googleapis.com/auth/cloud-platform",
    ]

    workload_metadata_config {
      mode = "GKE_METADATA"
    }

    shielded_instance_config {
      enable_secure_boot          = true
      enable_integrity_monitoring = true
    }
  }

  management {
    auto_repair  = true
    auto_upgrade = true
  }
}

# ═══════════════════════════════════════════════
# Cloud Memorystore (Redis)
# ═══════════════════════════════════════════════

resource "google_redis_instance" "primary" {
  name           = "alti-redis"
  tier           = "STANDARD_HA"
  memory_size_gb = 5
  region         = var.region

  redis_version = "REDIS_7_0"

  auth_enabled            = true
  transit_encryption_mode = "SERVER_AUTHENTICATION"

  maintenance_policy {
    weekly_maintenance_window {
      day = "SUNDAY"
      start_time {
        hours   = 2
        minutes = 0
      }
    }
  }

  labels = {
    environment = var.environment
    service     = "alti-code-studio"
  }
}

# ═══════════════════════════════════════════════
# Cloud KMS (Encryption)
# ═══════════════════════════════════════════════

resource "google_kms_key_ring" "primary" {
  name     = "alti-keyring"
  location = var.region
}

resource "google_kms_crypto_key" "data_encryption" {
  name     = "data-encryption-key"
  key_ring = google_kms_key_ring.primary.id

  rotation_period = "7776000s" # 90 days

  lifecycle {
    prevent_destroy = true
  }

  labels = {
    purpose     = "data-encryption"
    environment = var.environment
  }
}

resource "google_kms_crypto_key" "audit_signing" {
  name     = "audit-signing-key"
  key_ring = google_kms_key_ring.primary.id

  purpose = "ASYMMETRIC_SIGN"

  version_template {
    algorithm        = "RSA_SIGN_PKCS1_4096_SHA256"
    protection_level = "HSM"
  }

  lifecycle {
    prevent_destroy = true
  }

  labels = {
    purpose     = "audit-signing"
    environment = var.environment
  }
}

# ═══════════════════════════════════════════════
# Secret Manager
# ═══════════════════════════════════════════════

resource "google_secret_manager_secret" "redis_password" {
  secret_id = "redis-password"

  replication {
    auto {}
  }

  labels = {
    environment = var.environment
  }
}

resource "google_secret_manager_secret" "ai_api_keys" {
  secret_id = "ai-api-keys"

  replication {
    auto {}
  }

  labels = {
    environment = var.environment
    component   = "ai-providers"
  }
}

resource "google_secret_manager_secret" "sso_config" {
  secret_id = "sso-config"

  replication {
    auto {}
  }

  labels = {
    environment = var.environment
    component   = "enterprise-auth"
  }
}

# ═══════════════════════════════════════════════
# Cloud Armor (WAF/DDoS)
# ═══════════════════════════════════════════════

resource "google_compute_security_policy" "enterprise" {
  name = "alti-enterprise-policy"

  # Default: Allow
  rule {
    action   = "allow"
    priority = "2147483647"
    match {
      versioned_expr = "SRC_IPS_V1"
      config {
        src_ip_ranges = ["*"]
      }
    }
    description = "Default allow"
  }

  # Block known bad actors
  rule {
    action   = "deny(403)"
    priority = "1000"
    match {
      expr {
        expression = "evaluatePreconfiguredExpr('xss-v33-stable')"
      }
    }
    description = "XSS protection"
  }

  rule {
    action   = "deny(403)"
    priority = "1001"
    match {
      expr {
        expression = "evaluatePreconfiguredExpr('sqli-v33-stable')"
      }
    }
    description = "SQL injection protection"
  }

  # Rate limiting
  rule {
    action   = "rate_based_ban"
    priority = "2000"
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
        count        = 1000
        interval_sec = 60
      }
    }
    description = "Rate limit: 1000 req/min"
  }

  # Bot protection
  rule {
    action   = "deny(403)"
    priority = "3000"
    match {
      expr {
        expression = "evaluatePreconfiguredExpr('rce-v33-stable')"
      }
    }
    description = "RCE protection"
  }
}

# ═══════════════════════════════════════════════
# Cloud Monitoring (Alerting)
# ═══════════════════════════════════════════════

resource "google_monitoring_alert_policy" "high_error_rate" {
  display_name = "Alti - High Error Rate"
  combiner     = "OR"

  conditions {
    display_name = "Error rate > 5%"
    condition_threshold {
      filter          = "resource.type = \"k8s_container\" AND resource.labels.namespace_name = \"alti-code-studio\""
      comparison      = "COMPARISON_GT"
      threshold_value = 5
      duration        = "300s"
      aggregations {
        alignment_period   = "60s"
        per_series_aligner = "ALIGN_RATE"
      }
    }
  }

  notification_channels = []
  alert_strategy {
    auto_close = "1800s"
  }
}

resource "google_monitoring_alert_policy" "high_latency" {
  display_name = "Alti - High Agent Latency"
  combiner     = "OR"

  conditions {
    display_name = "P95 latency > 10s"
    condition_threshold {
      filter          = "resource.type = \"k8s_container\" AND resource.labels.namespace_name = \"alti-code-studio\""
      comparison      = "COMPARISON_GT"
      threshold_value = 10000
      duration        = "300s"
      aggregations {
        alignment_period   = "60s"
        per_series_aligner = "ALIGN_PERCENTILE_95"
      }
    }
  }

  notification_channels = []
  alert_strategy {
    auto_close = "1800s"
  }
}

# ═══════════════════════════════════════════════
# Service Accounts
# ═══════════════════════════════════════════════

resource "google_service_account" "api_sa" {
  account_id   = "alti-api"
  display_name = "Alti API Server"
}

resource "google_service_account" "worker_sa" {
  account_id   = "alti-worker"
  display_name = "Alti Worker Fleet"
}

# IAM bindings
resource "google_project_iam_member" "api_monitoring" {
  project = var.project_id
  role    = "roles/monitoring.metricWriter"
  member  = "serviceAccount:${google_service_account.api_sa.email}"
}

resource "google_project_iam_member" "api_trace" {
  project = var.project_id
  role    = "roles/cloudtrace.agent"
  member  = "serviceAccount:${google_service_account.api_sa.email}"
}

resource "google_project_iam_member" "api_logging" {
  project = var.project_id
  role    = "roles/logging.logWriter"
  member  = "serviceAccount:${google_service_account.api_sa.email}"
}

resource "google_project_iam_member" "api_kms" {
  project = var.project_id
  role    = "roles/cloudkms.cryptoKeyEncrypterDecrypter"
  member  = "serviceAccount:${google_service_account.api_sa.email}"
}

resource "google_project_iam_member" "api_secrets" {
  project = var.project_id
  role    = "roles/secretmanager.secretAccessor"
  member  = "serviceAccount:${google_service_account.api_sa.email}"
}

resource "google_project_iam_member" "worker_monitoring" {
  project = var.project_id
  role    = "roles/monitoring.metricWriter"
  member  = "serviceAccount:${google_service_account.worker_sa.email}"
}

resource "google_project_iam_member" "worker_trace" {
  project = var.project_id
  role    = "roles/cloudtrace.agent"
  member  = "serviceAccount:${google_service_account.worker_sa.email}"
}

resource "google_project_iam_member" "worker_pubsub" {
  project = var.project_id
  role    = "roles/pubsub.subscriber"
  member  = "serviceAccount:${google_service_account.worker_sa.email}"
}

# Workload Identity bindings
resource "google_service_account_iam_member" "api_wi" {
  service_account_id = google_service_account.api_sa.name
  role               = "roles/iam.workloadIdentityUser"
  member             = "serviceAccount:${var.project_id}.svc.id.goog[alti-code-studio/alti-api-sa]"
}

resource "google_service_account_iam_member" "worker_wi" {
  service_account_id = google_service_account.worker_sa.name
  role               = "roles/iam.workloadIdentityUser"
  member             = "serviceAccount:${var.project_id}.svc.id.goog[alti-code-studio/alti-worker-sa]"
}

# ═══════════════════════════════════════════════
# Outputs
# ═══════════════════════════════════════════════

output "gke_cluster_name" {
  value = google_container_cluster.primary.name
}

output "gke_cluster_endpoint" {
  value     = google_container_cluster.primary.endpoint
  sensitive = true
}

output "redis_host" {
  value = google_redis_instance.primary.host
}

output "redis_port" {
  value = google_redis_instance.primary.port
}

output "vpc_network" {
  value = google_compute_network.vpc.name
}
