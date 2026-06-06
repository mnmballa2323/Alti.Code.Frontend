variable "openstack_auth_url" {
  description = "OpenStack Identity API endpoint (e.g., Liberty Center One Keyston)"
  type        = string
}

variable "openstack_tenant_id" {
  description = "OpenStack Project/Tenant ID"
  type        = string
}

variable "openstack_region" {
  description = "OpenStack Region"
  type        = string
  default     = "RegionOne"
}

variable "gcp_project_id" {
  description = "The GCP Project ID for Vertex AI"
  type        = string
}

variable "gcp_region" {
  description = "The GCP Region for Vertex AI (e.g., us-central1)"
  type        = string
  default     = "us-central1"
}

variable "aws_region" {
  description = "The AWS Region for Bedrock"
  type        = string
  default     = "us-east-1"
}

variable "azure_subscription_id" {
  description = "The Azure Subscription ID for Azure Foundry / OpenAI"
  type        = string
}


variable "environment" {
  description = "Deployment environment (e.g., prod, staging)"
  type        = string
  default     = "prod"
}

# Stripe API Keys (Injected into Secret Manager)
variable "stripe_secret_key" {
  type      = string
  sensitive = true
}

variable "stripe_webhook_secret_key" {
  type      = string
  sensitive = true
}

# GitHub Integration
variable "github_repository" {
  description = "The GitHub repository for Workload Identity Federation (e.g. mnmballa2323/alti.code.studio)"
  type        = string
  default     = "mnmballa2323/alti.code.studio"
}
