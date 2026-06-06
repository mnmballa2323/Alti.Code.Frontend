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
# Enterprise Security (KMS, CloudTrail, GuardDuty)
# ==========================================
resource "aws_kms_key" "eks_encryption_key" {
  description             = "KMS Key for EKS Secret and EBS Encryption - Alti BYOC"
  enable_key_rotation     = true
  deletion_window_in_days = 7
}

resource "aws_guardduty_detector" "threat_detection" {
  enable = true
  finding_publishing_frequency = "FIFTEEN_MINUTES"
}

resource "aws_cloudtrail" "audit_trail" {
  name                          = "alti-enterprise-audit-trail"
  s3_bucket_name                = aws_s3_bucket.audit_bucket.id
  include_global_service_events = true
  is_multi_region_trail         = true
  enable_log_file_validation    = true
  kms_key_id                    = aws_kms_key.eks_encryption_key.arn
}

resource "aws_s3_bucket" "audit_bucket" {
  bucket = "alti-enterprise-audit-${var.customer_name}"
}

# ==========================================
# Hyper-Advanced Security (Macie, Security Hub, Config)
# ==========================================
resource "aws_macie2_account" "macie" {
  status = "ENABLED"
}

resource "aws_macie2_classification_job" "scan_audit_bucket" {
  name        = "alti-code-leakage-scan"
  job_type    = "SCHEDULED"
  s3_job_definition {
    bucket_definitions {
      account_id = data.aws_caller_identity.current.account_id
      buckets    = [aws_s3_bucket.audit_bucket.bucket]
    }
  }
  schedule_frequency {
    daily_schedule = true
  }
}

resource "aws_securityhub_account" "hub" {}

resource "aws_config_configuration_recorder" "config" {
  name     = "alti-config-recorder"
  role_arn = aws_iam_role.config_role.arn
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
  enable_vpn_gateway = false
}

resource "aws_flow_log" "vpc_flow_log" {
  log_destination      = aws_s3_bucket.audit_bucket.arn
  log_destination_type = "s3"
  traffic_type         = "ALL"
  vpc_id               = module.vpc.vpc_id
}

# ==========================================
# Edge & Deep Packet Inspection (WAF, Shield, Network Firewall)
# ==========================================
resource "aws_wafv2_web_acl" "edge_waf" {
  name        = "alti-enterprise-waf"
  description = "WAF for Alti Code Studio API Gateway"
  scope       = "REGIONAL"

  default_action { allow {} }

  visibility_config {
    cloudwatch_metrics_enabled = true
    metric_name                = "altiWafMetrics"
    sampled_requests_enabled   = true
  }
}

resource "aws_shield_protection" "api_shield" {
  name         = "alti-api-shield-advanced"
  resource_arn = aws_wafv2_web_acl.edge_waf.arn
}

resource "aws_networkfirewall_firewall" "deep_packet_inspection" {
  name                = "alti-network-firewall"
  firewall_policy_arn = aws_networkfirewall_firewall_policy.strict_policy.arn
  vpc_id              = module.vpc.vpc_id
  
  subnet_mapping {
    subnet_id = module.vpc.public_subnets[0]
  }
}

resource "aws_networkfirewall_firewall_policy" "strict_policy" {
  name = "alti-strict-dpi-policy"
  firewall_policy {
    stateless_default_actions          = ["aws:forward_to_sfe"]
    stateless_fragment_default_actions = ["aws:forward_to_sfe"]
  }
}

# ==========================================
# EKS Cluster (Customer Data Plane)
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
      max_size       = 10
      desired_size   = 3
      instance_types = ["g5.xlarge"]
      capacity_type  = "ON_DEMAND"
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

data "aws_caller_identity" "current" {}

resource "aws_iam_role" "config_role" {
  name = "alti-aws-config-role"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
      Principal = { Service = "config.amazonaws.com" }
    }]
  })
}
