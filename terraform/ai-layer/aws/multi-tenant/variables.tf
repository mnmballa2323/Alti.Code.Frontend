terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
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

variable "aws_region" {
  description = "The AWS region for Bedrock resources"
  type        = string
  default     = "us-east-1"
}

variable "aws_profile" {
  description = "The AWS CLI profile to use for authentication"
  type        = string
  default     = "default"
}
