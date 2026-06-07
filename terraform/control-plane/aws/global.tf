# AWS Global Active-Active Architecture
# - AWS Global Accelerator for Anycast Any-Region routing
# - Amazon Aurora Global Database for sub-second cross-region replication

provider "aws" {
  alias  = "primary"
  region = "us-east-1"
}

provider "aws" {
  alias  = "secondary"
  region = "eu-west-1"
}

# ==========================================
# Amazon Aurora Global Database
# ==========================================
resource "aws_rds_global_cluster" "alti_global_db" {
  provider                  = aws.primary
  global_cluster_identifier = "alti-global-control-plane"
  engine                    = "aurora-postgresql"
  engine_version            = "15.4"
  database_name             = "alticontrol"
  storage_encrypted         = true
}

resource "aws_rds_cluster" "primary_cluster" {
  provider                  = aws.primary
  cluster_identifier        = "alti-primary-cluster"
  global_cluster_identifier = aws_rds_global_cluster.alti_global_db.id
  engine                    = "aurora-postgresql"
  master_username           = "altisadmin"
  master_password           = random_password.db_password.result
  skip_final_snapshot       = true
}

resource "aws_rds_cluster" "secondary_cluster" {
  provider                  = aws.secondary
  cluster_identifier        = "alti-secondary-cluster"
  global_cluster_identifier = aws_rds_global_cluster.alti_global_db.id
  engine                    = "aurora-postgresql"
  skip_final_snapshot       = true
  depends_on                = [aws_rds_cluster.primary_cluster]
}

resource "random_password" "db_password" {
  length  = 32
  special = true
}

# ==========================================
# AWS Global Accelerator
# ==========================================
resource "aws_globalaccelerator_accelerator" "alti_global" {
  name            = "alti-control-plane-accelerator"
  ip_address_type = "IPV4"
  enabled         = true
}

resource "aws_globalaccelerator_listener" "https" {
  accelerator_arn = aws_globalaccelerator_accelerator.alti_global.id
  client_affinity = "SOURCE_IP"
  protocol        = "TCP"

  port_range {
    from_port = 443
    to_port   = 443
  }
}

resource "aws_globalaccelerator_endpoint_group" "us_east_1" {
  listener_arn = aws_globalaccelerator_listener.https.id
  endpoint_group_region = "us-east-1"

  endpoint_configuration {
    endpoint_id = aws_lb.primary_alb.arn # Assumes ALB is defined in primary region
    weight      = 128
  }
}

resource "aws_globalaccelerator_endpoint_group" "eu_west_1" {
  listener_arn = aws_globalaccelerator_listener.https.id
  endpoint_group_region = "eu-west-1"

  endpoint_configuration {
    endpoint_id = aws_lb.secondary_alb.arn # Assumes ALB is defined in secondary region
    weight      = 128
  }
}
