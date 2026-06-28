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
  default     = "e2-standard-8"
}

variable "machine_type_government" {
  description = "GCP Machine Type for Government VM"
  type        = string
  default     = "e2-standard-8"
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
