# AWS KMS External Key Store (XKS) Configuration
# This integrates AWS KMS directly with our Kubernetes FPGA Crypto Accelerator Service

resource "aws_kms_custom_key_store" "fpga_xks_keystore" {
  custom_key_store_name = "fpga-hardware-crypto-store"
  custom_key_store_type = "EXTERNAL_KEY_STORE"

  xks_proxy_uri_endpoint = "https://crypto-accelerator-svc.security.svc.cluster.local:8443/api/v1/xks"
  xks_proxy_uri_path     = "/api/v1/xks"
  xks_proxy_connectivity = "VPC_ENDPOINT_SERVICE"
  
  # Connects KMS to the K8s internal Network Load Balancer (NLB) via VPC Endpoint
  xks_proxy_vpc_endpoint_service_name = aws_vpc_endpoint_service.fpga_nlb_service.service_name

  xks_proxy_authentication_credential {
    access_key_id     = var.xks_proxy_access_key
    raw_secret_access_key = var.xks_proxy_secret_key
  }
}

# The Network Load Balancer exposing the FPGA Crypto Service to AWS KMS
resource "aws_lb" "fpga_internal_nlb" {
  name               = "fpga-crypto-nlb"
  internal           = true
  load_balancer_type = "network"
  subnets            = var.private_subnet_ids
}

resource "aws_vpc_endpoint_service" "fpga_nlb_service" {
  acceptance_required        = false
  network_load_balancer_arns = [aws_lb.fpga_internal_nlb.arn]
}

# Create a master key stored and executed exclusively on the FPGA
resource "aws_kms_key" "fpga_backed_key" {
  description             = "Master key backed by custom AWS F1 FPGA acceleration"
  custom_key_store_id     = aws_kms_custom_key_store.fpga_xks_keystore.id
  deletion_window_in_days = 7
  
  # XKS keys must have external origin
  origin = "EXTERNAL_KEY_STORE"

  policy = jsonencode({
    Version = "2012-10-17"
    Id      = "fpga-key-policy"
    Statement = [
      {
        Sid    = "Enable IAM User Permissions"
        Effect = "Allow"
        Principal = {
          AWS = "arn:aws:iam::${data.aws_caller_identity.current.account_id}:root"
        }
        Action   = "kms:*"
        Resource = "*"
      }
    ]
  })
}

resource "aws_kms_alias" "fpga_backed_key_alias" {
  name          = "alias/fpga-master-key"
  target_key_id = aws_kms_key.fpga_backed_key.key_id
}

data "aws_caller_identity" "current" {}

variable "xks_proxy_access_key" {
  description = "Access key for KMS to authenticate with the FPGA XKS Proxy"
  type        = string
  sensitive   = true
}

variable "xks_proxy_secret_key" {
  description = "Secret key for KMS to authenticate with the FPGA XKS Proxy"
  type        = string
  sensitive   = true
}

variable "private_subnet_ids" {
  description = "Private subnets for the internal NLB"
  type        = list(string)
}
