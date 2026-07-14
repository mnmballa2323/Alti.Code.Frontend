# AWS Single-Tenant Network Boundary
resource "aws_vpc" "tenant_vpc" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_support   = true
  enable_dns_hostnames = true
  tags = {
    Name   = "vpc-tenant-${var.tenant_id}"
    Tenant = var.tenant_id
    Tier   = "single-tenant"
  }
}

resource "aws_subnet" "tenant_private_subnet" {
  vpc_id            = aws_vpc.tenant_vpc.id
  cidr_block        = "10.0.1.0/24"
  availability_zone = "us-east-1a"
  tags = {
    Name   = "subnet-private-tenant-${var.tenant_id}"
    Tenant = var.tenant_id
  }
}
