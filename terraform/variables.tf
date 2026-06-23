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

variable "azure_government_secret_region" {
  description = "Azure Region for Government Secret Cloud (IL6) deployment"
  type        = string
  default     = "usgovvirginia"
}

variable "azure_government_top_secret_region" {
  description = "Azure Region for Government Top Secret (Air-Gap) deployment"
  type        = string
  default     = "usgovvirginia"
}

variable "ssh_public_key_path" {
  description = "File path to the SSH public key for VM access"
  type        = string
  default     = "~/.ssh/id_rsa.pub"
}

variable "stack_hub_domain" {
  description = "Custom DNS domain assigned to local Azure Stack Hub (IL6/Air-Gap)"
  type        = string
  default     = "stack.local"
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

variable "subscription_id_government_secret" {
  description = "Subscription ID for Government Secret (IL6 Classified) deployment"
  type        = string
  default     = "33333333-3333-3333-3333-333333333333"
}

variable "subscription_id_government_top_secret" {
  description = "Subscription ID for Government Top Secret (IL6 Air-Gap) deployment"
  type        = string
  default     = "44444444-4444-4444-4444-444444444444"
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
