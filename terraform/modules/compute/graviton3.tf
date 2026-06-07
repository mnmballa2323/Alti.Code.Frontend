variable "cluster_name" {
  description = "Name of the EKS cluster"
  type        = string
}

variable "subnet_ids" {
  description = "List of subnet IDs for Graviton3 nodes"
  type        = list(string)
}

resource "aws_eks_node_group" "graviton3_nodes" {
  cluster_name    = var.cluster_name
  node_group_name = "${var.cluster_name}-graviton3-nodes"
  node_role_arn   = aws_iam_role.graviton3_node_role.arn
  subnet_ids      = var.subnet_ids

  ami_type       = "AL2_ARM_64"
  instance_types = ["c7g.2xlarge", "c7g.4xlarge"]

  scaling_config {
    desired_size = 2
    max_size     = 5
    min_size     = 1
  }

  tags = {
    Hardware = "Graviton3"
    Purpose  = "High-Performance-Compute"
  }
}

resource "aws_iam_role" "graviton3_node_role" {
  name = "${var.cluster_name}-graviton3-node-role"

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
