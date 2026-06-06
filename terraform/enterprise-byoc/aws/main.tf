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
# VPC & Networking (Zero-Trust)
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

  eks_managed_node_groups = {
    alti_inference_nodes = {
      min_size     = 3
      max_size     = 10
      desired_size = 3
      instance_types = ["g5.xlarge"] # GPU enabled for edge inference
      capacity_type  = "ON_DEMAND"
    }
  }
}

# ==========================================
# IAM Roles for Service Accounts (IRSA) for Bedrock
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
