variable "vpc_id" {
  description = "VPC ID where FPGA instances will be launched"
  type        = string
}

variable "subnet_id" {
  description = "Subnet ID for the FPGA instance"
  type        = string
}

variable "fpga_ami_id" {
  description = "AMI ID for FPGA developer AMI (e.g., AWS FPGA Developer AMI)"
  type        = string
  default     = "ami-0b923126f555d4c81" # Example placeholder AMI ID
}

variable "instance_type" {
  description = "FPGA instance type"
  type        = string
  default     = "f1.2xlarge"
}

resource "aws_security_group" "fpga_sg" {
  name        = "fpga-crypto-sg"
  description = "Security group for FPGA Cryptographic Acceleration Instances"
  vpc_id      = var.vpc_id

  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["10.0.0.0/8"] # Restrict to internal network
    description = "SSH access from internal network"
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "FPGACryptoSG"
  }
}

resource "aws_instance" "fpga_crypto_accelerator" {
  ami           = var.fpga_ami_id
  instance_type = var.instance_type
  subnet_id     = var.subnet_id

  vpc_security_group_ids = [aws_security_group.fpga_sg.id]

  # Recommended storage for FPGA synthesis and operations
  root_block_device {
    volume_size = 100
    volume_type = "gp3"
  }

  user_data = <<-EOF
              #!/bin/bash
              echo "Initializing FPGA Cryptographic Acceleration Node..."
              
              # Update and install dependencies
              yum update -y
              yum install -y aws-fpga-developer-ami
              
              # Load required kernel modules for FPGA interaction
              modprobe edma
              modprobe xdma
              
              # Setup standard directories
              mkdir -p /opt/crypto-fpga
              echo "FPGA Node Ready for AFI loading." > /opt/crypto-fpga/status.txt
              
              # Concept: Load AFI (Amazon FPGA Image) for crypto acceleration
              # fpga-load-local-image -S 0 -I agfi-0123456789abcdef0
              EOF

  tags = {
    Name        = "F1-Crypto-Accelerator"
    Role        = "Hardware-Acceleration"
    Environment = "Production"
  }
}

output "fpga_instance_id" {
  value = aws_instance.fpga_crypto_accelerator.id
}

output "fpga_instance_private_ip" {
  value = aws_instance.fpga_crypto_accelerator.private_ip
}
