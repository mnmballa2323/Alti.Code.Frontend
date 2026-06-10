# ==============================================================================
# ALTI CODE STUDIO: Single-Tenant VPC & Compute Node Provisioning
# ==============================================================================

# ── 1. Customer-Specific VPC Network ──
resource "openstack_networking_network_v2" "customer_vpc" {
  name           = "alti-vpc-${var.customer_id}"
  admin_state_up = true
}

# Private Subnet inside the VPC
resource "openstack_networking_subnet_v2" "customer_subnet" {
  name            = "alti-subnet-${var.customer_id}"
  network_id      = openstack_networking_network_v2.customer_vpc.id
  cidr            = var.customer_subnet_cidr
  ip_version      = 4
  dns_nameservers = ["1.1.1.1", "8.8.8.8"]
}

# Attach Subnet to the Gateway Router for outbound API calls (AWS, GCP, Azure)
resource "openstack_networking_router_interface_v2" "router_interface" {
  count     = var.openstack_router_id != "" ? 1 : 0
  router_id = var.openstack_router_id
  subnet_id = openstack_networking_subnet_v2.customer_subnet.id
}

# ── 2. Isolated Security Group ──
resource "openstack_networking_secgroup_v2" "backend_secgroup" {
  name        = "alti-backend-${var.customer_id}-secgroup"
  description = "Security group for Alti Backend Node - Customer ${var.customer_id}"
}

# SSH Rule
resource "openstack_networking_secgroup_rule_v2" "ssh_rule" {
  direction         = "ingress"
  ethertype         = "IPv4"
  protocol          = "tcp"
  port_range_min    = 22
  port_range_max    = 22
  remote_ip_prefix  = "0.0.0.0/0"
  security_group_id = openstack_networking_secgroup_v2.backend_secgroup.id
}

# HTTP Rule
resource "openstack_networking_secgroup_rule_v2" "http_rule" {
  direction         = "ingress"
  ethertype         = "IPv4"
  protocol          = "tcp"
  port_range_min    = 80
  port_range_max    = 80
  remote_ip_prefix  = "0.0.0.0/0"
  security_group_id = openstack_networking_secgroup_v2.backend_secgroup.id
}

# HTTPS Rule
resource "openstack_networking_secgroup_rule_v2" "https_rule" {
  direction         = "ingress"
  ethertype         = "IPv4"
  protocol          = "tcp"
  port_range_min    = 443
  port_range_max    = 443
  remote_ip_prefix  = "0.0.0.0/0"
  security_group_id = openstack_networking_secgroup_v2.backend_secgroup.id
}

# Backend API Port Rule
resource "openstack_networking_secgroup_rule_v2" "backend_port_rule" {
  direction         = "ingress"
  ethertype         = "IPv4"
  protocol          = "tcp"
  port_range_min    = 5000
  port_range_max    = 5000
  remote_ip_prefix  = "0.0.0.0/0"
  security_group_id = openstack_networking_secgroup_v2.backend_secgroup.id
}

# ── 3. Namespaced Compute Node ──
resource "openstack_compute_instance_v2" "backend_instance" {
  name            = "alti-backend-${var.customer_id}-node"
  image_name      = var.openstack_image_name
  flavor_name     = var.openstack_flavor_name
  key_pair        = var.openstack_keypair_name
  security_groups = ["default", openstack_networking_secgroup_v2.backend_secgroup.name]

  # Deploy VM inside the customer-specific VPC network
  network {
    uuid = openstack_networking_network_v2.customer_vpc.id
  }

  metadata = {
    role        = "backend-sovereign"
    customer_id = var.customer_id
    environment = var.environment
  }

  # UserData Script to bootstrap Docker, Docker-compose, and launch backend stack
  user_data = <<-EOF
              #!/bin/bash
              set -ex

              # 1. Install Docker & Docker-Compose dependencies
              apt-get update
              apt-get install -y apt-transport-https ca-certificates curl gnupg lsb-release git

              # Add Docker's official GPG key
              mkdir -p /etc/apt/keyrings
              curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg

              # Set up docker repository
              echo \
                "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
                $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null

              apt-get update
              apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

              # Symlink docker-compose for compatibility
              ln -sf /usr/libexec/docker/cli-plugins/docker-compose /usr/local/bin/docker-compose

              # Enable and start Docker
              systemctl enable docker
              systemctl start docker

              # 2. Clone the Alti Code Studio repository
              mkdir -p /opt/alti-code-studio
              git clone https://github.com/${var.github_repository}.git /opt/alti-code-studio

              cd /opt/alti-code-studio

              # 3. Create production environment variables configuration
              cat <<EOT > .env
              PORT=5000
              NODE_ENV=production
              # Stripe config
              NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_51MlI9pAP2f3pNlGaofGvvj1eu7sSgRfze6CNAqOC7OFkafRyOdQEECDNJ7ckGwd78fV2o6PkOExZfJcPLNSJUnz300G2iSnF25
              EOT

              # 4. Start the production backend stack using docker-compose
              docker-compose -f docker-compose.prod.yml up -d --build
              EOF
}

# ── 4. Floating IP Association ──
resource "openstack_networking_floatingip_v2" "backend_fip" {
  pool = var.openstack_floating_ip_pool
}

resource "openstack_compute_floatingip_associate_v2" "backend_fip_assoc" {
  floating_ip = openstack_networking_floatingip_v2.backend_fip.address
  instance_id = openstack_compute_instance_v2.backend_instance.id
}

# ── 5. Outputs ──
output "backend_vm_private_ip" {
  description = "Private IP of the customer backend Compute Instance"
  value       = openstack_compute_instance_v2.backend_instance.access_ip_v4
}

output "backend_vm_public_ip" {
  description = "Public Floating IP of the customer backend Compute Instance"
  value       = openstack_networking_floatingip_v2.backend_fip.address
}

output "customer_vpc_network_id" {
  description = "VPC Network UUID for the customer"
  value       = openstack_networking_network_v2.customer_vpc.id
}
