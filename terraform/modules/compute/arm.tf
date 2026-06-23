# ==============================================================================
# ALTI CODE STUDIO: Azure ARM64 VM Provisioning Module
# ==============================================================================

terraform {
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.0"
    }
  }
}

resource "azurerm_network_interface" "arm_nic" {
  name                = "alti-arm-nic-${var.environment}"
  location            = var.location
  resource_group_name = var.resource_group_name

  ip_configuration {
    name                          = "internal"
    subnet_id                     = var.subnet_id
    private_ip_address_allocation = "Dynamic"
  }
}

resource "azurerm_linux_virtual_machine" "arm_node" {
  name                = "alti-arm-node-${var.environment}"
  resource_group_name = var.resource_group_name
  location            = var.location
  
  # Standard_D4ps_v5: Azure ARM64 (Ampere Altra) Virtual Machine size
  size                = "Standard_D4ps_v5"
  admin_username      = var.admin_username
  network_interface_ids = [
    azurerm_network_interface.arm_nic.id,
  ]

  admin_ssh_key {
    username   = var.admin_username
    public_key = file(var.ssh_public_key_path)
  }

  os_disk {
    caching              = "ReadWrite"
    storage_account_type = "Premium_LRS"
    disk_size_gb         = 128
  }

  source_image_reference {
    publisher = "Canonical"
    offer     = "0001-com-ubuntu-server-jammy"
    sku       = "22_04-lts-arm64" # Canonical Ubuntu build for ARM64
    version   = "latest"
  }

  identity {
    type = "SystemAssigned"
  }

  tags = {
    Architecture = "ARM64"
    Environment  = var.environment
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
output "arm_vm_id" {
  value = azurerm_linux_virtual_machine.arm_node.id
}
