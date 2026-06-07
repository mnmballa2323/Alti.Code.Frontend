variable "cluster_name" {
  description = "Name of the EKS cluster"
  type        = string
}

variable "subnet_ids" {
  description = "List of subnet IDs for ARM nodes"
  type        = list(string)
}

resource "aws_eks_node_group" "arm_nodes" {
  cluster_name    = var.cluster_name
  node_group_name = "${var.cluster_name}-arm-nodes"
  node_role_arn   = aws_iam_role.arm_node_role.arn
  subnet_ids      = var.subnet_ids

  ami_type       = "AL2_ARM_64"
  instance_types = ["m6g.large", "c6g.large"]

  scaling_config {
    desired_size = 2
    max_size     = 4
    min_size     = 1
  }

  tags = {
    Architecture = "ARM64"
    Cost         = "Optimized"
  }
}

resource "aws_iam_role" "arm_node_role" {
  name = "${var.cluster_name}-arm-node-role"

  assume_role_policy = jsonencode({
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
      Principal = {
        Service = "ec2.amazonaws.com"
      }
    }]
    Version = "2012-10-17"
  })
}
