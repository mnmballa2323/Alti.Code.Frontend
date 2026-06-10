variable "openstack_auth_url" {
  description = "OpenStack Identity API endpoint (e.g., Liberty Center One Keystone)"
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

# ==========================================
# OpenStack Liberty Center One Configurations
# ==========================================

variable "openstack_external_network_aws_id" {
  description = "The UUID of the physical AWS direct connect fiber network in Liberty Center One"
  type        = string
  default     = "physical-aws-fiber-net-id"
}

variable "openstack_external_network_azure_id" {
  description = "The UUID of the physical Azure expressroute fiber network in Liberty Center One"
  type        = string
  default     = "physical-azure-fiber-net-id"
}

variable "openstack_external_network_gcp_id" {
  description = "The UUID of the physical GCP interconnect fiber network in Liberty Center One"
  type        = string
  default     = "physical-gcp-fiber-net-id"
}

variable "openstack_magnum_template_id" {
  description = "The UUID or name of the Magnum cluster template in Liberty Center One"
  type        = string
  default     = "magnum-template-id"
}

variable "openstack_baremetal_flavor" {
  description = "The compute flavor for the bare-metal GPU nodes in Liberty Center One"
  type        = string
  default     = "baremetal.cyborg.h100"
}
