provider "aws" {
  region = "us-east-1"
}

module "eks" {
  source          = "terraform-aws-modules/eks/aws"
  version         = "19.15.3"
  cluster_name    = "alti-code-studio-single-${var.environment}"
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
}\n