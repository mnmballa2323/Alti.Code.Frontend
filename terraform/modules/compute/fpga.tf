variable "cluster_name" {
  description = "Name of the EKS cluster"
  type        = string
}

resource "aws_eks_node_group" "fpga_nodes" {
  cluster_name    = var.cluster_name
  node_group_name = "${var.cluster_name}-fpga-nodes"
  node_role_arn   = aws_iam_role.fpga_node_role.arn
  subnet_ids      = var.subnet_ids

  # F1 instance types feature FPGAs
  instance_types = ["f1.2xlarge"]

  scaling_config {
    desired_size = 1
    max_size     = 2
    min_size     = 1
  }

  tags = {
    Hardware = "FPGA"
    Purpose  = "Crypto-Acceleration"
  }
}

variable "subnet_ids" {
  type = list(string)
}

resource "aws_iam_role" "fpga_node_role" {
  name = "${var.cluster_name}-fpga-node-role"

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
