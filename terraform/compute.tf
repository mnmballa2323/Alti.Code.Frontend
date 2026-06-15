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

# Standalone Bootable Cinder Volume with Encryption Metadata
resource "openstack_blockstorage_volume_v3" "boot_volume" {
  name        = "alti-boot-vol-${var.customer_id}"
  size        = var.openstack_boot_volume_size
  volume_type = var.openstack_boot_volume_type
  image_id    = var.openstack_image_name
  
  metadata = {
    encrypted   = "true"
    fips-140-2  = "true"
    customer_id = var.customer_id
  }
}

# ── 3. Namespaced Compute Node ──
resource "openstack_compute_instance_v2" "backend_instance" {
  name            = "alti-backend-${var.customer_id}-node"
  flavor_name     = var.openstack_flavor_name
  key_pair        = var.openstack_keypair_name
  security_groups = ["default", openstack_networking_secgroup_v2.backend_secgroup.name]

  # Standalone Bootable Cinder Volume with Encryption Metadata
  # Boot VM from persistent Cinder volume with explicit disk capacity and type
  block_device {
    uuid                  = openstack_blockstorage_volume_v3.boot_volume.id
    source_type           = "volume"
    destination_type      = "volume"
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

              # 5.5. Configure passwordless SSH from Backend to Sandbox VM
              echo "Configuring passwordless SSH key..."
              if [ ! -f /home/ubuntu/.ssh/id_rsa ]; then
                sudo -u ubuntu ssh-keygen -t rsa -N "" -f /home/ubuntu/.ssh/id_rsa
              fi
              mkdir -p /opt/alti-code-studio/logs/workspaces
              cp /home/ubuntu/.ssh/id_rsa.pub /opt/alti-code-studio/logs/workspaces/backend_node_key.pub
              chown -R ubuntu:ubuntu /opt/alti-code-studio/logs/workspaces

              # Disable SSH Strict Host Key Checking for local VPC private IPs
              cat <<SSHCFG >> /etc/ssh/ssh_config
Host 10.*
    StrictHostKeyChecking no
    UserKnownHostsFile /dev/null
SSHCFG

              cd /opt/alti-code-studio

              # 6. Create production environment variables configuration
              cat <<EOT > .env
              PORT=5000
              NODE_ENV=production
              CUSTOMER_DOMAIN=${var.customer_domain}
              DB_PASSWORD=${random_password.db_password.result}
              # Stripe config
              NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_51MlI9pAP2f3pNlGaofGvvj1eu7sSgRfze6CNAqOC7OFkafRyOdQEECDNJ7ckGwd78fV2o6PkOExZfJcPLNSJUnz300G2iSnF25
              
              # OpenStack Keystone Configurations (Private Cloud Mode)
              PRIVATE_CLOUD_MODE=true
              OS_AUTH_URL=${var.openstack_auth_url}
              OPENSTACK_DEFAULT_DOMAIN=Default
              TENANCY_MODEL=${var.tenancy_model}
              
              # Docker Remote Sandbox VM Configurations
              SANDBOX_VM_IP=${openstack_compute_instance_v2.sandbox_instance.network[0].fixed_ip_v4}
              DOCKER_HOST=ssh://ubuntu@${openstack_compute_instance_v2.sandbox_instance.network[0].fixed_ip_v4}
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

              # 10. Configure Centralized Egress Log Forwarding (SIEM Integration)
              if [ -n "${var.syslog_server_ip}" ]; then
                echo "Configuring log forwarding to SIEM server: ${var.syslog_server_ip}..."
                echo "*.* @${var.syslog_server_ip}:${var.syslog_server_port}" >> /etc/rsyslog.d/90-siem-forward.conf
                systemctl restart rsyslog
              fi

              # 10.5. Configure NFS Server for Sandbox VM Workspace Access
              echo "Configuring NFS Server for Sandbox VM Workspace Access..."
              apt-get install -y nfs-kernel-server
              mkdir -p /opt/alti-code-studio/logs/workspaces
              chmod -R 777 /opt/alti-code-studio/logs/workspaces
              echo "/opt/alti-code-studio/logs/workspaces ${var.customer_subnet_cidr}(rw,sync,no_subtree_check,no_root_squash)" >> /etc/exports
              exportfs -a
              systemctl restart nfs-kernel-server

              # 10.6. Configure Stale Workspace Garbage Collection (Phase 2)
              echo "Configuring stale workspace garbage collection..."
              cat <<'STALECLEANUP' > /usr/local/bin/cleanup_stale_workspaces.sh
              #!/bin/bash
              # Prune workspace folders older than 14 days
              find /opt/alti-code-studio/logs/workspaces -mindepth 1 -maxdepth 1 -type d -mtime +14 -exec rm -rf {} +
              STALECLEANUP
              chmod +x /usr/local/bin/cleanup_stale_workspaces.sh
              (crontab -l 2>/dev/null; echo "0 4 * * * /usr/local/bin/cleanup_stale_workspaces.sh") | crontab -

              # 10.7. Configure Syslog Receiver for Sandbox Container Auditing (Phase 4)
              echo "Configuring syslog receiver for Sandbox container auditing..."
              cat <<'SYSLOGRCV' > /etc/rsyslog.d/50-alti-sandbox.conf
              # Enable UDP syslog reception on port 514
              module(load="imudp")
              input(type="imudp" port="514")

              # Route Sandbox Docker logs to dedicated audit log file
              if $$hostname contains "alti-sandbox" then {
                  action(type="omfile" file="/var/log/alti-sandbox-containers.log")
                  stop
              }
              SYSLOGRCV
              systemctl restart rsyslog

              # 11. Start the production database, cache, proxy and frontend services
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

output "sandbox_vm_private_ip" {
  description = "Private IP of the customer isolated sandbox VM node"
  value       = openstack_compute_instance_v2.sandbox_instance.access_ip_v4
}

output "customer_vpc_network_id" {
  description = "VPC Network UUID for the customer"
  value       = openstack_networking_network_v2.customer_vpc.id
}

# ── 6. Sandbox Compute Node and Security Groups ──

resource "openstack_networking_secgroup_v2" "sandbox_secgroup" {
  name        = "alti-sandbox-${var.customer_id}-secgroup"
  description = "Security group for Alti Sandbox Node - Customer ${var.customer_id}"
}

# SSH Rule for Sandbox: Allow inbound SSH from within the VPC (e.g. backend_instance)
resource "openstack_networking_secgroup_rule_v2" "sandbox_ssh_rule" {
  direction         = "ingress"
  ethertype         = "IPv4"
  protocol          = "tcp"
  port_range_min    = 22
  port_range_max    = 22
  remote_ip_prefix  = var.customer_subnet_cidr
  security_group_id = openstack_networking_secgroup_v2.sandbox_secgroup.id
}

# Persistent Boot Volume for Sandbox compute node
resource "openstack_blockstorage_volume_v3" "sandbox_boot_volume" {
  name        = "alti-sandbox-boot-vol-${var.customer_id}"
  size        = 100 # Dedicated 100GB disk for isolated Docker workspaces/cache
  volume_type = var.openstack_boot_volume_type
  image_id    = var.openstack_image_name
  
  metadata = {
    role        = "sandbox-sovereign"
    customer_id = var.customer_id
  }
}

# Dedicated unprivileged Sandbox Compute instance
resource "openstack_compute_instance_v2" "sandbox_instance" {
  name            = "alti-sandbox-${var.customer_id}-node"
  flavor_name     = var.openstack_flavor_name
  key_pair        = var.openstack_keypair_name
  security_groups = ["default", openstack_networking_secgroup_v2.sandbox_secgroup.name]

  block_device {
    uuid                  = openstack_blockstorage_volume_v3.sandbox_boot_volume.id
    source_type           = "volume"
    destination_type      = "volume"
    boot_index            = 0
    delete_on_termination = true
  }

  network {
    uuid = openstack_networking_network_v2.customer_vpc.id
  }

  metadata = {
    role        = "sandbox-sovereign"
    customer_id = var.customer_id
    environment = var.environment
  }

  # Sandbox VM UserData script to initialize Docker and mount backend workspaces directory via NFS
  user_data = <<-EOF
              #!/bin/bash
              set -ex

              # 1. Host OS Performance Optimizations
              echo "Applying OS performance optimizations..."
              cat <<LIMITS >> /etc/security/limits.conf
              * soft nofile 65536
              * hard nofile 65536
              root soft nofile 65536
              root hard nofile 65536
              LIMITS
              echo "session required pam_limits.so" >> /etc/pam.d/common-session

              cat <<SYSCTL >> /etc/sysctl.conf
              vm.overcommit_memory=1
              fs.file-max=2097152
              vm.max_map_count=262144
              SYSCTL
              sysctl -p

              # 2. Install Docker, NFS Client utilities, and dependencies
              apt-get update
              apt-get install -y apt-transport-https ca-certificates curl gnupg lsb-release git nfs-common

              # Add Docker's official GPG key
              mkdir -p /etc/apt/keyrings
              curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg

              # Set up docker repository
              echo \
                "deb [arch=\$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
                \$(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null

              apt-get update
              apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

              # Configure Docker daemon max-size logging & BuildKit acceleration (with remote syslog forwarding - Phase 4)
              mkdir -p /etc/docker
              cat <<DOCKER > /etc/docker/daemon.json
              {
                "log-driver": "syslog",
                "log-opts": {
                  "syslog-address": "udp://${openstack_compute_instance_v2.backend_instance.network[0].fixed_ip_v4}:514",
                  "tag": "{{.Name}}",
                  "syslog-facility": "local0"
                },
                "max-concurrent-downloads": 10,
                "max-concurrent-uploads": 5,
                "features": {
                  "buildkit": true
                }
              }
              DOCKER

              systemctl daemon-reload
              systemctl enable docker
              systemctl start docker || systemctl restart docker

              # 3. Mount Backend Workspaces via NFS
              mkdir -p /opt/alti-code-studio/logs/workspaces
              
              # Wait for backend NFS server export directory to become active
              for i in {1..30}; do
                if showmount -e ${openstack_compute_instance_v2.backend_instance.network[0].fixed_ip_v4} | grep -q "/opt/alti-code-studio/logs/workspaces"; then
                  break
                fi
                sleep 5
              done

              # Mount the shared workspace
              mount -t nfs ${openstack_compute_instance_v2.backend_instance.network[0].fixed_ip_v4}:/opt/alti-code-studio/logs/workspaces /opt/alti-code-studio/logs/workspaces
              
              # Persist mount on system reboots
              echo "${openstack_compute_instance_v2.backend_instance.network[0].fixed_ip_v4}:/opt/alti-code-studio/logs/workspaces /opt/alti-code-studio/logs/workspaces nfs defaults,timeo=900,retrans=5,_netdev 0 0" >> /etc/fstab

              # 4. Authorize Backend VM SSH Key on Sandbox VM
              echo "Authorizing Backend VM SSH key on Sandbox VM..."
              # Wait for backend VM public key to be written to NFS workspaces mount
              for i in {1..60}; do
                if [ -f /opt/alti-code-studio/logs/workspaces/backend_node_key.pub ]; then
                  break
                fi
                sleep 5
              done
              
              if [ -f /opt/alti-code-studio/logs/workspaces/backend_node_key.pub ]; then
                mkdir -p /home/ubuntu/.ssh
                cat /opt/alti-code-studio/logs/workspaces/backend_node_key.pub >> /home/ubuntu/.ssh/authorized_keys
                chown -R ubuntu:ubuntu /home/ubuntu/.ssh
                chmod 700 /home/ubuntu/.ssh
                chmod 600 /home/ubuntu/.ssh/authorized_keys
                echo "Successfully authorized Backend VM SSH key."
              else
                echo "Warning: Backend VM SSH key was not found."
              fi

              # Add ubuntu user to docker group to allow passwordless docker operations
              usermod -aG docker ubuntu

              # 5. Configure Metadata Service Shielding & Firewall rules (Phase 1)
              echo "Configuring metadata service firewall rules..."
              cat <<'FIREWALL' > /usr/local/bin/sandbox_firewall.sh
              #!/bin/bash
              # Reject docker containers forwarding packets to OpenStack metadata service
              iptables -I FORWARD -m conntrack --ctstate RELATED,ESTABLISHED -j ACCEPT
              iptables -A FORWARD -d 169.254.169.254 -j REJECT
              
              # Allow DNS resolution from containers
              iptables -A FORWARD -p udp --dport 53 -j ACCEPT
              iptables -A FORWARD -p tcp --dport 53 -j ACCEPT
              
              # Reject access to other private networks
              iptables -A FORWARD -d 10.0.0.0/8 -j REJECT
              iptables -A FORWARD -d 172.16.0.0/12 -j REJECT
              iptables -A FORWARD -d 192.168.0.0/16 -j REJECT
              FIREWALL
              chmod +x /usr/local/bin/sandbox_firewall.sh

              cat <<'FWSERVICE' > /etc/systemd/system/sandbox-firewall.service
              [Unit]
              Description=Alti Sandbox Container Firewall
              After=docker.service

              [Service]
              Type=oneshot
              ExecStart=/usr/local/bin/sandbox_firewall.sh
              RemainAfterExit=yes

              [Install]
              WantedBy=multi-user.target
              FWSERVICE
              systemctl daemon-reload
              systemctl enable sandbox-firewall.service
              systemctl start sandbox-firewall.service

              # 6. Configure Automated Docker Garbage Collection (Phase 2)
              echo "Configuring docker garbage collection cron..."
              (crontab -l 2>/dev/null; echo "0 3 * * * docker system prune -af --volumes --filter 'until=24h'") | crontab -

              # 7. Configure NFS Mount Recovery (Phase 3)
              echo "Configuring NFS mount recovery health check..."
              cat <<'NFSRECOVER' > /usr/local/bin/nfs_mount_check.sh
              #!/bin/bash
              MOUNT_POINT="/opt/alti-code-studio/logs/workspaces"
              LOGFILE="/var/log/nfs_mount_recovery.log"
              
              if ! timeout 5 ls "$$MOUNT_POINT" >/dev/null 2>&1; then
                echo "$$(date '+%Y-%m-%d %H:%M:%S') - NFS mount stale or unresponsive. Forcing unmount and remounting..." >> "$$LOGFILE"
                umount -f -l "$$MOUNT_POINT" || true
                mount -a || echo "$$(date '+%Y-%m-%d %H:%M:%S') - Remount failed!" >> "$$LOGFILE"
              fi
              NFSRECOVER
              chmod +x /usr/local/bin/nfs_mount_check.sh
              (crontab -l 2>/dev/null; echo "*/5 * * * * /usr/local/bin/nfs_mount_check.sh") | crontab -
              EOF
}
