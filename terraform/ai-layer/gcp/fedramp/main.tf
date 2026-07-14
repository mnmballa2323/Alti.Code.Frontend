# GCP Assured Workloads Provider Restrictions
provider "google" {
  region = "us-central1"
}

# Assured Workloads enforce compliance regimes at the folder level
resource "google_assured_workloads_workload" "fedramp_workload" {
  compliance_regime = "FEDRAMP_HIGH"
  display_name      = "fedramp-high-boundary"
  location          = "us-central1"
  organization      = var.gcp_organization_id
  billing_account   = var.gcp_billing_account

  provisioned_resources_parent = "folders/${var.gcp_fedramp_folder_id}"
}

variable "tenant_id" {
  type        = string
  description = "Tenant ID for GCP Assured Workload deployment"
}

variable "gcp_organization_id" {
  type = string
}

variable "gcp_billing_account" {
  type = string
}

variable "gcp_fedramp_folder_id" {
  type = string
}
