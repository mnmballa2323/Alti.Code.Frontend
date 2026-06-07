# FinOps VPC Endpoint Optimization
# AWS NAT Gateways charge heavily for data processing ($0.045 per GB).
# Traffic to AWS services like S3 and DynamoDB from private subnets naturally routes 
# through the NAT Gateway unless VPC Endpoints are configured.
# Gateway Endpoints for S3 and DynamoDB are completely FREE and bypass the NAT Gateway,
# instantly eliminating massive data transfer costs for heavy storage workloads.

variable "vpc_id" {
  description = "The ID of the VPC"
  type        = string
}

variable "private_route_table_ids" {
  description = "List of private route table IDs to attach the Gateway Endpoints to"
  type        = list(string)
}

data "aws_region" "current" {}

# 1. Amazon S3 Gateway Endpoint (FREE)
# Routes all S3 traffic originating from private subnets directly to the S3 fabric, bypassing NAT.
resource "aws_vpc_endpoint" "s3_gateway" {
  vpc_id       = var.vpc_id
  service_name = "com.amazonaws.${data.aws_region.current.name}.s3"
  
  # Gateway endpoints modify the route tables directly
  vpc_endpoint_type = "Gateway"
  route_table_ids   = var.private_route_table_ids

  tags = {
    Name        = "finops-s3-gateway-endpoint"
    Environment = "production"
    Optimization= "nat-cost-reduction"
  }
  
  # A permissive policy. In a strict security environment, this would restrict
  # access to only specific corporate S3 buckets to prevent data exfiltration.
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action    = "*"
        Effect    = "Allow"
        Principal = "*"
        Resource  = "*"
      }
    ]
  })
}

# 2. Amazon DynamoDB Gateway Endpoint (FREE)
# Routes all DynamoDB traffic directly, bypassing NAT Gateway charges.
resource "aws_vpc_endpoint" "dynamodb_gateway" {
  vpc_id       = var.vpc_id
  service_name = "com.amazonaws.${data.aws_region.current.name}.dynamodb"
  
  vpc_endpoint_type = "Gateway"
  route_table_ids   = var.private_route_table_ids

  tags = {
    Name        = "finops-dynamodb-gateway-endpoint"
    Environment = "production"
    Optimization= "nat-cost-reduction"
  }
}

# NOTE: Interface VPC Endpoints (for services like ECR, KMS, SSM) cost an hourly fee (~$0.01/hr).
# You should ONLY provision Interface Endpoints if the Data Processing savings 
# (> 100GB/month of ECR pulls, for example) exceed the fixed hourly cost of the endpoint itself.
# Gateway Endpoints (S3/DynamoDB) are always free and should always be provisioned.
