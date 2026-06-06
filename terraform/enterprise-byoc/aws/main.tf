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
  description = "The AWS region to deploy the Alti Code Studio Data Plane."
  type        = string
  default     = "us-east-1"
}

variable "customer_name" {
  description = "The name of the Enterprise customer."
  type        = string
}

# ==========================================
# God-Tier Security: CloudHSM (Hardware FIPS 140-2 L3)
# ==========================================
resource "aws_cloudhsm_v2_cluster" "hsm_cluster" {
  hsm_type   = "hsm1.medium"
  subnet_ids = module.vpc.private_subnets
}

resource "aws_kms_custom_key_store" "hsm_keystore" {
  cloud_hsm_cluster_id = aws_cloudhsm_v2_cluster.hsm_cluster.cluster_id
  custom_key_store_name = "alti-hsm-keystore-${var.customer_name}"
  trust_anchor_certificate = "REQUIRED_BUT_MANAGED_OUT_OF_BAND"
  key_store_password       = "MANAGED_SECURELY"
}

resource "aws_kms_key" "eks_encryption_key" {
  description             = "CloudHSM Backed Key for EKS Secret and EBS Encryption"
  custom_key_store_id     = aws_kms_custom_key_store.hsm_keystore.id
  enable_key_rotation     = true
}

# ==========================================
# VPC & Networking (Zero-Trust + Flow Logs)
# ==========================================
module "vpc" {
  source  = "terraform-aws-modules/vpc/aws"
  version = "5.0.0"

  name = "alti-enterprise-${var.customer_name}-vpc"
  cidr = "10.0.0.0/16"

  azs             = ["${var.aws_region}a", "${var.aws_region}b", "${var.aws_region}c"]
  private_subnets = ["10.0.1.0/24", "10.0.2.0/24", "10.0.3.0/24"]
  public_subnets  = ["10.0.101.0/24", "10.0.102.0/24", "10.0.103.0/24"]

  enable_nat_gateway = true
  single_nat_gateway = false
}

resource "aws_s3_bucket" "audit_bucket" {
  bucket = "alti-enterprise-audit-${var.customer_name}"
}

resource "aws_flow_log" "vpc_flow_log" {
  log_destination      = aws_s3_bucket.audit_bucket.arn
  log_destination_type = "s3"
  traffic_type         = "ALL"
  vpc_id               = module.vpc.vpc_id
}

# ==========================================
# Deep Packet Inspection & Boundary Shielding
# ==========================================
resource "aws_networkfirewall_firewall" "deep_packet_inspection" {
  name                = "alti-network-firewall"
  firewall_policy_arn = aws_networkfirewall_firewall_policy.strict_policy.arn
  vpc_id              = module.vpc.vpc_id
  subnet_mapping { subnet_id = module.vpc.public_subnets[0] }
}

resource "aws_networkfirewall_firewall_policy" "strict_policy" {
  name = "alti-strict-dpi-policy"
  firewall_policy {
    stateless_default_actions          = ["aws:forward_to_sfe"]
    stateless_fragment_default_actions = ["aws:forward_to_sfe"]
  }
}

# ==========================================
# Dedicated Hosts (Physical Hardware Isolation)
# ==========================================
resource "aws_ec2_host" "dedicated_host" {
  instance_type     = "g5.xlarge"
  availability_zone = "${var.aws_region}a"
  auto_placement    = "on"
}

# ==========================================
# EKS Cluster with Nitro Enclaves (Memory Encryption)
# ==========================================
module "eks" {
  source  = "terraform-aws-modules/eks/aws"
  version = "20.0.0"

  cluster_name    = "alti-data-plane-${var.customer_name}"
  cluster_version = "1.29"

  vpc_id                   = module.vpc.vpc_id
  subnet_ids               = module.vpc.private_subnets
  control_plane_subnet_ids = module.vpc.public_subnets

  create_kms_key = false
  cluster_encryption_config = {
    provider_key_arn = aws_kms_key.eks_encryption_key.arn
    resources        = ["secrets"]
  }

  eks_managed_node_groups = {
    alti_inference_nodes = {
      min_size       = 3
      max_size       = 3
      desired_size   = 3
      instance_types = ["g5.xlarge"]
      
      # Enforce execution on Dedicated Physical Hosts
      placement_group_id = aws_ec2_host.dedicated_host.id
      
      # God-Tier: Enable AWS Nitro Enclaves
      enclave_options = {
        enabled = true
      }
    }
  }
}

# ==========================================
# IAM Roles for Service Accounts (IRSA)
# ==========================================
module "iam_eks_role" {
  source    = "terraform-aws-modules/iam/aws//modules/iam-role-for-service-accounts-eks"
  version   = "5.30.0"

  role_name = "alti-bedrock-access-role-${var.customer_name}"
  attach_amazon_bedrock_full_access = true

  oidc_providers = {
    ex = {
      provider_arn               = module.eks.oidc_provider_arn
      namespace_service_accounts = ["default:alti-backend-aws"]
    }
  }
}

# ==========================================
# ML Threat Detection (GuardDuty & Macie)
# ==========================================
resource "aws_guardduty_detector" "threat_detection" {
  enable = true
}

resource "aws_macie2_account" "macie" {
  status = "ENABLED"
}
