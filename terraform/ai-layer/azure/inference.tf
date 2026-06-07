# Azure AI Hardware & Hybrid Quantum Architecture
# - Azure NDm H100 v5 Supercomputing instances
# - Azure Quantum Workspace for Quantum-Inspired Optimization

provider "azurerm" {
  features {}
}

# ==========================================
# AKS Node Pool: NVIDIA H100 Supercomputing
# ==========================================
resource "azurerm_kubernetes_cluster_node_pool" "h100_nodes" {
  name                  = "h100v5pool"
  kubernetes_cluster_id = "/subscriptions/sub-id/resourcegroups/rg/providers/Microsoft.ContainerService/managedClusters/alti-aks-cluster"
  
  # Standard_ND96isr_H100_v5: 8x NVIDIA H100 GPUs with Quantum-2 InfiniBand
  vm_size               = "Standard_ND96isr_H100_v5"
  
  node_count            = 1
  min_count             = 1
  max_count             = 4
  enable_auto_scaling   = true

  os_type               = "Linux"
  os_sku                = "Ubuntu" # Required for NVIDIA drivers

  node_labels = {
    "accelerator"       = "nvidia-h100"
    "infiniband"        = "enabled"
    "alti.code.studio"  = "ai-inference-engine"
  }

  node_taints = [
    "sku=gpu:NoSchedule"
  ]

  tags = {
    Environment = "AI-Supercomputing"
  }
}

# ==========================================
# Azure Quantum Workspace
# ==========================================
resource "azurerm_quantum_workspace" "alti_quantum" {
  name                = "alti-quantum-workspace"
  location            = "eastus"
  resource_group_name = "alti-ai-rg"

  providers {
    provider_sku = "qci.quantum-inspired" # Microsoft Quantum-Inspired Optimization
  }

  providers {
    provider_sku = "quantinuum.qpu" # Quantinuum Ion-Trap QPU
  }

  tags = {
    Purpose = "Algorithmic Code Generation & Refactoring"
  }
}

# ==========================================
# Managed Identity Role Assignment
# ==========================================
# Allow AKS to submit jobs to Azure Quantum
resource "azurerm_role_assignment" "aks_to_quantum" {
  scope                = azurerm_quantum_workspace.alti_quantum.id
  role_definition_name = "Quantum Workspace Contributor"
  principal_id         = "aks-managed-identity-object-id" # Replaced dynamically
}
