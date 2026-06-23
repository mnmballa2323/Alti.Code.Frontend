# ==============================================================================
# ALTI CODE STUDIO: Azure Sovereign Cloud Resource Groups & Networks
# ==============================================================================

terraform {
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.0"
    }
  }
}

# 1. Azure Commercial Cloud Provider Configuration
provider "azurerm" {
  features {}
  subscription_id = var.subscription_id_commercial
  tenant_id       = var.tenant_id
}

# 2. Azure Government Cloud (IL4/IL5) Provider Configuration
provider "azurerm" {
  alias           = "government"
  environment     = "usgovernment"
  subscription_id = var.subscription_id_government
  tenant_id       = var.tenant_id
  features {}
}



# ==============================================================================
# Azure Commercial Cloud Infrastructure
# ==============================================================================
resource "azurerm_resource_group" "commercial_rg" {
  name     = "alti-${var.customer_id}-commercial-rg"
  location = var.azure_commercial_region
}

resource "azurerm_virtual_network" "commercial_vnet" {
  name                = "alti-${var.customer_id}-commercial-vnet"
  address_space       = ["10.100.0.0/16"]
  location            = azurerm_resource_group.commercial_rg.location
  resource_group_name = azurerm_resource_group.commercial_rg.name
}

resource "azurerm_subnet" "commercial_subnet" {
  name                 = "commercial-subnet"
  resource_group_name  = azurerm_resource_group.commercial_rg.name
  virtual_network_name = azurerm_virtual_network.commercial_vnet.name
  address_prefixes     = ["10.100.1.0/24"]
}

resource "azurerm_network_security_group" "commercial_nsg" {
  name                = "alti-${var.customer_id}-commercial-nsg"
  location            = azurerm_resource_group.commercial_rg.location
  resource_group_name = azurerm_resource_group.commercial_rg.name

  security_rule {
    name                       = "allow-ssh-inbound"
    priority                   = 100
    direction                  = "Inbound"
    access                     = "Allow"
    protocol                   = "Tcp"
    source_port_range          = "*"
    destination_port_range     = "22"
    source_address_prefix      = "*"
    destination_address_prefix = "*"
  }

  security_rule {
    name                       = "allow-http-inbound"
    priority                   = 110
    direction                  = "Inbound"
    access                     = "Allow"
    protocol                   = "Tcp"
    source_port_range          = "*"
    destination_port_range     = "80"
    source_address_prefix      = "*"
    destination_address_prefix = "*"
  }

  security_rule {
    name                       = "allow-https-inbound"
    priority                   = 120
    direction                  = "Inbound"
    access                     = "Allow"
    protocol                   = "Tcp"
    source_port_range          = "*"
    destination_port_range     = "443"
    source_address_prefix      = "*"
    destination_address_prefix = "*"
  }
}

resource "azurerm_subnet_network_security_group_association" "commercial_nsg_assoc" {
  subnet_id                 = azurerm_subnet.commercial_subnet.id
  network_security_group_id = azurerm_network_security_group.commercial_nsg.id
}

# ==============================================================================
# Azure Government Cloud (IL5) Infrastructure
# ==============================================================================
resource "azurerm_resource_group" "government_rg" {
  provider = azurerm.government
  name     = "alti-${var.customer_id}-government-rg"
  location = var.azure_government_region
}

resource "azurerm_virtual_network" "government_vnet" {
  provider            = azurerm.government
  name                = "alti-${var.customer_id}-government-vnet"
  address_space       = ["10.200.0.0/16"]
  location            = azurerm_resource_group.government_rg.location
  resource_group_name = azurerm_resource_group.government_rg.name
}

resource "azurerm_subnet" "government_subnet" {
  provider             = azurerm.government
  name                 = "government-subnet"
  resource_group_name  = azurerm_resource_group.government_rg.name
  virtual_network_name = azurerm_virtual_network.government_vnet.name
  address_prefixes     = ["10.200.1.0/24"]
}

resource "azurerm_network_security_group" "government_nsg" {
  provider            = azurerm.government
  name                = "alti-${var.customer_id}-government-nsg"
  location            = azurerm_resource_group.government_rg.location
  resource_group_name = azurerm_resource_group.government_rg.name

  # Allow inbound only from designated Gov IP ranges/internal bastion
  security_rule {
    name                       = "allow-internal-ssh"
    priority                   = 100
    direction                  = "Inbound"
    access                     = "Allow"
    protocol                   = "Tcp"
    source_port_range          = "*"
    destination_port_range     = "22"
    source_address_prefix      = "10.200.0.0/16"
    destination_address_prefix = "*"
  }

  security_rule {
    name                       = "deny-public-ingress"
    priority                   = 200
    direction                  = "Inbound"
    access                     = "Deny"
    protocol                   = "*"
    source_port_range          = "*"
    destination_port_range     = "*"
    source_address_prefix      = "*"
    destination_address_prefix = "*"
  }
}

resource "azurerm_subnet_network_security_group_association" "government_nsg_assoc" {
  provider                  = azurerm.government
  subnet_id                 = azurerm_subnet.government_subnet.id
  network_security_group_id = azurerm_network_security_group.government_nsg.id
}
