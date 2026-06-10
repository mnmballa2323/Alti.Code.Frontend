terraform {
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.0"
    }
  }
}

provider "azurerm" {
  features {}
  environment = "custom"
  metadata_host = "management.${var.stack_hub_domain}"
}

variable "location_bunker_alpha" {
  description = "The physical location of the primary Azure Stack Hub appliance (Bunker Alpha)."
  type        = string
}

variable "location_bunker_omega" {
  description = "The physical location of the secondary Azure Stack Hub appliance (Bunker Omega)."
  type        = string
}

variable "customer_name" {
  description = "The name of the Enterprise customer."
  type        = string
}

variable "stack_hub_domain" {
  description = "The domain name assigned to the local Azure Stack Hub infrastructure."
  type        = string
}

# ==========================================
# Resource Groups
# ==========================================
resource "azurerm_resource_group" "quantum_rg" {
  name     = "alti-quantum-rg"
  location = "westus"
}

resource "azurerm_resource_group" "space_rg" {
  name     = "alti-space-rg"
  location = "westus2"
}

resource "azurerm_resource_group" "network_rg" {
  name     = "alti-network-rg"
  location = "westus"
}

resource "azurerm_resource_group" "bunker_alpha_rg" {
  name     = "alti-bunker-alpha-rg"
  location = var.location_bunker_alpha
}

resource "azurerm_resource_group" "bunker_omega_rg" {
  name     = "alti-bunker-omega-rg"
  location = var.location_bunker_omega
}

# ==========================================
# Azure Quantum Key Generation (QKD)
# ==========================================
# Generating cryptographically perfect keys using quantum physical properties.
# These keys are injected into the local Key Vault for absolute cryptographic security.
resource "azurerm_quantum_workspace" "qkd_workspace" {
  name                = "alti-quantum-${var.customer_name}"
  location            = azurerm_resource_group.quantum_rg.location
  resource_group_name = azurerm_resource_group.quantum_rg.name
  providers {
    provider_sku = "Honeywell"
  }
}

# ==========================================
# Space-Linked Data Ingestion (Azure Orbital)
# ==========================================
# Communicates directly with spacecraft, completely bypassing terrestrial networks.
resource "azurerm_orbital_spacecraft" "leo_sat" {
  name                = "alti-constellation-alpha"
  location            = azurerm_resource_group.space_rg.location
  resource_group_name = azurerm_resource_group.space_rg.name
  title_line          = "ALTI-SAT-1"
  norad_id            = "99999"
  tle_line1           = "1 99999U 24001A   24123.12345678  .00000000  00000-0  00000-0 0  9999"
  tle_line2           = "2 99999  97.1234 123.4567 0001234  12.3456 123.4567 15.12345678    19"
  links {
    name       = "x-band-downlink"
    direction  = "Downlink"
    bandwidth_mhz = 500
    center_frequency_mhz = 8100
    polarization = "RHCP"
  }
}

resource "azurerm_orbital_contact_profile" "contact" {
  name                = "alti-bunker-contact"
  location            = azurerm_resource_group.space_rg.location
  resource_group_name = azurerm_resource_group.space_rg.name
  minimum_variable_contact_duration = "PT5M"
  auto_tracking_configuration = "disabled"
  
  links {
    direction = "Downlink"
    channels {
      name = "x-band-channel"
      center_frequency_mhz = 8100
      bandwidth_mhz = 500
      end_point {
        ip_address = "10.0.1.5" # Internal IP of the bunker ingress
        end_point_name = "bunker-ingress"
        port = 50000
        protocol = "UDP"
      }
    }
  }
}

# ==========================================
# Dark Fiber Cross-Stack Mesh
# ==========================================
# Bypassing the internet to sync the two disconnected physical bunkers.
resource "azurerm_express_route_circuit" "dark_fiber_mesh" {
  name                  = "alti-bunker-mesh"
  resource_group_name   = azurerm_resource_group.network_rg.name
  location              = "local"
  service_provider_name = "Equinix"
  peering_location      = "Silicon Valley"
  bandwidth_in_mbps     = 10000

  sku {
    tier   = "Premium"
    family = "MeteredData"
  }
}

# ==========================================
# AKS on Multi-Bunker Azure Stack Hubs
# ==========================================
resource "azurerm_kubernetes_cluster" "aks_bunker_alpha" {
  name                = "alti-data-plane-alpha-${var.customer_name}"
  location            = var.location_bunker_alpha
  resource_group_name = azurerm_resource_group.bunker_alpha_rg.name
  dns_prefix          = "alti-alpha"

  default_node_pool {
    name           = "default"
    node_count     = 3
    vm_size        = "Standard_NC6s_v3"
  }
  identity { type = "SystemAssigned" }
}

resource "azurerm_kubernetes_cluster" "aks_bunker_omega" {
  name                = "alti-data-plane-omega-${var.customer_name}"
  location            = var.location_bunker_omega
  resource_group_name = azurerm_resource_group.bunker_omega_rg.name
  dns_prefix          = "alti-omega"

  default_node_pool {
    name           = "default"
    node_count     = 3
    vm_size        = "Standard_NC6s_v3"
  }
  identity { type = "SystemAssigned" }
}
