# ==============================================================================
# ALTI CODE STUDIO: Single-Tenant VPC & Compute Node Provisioning
# ==============================================================================

# ── 0. Cryptographically Secure Dynamic Tenant Database Password ──
resource "random_password" "db_password" {
  length  = 32
  special = false
}

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
  flavor_name     = var.openstack_flavor_name
  key_pair        = var.openstack_keypair_name
  security_groups = ["default", openstack_networking_secgroup_v2.backend_secgroup.name]

  # Boot VM from persistent Cinder volume with explicit disk capacity and type
  block_device {
    uuid                  = var.openstack_image_name
    source_type           = "image"
    destination_type      = "volume"
    volume_size           = var.openstack_boot_volume_size
    volume_type           = var.openstack_boot_volume_type
    boot_index            = 0
    delete_on_termination = true
  }

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

              # 1. Host Tuning (Lamborghini Mode)
              echo "Applying OS performance optimizations..."
              
              # Increase open file descriptor limits
              cat <<LIMITS >> /etc/security/limits.conf
              * soft nofile 65536
              * hard nofile 65536
              root soft nofile 65536
              root hard nofile 65536
              LIMITS
              echo "session required pam_limits.so" >> /etc/pam.d/common-session

              # Tune TCP backlog, buffers, and virtual memory overcommit
              cat <<SYSCTL >> /etc/sysctl.conf
              vm.overcommit_memory=1
              fs.file-max=2097152
              vm.max_map_count=262144
              net.core.somaxconn=1024
              net.ipv4.tcp_max_syn_backlog=2048
              net.core.netdev_max_backlog=2500
              net.ipv4.tcp_rmem=4096 87380 16777216
              net.ipv4.tcp_wmem=4096 65536 16777216
              net.core.default_qdisc=fq
              net.ipv4.tcp_congestion_control=bbr
              SYSCTL
              sysctl -p

              # 2. Host Hardening (Fortune 100 Security Standards)
              echo "Enforcing host security hardening..."
              
              # Set up UFW (Uncomplicated Firewall) rules
              apt-get update
              apt-get install -y ufw fail2ban
              ufw default deny incoming
              ufw default allow outgoing
              # Block egress to Cloud Metadata IP (SSRF protection)
              ufw deny out to 169.254.169.254
              ufw allow 22/tcp   # Secure SSH
              ufw allow 80/tcp   # HTTP SSL Negotiation (Certbot)
              ufw allow 443/tcp  # HTTPS Secure API Gateway
              ufw allow 5000/tcp # Core Backend API Port
              ufw --force enable

              # Enable Fail2ban to block SSH brute-force attacks
              cat <<FAIL2BAN > /etc/fail2ban/jail.local
              [sshd]
              enabled = true
              port = 22
              filter = sshd
              logpath = /var/log/auth.log
              maxretry = 3
              bantime = 86400
              findtime = 600
              FAIL2BAN
              systemctl enable fail2ban
              systemctl restart fail2ban

              # SSH Hardening (Disable password and root logins)
              sed -i 's/#PermitRootLogin yes/PermitRootLogin no/g' /etc/ssh/sshd_config || true
              sed -i 's/PermitRootLogin yes/PermitRootLogin no/g' /etc/ssh/sshd_config || true
              sed -i 's/#PasswordAuthentication yes/PasswordAuthentication no/g' /etc/ssh/sshd_config || true
              sed -i 's/PasswordAuthentication yes/PasswordAuthentication no/g' /etc/ssh/sshd_config || true
              systemctl restart ssh || systemctl restart sshd

              # 3. Install Docker & Docker-Compose dependencies
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

              # 4. Configure Docker Daemon optimizations
              mkdir -p /etc/docker
              cat <<DOCKER > /etc/docker/daemon.json
              {
                "log-driver": "json-file",
                "log-opts": {
                  "max-size": "50m",
                  "max-file": "3"
                },
                "max-concurrent-downloads": 10,
                "max-concurrent-uploads": 5,
                "features": {
                  "buildkit": true
                }
              }
              DOCKER

              # Enable and start Docker
              systemctl daemon-reload
              systemctl enable docker
              systemctl start docker || systemctl restart docker

              # 5. Clone the Alti Code Studio repository
              mkdir -p /opt/alti-code-studio
              git clone https://github.com/${var.github_repository}.git /opt/alti-code-studio

              cd /opt/alti-code-studio

              # 6. Create production environment variables configuration
              cat <<EOT > .env
              PORT=5000
              NODE_ENV=production
              CUSTOMER_DOMAIN=${var.customer_domain}
              DB_PASSWORD=${random_password.db_password.result}
              # Stripe config
              NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_51MlI9pAP2f3pNlGaofGvvj1eu7sSgRfze6CNAqOC7OFkafRyOdQEECDNJ7ckGwd78fV2o6PkOExZfJcPLNSJUnz300G2iSnF25
              EOT

              # 7. Configure Nightly Postgres Backup Script & Cron Job
              mkdir -p /var/backups/postgres
              mkdir -p /var/backups/postgres/wals
              chown -R 999:999 /var/backups/postgres/wals
              chmod -R 700 /var/backups/postgres/wals

              cat <<'BACKUP' > /usr/local/bin/backup_postgres.sh
              #!/bin/bash
              BACKUP_DIR="/var/backups/postgres"
              DATE=$(date +%Y-%m-%d_%H%M%S)
              FILENAME="$${BACKUP_DIR}/postgres_backup_$${DATE}.sql.gz"
              
              # Dump database and gzip
              docker exec -t alti_backend_postgres_1 pg_dumpall -U postgres | gzip > "$$FILENAME"
              
              # Retain 14 days of history
              find "$$BACKUP_DIR" -type f -name "*.sql.gz" -mtime +14 -delete
              BACKUP
              chmod +x /usr/local/bin/backup_postgres.sh
              (crontab -l 2>/dev/null; echo "0 2 * * * /usr/local/bin/backup_postgres.sh") | crontab -

              # 8. Configure Self-Healing API Health Monitor Script
              cat <<'HEALTHCHECK' > /usr/local/bin/alti_health_check.sh
              #!/bin/bash
              URL="http://localhost/api/v1/healthz"
              LOGFILE="/var/log/alti_self_healing.log"
              STACK_DIR="/opt/alti-code-studio"
              
              STATUS_CODE=$(curl -s -o /dev/null -w "%%{http_code}" --max-time 5 "$$URL")
              
              if [ "$$STATUS_CODE" != "200" ]; then
                echo "$$(date '+%%Y-%%m-%%d %%H:%%M:%%S') - HEALTH CHECK FAILED (Status: $$STATUS_CODE). Repairing active backend container..." >> "$$LOGFILE"
                cd "$$STACK_DIR"
                ACTIVE="blue"
                if [ -f "./active_backend.conf" ] && grep -q "alti-backend-green" "./active_backend.conf"; then
                  ACTIVE="green"
                fi
                docker-compose -f docker-compose.prod.yml restart "alti-backend-$$ACTIVE" >> "$$LOGFILE" 2>&1
              else
                echo "$$(date '+%%Y-%%m-%%d %%H:%%M:%%S') - Health OK (Status: 200)" >> "$$LOGFILE"
              fi
              HEALTHCHECK
              chmod +x /usr/local/bin/alti_health_check.sh
              (crontab -l 2>/dev/null; echo "*/5 * * * * /usr/local/bin/alti_health_check.sh") | crontab -

              # 9. Configure Host Blue-Green Deployment Orchestration Script
              cat <<'BLUEGREEN' > /usr/local/bin/deploy_blue_green.sh
              #!/bin/bash
              set -e
              STACK_DIR="/opt/alti-code-studio"
              cd "$$STACK_DIR"
              
              ACTIVE="blue"
              if [ -f "./active_backend.conf" ] && grep -q "alti-backend-green" "./active_backend.conf"; then
                ACTIVE="green"
              fi
              
              if [ "$$ACTIVE" == "blue" ]; then
                TARGET="green"
                PORT=3002
              else
                TARGET="blue"
                PORT=3000
              fi
              
              echo "Active stack is $$ACTIVE. Preparing to deploy to target stack: $$TARGET..."
              docker-compose -f docker-compose.prod.yml up -d --build "alti-backend-$$TARGET"
              
              echo "Polling http://localhost:$$PORT/api/v1/healthz until online..."
              SUCCESS=0
              for i in {1..30}; do
                STATUS=$$(curl -s -o /dev/null -w "%%{http_code}" --max-time 2 "http://localhost:$$PORT/api/v1/healthz" || true)
                if [ "$$STATUS" == "200" ]; then
                  SUCCESS=1
                  break
                fi
                sleep 2
              done
              
              if [ "$$SUCCESS" -ne 1 ]; then
                echo "ERROR: Target stack $$TARGET failed to respond. Aborting deployment."
                exit 1
              fi
              
              echo "Target stack $$TARGET is healthy! Switching Caddy traffic routing..."
              echo "reverse_proxy alti-backend-$$TARGET:3000" > "./active_backend.conf"
              docker-compose -f docker-compose.prod.yml exec -t caddy caddy reload --config /etc/caddy/Caddyfile
              
              echo "Caddy routed traffic to $$TARGET successfully. Stopping old stack: $$ACTIVE..."
              docker-compose -f docker-compose.prod.yml stop "alti-backend-$$ACTIVE"
              
              echo "Blue-Green deployment complete. Now serving on $$TARGET."
              BLUEGREEN
              chmod +x /usr/local/bin/deploy_blue_green.sh

              # 10. Start the production database, cache, proxy and frontend services
              cd /opt/alti-code-studio
              echo "reverse_proxy alti-backend-blue:3000" > ./active_backend.conf
              docker-compose -f docker-compose.prod.yml up -d postgres redis prometheus grafana jaeger caddy alti-frontend
              
              # Execute the first blue-green deployment to build/run the backend service container
              /usr/local/bin/deploy_blue_green.sh
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
