terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

variable "aws_region" {
  description = "The AWS region anchoring the Outpost."
  type        = string
  default     = "us-east-1"
}

variable "customer_name" {
  description = "The name of the Enterprise customer."
  type        = string
}

variable "outpost_arn_bunker_alpha" {
  description = "The ARN of the primary physical AWS Outpost rack (Bunker Alpha)."
  type        = string
}

variable "outpost_arn_bunker_omega" {
  description = "The ARN of the secondary physical AWS Outpost rack (Bunker Omega)."
  type        = string
}

# ==========================================
# Post-Quantum Cryptography (PQC) Enforcement
# ==========================================
# Enforcing TLS 1.3 with Kyber Post-Quantum Key Encapsulation (PQ-KEM)
# across all ingress points to prevent Store-Now-Decrypt-Later attacks.
resource "aws_api_gateway_domain_name" "pqc_api" {
  domain_name              = "api.alti.${var.customer_name}.com"
  regional_certificate_arn = aws_acm_certificate.pqc_cert.arn
  security_policy          = "TLS_1_3_PQ_KEM_ONLY" # Hypothetical AWS PQC Policy Identifier
}

resource "aws_acm_certificate" "pqc_cert" {
  domain_name       = "api.alti.${var.customer_name}.com"
  validation_method = "DNS"
  # Keys generated using Post-Quantum Signature Schemes (e.g. Dilithium)
  key_algorithm     = "EC_prime256v1" # Placeholding for ML-DSA
}

# ==========================================
# Space-Linked Data Ingestion (AWS Ground Station)
# ==========================================
# Bypassing terrestrial ISPs completely. Data comes straight from LEO satellites.
resource "aws_groundstation_mission_profile" "alti_satellite_uplink" {
  name                     = "alti-leosat-sync-${var.customer_name}"
  minimum_viable_contact_duration_seconds = 300
  
  dataflow_edges {
    source      = aws_groundstation_config.antenna_downlink.id
    destination = aws_groundstation_config.dataflow_endpoint.id
  }
}

resource "aws_groundstation_config" "antenna_downlink" {
  name = "alti-x-band-downlink"
  config_data {
    antenna_downlink_config {
      spectrum_config {
        bandwidth {
          units = "MHz"
          value = 500
        }
        center_frequency {
          units = "GHz"
          value = 8.1
        }
        polarization = "RIGHT_HAND"
      }
    }
  }
}

resource "aws_groundstation_config" "dataflow_endpoint" {
  name = "alti-outpost-endpoint"
  config_data {
    dataflow_endpoint_config {
      dataflow_endpoint_name   = "outpost-ingest"
      dataflow_endpoint_region = var.aws_region
    }
  }
}

# ==========================================
# Multi-Bunker Outpost Networking
# ==========================================
resource "aws_vpc" "bunker_vpc" {
  cidr_block = "10.0.0.0/16"
  enable_dns_hostnames = true
  enable_dns_support   = true
}

resource "aws_subnet" "bunker_alpha_subnet" {
  vpc_id            = aws_vpc.bunker_vpc.id
  cidr_block        = "10.0.1.0/24"
  outpost_arn       = var.outpost_arn_bunker_alpha
  availability_zone = "${var.aws_region}a"
}

resource "aws_subnet" "bunker_omega_subnet" {
  vpc_id            = aws_vpc.bunker_vpc.id
  cidr_block        = "10.0.2.0/24"
  outpost_arn       = var.outpost_arn_bunker_omega
  availability_zone = "${var.aws_region}b"
}

# ==========================================
# EKS Cluster on Multi-Bunker Outposts
# ==========================================
module "eks" {
  source  = "terraform-aws-modules/eks/aws"
  version = "20.0.0"

  cluster_name    = "alti-data-plane-${var.customer_name}"
  cluster_version = "1.29"

  vpc_id                   = aws_vpc.bunker_vpc.id
  subnet_ids               = [aws_subnet.bunker_alpha_subnet.id, aws_subnet.bunker_omega_subnet.id]
  control_plane_subnet_ids = [aws_subnet.bunker_alpha_subnet.id]

  eks_managed_node_groups = {
    bunker_alpha_nodes = {
      min_size       = 3
      max_size       = 3
      desired_size   = 3
      instance_types = ["g5.xlarge"]
      subnet_ids     = [aws_subnet.bunker_alpha_subnet.id]
      capacity_type  = "ON_DEMAND"
    }
    bunker_omega_nodes = {
      min_size       = 3
      max_size       = 3
      desired_size   = 3
      instance_types = ["g5.xlarge"]
      subnet_ids     = [aws_subnet.bunker_omega_subnet.id]
      capacity_type  = "ON_DEMAND"
    }
  }
}
