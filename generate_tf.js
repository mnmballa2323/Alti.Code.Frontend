const fs = require('fs');
const path = require('path');

const baseDir = '/Users/michaelmeram/workspace/alti.code.studio/cloud-infrastructure';

const commonVariables = `
variable "lco_keycloak_issuer" {
  description = "The Sovereign Identity URL at Liberty Center One"
  type        = string
}

variable "lco_keycloak_client_id" {
  description = "The Keycloak Client ID for the Workload Plane"
  type        = string
}

variable "lco_keycloak_client_secret" {
  description = "The Keycloak Client Secret for the Workload Plane"
  type        = string
  sensitive   = true
}

variable "lco_billing_api" {
  description = "The internal Sovereign Billing URL"
  type        = string
}

variable "environment" {
  description = "Environment name (e.g., prod, dev)"
  type        = string
  default     = "prod"
}

variable "docker_image" {
  description = "The Docker image for inso.code"
  type        = string
}
`;

const configs = {
  aws: {
    multi_tenant: `
provider "aws" {
  region = "us-east-1"
}

resource "aws_ecs_cluster" "main" {
  name = "inso-code-multi-\${var.environment}"
}

resource "aws_ecs_task_definition" "app" {
  family                   = "inso-code-task"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = 256
  memory                   = 512

  container_definitions = jsonencode([{
    name      = "inso-code"
    image     = var.docker_image
    essential = true
    environment = [
      { name = "KEYCLOAK_ISSUER", value = var.lco_keycloak_issuer },
      { name = "KEYCLOAK_CLIENT_ID", value = var.lco_keycloak_client_id },
      { name = "KEYCLOAK_CLIENT_SECRET", value = var.lco_keycloak_client_secret },
      { name = "LCO_BILLING_API", value = var.lco_billing_api }
    ]
    portMappings = [{
      containerPort = 3000
      hostPort      = 3000
    }]
  }])
}
`,
    single_tenant: `
provider "aws" {
  region = "us-east-1"
}

module "eks" {
  source          = "terraform-aws-modules/eks/aws"
  version         = "19.15.3"
  cluster_name    = "inso-code-single-\${var.environment}"
  cluster_version = "1.27"
  vpc_id          = "vpc-12345678"
  subnet_ids      = ["subnet-12345678", "subnet-87654321"]

  eks_managed_node_groups = {
    dedicated = {
      desired_size = 3
      min_size     = 3
      max_size     = 5
      instance_types = ["m5.large"]
    }
  }
}
`,
    government: `
provider "aws" {
  region = "us-gov-west-1" # AWS GovCloud
}

resource "aws_instance" "app" {
  ami           = "ami-0c55b159cbfafe1f0" # GovCloud AL2 AMI
  instance_type = "m5.large"
  
  tags = {
    Name = "inso-code-gov-\${var.environment}"
    Compliance = "FedRAMP-High"
  }

  user_data = <<-EOF
              #!/bin/bash
              yum update -y
              amazon-linux-extras install docker
              service docker start
              usermod -a -G docker ec2-user
              docker run -d -p 80:3000 \\
                -e KEYCLOAK_ISSUER="\${var.lco_keycloak_issuer}" \\
                -e KEYCLOAK_CLIENT_ID="\${var.lco_keycloak_client_id}" \\
                -e KEYCLOAK_CLIENT_SECRET="\${var.lco_keycloak_client_secret}" \\
                -e LCO_BILLING_API="\${var.lco_billing_api}" \\
                \${var.docker_image}
              EOF
}
`
  },
  gcp: {
    multi_tenant: `
provider "google" {
  project = "inso-code"
  region  = "us-central1"
}

resource "google_cloud_run_service" "app" {
  name     = "inso-code-multi-\${var.environment}"
  location = "us-central1"

  template {
    spec {
      containers {
        image = var.docker_image
        env {
          name  = "KEYCLOAK_ISSUER"
          value = var.lco_keycloak_issuer
        }
        env {
          name  = "KEYCLOAK_CLIENT_ID"
          value = var.lco_keycloak_client_id
        }
        env {
          name  = "KEYCLOAK_CLIENT_SECRET"
          value = var.lco_keycloak_client_secret
        }
        env {
          name  = "LCO_BILLING_API"
          value = var.lco_billing_api
        }
        ports {
          container_port = 3000
        }
      }
    }
  }

  traffic {
    percent         = 100
    latest_revision = true
  }
}
`,
    single_tenant: `
provider "google" {
  project = "inso-code"
  region  = "us-central1"
}

resource "google_container_cluster" "primary" {
  name     = "inso-code-single-\${var.environment}"
  location = "us-central1"

  remove_default_node_pool = true
  initial_node_count       = 1
}

resource "google_container_node_pool" "primary_nodes" {
  name       = "alti-dedicated-pool"
  location   = "us-central1"
  cluster    = google_container_cluster.primary.name
  node_count = 3

  node_config {
    machine_type = "e2-standard-4"
  }
}
`,
    government: `
provider "google" {
  project = "inso-code-gov"
  region  = "us-central1"
}

# Assured Workloads configuration for FedRAMP High
resource "google_assured_workloads_workload" "gov_workload" {
  compliance_regime = "FEDRAMP_HIGH"
  display_name      = "alti-gov-workload-\${var.environment}"
  location          = "us-central1"
  organization      = "123456789012"
}

resource "google_compute_instance" "app" {
  name         = "inso-code-gov-\${var.environment}"
  machine_type = "e2-standard-4"
  zone         = "us-central1-a"

  boot_disk {
    initialize_params {
      image = "debian-cloud/debian-11"
    }
  }

  network_interface {
    network = "default"
    access_config {}
  }

  metadata_startup_script = <<-EOF
    #!/bin/bash
    apt-get update
    apt-get install -y docker.io
    docker run -d -p 80:3000 \\
      -e KEYCLOAK_ISSUER="\${var.lco_keycloak_issuer}" \\
      -e KEYCLOAK_CLIENT_ID="\${var.lco_keycloak_client_id}" \\
      -e KEYCLOAK_CLIENT_SECRET="\${var.lco_keycloak_client_secret}" \\
      -e LCO_BILLING_API="\${var.lco_billing_api}" \\
      \${var.docker_image}
  EOF
}
`
  },
  azure: {
    multi_tenant: `
provider "azurerm" {
  features {}
}

resource "azurerm_resource_group" "rg" {
  name     = "alti-multi-rg-\${var.environment}"
  location = "East US"
}

resource "azurerm_container_group" "app" {
  name                = "alti-aci-\${var.environment}"
  location            = azurerm_resource_group.rg.location
  resource_group_name = azurerm_resource_group.rg.name
  ip_address_type     = "Public"
  dns_name_label      = "alti-multi-\${var.environment}"
  os_type             = "Linux"

  container {
    name   = "inso-code"
    image  = var.docker_image
    cpu    = "1.0"
    memory = "1.5"

    ports {
      port     = 3000
      protocol = "TCP"
    }

    environment_variables = {
      "KEYCLOAK_ISSUER"        = var.lco_keycloak_issuer
      "KEYCLOAK_CLIENT_ID"     = var.lco_keycloak_client_id
      "KEYCLOAK_CLIENT_SECRET" = var.lco_keycloak_client_secret
      "LCO_BILLING_API"        = var.lco_billing_api
    }
  }
}
`,
    single_tenant: `
provider "azurerm" {
  features {}
}

resource "azurerm_resource_group" "rg" {
  name     = "alti-single-aks-rg-\${var.environment}"
  location = "East US"
}

resource "azurerm_kubernetes_cluster" "aks" {
  name                = "alti-single-aks-\${var.environment}"
  location            = azurerm_resource_group.rg.location
  resource_group_name = azurerm_resource_group.rg.name
  dns_prefix          = "altisingle"

  default_node_pool {
    name       = "default"
    node_count = 3
    vm_size    = "Standard_D4_v2"
  }

  identity {
    type = "SystemAssigned"
  }
}
`,
    government: `
provider "azurerm" {
  features {}
  environment = "usgovernment" # Azure Gov
}

resource "azurerm_resource_group" "rg" {
  name     = "alti-gov-rg-\${var.environment}"
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
  name                = "alti-gov-vm-\${var.environment}"
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
    docker run -d -p 80:3000 \\
      -e KEYCLOAK_ISSUER="\${var.lco_keycloak_issuer}" \\
      -e KEYCLOAK_CLIENT_ID="\${var.lco_keycloak_client_id}" \\
      -e KEYCLOAK_CLIENT_SECRET="\${var.lco_keycloak_client_secret}" \\
      -e LCO_BILLING_API="\${var.lco_billing_api}" \\
      \${var.docker_image}
  EOF
  )
}
`
  }
};

if (!fs.existsSync(baseDir)) {
  fs.mkdirSync(baseDir, { recursive: true });
}

Object.keys(configs).forEach(cloud => {
  Object.keys(configs[cloud]).forEach(topology => {
    const dirPath = path.join(baseDir, cloud, topology);
    fs.mkdirSync(dirPath, { recursive: true });

    fs.writeFileSync(path.join(dirPath, 'main.tf'), configs[cloud][topology].trim() + '\\n');
    fs.writeFileSync(path.join(dirPath, 'variables.tf'), commonVariables.trim() + '\\n');
    
    console.log("Created " + cloud + "/" + topology);
  });
});
console.log('Done!');
