# ==============================================================================
# ALTI CODE STUDIO: Azure FPGA VM Provisioning Module
# ==============================================================================

terraform {
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.0"
    }
  }
}

resource "azurerm_network_interface" "fpga_nic" {
  name                = "alti-fpga-nic-${var.environment}"
  location            = var.location
  resource_group_name = var.resource_group_name

  ip_configuration {
    name                          = "internal"
    subnet_id                     = var.subnet_id
    private_ip_address_allocation = "Dynamic"
  }
}

resource "azurerm_linux_virtual_machine" "fpga_node" {
  name                = "alti-fpga-node-${var.environment}"
  resource_group_name = var.resource_group_name
  location            = var.location
  
  # Standard_NP10s: FPGA-optimized VM featuring 1x Xilinx Alveo U250 FPGA
  size                = "Standard_NP10s"
  admin_username      = var.admin_username
  network_interface_ids = [
    azurerm_network_interface.fpga_nic.id,
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
    Hardware    = "FPGA"
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
output "fpga_vm_id" {
  value = azurerm_linux_virtual_machine.fpga_node.id
}
