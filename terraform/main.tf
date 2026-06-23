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

  # ----------------------------------------------------------------------------
  # Remote State Configuration (Azure Blob Storage Backend)
  # ----------------------------------------------------------------------------
  # To enable team collaboration and state locking, uncomment the following block
  # and configure your Azure storage account coordinates.
  #
  # backend "azurerm" {
  #   resource_group_name  = "alti-tfstate-rg"
  #   storage_account_name = "altitfstatexxxx"
  #   container_name       = "tfstate"
  #   key                  = "terraform.tfstate"
  # }
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
locals {
  deploy_commercial = var.enable_azure_cloud || var.enable_azure_dedicated
  commercial_vm_ids = concat(
    var.enable_azure_cloud ? [azurerm_linux_virtual_machine.commercial_node[0].id] : [],
    var.enable_azure_dedicated ? [azurerm_linux_virtual_machine.dedicated_node[0].id] : []
  )
}


# ==============================================================================
# Azure Commercial Cloud Infrastructure
# ==============================================================================
resource "azurerm_resource_group" "commercial_rg" {
  count    = local.deploy_commercial ? 1 : 0
  name     = "alti-${var.customer_id}-commercial-rg"
  location = var.azure_commercial_region
}

resource "azurerm_management_lock" "commercial_rg_lock" {
  count      = (local.deploy_commercial && var.environment == "prod") ? 1 : 0
  name       = "rg-prevent-delete"
  scope      = azurerm_resource_group.commercial_rg[0].id
  lock_level = "CanNotDelete"
  notes      = "Accidental deletion prevention lock for production resources"
}

resource "azurerm_virtual_network" "commercial_vnet" {
  count               = local.deploy_commercial ? 1 : 0
  name                = "alti-${var.customer_id}-commercial-vnet"
  address_space       = ["10.100.0.0/16"]
  location            = azurerm_resource_group.commercial_rg[0].location
  resource_group_name = azurerm_resource_group.commercial_rg[0].name
}

resource "azurerm_subnet" "commercial_subnet" {
  count                = local.deploy_commercial ? 1 : 0
  name                 = "commercial-subnet"
  resource_group_name  = azurerm_resource_group.commercial_rg[0].name
  virtual_network_name = azurerm_virtual_network.commercial_vnet[0].name
  address_prefixes     = ["10.100.1.0/24"]
}

resource "azurerm_subnet" "commercial_db_subnet" {
  count                = local.deploy_commercial ? 1 : 0
  name                 = "commercial-db-subnet"
  resource_group_name  = azurerm_resource_group.commercial_rg[0].name
  virtual_network_name = azurerm_virtual_network.commercial_vnet[0].name
  address_prefixes     = ["10.100.2.0/24"]

  delegation {
    name = "db-delegation"
    service_delegation {
      name    = "Microsoft.DBforPostgreSQL/flexibleServers"
      actions = ["Microsoft.Network/virtualNetworks/subnets/join/action"]
    }
  }
}


resource "azurerm_network_security_group" "commercial_nsg" {
  count               = local.deploy_commercial ? 1 : 0
  name                = "alti-${var.customer_id}-commercial-nsg"
  location            = azurerm_resource_group.commercial_rg[0].location
  resource_group_name = azurerm_resource_group.commercial_rg[0].name

  security_rule {
    name                       = "allow-ssh-inbound"
    priority                   = 100
    direction                  = "Inbound"
    access                     = "Allow"
    protocol                   = "Tcp"
    source_port_range          = "*"
    destination_port_range     = "22"
    source_address_prefix      = var.admin_source_ip_range
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
  count                     = local.deploy_commercial ? 1 : 0
  subnet_id                 = azurerm_subnet.commercial_subnet[0].id
  network_security_group_id = azurerm_network_security_group.commercial_nsg[0].id
}

# ==============================================================================
# Azure Government Cloud (IL5) Infrastructure
# ==============================================================================
resource "azurerm_resource_group" "government_rg" {
  count    = var.enable_azure_government ? 1 : 0
  provider = azurerm.government
  name     = "alti-${var.customer_id}-government-rg"
  location = var.azure_government_region
}

resource "azurerm_management_lock" "government_rg_lock" {
  count      = (var.enable_azure_government && var.environment == "prod") ? 1 : 0
  provider   = azurerm.government
  name       = "rg-prevent-delete"
  scope      = azurerm_resource_group.government_rg[0].id
  lock_level = "CanNotDelete"
  notes      = "Accidental deletion prevention lock for production resources"
}

resource "azurerm_virtual_network" "government_vnet" {
  count               = var.enable_azure_government ? 1 : 0
  provider            = azurerm.government
  name                = "alti-${var.customer_id}-government-vnet"
  address_space       = ["10.200.0.0/16"]
  location            = azurerm_resource_group.government_rg[0].location
  resource_group_name = azurerm_resource_group.government_rg[0].name
}

resource "azurerm_subnet" "government_subnet" {
  count                = var.enable_azure_government ? 1 : 0
  provider             = azurerm.government
  name                 = "government-subnet"
  resource_group_name  = azurerm_resource_group.government_rg[0].name
  virtual_network_name = azurerm_virtual_network.government_vnet[0].name
  address_prefixes     = ["10.200.1.0/24"]
}

resource "azurerm_subnet" "government_db_subnet" {
  count                = var.enable_azure_government ? 1 : 0
  provider             = azurerm.government
  name                 = "government-db-subnet"
  resource_group_name  = azurerm_resource_group.government_rg[0].name
  virtual_network_name = azurerm_virtual_network.government_vnet[0].name
  address_prefixes     = ["10.200.2.0/24"]

  delegation {
    name = "db-delegation"
    service_delegation {
      name    = "Microsoft.DBforPostgreSQL/flexibleServers"
      actions = ["Microsoft.Network/virtualNetworks/subnets/join/action"]
    }
  }
}


resource "azurerm_network_security_group" "government_nsg" {
  count               = var.enable_azure_government ? 1 : 0
  provider            = azurerm.government
  name                = "alti-${var.customer_id}-government-nsg"
  location            = azurerm_resource_group.government_rg[0].location
  resource_group_name = azurerm_resource_group.government_rg[0].name

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
  count                     = var.enable_azure_government ? 1 : 0
  provider                  = azurerm.government
  subnet_id                 = azurerm_subnet.government_subnet[0].id
  network_security_group_id = azurerm_network_security_group.government_nsg[0].id
}

# ==============================================================================
# Commercial Sovereign Services Module Instantiations
# ==============================================================================
module "secrets_commercial" {
  count               = local.deploy_commercial ? 1 : 0
  source              = "./modules/secrets"
  customer_id         = var.customer_id
  environment         = var.environment
  location            = azurerm_resource_group.commercial_rg[0].location
  resource_group_name = azurerm_resource_group.commercial_rg[0].name
  tenant_id           = var.tenant_id
  secrets = {
    "pg-admin-password" = var.pg_admin_password
  }
}

module "database_commercial" {
  count               = local.deploy_commercial ? 1 : 0
  source              = "./modules/database"
  customer_id         = var.customer_id
  environment         = var.environment
  location            = azurerm_resource_group.commercial_rg[0].location
  resource_group_name = azurerm_resource_group.commercial_rg[0].name
  subnet_id           = azurerm_subnet.commercial_db_subnet[0].id
  admin_username      = var.pg_admin_username
  admin_password      = var.pg_admin_password
  db_sku_name         = var.pg_db_sku_name
  redis_sku_name      = var.redis_cache_sku
  redis_capacity      = var.redis_cache_capacity
  redis_family        = var.redis_cache_family
}

module "observability_commercial" {
  count               = local.deploy_commercial ? 1 : 0
  source              = "./modules/observability"
  customer_id         = var.customer_id
  environment         = var.environment
  location            = azurerm_resource_group.commercial_rg[0].location
  resource_group_name = azurerm_resource_group.commercial_rg[0].name
  target_resource_ids = local.commercial_vm_ids
}

# ==============================================================================
# Government Sovereign Services Module Instantiations
# ==============================================================================
module "secrets_government" {
  count               = var.enable_azure_government ? 1 : 0
  source              = "./modules/secrets"
  providers = {
    azurerm = azurerm.government
  }
  customer_id         = var.customer_id
  environment         = var.environment
  location            = azurerm_resource_group.government_rg[0].location
  resource_group_name = azurerm_resource_group.government_rg[0].name
  tenant_id           = var.tenant_id
  secrets = {
    "pg-admin-password" = var.pg_admin_password
  }
}

module "database_government" {
  count               = var.enable_azure_government ? 1 : 0
  source              = "./modules/database"
  providers = {
    azurerm = azurerm.government
  }
  customer_id         = var.customer_id
  environment         = var.environment
  location            = azurerm_resource_group.government_rg[0].location
  resource_group_name = azurerm_resource_group.government_rg[0].name
  subnet_id           = azurerm_subnet.government_db_subnet[0].id
  admin_username      = var.pg_admin_username
  admin_password      = var.pg_admin_password
  db_sku_name         = var.pg_db_sku_name
  redis_sku_name      = var.redis_cache_sku
  redis_capacity      = var.redis_cache_capacity
  redis_family        = var.redis_cache_family
}

module "observability_government" {
  count               = var.enable_azure_government ? 1 : 0
  source              = "./modules/observability"
  providers = {
    azurerm = azurerm.government
  }
  customer_id         = var.customer_id
  environment         = var.environment
  location            = azurerm_resource_group.government_rg[0].location
  resource_group_name = azurerm_resource_group.government_rg[0].name
  target_resource_ids = var.enable_azure_government ? [azurerm_linux_virtual_machine.government_node[0].id] : []
}

# ==============================================================================
# Commercial Advanced Sovereign Controls
# ==============================================================================
module "finops_commercial" {
  count               = local.deploy_commercial ? 1 : 0
  source              = "./modules/finops"
  customer_id         = var.customer_id
  environment         = var.environment
  resource_group_name = azurerm_resource_group.commercial_rg[0].name
  resource_group_id   = azurerm_resource_group.commercial_rg[0].id
  budget_amount       = 3500
}

module "workload_identity_commercial" {
  count               = local.deploy_commercial ? 1 : 0
  source              = "./modules/workload_identity"
  customer_id         = var.customer_id
  environment         = var.environment
  location            = azurerm_resource_group.commercial_rg[0].location
  resource_group_name = azurerm_resource_group.commercial_rg[0].name
  github_repository   = var.github_repository
}

# ==============================================================================
# Government Advanced Sovereign Controls
# ==============================================================================
module "finops_government" {
  count               = var.enable_azure_government ? 1 : 0
  source              = "./modules/finops"
  providers = {
    azurerm = azurerm.government
  }
  customer_id         = var.customer_id
  environment         = var.environment
  resource_group_name = azurerm_resource_group.government_rg[0].name
  resource_group_id   = azurerm_resource_group.government_rg[0].id
  budget_amount       = 5000
}

module "workload_identity_government" {
  count               = var.enable_azure_government ? 1 : 0
  source              = "./modules/workload_identity"
  providers = {
    azurerm = azurerm.government
  }
  customer_id         = var.customer_id
  environment         = var.environment
  location            = azurerm_resource_group.government_rg[0].location
  resource_group_name = azurerm_resource_group.government_rg[0].name
  github_repository   = var.github_repository
}



