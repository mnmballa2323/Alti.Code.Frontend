# ==============================================================================
# ALTI CODE STUDIO: GCP Sovereign Cloud Terraform Variables
# ==============================================================================

variable "customer_id" {
  description = "Unique identifier for the customer/tenant"
  type        = string
  default     = "generic-tenant"

  validation {
    condition     = can(regex("^[a-zA-Z0-9-]+$", var.customer_id))
    error_message = "The customer_id value must contain only alphanumeric characters and hyphens."
  }
}

variable "environment" {
  description = "Deployment environment (e.g., prod, staging, dev)"
  type        = string
  default     = "prod"

  validation {
    condition     = can(regex("^[a-zA-Z0-9-]+$", var.environment))
    error_message = "The environment value must contain only alphanumeric characters and hyphens."
  }
}

variable "gcp_project_id" {
  description = "The target Google Cloud Project ID"
  type        = string
  default     = "alti-code-studio-production"
}

variable "gcp_region_commercial" {
  description = "GCP Region for Commercial Cloud deployment"
  type        = string
  default     = "us-central1"
}

variable "gcp_region_government" {
  description = "GCP Region for Government Cloud deployment"
  type        = string
  default     = "us-gov-west1"
}

variable "ssh_public_key_path" {
  description = "File path to the SSH public key for VM access"
  type        = string
  default     = "~/.ssh/id_rsa.pub"
}

variable "pg_admin_username" {
  description = "Administrator login for PostgreSQL Database"
  type        = string
  default     = "altipgadmin"
}

variable "pg_admin_password" {
  description = "Administrator password for PostgreSQL Database (must be supplied via TF_VAR_pg_admin_password or securely at runtime)"
  type        = string
  default     = null
  sensitive   = true

  validation {
    condition     = var.pg_admin_password == null ? true : (length(var.pg_admin_password) >= 8 && length(var.pg_admin_password) <= 128)
    error_message = "The pg_admin_password must be between 8 and 128 characters in length."
  }
}

variable "github_repository" {
  description = "The GitHub repository path in format ORG/REPO"
  type        = string
  default     = "mnmballa2323/alti.code.studio"

  validation {
    condition     = can(regex("^[a-zA-Z0-9._-]+/[a-zA-Z0-9._-]+$", var.github_repository))
    error_message = "The github_repository value must be in the format 'organization/repository'."
  }
}

# ------------------------------------------------------------------------------
# Deployment Option Toggles
# ------------------------------------------------------------------------------
variable "enable_gcp_cloud" {
  description = "Deploy the GCP Cloud tier (commercial multi-tenant VM)"
  type        = bool
  default     = true
}

variable "enable_gcp_dedicated" {
  description = "Deploy the GCP Dedicated tier (commercial VM on sole-tenant nodes)"
  type        = bool
  default     = false
}

variable "enable_gcp_government" {
  description = "Deploy the GCP Government tier (government VM in Assured Workloads)"
  type        = bool
  default     = false
}

variable "admin_source_ip_range" {
  description = "The CIDR or IP range allowed to SSH into the commercial nodes"
  type        = string
  default     = "0.0.0.0/0"
}

# ------------------------------------------------------------------------------
# Resource Sizing & SKUs
# ------------------------------------------------------------------------------
variable "machine_type_commercial" {
  description = "GCP Machine Type for Commercial Cloud VM"
  type        = string
  default     = "e2-standard-8"
}

variable "machine_type_dedicated" {
  description = "GCP Machine Type for Dedicated VM"
  type        = string
  default     = "n2d-standard-8"
}

variable "machine_type_government" {
  description = "GCP Machine Type for Government VM"
  type        = string
  default     = "n2d-standard-8"
}

variable "sole_tenant_node_type" {
  description = "The Sole Tenant Node Type in GCP"
  type        = string
  default     = "c2-node-60-240"
}

variable "pg_db_tier" {
  description = "The database tier/SKU for Cloud SQL PostgreSQL"
  type        = string
  default     = "db-custom-4-16384"
}

variable "redis_tier" {
  description = "The tier for Memorystore Redis (BASIC or STANDARD_HA)"
  type        = string
  default     = "BASIC"
}

variable "redis_memory_size_gb" {
  description = "The memory size in GB for Redis Cache"
  type        = number
  default     = 1
}

variable "waf_rate_limit_count" {
  description = "The maximum number of requests allowed in the WAF rate limit window"
  type        = number
  default     = 100
}

variable "waf_rate_limit_interval" {
  description = "The time window in seconds for the WAF rate limit"
  type        = number
  default     = 60
}

variable "enable_confidential_compute" {
  description = "Toggle Google Cloud Confidential VM technology (AMD SEV memory encryption)"
  type        = bool
  default     = false
}

variable "gcp_kms_crypto_key" {
  description = "The self-link of the Google Cloud KMS Crypto Key for data encryption at rest (CMEK)"
  type        = string
  default     = null
}

# ------------------------------------------------------------------------------
# Cloud Run Configuration
# ------------------------------------------------------------------------------
variable "cloud_run_min_instances" {
  description = "Minimum number of Cloud Run instances (keep warm)"
  type        = number
  default     = 1
}

variable "cloud_run_max_instances" {
  description = "Maximum number of Cloud Run instances for auto-scaling"
  type        = number
  default     = 10
}

variable "cloud_run_cpu" {
  description = "CPU allocation per Cloud Run container (e.g., '2' for 2 vCPUs)"
  type        = string
  default     = "2"
}

variable "cloud_run_memory" {
  description = "Memory allocation per Cloud Run container"
  type        = string
  default     = "2Gi"
}

variable "cloud_run_allow_unauthenticated" {
  description = "Allow unauthenticated access to Cloud Run (traffic comes via load balancer)"
  type        = bool
  default     = false
}

# ------------------------------------------------------------------------------
# CDN & Load Balancer Configuration
# ------------------------------------------------------------------------------
variable "cdn_domain" {
  description = "The primary domain name for the HTTPS load balancer and SSL certificate"
  type        = string
  default     = "app.alticode.studio"
}

variable "cdn_cors_origins" {
  description = "Allowed CORS origins for the frontend assets bucket"
  type        = list(string)
  default     = ["https://app.alticode.studio"]
}

# ------------------------------------------------------------------------------
# WAF Geo-Blocking Configuration
# ------------------------------------------------------------------------------
variable "waf_blocked_countries" {
  description = "List of ISO 3166-1 alpha-2 country codes to block via Cloud Armor geo-blocking (e.g., ['CN', 'RU'])"
  type        = list(string)
  default     = []
}

# ------------------------------------------------------------------------------
# Workstream 4: Security Deepening
# ------------------------------------------------------------------------------
variable "gcp_project_number" {
  description = "The numeric GCP project number (not the project ID). Required for VPC Service Controls resource scoping."
  type        = string
  default     = ""
}

variable "enable_binary_authorization" {
  description = "Enable Binary Authorization to enforce attestation-gated container deployments via Cloud Build"
  type        = bool
  default     = false
}

# ------------------------------------------------------------------------------
# AI-Layer Configuration
# ------------------------------------------------------------------------------
variable "vertex_ai_search_datastore_id" {
  description = "Discovery Engine data store ID for code search RAG"
  type        = string
  default     = "alti-code-search"
}

variable "vertex_ai_tensorboard_enabled" {
  description = "Enable Vertex AI Tensorboard for experiment tracking"
  type        = bool
  default     = true
}

variable "vertex_ai_feature_store_min_nodes" {
  description = "Minimum Bigtable nodes for Feature Online Store"
  type        = number
  default     = 1
}

variable "vertex_ai_feature_store_max_nodes" {
  description = "Maximum Bigtable nodes for Feature Online Store auto-scaling"
  type        = number
  default     = 3
}

# ------------------------------------------------------------------------------
# Deployment Mode Configuration
# ------------------------------------------------------------------------------
variable "deployment_mode" {
  description = "Primary deployment mode: 'cloud' (SaaS), 'byoc' (enterprise), 'airgap' (classified)"
  type        = string
  default     = "cloud"

  validation {
    condition     = contains(["cloud", "byoc", "airgap"], var.deployment_mode)
    error_message = "deployment_mode must be one of: cloud, byoc, airgap"
  }
}

variable "enable_governance_module" {
  description = "Enable the governance module (org policies, audit logging, budget alerts)"
  type        = bool
  default     = true
}

variable "enable_control_plane" {
  description = "Enable the SaaS control plane for multi-tenant management"
  type        = bool
  default     = false
}

# ------------------------------------------------------------------------------
# Security: Cloud Armor & VPC Service Controls
# ------------------------------------------------------------------------------
variable "enable_vpc_sc" {
  description = "Enable VPC Service Controls for data exfiltration prevention"
  type        = bool
  default     = false
}

variable "trusted_ip_ranges" {
  description = "Trusted IP CIDR ranges for VPC-SC access levels"
  type        = list(string)
  default     = []
}

variable "vpc_sc_allowed_ip_ranges" {
  description = "Allowed IP ranges for VPC Service Controls"
  type        = list(string)
  default     = []
}

variable "vpc_sc_allowed_members" {
  description = "Allowed IAM members for VPC Service Controls"
  type        = list(string)
  default     = []
}

# ------------------------------------------------------------------------------
# Observability: Monitoring, Logging, Uptime
# ------------------------------------------------------------------------------
variable "ops_email" {
  description = "Email address for operational alert notifications"
  type        = string
  default     = "ops@alticode.studio"
}

variable "backend_domain" {
  description = "Backend domain for uptime checks"
  type        = string
  default     = "api.alticode.studio"
}

variable "frontend_domain" {
  description = "Frontend domain for uptime checks"
  type        = string
  default     = "app.alticode.studio"
}

# ------------------------------------------------------------------------------
# DNS Configuration
# ------------------------------------------------------------------------------
variable "domain_name" {
  description = "Root domain name for DNS zone"
  type        = string
  default     = "alticode.studio"
}

variable "frontend_lb_ip" {
  description = "Frontend load balancer IP address for DNS A record"
  type        = string
  default     = ""
}

variable "backend_lb_ip" {
  description = "Backend load balancer IP address for DNS A record"
  type        = string
  default     = ""
}

# ------------------------------------------------------------------------------
# CDN & Load Balancing
# ------------------------------------------------------------------------------
variable "cdn_api_domain" {
  description = "API subdomain for backend routing"
  type        = string
  default     = "api.alticode.studio"
}

variable "frontend_bucket_name" {
  description = "GCS bucket name for frontend static assets"
  type        = string
  default     = "alti-frontend-assets"
}

variable "cloud_run_neg_name" {
  description = "Name of the Cloud Run network endpoint group for the backend"
  type        = string
  default     = "alti-backend-neg"
}
