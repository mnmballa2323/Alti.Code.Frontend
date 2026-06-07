# FinOps S3 Lifecycle Optimization Configuration
# This module automatically transitions older data to cheaper storage tiers
# and cleans up incomplete multipart uploads to prevent hidden storage costs.

# Assume the bucket names are passed as a variable or looked up via a data source.
# For this module, we will create a standalone reusable policy attachment.

variable "target_bucket_ids" {
  description = "List of S3 Bucket IDs to apply the FinOps Lifecycle Policy to"
  type        = list(string)
  default     = []
}

resource "aws_s3_bucket_lifecycle_configuration" "finops_storage_optimization" {
  count  = length(var.target_bucket_ids)
  bucket = var.target_bucket_ids[count.index]

  rule {
    id     = "finops-cost-optimization-rule"
    status = "Enabled"

    # 1. Clean up incomplete multipart uploads after 7 days
    # This prevents users/apps from starting huge uploads, abandoning them, and leaving us paying for the hidden parts forever.
    abort_incomplete_multipart_upload {
      days_after_initiation = 7
    }

    # 2. Transition current versions of objects to Infrequent Access (Standard-IA) after 30 days
    transition {
      days          = 30
      storage_class = "STANDARD_IA"
    }

    # 3. Transition current versions to Glacier Deep Archive after 90 days
    transition {
      days          = 90
      storage_class = "DEEP_ARCHIVE"
    }

    # 4. If versioning is enabled, aggressively expire non-current versions
    noncurrent_version_transition {
      noncurrent_days = 15
      storage_class   = "STANDARD_IA"
    }

    noncurrent_version_transition {
      noncurrent_days = 60
      storage_class   = "DEEP_ARCHIVE"
    }

    # 5. Permanently delete non-current versions after 365 days
    noncurrent_version_expiration {
      noncurrent_days = 365
    }
    
    # 6. Delete DeleteMarkers for objects with no remaining versions
    expiration {
      expired_object_delete_marker = true
    }
  }
}
