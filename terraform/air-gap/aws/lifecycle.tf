# AWS Air-Gap Lifecycle Management
# - AWS Snowball Edge job configuration for physical model weight syncing
# - AWS PrivateLink and internal ECR for disconnected GitOps (FluxCD)

provider "aws" {
  region = "us-east-1"
}

# ==========================================
# Physical Weight Transfer (Snowball Edge)
# ==========================================
# Triggers a physical Snowball Edge device to be shipped to the customer's datacenter
# loaded with the latest Alti Code Studio 100GB+ LLM model weights.
resource "aws_snowball_job" "model_weight_sync" {
  job_type      = "EDGE_STORAGE_OPTIMIZED"
  snowball_type = "EDGE"
  
  # Address ID must be pre-configured in the AWS account for the physical bunker location
  address_id    = "ADID-XXXXX-BUNKER-LOCATION"
  role_arn      = aws_iam_role.snowball_role.arn

  resources {
    s3_resources {
      bucket_arn = "arn:aws:s3:::alti-master-weights-bucket"
      key_range {
        begin_marker = "releases/v2.5.0/"
      }
    }
  }

  description = "Alti Code Studio physical weight synchronization for disconnected Outpost"
}

# ==========================================
# Disconnected GitOps (FluxCD & PrivateLink)
# ==========================================
# Internal ECR registry that is only accessible inside the VPC
resource "aws_ecr_repository" "internal_artifacts" {
  name                 = "alti-airgapped-artifacts"
  image_tag_mutability = "IMMUTABLE"

  image_scanning_configuration {
    scan_on_push = true
  }
}

# AWS PrivateLink (VPC Endpoint) ensures traffic to ECR never traverses the internet
resource "aws_vpc_endpoint" "ecr_api" {
  vpc_id              = "vpc-isolated-bunker" # Replaced dynamically
  service_name        = "com.amazonaws.us-east-1.ecr.api"
  vpc_endpoint_type   = "Interface"
  private_dns_enabled = true
}

resource "aws_vpc_endpoint" "ecr_dkr" {
  vpc_id              = "vpc-isolated-bunker"
  service_name        = "com.amazonaws.us-east-1.ecr.dkr"
  vpc_endpoint_type   = "Interface"
  private_dns_enabled = true
}

# IAM Role for Snowball
resource "aws_iam_role" "snowball_role" {
  name = "AltiSnowballTransferRole"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "importexport.amazonaws.com"
        }
      }
    ]
  })
}
