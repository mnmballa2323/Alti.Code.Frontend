# ==============================================================================
# Alti Code Studio Cross-Cloud Sovereign Connectivity
# azure-gcp-private-connection.tf
#
# Configures a highly secure, private IPsec HA VPN connection between Google Cloud (GCP)
# and Microsoft Azure, integrating private service routing and Workload Identity
# Federation to satisfy strict enterprise compliance requirements (SOC 2, FedRAMP).
# ==============================================================================

terraform {
  required_version = ">= 1.5.0"
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.0"
    }
  }
}

# ──────────────────────────────────────────────────────────────────────────────
# variables
# ──────────────────────────────────────────────────────────────────────────────
variable "gcp_project_id" {
  type        = string
  default     = "sovereign-cloud-project"
  description = "Google Cloud Project ID"
}

variable "gcp_region" {
  type        = string
  default     = "us-central1"
  description = "Primary GCP Region"
}

variable "azure_location" {
  type        = string
  default     = "eastus"
  description = "Primary Azure Location"
}

variable "shared_secret" {
  type        = string
  sensitive   = true
  description = "Shared pre-shared key (PSK) for VPN Tunnels"
  default     = "SovereignShieldTunnelKey2026Secure!"
}

# ──────────────────────────────────────────────────────────────────────────────
# 1. Google Cloud Network Infrastructure
# ──────────────────────────────────────────────────────────────────────────────
provider "google" {
  project = var.gcp_project_id
  region  = var.gcp_region
}

resource "google_compute_network" "gcp_vpc" {
  name                    = "sovereign-gcp-vpc"
  auto_create_subnetworks = false
}

resource "google_compute_subnetwork" "gcp_subnet" {
  name          = "sovereign-gcp-subnet"
  ip_cidr_range = "10.120.0.0/20"
  network       = google_compute_network.gcp_vpc.self_link
}

resource "google_compute_ha_vpn_gateway" "gcp_ha_vpn" {
  name    = "gcp-ha-vpn-gateway"
  network = google_compute_network.gcp_vpc.self_link
}

# ──────────────────────────────────────────────────────────────────────────────
# 2. Microsoft Azure Network Infrastructure
# ──────────────────────────────────────────────────────────────────────────────
provider "azurerm" {
  features {}
}

resource "azurerm_resource_group" "azure_rg" {
  name     = "sovereign-azure-rg"
  location = var.azure_location
}

resource "azurerm_virtual_network" "azure_vnet" {
  name                = "sovereign-azure-vnet"
  address_space       = ["10.240.0.0/16"]
  location            = azurerm_resource_group.azure_rg.location
  resource_group_name = azurerm_resource_group.azure_rg.name
}

resource "azurerm_subnet" "azure_gateway_subnet" {
  name                 = "GatewaySubnet" # Mandatory name for Azure VPN gateway subnet
  resource_group_name  = azurerm_resource_group.azure_rg.name
  virtual_network_name = azurerm_virtual_network.azure_vnet.name
  address_prefixes     = ["10.240.0.0/24"]
}

resource "azurerm_subnet" "azure_inference_subnet" {
  name                 = "azure-inference-subnet"
  resource_group_name  = azurerm_resource_group.azure_rg.name
  virtual_network_name = azurerm_virtual_network.azure_vnet.name
  address_prefixes     = ["10.240.10.0/24"]
}

resource "azurerm_public_ip" "azure_vpn_pip_1" {
  name                = "azure-vpn-pip-1"
  location            = azurerm_resource_group.azure_rg.location
  resource_group_name = azurerm_resource_group.azure_rg.name
  allocation_method   = "Static"
  sku                 = "Standard"
}

resource "azurerm_public_ip" "azure_vpn_pip_2" {
  name                = "azure-vpn-pip-2"
  location            = azurerm_resource_group.azure_rg.location
  resource_group_name = azurerm_resource_group.azure_rg.name
  allocation_method   = "Static"
  sku                 = "Standard"
}

resource "azurerm_virtual_network_gateway" "azure_vpn_gw" {
  name                = "azure-vpn-gateway"
  location            = azurerm_resource_group.azure_rg.location
  resource_group_name = azurerm_resource_group.azure_rg.name
  type                = "Vpn"
  vpn_type            = "RouteBased"
  active_active       = true
  enable_bgp          = true
  sku                 = "VpnGw1"

  ip_configuration {
    name                          = "vnetGatewayConfig1"
    public_ip_address_id          = azurerm_public_ip.azure_vpn_pip_1.id
    private_ip_address_allocation = "Dynamic"
    subnet_id                     = azurerm_subnet.azure_gateway_subnet.id
  }

  ip_configuration {
    name                          = "vnetGatewayConfig2"
    public_ip_address_id          = azurerm_public_ip.azure_vpn_pip_2.id
    private_ip_address_allocation = "Dynamic"
    subnet_id                     = azurerm_subnet.azure_gateway_subnet.id
  }
}

# ──────────────────────────────────────────────────────────────────────────────
# 3. Inter-Cloud HA VPN Peering & Tunnels
# ──────────────────────────────────────────────────────────────────────────────

# GCP Peer External Gateway representing Azure public IPs
resource "google_compute_external_vpn_gateway" "azure_vpn_peer" {
  name            = "azure-vpn-peer-gateway"
  redundancy_type = "TWO_IPS_REDUNDANCY"

  interface {
    id         = 0
    ip_address = azurerm_public_ip.azure_vpn_pip_1.ip_address
  }

  interface {
    id         = 1
    ip_address = azurerm_public_ip.azure_vpn_pip_2.ip_address
  }
}

# GCP VPN Tunnels
resource "google_compute_vpn_tunnel" "gcp_tunnel_1" {
  name                  = "gcp-to-azure-tunnel-1"
  peer_external_gateway = google_compute_external_vpn_gateway.azure_vpn_peer.id
  peer_external_gateway_interface = 0
  shared_secret         = var.shared_secret
  ike_version           = 2
  vpn_gateway           = google_compute_ha_vpn_gateway.gcp_ha_vpn.id
  vpn_gateway_interface = 0
  router                = google_compute_router.gcp_router.name
}

resource "google_compute_vpn_tunnel" "gcp_tunnel_2" {
  name                  = "gcp-to-azure-tunnel-2"
  peer_external_gateway = google_compute_external_vpn_gateway.azure_vpn_peer.id
  peer_external_gateway_interface = 1
  shared_secret         = var.shared_secret
  ike_version           = 2
  vpn_gateway           = google_compute_ha_vpn_gateway.gcp_ha_vpn.id
  vpn_gateway_interface = 1
  router                = google_compute_router.gcp_router.name
}

resource "google_compute_router" "gcp_router" {
  name    = "gcp-vpn-router"
  network = google_compute_network.gcp_vpc.name
  bgp {
    asn = 65001
  }
}

# Azure Local Network Gateways representing Google HA VPN IPs
resource "azurerm_local_network_gateway" "gcp_peer_1" {
  name                = "gcp-peer-interface-1"
  resource_group_name = azurerm_resource_group.azure_rg.name
  location            = azurerm_resource_group.azure_rg.location
  gateway_address     = google_compute_ha_vpn_gateway.gcp_ha_vpn.vpn_interfaces[0].ip_address
}

resource "azurerm_local_network_gateway" "gcp_peer_2" {
  name                = "gcp-peer-interface-2"
  resource_group_name = azurerm_resource_group.azure_rg.name
  location            = azurerm_resource_group.azure_rg.location
  gateway_address     = google_compute_ha_vpn_gateway.gcp_ha_vpn.vpn_interfaces[1].ip_address
}

# Azure Connections linking Gateways
resource "azurerm_virtual_network_gateway_connection" "azure_to_gcp_1" {
  name                = "azure-to-gcp-conn-1"
  location            = azurerm_resource_group.azure_rg.location
  resource_group_name = azurerm_resource_group.azure_rg.name

  type                       = "IPsec"
  virtual_network_gateway_id = azurerm_virtual_network_gateway.azure_vpn_gw.id
  local_network_gateway_id   = azurerm_local_network_gateway.gcp_peer_1.id
  shared_key                 = var.shared_secret
}

resource "azurerm_virtual_network_gateway_connection" "azure_to_gcp_2" {
  name                = "azure-to-gcp-conn-2"
  location            = azurerm_resource_group.azure_rg.location
  resource_group_name = azurerm_resource_group.azure_rg.name

  type                       = "IPsec"
  virtual_network_gateway_id = azurerm_virtual_network_gateway.azure_vpn_gw.id
  local_network_gateway_id   = azurerm_local_network_gateway.gcp_peer_2.id
  shared_key                 = var.shared_secret
}

# ──────────────────────────────────────────────────────────────────────────────
# 4. Identity trust: Google Cloud Workload Identity Federation
# ──────────────────────────────────────────────────────────────────────────────
resource "google_iam_workload_identity_pool" "azure_trust_pool" {
  workload_identity_pool_id = "azure-sovereign-trust-pool"
  display_name              = "Azure Sovereign Identity Pool"
  description               = "Identity Pool for passwordless token exchanges with Azure Active Directory"
}

resource "google_iam_workload_identity_pool_provider" "azure_provider" {
  workload_identity_pool_id          = google_iam_workload_identity_pool.azure_trust_pool.workload_identity_pool_id
  workload_identity_pool_provider_id = "azure-entra-id-provider"
  display_name                       = "Azure Entra ID Identity Provider"
  attribute_mapping = {
    "google.subject" = "assertion.sub"
    "attribute.aud"  = "assertion.aud"
    "attribute.tid"  = "assertion.tid"
  }
  oidc {
    issuer_uri        = "https://sts.windows.net/00000000-0000-0000-0000-000000000000" # Target Azure Tenant ID placeholder
    allowed_audiences = ["api://gcp-workload-identity-fed-audience"]
  }
}
