# ==============================================================================
# ALTI CODE STUDIO: Azure Sovereign Cloud Terraform Variables
# ==============================================================================

variable "customer_id" {
  description = "Unique identifier for the customer/tenant"
  type        = string
  default     = "generic-tenant"
}

variable "environment" {
  description = "Deployment environment (e.g., prod, staging, dev)"
  type        = string
  default     = "prod"
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
}

variable "subscription_id_commercial" {
  description = "Subscription ID for Commercial Cloud (IL2) deployment"
  type        = string
  default     = "11111111-1111-1111-1111-111111111111"
}

variable "subscription_id_government" {
  description = "Subscription ID for Government Cloud (IL4/IL5) deployment"
  type        = string
  default     = "22222222-2222-2222-2222-222222222222"
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
}

variable "github_repository" {
  description = "The GitHub repository path in format ORG/REPO"
  type        = string
  default     = "mnmballa2323/alti.code.studio"
}
