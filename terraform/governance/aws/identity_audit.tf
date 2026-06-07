# AWS Enterprise Governance
# - IAM Identity Center (Federated SAML / SSO)
# - CloudTrail Immutable Forensic Auditing (S3 Object Lock)

provider "aws" {
  region = "us-east-1"
}

# ==========================================
# IAM Identity Center (Federated Identity)
# ==========================================
# Represents the integration with Corporate Okta / PingIdentity
resource "aws_ssoadmin_permission_set" "alti_admin_access" {
  name             = "AltiCodeStudio-EnterpriseAdmin"
  description      = "Federated Admin access for Alti Code Studio"
  instance_arn     = "arn:aws:sso:::instance/ssoins-xxxxxxxxxxxxxxxx" # Pre-existing SSO Instance
  session_duration = "PT2H" # Strict 2 hour session limit
}

resource "aws_ssoadmin_managed_policy_attachment" "admin_attach" {
  instance_arn       = aws_ssoadmin_permission_set.alti_admin_access.instance_arn
  managed_policy_arn = "arn:aws:iam::aws:policy/AdministratorAccess"
  permission_set_arn = aws_ssoadmin_permission_set.alti_admin_access.arn
}

# ==========================================
# Immutable Forensic Auditing (WORM Storage)
# ==========================================
# Create an S3 bucket with Object Lock explicitly enabled
resource "aws_s3_bucket" "audit_vault" {
  bucket = "alti-forensic-audit-vault-secure"
  
  # Object Lock enables WORM (Write Once, Read Many)
  object_lock_enabled = true
}

# Enforce Compliance Mode retention
resource "aws_s3_bucket_object_lock_configuration" "audit_vault_lock" {
  bucket = aws_s3_bucket.audit_vault.id

  rule {
    default_retention {
      mode  = "COMPLIANCE" # Cannot be deleted by ANY user, including root account
      years = 7            # SEC Rule 17a-4(f) standard retention
    }
  }
}

# CloudTrail config routing all API activity to the WORM vault
resource "aws_cloudtrail" "enterprise_audit" {
  name                          = "alti-enterprise-audit-trail"
  s3_bucket_name                = aws_s3_bucket.audit_vault.id
  include_global_service_events = true
  is_multi_region_trail         = true
  enable_log_file_validation    = true # Cryptographic validation of log integrity
  kms_key_id                    = aws_kms_key.audit_key.arn
}

resource "aws_kms_key" "audit_key" {
  description             = "KMS key for encrypting CloudTrail forensic logs"
  enable_key_rotation     = true
  deletion_window_in_days = 30
}
