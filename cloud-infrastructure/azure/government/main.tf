provider "azurerm" {
  features {}
  environment = "usgovernment" # Azure Gov
}

resource "azurerm_resource_group" "rg" {
  name     = "alti-gov-rg-${var.environment}"
  location = "USGov Virginia"
}

resource "azurerm_virtual_network" "vnet" {
  name                = "alti-gov-vnet"
  address_space       = ["10.0.0.0/16"]
  location            = azurerm_resource_group.rg.location
  resource_group_name = azurerm_resource_group.rg.name
}

resource "azurerm_subnet" "subnet" {
  name                 = "internal"
  resource_group_name  = azurerm_resource_group.rg.name
  virtual_network_name = azurerm_virtual_network.vnet.name
  address_prefixes     = ["10.0.2.0/24"]
}

resource "azurerm_network_interface" "nic" {
  name                = "alti-gov-nic"
  location            = azurerm_resource_group.rg.location
  resource_group_name = azurerm_resource_group.rg.name

  ip_configuration {
    name                          = "internal"
    subnet_id                     = azurerm_subnet.subnet.id
    private_ip_address_allocation = "Dynamic"
  }
}

resource "azurerm_linux_virtual_machine" "vm" {
  name                = "alti-gov-vm-${var.environment}"
  resource_group_name = azurerm_resource_group.rg.name
  location            = azurerm_resource_group.rg.location
  size                = "Standard_D4s_v3"
  admin_username      = "govadmin"
  network_interface_ids = [
    azurerm_network_interface.nic.id,
  ]

  admin_ssh_key {
    username   = "govadmin"
    public_key = file("~/.ssh/id_rsa.pub")
  }

  os_disk {
    caching              = "ReadWrite"
    storage_account_type = "Premium_LRS"
  }

  source_image_reference {
    publisher = "Canonical"
    offer     = "0001-com-ubuntu-server-jammy"
    sku       = "22_04-lts"
    version   = "latest"
  }

  custom_data = base64encode(<<-EOF
    #!/bin/bash
    apt-get update
    apt-get install -y docker.io
    docker run -d -p 80:3000 \
      -e KEYCLOAK_ISSUER="${var.lco_keycloak_issuer}" \
      -e KEYCLOAK_CLIENT_ID="${var.lco_keycloak_client_id}" \
      -e KEYCLOAK_CLIENT_SECRET="${var.lco_keycloak_client_secret}" \
      -e LCO_BILLING_API="${var.lco_billing_api}" \
      ${var.docker_image}
  EOF
  )
}\n