# ==============================================================================
# ALTI CODE STUDIO: Azure Sovereign Cloud Terraform Variables
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

variable "azure_commercial_region" {
  description = "Azure Region for Commercial Cloud (IL2) deployment"
  type        = string
  default     = "eastus"
}

variable "azure_government_region" {
  description = "Azure Region for Government Cloud (IL4/IL5) deployment"
  type        = string
  default     = "usgovvirginia"
}

variable "ssh_public_key_path" {
  description = "File path to the SSH public key for VM access"
  type        = string
  default     = "~/.ssh/id_rsa.pub"
}

variable "tenant_id" {
  description = "The Azure AD/Entra ID Directory Tenant ID"
  type        = string
  default     = "00000000-0000-0000-0000-000000000000"

  validation {
    condition     = can(regex("^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$", var.tenant_id))
    error_message = "The tenant_id value must be a valid UUID format (e.g., 00000000-0000-0000-0000-000000000000)."
  }
}

variable "subscription_id_commercial" {
  description = "Subscription ID for Commercial Cloud (IL2) deployment"
  type        = string
  default     = "11111111-1111-1111-1111-111111111111"

  validation {
    condition     = can(regex("^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$", var.subscription_id_commercial))
    error_message = "The subscription_id_commercial value must be a valid UUID format."
  }
}

variable "subscription_id_government" {
  description = "Subscription ID for Government Cloud (IL4/IL5) deployment"
  type        = string
  default     = "22222222-2222-2222-2222-222222222222"

  validation {
    condition     = can(regex("^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$", var.subscription_id_government))
    error_message = "The subscription_id_government value must be a valid UUID format."
  }
}

variable "pg_admin_username" {
  description = "Administrator login for PostgreSQL Flexible Server"
  type        = string
  default     = "altipgadmin"
}

variable "pg_admin_password" {
  description = "Administrator password for PostgreSQL Flexible Server"
  type        = string
  default     = "P@ssw0rd1234!" # Avoid using default password in live environments
  sensitive   = true

  validation {
    condition     = length(var.pg_admin_password) >= 8 && length(var.pg_admin_password) <= 128
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
variable "enable_azure_cloud" {
  description = "Deploy the Azure Cloud tier (commercial multi-tenant VM)"
  type        = bool
  default     = true
}

variable "enable_azure_dedicated" {
  description = "Deploy the Azure Dedicated tier (commercial VM on dedicated host)"
  type        = bool
  default     = false
}

variable "enable_azure_government" {
  description = "Deploy the Azure Government tier (government VM)"
  type        = bool
  default     = false
}

variable "admin_source_ip_range" {
  description = "The CIDR or IP range allowed to SSH into the commercial nodes (default permits all)"
  type        = string
  default     = "*"
}

# ------------------------------------------------------------------------------
# Resource Sizing & SKUs
# ------------------------------------------------------------------------------
variable "vm_size_commercial" {
  description = "VM size for Commercial Cloud VM"
  type        = string
  default     = "Standard_D8s_v5"
}

variable "vm_size_dedicated" {
  description = "VM size for Dedicated VM"
  type        = string
  default     = "Standard_D8s_v5"
}

variable "vm_size_government" {
  description = "VM size for Government VM"
  type        = string
  default     = "Standard_D8s_v5"
}

variable "dedicated_host_sku" {
  description = "The SKU for Azure Dedicated Host"
  type        = string
  default     = "Dsv5-Type1"
}

variable "pg_db_sku_name" {
  description = "The SKU for PostgreSQL Flexible Server"
  type        = string
  default     = "GP_Standard_D4ds_v5"
}

variable "redis_cache_sku" {
  description = "The SKU for Redis Cache (Basic, Standard, Premium)"
  type        = string
  default     = "Standard"
}

variable "redis_cache_capacity" {
  description = "The capacity size for Redis Cache"
  type        = number
  default     = 1
}

variable "redis_cache_family" {
  description = "The SKU family for Redis Cache (C for Basic/Standard, P for Premium)"
  type        = string
  default     = "C"
}



