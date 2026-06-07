# Azure Air-Gap Lifecycle Management
# - Azure Data Box for physical model weight syncing
# - Azure Arc (Disconnected Mode) for local cluster state management

provider "azurerm" {
  features {}
}

# ==========================================
# Physical Weight Transfer (Azure Data Box)
# ==========================================
# Requests a physical Azure Data Box Disk to be mailed to the customer,
# containing the latest AI models for import into Azure Stack Hub.
resource "azurerm_databox_job" "model_weight_sync" {
  name                = "alti-databox-weights-sync"
  resource_group_name = "alti-logistics-rg"
  location            = "eastus"
  sku                 = "DataBoxDisk" # Ships 8TB encrypted disks
  
  transfer_type       = "ImportToAzure"

  contact_details {
    contact_name  = "Alti Classified Logistics"
    phone         = "555-0100"
    email_list    = ["logistics@alticodestudio.com"]
  }

  shipping_address {
    street_address1 = "Classified Customer Bunker"
    city            = "Ashburn"
    state_or_province = "VA"
    country         = "US"
    postal_code     = "20147"
  }

  # Data will be dumped into a local storage account on Azure Stack Hub
  destination_account_id = "/subscriptions/sub-id/resourceGroups/rg/providers/Microsoft.Storage/storageAccounts/altiofflinestorage"
}

# ==========================================
# Disconnected GitOps (Azure Arc)
# ==========================================
# Represents an AKS cluster running on Azure Stack Hub completely severed from the internet
resource "azurerm_arc_kubernetes_cluster" "disconnected_cluster" {
  name                = "alti-disconnected-aks"
  resource_group_name = "alti-airgap-rg"
  location            = "eastus"
  
  # Crucial: Agent only operates locally. 
  # No outbound telemetry is sent to Azure Resource Manager.
  agent_public_key_certificate = file("base64-cert.pem")
  
  tags = {
    Environment = "Air-Gapped"
    Management  = "Local-Arc-Only"
  }
}

# Configures the local cluster to pull updates ONLY from an internal, mathematically verified Git repository
resource "azurerm_arc_kubernetes_cluster_extension" "flux_disconnected" {
  name           = "flux-local-sync"
  cluster_id     = azurerm_arc_kubernetes_cluster.disconnected_cluster.id
  extension_type = "microsoft.flux"

  configuration_settings = {
    "sourceControlConfiguration.repositoryUrl" = "git://local-bunker-gitea.internal/alti-state.git"
    "sourceControlConfiguration.operatorScope" = "cluster"
    "sourceControlConfiguration.enableHelmOperator" = "true"
  }
}
