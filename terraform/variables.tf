variable "project_id" {
  description = "The GCP Project ID"
  type        = string
}

variable "region" {
  description = "The GCP Region (e.g., us-central1)"
  type        = string
  default     = "us-central1"
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
