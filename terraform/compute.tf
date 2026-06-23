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
# 3. Government Secret Confidential VM (IL6)
# ------------------------------------------------------------------------------
resource "azurerm_network_interface" "government_secret_nic" {
  provider            = azurerm.government_secret
  name                = "alti-${var.customer_id}-gov-secret-nic"
  location            = azurerm_resource_group.government_secret_rg.location
  resource_group_name = azurerm_resource_group.government_secret_rg.name

  ip_configuration {
    name                          = "internal"
    subnet_id                     = azurerm_subnet.government_secret_subnet.id
    private_ip_address_allocation = "Dynamic"
  }
}

resource "azurerm_linux_virtual_machine" "government_secret_node" {
  provider            = azurerm.government_secret
  name                = "alti-${var.customer_id}-gov-secret-node"
  resource_group_name = azurerm_resource_group.government_secret_rg.name
  location            = azurerm_resource_group.government_secret_rg.location
  size                = "Standard_DC8as_v5" # AMD SEV-SNP support
  admin_username      = "secretuser"
  network_interface_ids = [
    azurerm_network_interface.government_secret_nic.id,
  ]

  admin_ssh_key {
    username   = "secretuser"
    public_key = file(var.ssh_public_key_path)
  }

  os_disk {
    caching              = "ReadWrite"
    storage_account_type = "Premium_LRS"
    disk_size_gb         = 1000
  }

  source_image_reference {
    publisher = "Canonical"
    offer     = "0001-com-ubuntu-server-jammy"
    sku       = "22_04-lts"
    version   = "latest"
  }

  # Hardware Security Profile: Confidential VM configuration with AMD SEV-SNP
  security_type        = "ConfidentialVM"
  vtpm_enabled         = true
  secure_boot_enabled  = true

  identity {
    type = "SystemAssigned"
  }

  tags = {
    Environment = var.environment
    Sovereignty = "US-Government-Secret-IL6"
  }
}

# ------------------------------------------------------------------------------
# 4. Government Top Secret Air-Gapped Confidential VM (IL6 Air-Gap)
# ------------------------------------------------------------------------------
resource "azurerm_network_interface" "government_top_secret_nic" {
  provider            = azurerm.government_top_secret
  name                = "alti-${var.customer_id}-gov-top-secret-nic"
  location            = azurerm_resource_group.government_top_secret_rg.location
  resource_group_name = azurerm_resource_group.government_top_secret_rg.name

  ip_configuration {
    name                          = "internal"
    subnet_id                     = azurerm_subnet.government_top_secret_subnet.id
    private_ip_address_allocation = "Dynamic"
  }
}

resource "azurerm_linux_virtual_machine" "government_top_secret_node" {
  provider            = azurerm.government_top_secret
  name                = "alti-${var.customer_id}-gov-top-secret-node"
  resource_group_name = azurerm_resource_group.government_top_secret_rg.name
  location            = azurerm_resource_group.government_top_secret_rg.location
  size                = "Standard_DC8as_v5" # AMD SEV-SNP support
  admin_username      = "topsecretuser"
  network_interface_ids = [
    azurerm_network_interface.government_top_secret_nic.id,
  ]

  admin_ssh_key {
    username   = "topsecretuser"
    public_key = file(var.ssh_public_key_path)
  }

  os_disk {
    caching              = "ReadWrite"
    storage_account_type = "Premium_LRS"
    disk_size_gb         = 1000
  }

  source_image_reference {
    # In pure disconnected air-gap, this references local shared images
    publisher = "Canonical"
    offer     = "0001-com-ubuntu-server-jammy"
    sku       = "22_04-lts"
    version   = "latest"
  }

  # Hardware Security Profile: Confidential VM configuration with AMD SEV-SNP
  security_type        = "ConfidentialVM"
  vtpm_enabled         = true
  secure_boot_enabled  = true

  identity {
    type = "SystemAssigned"
  }

  tags = {
    Environment = var.environment
    Sovereignty = "US-Government-Top-Secret-IL6"
  }
}
