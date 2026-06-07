# FinOps RDS Storage Auto Scaling Enforcer
# Developers frequently over-provision AWS RDS Storage (e.g. requesting 2000 GB immediately)
# out of fear that a sudden data spike will fill the disk and crash the database.
# Because AWS bills for PROVISIONED storage, not USED storage, this wastes massive amounts of money.
# This Terraform module enforces RDS Storage Autoscaling on core databases.
# We provision a lean 100 GB baseline. When free space drops below 10%, AWS automatically
# expands the physical volume seamlessly up to a max limit, ensuring zero downtime and minimal cost.

variable "db_instance_identifier" {
  description = "The identifier of the target RDS instance"
  type        = string
  default     = "alti-crypto-ledger-primary-db"
}

# Example of an optimized RDS instance definition
resource "aws_db_instance" "finops_optimized_rds" {
  identifier           = var.db_instance_identifier
  engine               = "postgres"
  engine_version       = "15.4"
  instance_class       = "db.t4g.large" # Graviton2 for better price/performance
  
  # ---------------------------------------------------------
  # FINOPS STORAGE OPTIMIZATION
  # ---------------------------------------------------------
  
  # Provision a very small, cost-effective baseline.
  # We only pay for 100 GB of gp3 storage upfront.
  allocated_storage    = 100 
  storage_type         = "gp3"
  
  # Enforce Storage Autoscaling!
  # If the database fills up, AWS will automatically expand the volume by 5 GB or 10% 
  # (whichever is larger) up to this maximum threshold.
  # This eliminates the need to over-provision Terabytes of empty, expensive SSD space.
  max_allocated_storage = 2000 
  
  # gp3 volumes allow independent IOPS provisioning without needing expensive io1/io2 tiers
  iops                 = 3000
  throughput           = 125
  
  # Database credentials (mocked for infrastructure template)
  username             = "postgres_admin"
  password             = "mock_password_replace_with_secrets_manager"
  
  # Other essential configurations
  multi_az             = true
  publicly_accessible  = false
  skip_final_snapshot  = false
  deletion_protection  = true
  
  # FinOps best practice: Enable Performance Insights for query tuning
  performance_insights_enabled          = true
  performance_insights_retention_period = 7 # 7 days is free, 731 days costs money
}
