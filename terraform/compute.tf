# ==============================================================================
# ALTI CODE STUDIO: Azure Sovereign Compute Node Provisioning
# ==============================================================================

# ------------------------------------------------------------------------------
# 1. Commercial VM (Default Provider)
# ------------------------------------------------------------------------------
resource "azurerm_public_ip" "commercial_ip" {
  name                = "alti-${var.customer_id}-commercial-ip"
  location            = azurerm_resource_group.commercial_rg.location
  resource_group_name = azurerm_resource_group.commercial_rg.name
  allocation_method   = "Static"
  sku                 = "Standard"
}

resource "azurerm_network_interface" "commercial_nic" {
  name                = "alti-${var.customer_id}-commercial-nic"
  location            = azurerm_resource_group.commercial_rg.location
  resource_group_name = azurerm_resource_group.commercial_rg.name

  ip_configuration {
    name                          = "internal"
    subnet_id                     = azurerm_subnet.commercial_subnet.id
    private_ip_address_allocation = "Dynamic"
    public_ip_address_id          = azurerm_public_ip.commercial_ip.id
  }
}

resource "azurerm_linux_virtual_machine" "commercial_node" {
  name                = "alti-${var.customer_id}-commercial-node"
  resource_group_name = azurerm_resource_group.commercial_rg.name
  location            = azurerm_resource_group.commercial_rg.location
  size                = "Standard_D8s_v5"
  admin_username      = "azureuser"
  network_interface_ids = [
    azurerm_network_interface.commercial_nic.id,
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
# 2. Government VM (IL5)
# ------------------------------------------------------------------------------
resource "azurerm_network_interface" "government_nic" {
  provider            = azurerm.government
  name                = "alti-${var.customer_id}-government-nic"
  location            = azurerm_resource_group.government_rg.location
  resource_group_name = azurerm_resource_group.government_rg.name

  ip_configuration {
    name                          = "internal"
    subnet_id                     = azurerm_subnet.government_subnet.id
    private_ip_address_allocation = "Dynamic"
  }
}

resource "azurerm_linux_virtual_machine" "government_node" {
  provider            = azurerm.government
  name                = "alti-${var.customer_id}-government-node"
  resource_group_name = azurerm_resource_group.government_rg.name
  location            = azurerm_resource_group.government_rg.location
  size                = "Standard_D8s_v5"
  admin_username      = "govuser"
  network_interface_ids = [
    azurerm_network_interface.government_nic.id,
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
  name                        = "alti-${var.customer_id}-dedicated-host-group"
  resource_group_name         = azurerm_resource_group.commercial_rg.name
  location                    = azurerm_resource_group.commercial_rg.location
  platform_fault_domain_count = 1
}

resource "azurerm_dedicated_host" "commercial_host" {
  name                    = "alti-${var.customer_id}-dedicated-host"
  location                = azurerm_resource_group.commercial_rg.location
  resource_group_name     = azurerm_resource_group.commercial_rg.name
  dedicated_host_group_id = azurerm_dedicated_host_group.commercial_host_group.id
  sku_name                = "Dsv5-Type1"
  platform_fault_domain   = 0
}

resource "azurerm_network_interface" "dedicated_nic" {
  name                = "alti-${var.customer_id}-dedicated-nic"
  location            = azurerm_resource_group.commercial_rg.location
  resource_group_name = azurerm_resource_group.commercial_rg.name

  ip_configuration {
    name                          = "internal"
    subnet_id                     = azurerm_subnet.commercial_subnet.id
    private_ip_address_allocation = "Dynamic"
  }
}

resource "azurerm_linux_virtual_machine" "dedicated_node" {
  name                = "alti-${var.customer_id}-dedicated-node"
  resource_group_name = azurerm_resource_group.commercial_rg.name
  location            = azurerm_resource_group.commercial_rg.location
  size                = "Standard_D8s_v5"
  admin_username      = "dedicateduser"
  network_interface_ids = [
    azurerm_network_interface.dedicated_nic.id,
  ]

  dedicated_host_id = azurerm_dedicated_host.commercial_host.id

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
