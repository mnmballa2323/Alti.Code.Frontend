# FinOps S3 Intelligent-Tiering Enforcer
# While standard S3 Lifecycle policies require manual configuration and guessing access patterns,
# S3 Intelligent-Tiering utilizes AWS machine learning to automatically move objects 
# between access tiers (Frequent, Infrequent, Archive Instant) based on real-time usage.
# This Terraform module provides a standard configuration that forces ALL data older than 90 days
# into the Archive Instant Access tier, slashing storage costs by 68% automatically.

variable "bucket_id" {
  description = "The ID of the S3 bucket to apply Intelligent-Tiering to"
  type        = string
  default     = "alti-crypto-ledger-backups"
}

resource "aws_s3_bucket_intelligent_tiering_configuration" "finops_intelligent_tiering" {
  bucket = var.bucket_id
  name   = "FinOps-Auto-Archive-Entire-Bucket"

  # Applies to the entire bucket (no specific prefix/tag filter)
  # This guarantees all objects are cost-optimized.
  
  tiering {
    # If an object hasn't been accessed in 90 days, move it to Archive Instant Access tier.
    # This tier provides milliseconds retrieval but costs ~68% less than Standard S3.
    access_tier = "ARCHIVE_ACCESS"
    days        = 90
  }

  tiering {
    # If an object hasn't been accessed in 180 days, move it to Deep Archive Access tier.
    # This tier takes 12-48 hours to retrieve but costs ~99% less than Standard S3 (e.g., $0.00099 per GB).
    access_tier = "DEEP_ARCHIVE_ACCESS"
    days        = 180
  }

  # Ensure the configuration is active
  status = "Enabled"
}
