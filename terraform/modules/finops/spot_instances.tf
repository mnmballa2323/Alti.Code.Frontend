variable "cluster_name" {
  description = "The name of the EKS cluster"
  type        = string
}

variable "spot_instance_types" {
  description = "List of instance types for Spot fleet"
  type        = list(string)
  default     = ["t3.medium", "t3.large", "m5.large"]
}

resource "aws_eks_node_group" "spot_nodes" {
  cluster_name    = var.cluster_name
  node_group_name = "${var.cluster_name}-spot-nodes"
  node_role_arn   = aws_iam_role.node_role.arn
  subnet_ids      = var.subnet_ids

  capacity_type  = "SPOT"
  instance_types = var.spot_instance_types

  scaling_config {
    desired_size = 2
    max_size     = 5
    min_size     = 1
  }

  update_config {
    max_unavailable = 1
  }

  tags = {
    FinOps = "Optimized"
    Type   = "Spot"
  }
}

variable "subnet_ids" {
  type = list(string)
}

resource "aws_iam_role" "node_role" {
  name = "${var.cluster_name}-spot-node-role"

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
