# ==============================================================================
# ALTI CODE STUDIO: Azure FinOps Cost Controls Module
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
# 1. Monitor Action Group for Billing Alerts
# ------------------------------------------------------------------------------
resource "azurerm_monitor_action_group" "billing_alert_group" {
  name                = "alti-billing-${var.customer_id}-${var.environment}"
  resource_group_name = var.resource_group_name
  short_name          = "billingalert"

  email_receiver {
    name                    = "billing-admins"
    email_address           = var.billing_contact_email
    use_common_alert_schema = true
  }
}

# ------------------------------------------------------------------------------
# 2. Consumption Budget for Resource Group
# ------------------------------------------------------------------------------
resource "azurerm_consumption_budget_resource_group" "budget" {
  name              = "alti-budget-${var.customer_id}-${var.environment}"
  resource_group_id = var.resource_group_id

  amount     = var.budget_amount
  time_grain = "Monthly"

  time_period {
    start_date = formatdate("YYYY-MM-01'T'00:00:00Z", timestamp())
    end_date   = formatdate("YYYY-MM-01'T'00:00:00Z", timeadd(timestamp(), "8760h")) # ~1 Year out
  }

  notification {
    enabled   = true
    threshold = 80
    operator  = "GreaterThan"

    contact_groups = [
      azurerm_monitor_action_group.billing_alert_group.id
    ]
  }

  notification {
    enabled   = true
    threshold = 100
    operator  = "GreaterThan"

    contact_groups = [
      azurerm_monitor_action_group.billing_alert_group.id
    ]
  }

  # Prevent resource creation or modification changes when dynamic evaluation triggers
  lifecycle {
    ignore_changes = [
      time_period
    ]
  }
}

# ------------------------------------------------------------------------------
# Variables
# ------------------------------------------------------------------------------
variable "customer_id" {
  type        = string
  description = "Unique identifier for the customer/tenant to ensure naming uniqueness"
}
variable "environment" { type = string }
variable "resource_group_name" { type = string }
variable "resource_group_id" { type = string }
variable "billing_contact_email" {
  type    = string
  default = "finops@alticodestudio.com"
}
variable "budget_amount" {
  type    = number
  default = 5000
}

