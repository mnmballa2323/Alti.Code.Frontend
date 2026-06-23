# ==============================================================================
# ALTI CODE STUDIO: Azure Monitor & Log Analytics Observability Module
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
# 1. Log Analytics Workspace
# ------------------------------------------------------------------------------
resource "azurerm_log_analytics_workspace" "workspace" {
  name                = "alti-logs-${var.customer_id}-${var.environment}"
  location            = var.location
  resource_group_name = var.resource_group_name
  sku                 = "PerGB2018"
  retention_in_days   = var.environment == "prod" ? 90 : 30
}

# ------------------------------------------------------------------------------
# 2. Diagnostic Settings for Compute/Service nodes (Dynamic Association)
# ------------------------------------------------------------------------------
resource "azurerm_monitor_diagnostic_setting" "audit_diagnostics" {
  for_each                   = toset(var.target_resource_ids)
  name                       = "alti-audit-logs-${var.environment}"
  target_resource_id         = each.value
  log_analytics_workspace_id = azurerm_log_analytics_workspace.workspace.id

  # Dynamically routes logs (e.g. administrative/security audits)
  enabled_log {
    category_group = "allLogs"
  }

  metric {
    category = "AllMetrics"
    enabled  = true
  }
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

variable "target_resource_ids" {
  type        = list(string)
  default     = []
  description = "List of Azure Resource IDs to associate with diagnostic logging"
}

# ------------------------------------------------------------------------------
# Outputs
# ------------------------------------------------------------------------------
output "log_analytics_workspace_id" {
  value       = azurerm_log_analytics_workspace.workspace.id
  description = "The ID of the Log Analytics Workspace"
}

output "log_analytics_workspace_primary_key" {
  value       = azurerm_log_analytics_workspace.workspace.primary_shared_key
  sensitive   = true
  description = "The Shared Key of the Log Analytics Workspace"
}
