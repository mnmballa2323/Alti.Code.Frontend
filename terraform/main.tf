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

# 3. Azure Government Secret (IL6 Classified) Provider Configuration
provider "azurerm" {
  alias           = "government_secret"
  environment     = "usgovernment" 
  subscription_id = var.subscription_id_government_secret
  tenant_id       = var.tenant_id
  features {}
}

# 4. Azure Government Top Secret (IL6 Air-Gap) Provider Configuration
# Set to custom for Stack Hub or usgovernment depending on deployment mode
provider "azurerm" {
  alias           = "government_top_secret"
  environment     = "usgovernment" 
  subscription_id = var.subscription_id_government_top_secret
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

# ==============================================================================
# Azure Government Secret Cloud (IL6) Infrastructure
# ==============================================================================
resource "azurerm_resource_group" "government_secret_rg" {
  provider = azurerm.government_secret
  name     = "alti-${var.customer_id}-gov-secret-rg"
  location = var.azure_government_secret_region
}

resource "azurerm_virtual_network" "government_secret_vnet" {
  provider            = azurerm.government_secret
  name                = "alti-${var.customer_id}-gov-secret-vnet"
  address_space       = ["10.300.0.0/16"]
  location            = azurerm_resource_group.government_secret_rg.location
  resource_group_name = azurerm_resource_group.government_secret_rg.name
}

resource "azurerm_subnet" "government_secret_subnet" {
  provider             = azurerm.government_secret
  name                 = "gov-secret-subnet"
  resource_group_name  = azurerm_resource_group.government_secret_rg.name
  virtual_network_name = azurerm_virtual_network.government_secret_vnet.name
  address_prefixes     = ["10.300.1.0/24"]
}

resource "azurerm_network_security_group" "government_secret_nsg" {
  provider            = azurerm.government_secret
  name                = "alti-${var.customer_id}-gov-secret-nsg"
  location            = azurerm_resource_group.government_secret_rg.location
  resource_group_name = azurerm_resource_group.government_secret_rg.name

  # Allow internal sync and communication, restrict external
  security_rule {
    name                       = "allow-internal-sync"
    priority                   = 100
    direction                  = "Inbound"
    access                     = "Allow"
    protocol                   = "*"
    source_port_range          = "*"
    destination_port_range     = "*"
    source_address_prefix      = "10.300.0.0/16"
    destination_address_prefix = "10.300.0.0/16"
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

resource "azurerm_subnet_network_security_group_association" "government_secret_nsg_assoc" {
  provider                  = azurerm.government_secret
  subnet_id                 = azurerm_subnet.government_secret_subnet.id
  network_security_group_id = azurerm_network_security_group.government_secret_nsg.id
}

# ==============================================================================
# Azure Government Top Secret Cloud (IL6 Air-Gap) Infrastructure
# ==============================================================================
resource "azurerm_resource_group" "government_top_secret_rg" {
  provider = azurerm.government_top_secret
  name     = "alti-${var.customer_id}-gov-top-secret-rg"
  location = var.azure_government_top_secret_region
}

resource "azurerm_virtual_network" "government_top_secret_vnet" {
  provider            = azurerm.government_top_secret
  name                = "alti-${var.customer_id}-gov-top-secret-vnet"
  address_space       = ["10.400.0.0/16"]
  location            = azurerm_resource_group.government_top_secret_rg.location
  resource_group_name = azurerm_resource_group.government_top_secret_rg.name
}

resource "azurerm_subnet" "government_top_secret_subnet" {
  provider             = azurerm.government_top_secret
  name                 = "gov-top-secret-subnet"
  resource_group_name  = azurerm_resource_group.government_top_secret_rg.name
  virtual_network_name = azurerm_virtual_network.government_top_secret_vnet.name
  address_prefixes     = ["10.400.1.0/24"]
}

resource "azurerm_network_security_group" "government_top_secret_nsg" {
  provider            = azurerm.government_top_secret
  name                = "alti-${var.customer_id}-gov-top-secret-nsg"
  location            = azurerm_resource_group.government_top_secret_rg.location
  resource_group_name = azurerm_resource_group.government_top_secret_rg.name

  # Absolute isolation: deny all inbound and outbound except internal subnet syncing
  security_rule {
    name                       = "allow-internal-subnet-sync"
    priority                   = 100
    direction                  = "Inbound"
    access                     = "Allow"
    protocol                   = "*"
    source_port_range          = "*"
    destination_port_range     = "*"
    source_address_prefix      = "10.400.0.0/16"
    destination_address_prefix = "10.400.0.0/16"
  }

  security_rule {
    name                       = "deny-all-ingress"
    priority                   = 200
    direction                  = "Inbound"
    access                     = "Deny"
    protocol                   = "*"
    source_port_range          = "*"
    destination_port_range     = "*"
    source_address_prefix      = "*"
    destination_address_prefix = "*"
  }

  security_rule {
    name                       = "deny-all-egress"
    priority                   = 210
    direction                  = "Outbound"
    access                     = "Deny"
    protocol                   = "*"
    source_port_range          = "*"
    destination_port_range     = "*"
    source_address_prefix      = "*"
    destination_address_prefix = "*"
  }
}

resource "azurerm_subnet_network_security_group_association" "government_top_secret_nsg_assoc" {
  provider                  = azurerm.government_top_secret
  subnet_id                 = azurerm_subnet.government_top_secret_subnet.id
  network_security_group_id = azurerm_network_security_group.government_top_secret_nsg.id
}
