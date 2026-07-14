# AWS GovCloud Audit Logging
resource "aws_cloudtrail" "fedramp_audit" {
  name                          = "cloudtrail-fedramp"
  s3_bucket_name                = aws_s3_bucket.audit_bucket.id
  include_global_service_events = true
  is_multi_region_trail         = true
  enable_log_file_validation    = true

  kms_key_id = aws_kms_key.audit_key.arn
}

resource "aws_s3_bucket" "audit_bucket" {
  bucket = "fedramp-audit-logs-${var.tenant_id}"
}

resource "aws_kms_key" "audit_key" {
  description             = "KMS key for CloudTrail logs"
  deletion_window_in_days = 10
  enable_key_rotation     = true
}
