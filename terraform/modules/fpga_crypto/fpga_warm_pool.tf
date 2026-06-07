# Terraform Configuration for AWS F1 FPGA Auto Scaling Group Warm Pools
# This ensures that computationally expensive FPGA instances are pre-initialized 
# with the Custom Hardware Logic (AFI) so they can instantly absorb cryptographic traffic spikes.

resource "aws_autoscaling_group" "fpga_crypto_asg" {
  name                      = "fpga-crypto-hardware-pool"
  max_size                  = 10
  min_size                  = 2
  desired_capacity          = 2
  vpc_zone_identifier       = var.private_subnet_ids
  health_check_grace_period = 300
  health_check_type         = "EC2"
  
  launch_template {
    id      = aws_launch_template.fpga_crypto_template.id
    version = "$Latest"
  }

  tag {
    key                 = "Name"
    value               = "FPGA-Crypto-Node"
    propagate_at_launch = true
  }

  # EKS specific tags to allow the cluster autoscaler to discover the pool
  tag {
    key                 = "k8s.io/cluster/${var.cluster_name}"
    value               = "owned"
    propagate_at_launch = true
  }
  
  # A Warm Pool maintains instances in a Stopped state to save compute costs, 
  # while keeping the EBS volumes and configurations fully initialized. 
  # For FPGAs, this dramatically reduces scale-out latency.
  warm_pool {
    pool_state                  = "Stopped"
    min_size                    = 1
    max_group_prepared_capacity = 3
    
    instance_reuse_policy {
      # We don't reuse terminated instances, we provision new ones for the warm pool
      reuse_on_scale_in = false
    }
  }
}

# Advanced scaling policies leveraging the Prometheus Exporter metrics we built in Cycle 36 and 52
resource "aws_autoscaling_policy" "fpga_scale_out_policy" {
  name                   = "fpga-crypto-scale-out"
  scaling_adjustment     = 1
  adjustment_type        = "ChangeInCapacity"
  cooldown               = 120
  autoscaling_group_name = aws_autoscaling_group.fpga_crypto_asg.name
}

# The launch template defines the f1.2xlarge hardware
resource "aws_launch_template" "fpga_crypto_template" {
  name_prefix   = "fpga-crypto-node-"
  image_id      = var.fpga_ami_id # Ideally an AMI pre-baked with the AWS FPGA SDK
  instance_type = "f1.2xlarge"
  
  vpc_security_group_ids = [var.fpga_security_group_id]
  
  iam_instance_profile {
    name = var.fpga_instance_profile_name
  }

  # The UserData script is critical: it triggers the fpga-load-local-image command 
  # to flash the logic gates the moment the instance boots from the warm pool.
  user_data = base64encode(<<EOF
#!/bin/bash
set -ex

# Load the proprietary Cryptographic AFI onto the FPGA silicon
# This process takes 5-10 seconds, which is why the Warm Pool is critical
fpga-load-local-image -S 0 -I ${var.agfi_id}

# Join the EKS Cluster with specific FPGA taints to prevent generic workloads from stealing the hardware
/etc/eks/bootstrap.sh ${var.cluster_name} \
  --kubelet-extra-args '--node-labels=hardware=fpga --register-with-taints=hardware=fpga:NoSchedule'

EOF
  )

  block_device_mappings {
    device_name = "/dev/xvda"
    ebs {
      volume_size = 50
      volume_type = "gp3"
      encrypted   = true
    }
  }
}

variable "cluster_name" {
  type = string
}
variable "private_subnet_ids" {
  type = list(string)
}
variable "fpga_ami_id" {
  type = string
}
variable "fpga_security_group_id" {
  type = string
}
variable "fpga_instance_profile_name" {
  type = string
}
variable "agfi_id" {
  description = "The Amazon FPGA Image (AFI) ID containing the compiled hardware logic"
  type = string
  default = "agfi-0123456789abcdef0"
}
