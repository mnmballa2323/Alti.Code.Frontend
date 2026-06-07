variable "cluster_name" {
  description = "Name of the EKS cluster"
  type        = string
}

variable "subnet_ids" {
  description = "List of subnet IDs for GPU nodes"
  type        = list(string)
}

resource "aws_eks_node_group" "gpu_nodes" {
  cluster_name    = var.cluster_name
  node_group_name = "${var.cluster_name}-gpu-nodes"
  node_role_arn   = aws_iam_role.gpu_node_role.arn
  subnet_ids      = var.subnet_ids

  ami_type       = "AL2_x86_64_GPU"
  instance_types = ["p3.2xlarge", "g4dn.xlarge"]

  scaling_config {
    desired_size = 1
    max_size     = 3
    min_size     = 0
  }

  tags = {
    Hardware = "GPU"
    Purpose  = "Machine-Learning"
  }
}

resource "aws_iam_role" "gpu_node_role" {
  name = "${var.cluster_name}-gpu-node-role"

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
