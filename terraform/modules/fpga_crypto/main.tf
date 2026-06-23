# ==============================================================================
# ALTI CODE STUDIO: Azure FPGA Cryptographic Accelerator Module
# ==============================================================================

terraform {
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.0"
    }
  }
}

resource "azurerm_network_security_group" "fpga_sg" {
  name                = "alti-fpga-crypto-nsg-${var.environment}"
  location            = var.location
  resource_group_name = var.resource_group_name

  security_rule {
    name                       = "allow-internal-ssh"
    priority                   = 100
    direction                  = "Inbound"
    access                     = "Allow"
    protocol                   = "Tcp"
    source_port_range          = "*"
    destination_port_range     = "22"
    source_address_prefix      = "10.0.0.0/8"
    destination_address_prefix = "*"
  }
}

resource "azurerm_network_interface" "fpga_nic" {
  name                = "alti-fpga-crypto-nic-${var.environment}"
  location            = var.location
  resource_group_name = var.resource_group_name

  ip_configuration {
    name                          = "internal"
    subnet_id                     = var.subnet_id
    private_ip_address_allocation = "Dynamic"
  }
}

resource "azurerm_network_interface_security_group_association" "fpga_nic_sg" {
  network_interface_id      = azurerm_network_interface.fpga_nic.id
  network_security_group_id = azurerm_network_security_group.fpga_sg.id
}

resource "azurerm_linux_virtual_machine" "fpga_crypto_accelerator" {
  name                = "alti-fpga-crypto-${var.environment}"
  resource_group_name = var.resource_group_name
  location            = var.location
  size                = var.instance_type
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
    disk_size_gb         = 128
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

  user_data = base64encode(<<-EOF
              #!/bin/bash
              echo "Initializing Azure FPGA Cryptographic Node..."
              mkdir -p /opt/crypto-fpga
              echo "Azure FPGA Node Ready." > /opt/crypto-fpga/status.txt
              EOF
  )

  tags = {
    Name        = "NP-Crypto-Accelerator"
    Role        = "Hardware-Acceleration"
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
variable "instance_type" {
  type    = string
  default = "Standard_NP10s"
}

# ------------------------------------------------------------------------------
# Outputs
# ------------------------------------------------------------------------------
output "fpga_instance_id" {
  value = azurerm_linux_virtual_machine.fpga_crypto_accelerator.id
}

output "fpga_instance_private_ip" {
  value = azurerm_network_interface.fpga_nic.private_ip_address
}
