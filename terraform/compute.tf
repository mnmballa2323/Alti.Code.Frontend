# ==============================================================================
# ALTI CODE STUDIO: Azure Sovereign Compute Node Provisioning
# ==============================================================================

# ------------------------------------------------------------------------------
# 1. Commercial VM (Azure Cloud)
# ------------------------------------------------------------------------------
resource "azurerm_public_ip" "commercial_ip" {
  count               = var.enable_azure_cloud ? 1 : 0
  name                = "alti-${var.customer_id}-commercial-ip"
  location            = azurerm_resource_group.commercial_rg[0].location
  resource_group_name = azurerm_resource_group.commercial_rg[0].name
  allocation_method   = "Static"
  sku                 = "Standard"
}

resource "azurerm_network_interface" "commercial_nic" {
  count               = var.enable_azure_cloud ? 1 : 0
  name                = "alti-${var.customer_id}-commercial-nic"
  location            = azurerm_resource_group.commercial_rg[0].location
  resource_group_name = azurerm_resource_group.commercial_rg[0].name

  ip_configuration {
    name                          = "internal"
    subnet_id                     = azurerm_subnet.commercial_subnet[0].id
    private_ip_address_allocation = "Dynamic"
    public_ip_address_id          = azurerm_public_ip.commercial_ip[0].id
  }
}

resource "azurerm_linux_virtual_machine" "commercial_node" {
  count               = var.enable_azure_cloud ? 1 : 0
  name                = "alti-${var.customer_id}-commercial-node"
  resource_group_name = azurerm_resource_group.commercial_rg[0].name
  location            = azurerm_resource_group.commercial_rg[0].location
  size                = "Standard_D8s_v5"
  admin_username      = "azureuser"
  network_interface_ids = [
    azurerm_network_interface.commercial_nic[0].id,
  ]

  admin_ssh_key {
    username   = "azureuser"
    public_key = file(var.ssh_public_key_path)
  }

  os_disk {
    caching              = "ReadWrite"
    storage_account_type = "Premium_LRS"
    disk_size_gb         = 250
  }

  source_image_reference {
    publisher = "Canonical"
    offer     = "0001-com-ubuntu-server-jammy"
    sku       = "22_04-lts"
    version   = "latest"
  }

  # Enable Managed Identity
  identity {
    type = "SystemAssigned"
  }

  tags = {
    Environment = var.environment
    Sovereignty = "Commercial"
  }
}

# ------------------------------------------------------------------------------
# 2. Government VM (Azure Government)
# ------------------------------------------------------------------------------
resource "azurerm_network_interface" "government_nic" {
  count               = var.enable_azure_government ? 1 : 0
  provider            = azurerm.government
  name                = "alti-${var.customer_id}-government-nic"
  location            = azurerm_resource_group.government_rg[0].location
  resource_group_name = azurerm_resource_group.government_rg[0].name

  ip_configuration {
    name                          = "internal"
    subnet_id                     = azurerm_subnet.government_subnet[0].id
    private_ip_address_allocation = "Dynamic"
  }
}

resource "azurerm_linux_virtual_machine" "government_node" {
  count               = var.enable_azure_government ? 1 : 0
  provider            = azurerm.government
  name                = "alti-${var.customer_id}-government-node"
  resource_group_name = azurerm_resource_group.government_rg[0].name
  location            = azurerm_resource_group.government_rg[0].location
  size                = "Standard_D8s_v5"
  admin_username      = "govuser"
  network_interface_ids = [
    azurerm_network_interface.government_nic[0].id,
  ]

  admin_ssh_key {
    username   = "govuser"
    public_key = file(var.ssh_public_key_path)
  }

  os_disk {
    caching              = "ReadWrite"
    storage_account_type = "Premium_LRS"
    disk_size_gb         = 500
  }

  source_image_reference {
    publisher = "Canonical"
    offer     = "0001-com-ubuntu-server-jammy"
    sku       = "22_04-lts"
    version   = "latest"
  }

  # Enable Managed Identity for Secure Cloud Operations
  identity {
    type = "SystemAssigned"
  }

  tags = {
    Environment = var.environment
    Sovereignty = "US-Government-IL5"
  }
}

# ------------------------------------------------------------------------------
# 3. Dedicated Host and VM (Azure Dedicated)
# ------------------------------------------------------------------------------
resource "azurerm_dedicated_host_group" "commercial_host_group" {
  count                       = var.enable_azure_dedicated ? 1 : 0
  name                        = "alti-${var.customer_id}-dedicated-host-group"
  resource_group_name         = azurerm_resource_group.commercial_rg[0].name
  location                    = azurerm_resource_group.commercial_rg[0].location
  platform_fault_domain_count = 1
}

resource "azurerm_dedicated_host" "commercial_host" {
  count                   = var.enable_azure_dedicated ? 1 : 0
  name                    = "alti-${var.customer_id}-dedicated-host"
  location                = azurerm_resource_group.commercial_rg[0].location
  resource_group_name     = azurerm_resource_group.commercial_rg[0].name
  dedicated_host_group_id = azurerm_dedicated_host_group.commercial_host_group[0].id
  sku_name                = "Dsv5-Type1"
  platform_fault_domain   = 0
}

resource "azurerm_network_interface" "dedicated_nic" {
  count               = var.enable_azure_dedicated ? 1 : 0
  name                = "alti-${var.customer_id}-dedicated-nic"
  location            = azurerm_resource_group.commercial_rg[0].location
  resource_group_name = azurerm_resource_group.commercial_rg[0].name

  ip_configuration {
    name                          = "internal"
    subnet_id                     = azurerm_subnet.commercial_subnet[0].id
    private_ip_address_allocation = "Dynamic"
  }
}

resource "azurerm_linux_virtual_machine" "dedicated_node" {
  count               = var.enable_azure_dedicated ? 1 : 0
  name                = "alti-${var.customer_id}-dedicated-node"
  resource_group_name = azurerm_resource_group.commercial_rg[0].name
  location            = azurerm_resource_group.commercial_rg[0].location
  size                = "Standard_D8s_v5"
  admin_username      = "dedicateduser"
  network_interface_ids = [
    azurerm_network_interface.dedicated_nic[0].id,
  ]

  dedicated_host_id = azurerm_dedicated_host.commercial_host[0].id

  admin_ssh_key {
    username   = "dedicateduser"
    public_key = file(var.ssh_public_key_path)
  }

  os_disk {
    caching              = "ReadWrite"
    storage_account_type = "Premium_LRS"
    disk_size_gb         = 500
  }

  source_image_reference {
    publisher = "Canonical"
    offer     = "0001-com-ubuntu-server-jammy"
    sku       = "22_04-lts"
    version   = "latest"
  }

  identity {
    type = "SystemAssigned"
  }

  tags = {
    Environment = var.environment
    Sovereignty = "Commercial-Dedicated"
  }
}

