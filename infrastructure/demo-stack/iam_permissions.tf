# ==============================================================================
# INSO CODE - SOVEREIGN CONTROL PANEL IAM PERMISSIONS (MULTI-CLOUD)
# ==============================================================================
# This file codifies the exact roles and permissions the OpenStack
# Control Panel requires to dynamically provision tenant resources on AWS, GCP, and Azure.

# ------------------------------------------------------------------------------
# 1. AWS IAM Role (for EC2/EKS provisioning)
# ------------------------------------------------------------------------------
resource "aws_iam_role" "inso_control_panel_role" {
  name = "inso-control-panel-orchestrator"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ec2.amazonaws.com"
        }
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "inso_aws_admin" {
  role       = aws_iam_role.inso_control_panel_role.name
  policy_arn = "arn:aws:iam::aws:policy/AdministratorAccess"
  # Note: For strict FedRAMP, scope this down to exact EC2/VPC permissions in production.
}

# ------------------------------------------------------------------------------
# 2. GCP Service Account (for Compute/GKE provisioning)
# ------------------------------------------------------------------------------
resource "google_service_account" "inso_control_panel_sa" {
  account_id   = "inso-control-panel"
  display_name = "Inso Code Control Panel Orchestrator"
}

resource "google_project_iam_member" "inso_gcp_editor" {
  project = var.gcp_project_id
  role    = "roles/editor"
  member  = "serviceAccount:${google_service_account.inso_control_panel_sa.email}"
}

# ------------------------------------------------------------------------------
# 3. Azure Service Principal (for VMs/AKS provisioning)
# ------------------------------------------------------------------------------
data "azuread_client_config" "current" {}

resource "azuread_application" "inso_control_panel_app" {
  display_name = "inso-control-panel-orchestrator"
  owners       = [data.azuread_client_config.current.object_id]
}

resource "azuread_service_principal" "inso_control_panel_sp" {
  client_id                    = azuread_application.inso_control_panel_app.client_id
  app_role_assignment_required = false
  owners                       = [data.azuread_client_config.current.object_id]
}

resource "azurerm_role_assignment" "inso_azure_contributor" {
  scope                = "/subscriptions/${var.azure_subscription_id}"
  role_definition_name = "Contributor"
  principal_id         = azuread_service_principal.inso_control_panel_sp.object_id
}
