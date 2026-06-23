# ==============================================================================
# ALTI CODE STUDIO: Azure AD Federated Workload Identity Module
# ==============================================================================

terraform {
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.0"
    }
  }
}

# ------------------------------------------------------------------------------
# 1. User Assigned Managed Identity for GitHub Actions CI/CD
# ------------------------------------------------------------------------------
resource "azurerm_user_assigned_identity" "cicd_identity" {
  name                = "alti-git-${var.customer_id}-${var.environment}"
  location            = var.location
  resource_group_name = var.resource_group_name
}

# ------------------------------------------------------------------------------
# 2. Federated Identity Credentials mapping to GitHub Actions OIDC
# ------------------------------------------------------------------------------
resource "azurerm_federated_identity_credential" "github_federation" {
  name                = "alti-fed-${var.customer_id}-${var.environment}"
  resource_group_name = var.resource_group_name
  audience            = ["api://AzureADTokenExchange"]
  issuer              = "https://token.actions.githubusercontent.com"
  parent_id           = azurerm_user_assigned_identity.cicd_identity.id
  subject             = "repo:${var.github_repository}:environment:${var.environment}"
}

# ------------------------------------------------------------------------------
# Variables
# ------------------------------------------------------------------------------
variable "customer_id" {
  type        = string
  description = "Unique identifier for the customer/tenant to ensure naming uniqueness"
}

variable "environment" {
  type        = string
  description = "Deployment environment (e.g. prod, staging)"
}


variable "location" {
  type        = string
  description = "Azure region where resources will be created"
}

variable "resource_group_name" {
  type        = string
  description = "Name of the resource group"
}

variable "github_repository" {
  type        = string
  description = "The GitHub repository path in format ORG/REPO (e.g., mnmballa2323/alti.code.studio)"
}

# ------------------------------------------------------------------------------
# Outputs
# ------------------------------------------------------------------------------
output "client_id" {
  value       = azurerm_user_assigned_identity.cicd_identity.client_id
  description = "Client ID of the User Assigned Identity for authentication"
}

output "principal_id" {
  value       = azurerm_user_assigned_identity.cicd_identity.principal_id
  description = "Principal ID of the User Assigned Identity for role assignments"
}
