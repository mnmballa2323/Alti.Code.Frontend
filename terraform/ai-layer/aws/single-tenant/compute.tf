# AWS Single-Tenant Compute (EKS / ECS / EC2 isolated boundary)
resource "aws_eks_cluster" "tenant_cluster" {
  name     = "eks-tenant-${var.tenant_id}"
  role_arn = aws_iam_role.tenant_eks_role.arn

  vpc_config {
    subnet_ids = [aws_subnet.tenant_private_subnet.id]
    endpoint_private_access = true
    endpoint_public_access  = false
  }
}

resource "aws_iam_role" "tenant_eks_role" {
  name = "role-eks-tenant-${var.tenant_id}"
  assume_role_policy = jsonencode({
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
      Principal = {
        Service = "eks.amazonaws.com"
      }
    }]
    Version = "2012-10-17"
  })
}
