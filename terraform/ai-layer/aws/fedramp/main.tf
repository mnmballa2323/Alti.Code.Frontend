# AWS GovCloud Provider Restrictions
provider "aws" {
  region = "us-gov-west-1" # Strictly lock to GovCloud region
  
  # Ensure all communication to the provider is FIPS validated
  use_fips_endpoint = true
}

variable "tenant_id" {
  type        = string
  description = "Tenant ID for GovCloud deployment (if applicable)"
}
