# AWS Single-Tenant Customer-Managed Encryption Key (CMEK)
resource "aws_kms_key" "tenant_key" {
  description             = "Dedicated KMS key for tenant ${var.tenant_id}"
  deletion_window_in_days = 30
  enable_key_rotation     = true
  tags = {
    Tenant = var.tenant_id
    Tier   = "single-tenant"
  }
}

resource "aws_kms_alias" "tenant_key_alias" {
  name          = "alias/tenant-${var.tenant_id}"
  target_key_id = aws_kms_key.tenant_key.key_id
}
