# AWS Compute Optimizer configuration to generate EC2 instance recommendations
# Including identifying idle instances that can be replaced by Spot instances.

resource "aws_compute_optimizer_enrollment_status" "finops_enrollment" {
  status = "Active"
}

# Export recommendations to an S3 bucket for automated ingestion
resource "aws_s3_bucket" "compute_optimizer_export" {
  bucket        = "alti-finops-compute-optimizer-exports-${var.cluster_name}"
  force_destroy = true
}

resource "aws_s3_bucket_public_access_block" "optimizer_bucket_block" {
  bucket = aws_s3_bucket.compute_optimizer_export.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_policy" "optimizer_bucket_policy" {
  bucket = aws_s3_bucket.compute_optimizer_export.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = {
          Service = "compute-optimizer.amazonaws.com"
        }
        Action = [
          "s3:GetBucketAcl",
          "s3:GetBucketPolicy",
          "s3:PutObject"
        ]
        Resource = [
          aws_s3_bucket.compute_optimizer_export.arn,
          "${aws_s3_bucket.compute_optimizer_export.arn}/*"
        ]
        Condition = {
          StringEquals = {
            "s3:x-amz-acl" = "bucket-owner-full-control"
          }
        }
      }
    ]
  })
}

# In a real environment, you'd trigger a lambda from the S3 upload to parse 
# the CSV and automatically transition underutilized nodes to Spot ASGs.
