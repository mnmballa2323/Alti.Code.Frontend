terraform {
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.0"
    }
  }
}

variable "environment" {
  description = "Deployment environment (prod, staging, dev)"
  type        = string
  default     = "prod"
}

variable "deployment_tier" {
  description = "The AI infrastructure deployment tier"
  type        = string
  default     = "multi-tenant"

  validation {
    condition     = contains(["multi-tenant", "single-tenant", "fedramp"], var.deployment_tier)
    error_message = "deployment_tier must be one of: multi-tenant, single-tenant, fedramp."
  }
}

variable "azure_subscription_id" {
  description = "The Azure Subscription ID for AI Foundry resources"
  type        = string
  default     = ""
}

variable "azure_location" {
  description = "The Azure region for OpenAI resources"
  type        = string
  default     = "eastus"
}
