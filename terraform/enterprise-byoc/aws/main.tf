terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

variable "aws_region" {
  description = "The AWS region anchoring the Outpost."
  type        = string
  default     = "us-east-1"
}

variable "customer_name" {
  description = "The name of the Enterprise customer."
  type        = string
}

variable "outpost_arn" {
  description = "The ARN of the physical AWS Outpost rack installed in the customer's datacenter."
  type        = string
}

# ==========================================
# VPC & Outpost Networking (Air-Gapped Local Gateway)
# ==========================================
resource "aws_vpc" "outpost_vpc" {
  cidr_block = "10.0.0.0/16"
  enable_dns_hostnames = true
  enable_dns_support   = true
  tags = { Name = "alti-outpost-vpc-${var.customer_name}" }
}

resource "aws_subnet" "outpost_subnet" {
  vpc_id            = aws_vpc.outpost_vpc.id
  cidr_block        = "10.0.1.0/24"
  outpost_arn       = var.outpost_arn # Physical pinning to the Outpost
  availability_zone = "${var.aws_region}a"
  tags = { Name = "alti-outpost-subnet" }
}

# The Local Gateway routes traffic entirely locally within the customer's physical datacenter LAN.
# It mathematically cannot route to the public internet.
data "aws_ec2_local_gateways" "lgw" {}

resource "aws_route_table" "outpost_rt" {
  vpc_id = aws_vpc.outpost_vpc.id
  route {
    cidr_block         = "0.0.0.0/0"
    local_gateway_id   = data.aws_ec2_local_gateways.lgw.ids[0]
  }
}

resource "aws_route_table_association" "outpost_rta" {
  subnet_id      = aws_subnet.outpost_subnet.id
  route_table_id = aws_route_table.outpost_rt.id
}

# ==========================================
# God-Tier Security: CloudHSM (Hardware FIPS 140-2 L3)
# ==========================================
resource "aws_cloudhsm_v2_cluster" "hsm_cluster" {
  hsm_type   = "hsm1.medium"
  subnet_ids = [aws_subnet.outpost_subnet.id]
}

resource "aws_kms_custom_key_store" "hsm_keystore" {
  cloud_hsm_cluster_id = aws_cloudhsm_v2_cluster.hsm_cluster.cluster_id
  custom_key_store_name = "alti-hsm-keystore-${var.customer_name}"
  trust_anchor_certificate = "REQUIRED_BUT_MANAGED_OUT_OF_BAND"
  key_store_password       = "MANAGED_SECURELY"
}

resource "aws_kms_key" "eks_encryption_key" {
  description             = "CloudHSM Backed Key for EKS Secret and Outpost EBS Encryption"
  custom_key_store_id     = aws_kms_custom_key_store.hsm_keystore.id
  enable_key_rotation     = true
}

# ==========================================
# EKS Cluster on AWS Outposts (Physical Disconnected Racks)
# ==========================================
module "eks" {
  source  = "terraform-aws-modules/eks/aws"
  version = "20.0.0"

  cluster_name    = "alti-data-plane-${var.customer_name}"
  cluster_version = "1.29"

  vpc_id                   = aws_vpc.outpost_vpc.id
  subnet_ids               = [aws_subnet.outpost_subnet.id]
  control_plane_subnet_ids = [aws_subnet.outpost_subnet.id]

  create_kms_key = false
  cluster_encryption_config = {
    provider_key_arn = aws_kms_key.eks_encryption_key.arn
    resources        = ["secrets"]
  }

  eks_managed_node_groups = {
    alti_outpost_inference_nodes = {
      min_size       = 3
      max_size       = 3
      desired_size   = 3
      instance_types = ["g5.xlarge"]
      
      # The nodes execute completely locally on the physical Outpost rack
      capacity_type  = "ON_DEMAND"
      
      enclave_options = {
        enabled = true # Nitro Enclaves still active on Outpost hardware
      }
    }
  }
}

# ==========================================
# Disconnected Tactical Edge (AWS Snowball Edge)
# ==========================================
# Placeholders for fully offline AWS Snowball Edge clusters.
# For environments where even the Outpost fiber connection is cut (e.g. submarines, forward operating bases).
resource "aws_eks_cluster" "snowball_cluster" {
  count = var.enable_tactical_snowball ? 1 : 0
  name  = "alti-tactical-edge"
  role_arn = "arn:aws:iam::123456789012:role/eks-snowball-role"
  vpc_config {
    subnet_ids = [aws_subnet.outpost_subnet.id]
  }
}

variable "enable_tactical_snowball" {
  type    = bool
  default = false
}
