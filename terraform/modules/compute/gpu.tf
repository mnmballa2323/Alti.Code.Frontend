# ==============================================================================
# ALTI CODE STUDIO: Azure GPU VM Provisioning Module
# ==============================================================================

terraform {
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.0"
    }
  }
}

resource "azurerm_network_interface" "gpu_nic" {
  name                = "alti-gpu-nic-${var.environment}"
  location            = var.location
  resource_group_name = var.resource_group_name

  ip_configuration {
    name                          = "internal"
    subnet_id                     = var.subnet_id
    private_ip_address_allocation = "Dynamic"
  }
}

resource "azurerm_linux_virtual_machine" "gpu_node" {
  name                = "alti-gpu-node-${var.environment}"
  resource_group_name = var.resource_group_name
  location            = var.location
  
  # Standard_NC6s_v3: GPU-optimized VM featuring 1x NVIDIA Tesla V100 GPU
  size                = "Standard_NC6s_v3"
  admin_username      = var.admin_username
  network_interface_ids = [
    azurerm_network_interface.gpu_nic.id,
  ]

  admin_ssh_key {
    username   = var.admin_username
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

  identity {
    type = "SystemAssigned"
  }

  tags = {
    Hardware    = "GPU"
    Environment = var.environment
  }
}

# ------------------------------------------------------------------------------
# Variables
# ------------------------------------------------------------------------------
variable "environment" { type = string }
variable "location" { type = string }
variable "resource_group_name" { type = string }
variable "subnet_id" { type = string }
variable "admin_username" { type = string }
variable "ssh_public_key_path" { type = string }

# ------------------------------------------------------------------------------
# Outputs
# ------------------------------------------------------------------------------
output "gpu_vm_id" {
  value = azurerm_linux_virtual_machine.gpu_node.id
}
