# GCP Air-Gap Lifecycle Management
# - Google Transfer Appliance for physical model weight syncing
# - Anthos Config Management (Offline Mode) for local cluster state management

provider "google" {
  project = "alti-code-studio-prod"
  region  = "us-central1"
}

# ==========================================
# Physical Weight Transfer (Transfer Appliance)
# ==========================================
# Provisions a Google Transfer Appliance (a high-capacity ruggedized server)
# to physically move 300TB+ of AI models into the GDC Hosted bunker.
resource "google_datatransfer_appliance" "model_weight_sync" {
  project     = "alti-code-studio-prod"
  description = "Alti Code Studio AI Weight Transfer"
  
  # TA300 is a 300TB capacity physical appliance
  appliance_model = "TA300"
  
  contact_email   = "logistics@alticodestudio.com"
  
  shipping_address {
    name           = "Alti Classified Logistics"
    address_line_1 = "Classified Customer Bunker"
    city           = "Ashburn"
    state          = "VA"
    zip_code       = "20147"
    country        = "US"
  }
}

# ==========================================
# Disconnected GitOps (Anthos Config Management)
# ==========================================
# Enables the Anthos Config Management feature on the GDC Hosted (Air-Gapped) cluster
resource "google_gke_hub_feature" "configmanagement" {
  name     = "configmanagement"
  location = "global"
}

# Configures Anthos Config Management strictly for offline mode
resource "google_gke_hub_feature_membership" "offline_acm" {
  location   = "global"
  feature    = google_gke_hub_feature.configmanagement.name
  membership = "projects/alti-code-studio-prod/locations/global/memberships/alti-gdc-cluster"

  configmanagement {
    version = "1.16.0"
    
    config_sync {
      # Pulls exclusively from a local Git server inside the bunker
      git {
        sync_repo   = "https://local-bunker-gitea.internal/alti-state.git"
        sync_branch = "main"
        policy_dir  = "config"
        secret_type = "none" # Assumes internal MTLS authentication
      }
      # Prevents ACM from attempting to phone home to Google Cloud metrics
      metrics_gcp_service_account_email = ""
    }
  }
}
