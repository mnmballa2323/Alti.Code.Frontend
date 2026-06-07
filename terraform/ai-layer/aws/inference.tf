# AWS AI Hardware & Hybrid Quantum Architecture
# - Amazon EC2 Inferentia2 (inf2.48xlarge) for high-throughput LLM inference
# - Amazon Braket for Quantum-Assisted Algorithm Optimization

provider "aws" {
  region = "us-east-1"
}

# ==========================================
# EKS Managed Node Group: Inferentia2
# ==========================================
resource "aws_eks_node_group" "inferentia2_nodes" {
  cluster_name    = "alti-data-plane-cluster"
  node_group_name = "alti-inferentia-pool"
  node_role_arn   = aws_iam_role.eks_node_role.arn
  subnet_ids      = ["subnet-12345678"] # Replaced dynamically in full deployment

  scaling_config {
    desired_size = 2
    max_size     = 10
    min_size     = 1
  }

  # AWS Custom Silicon for Machine Learning
  instance_types = ["inf2.48xlarge"]
  
  # AWS Neuron drivers are required for Inferentia
  ami_type = "AL2_x86_64"

  labels = {
    "node.kubernetes.io/accelerator" = "aws-inferentia"
    "alti.code.studio/tier"          = "ml-inference"
  }

  tags = {
    Name = "Alti-Inferentia2-Node"
  }
}

# ==========================================
# IAM Role for EKS Nodes
# ==========================================
resource "aws_iam_role" "eks_node_role" {
  name = "alti_eks_inferentia_role"

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

resource "aws_iam_role_policy_attachment" "eks_worker_node_policy" {
  policy_arn = "arn:aws:iam::aws:policy/AmazonEKSWorkerNodePolicy"
  role       = aws_iam_role.eks_node_role.name
}

resource "aws_iam_role_policy_attachment" "eks_cni_policy" {
  policy_arn = "arn:aws:iam::aws:policy/AmazonEKS_CNI_Policy"
  role       = aws_iam_role.eks_node_role.name
}

# ==========================================
# Amazon Braket (Quantum Computing Integration)
# ==========================================
# Allow the Inferentia nodes to invoke Amazon Braket Quantum Processing Units (QPUs)
resource "aws_iam_policy" "braket_access" {
  name        = "AltiQuantumBraketAccess"
  description = "Allows Alti Code Studio to route optimization algorithms to QPUs"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = [
          "braket:CreateQuantumTask",
          "braket:GetQuantumTask",
          "braket:SearchQuantumTasks",
          "s3:PutObject",
          "s3:GetObject"
        ]
        Effect   = "Allow"
        Resource = "*"
      },
    ]
  })
}

resource "aws_iam_role_policy_attachment" "braket_attachment" {
  policy_arn = aws_iam_policy.braket_access.arn
  role       = aws_iam_role.eks_node_role.name
}
