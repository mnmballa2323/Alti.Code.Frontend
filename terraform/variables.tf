variable "project_id" {
  description = "Google Cloud Project ID"
  type        = string
}

variable "region" {
  description = "GCP Region"
  default     = "us-central1"
}

variable "zone" {
  description = "GCP Zone"
  default     = "us-central1-a"
}

variable "environment" {
  description = "Deployment Environment (dev, staging, prod)"
  default     = "prod"
}

variable "machine_type" {
  description = "Compute Engine Machine Type"
  default     = "e2-medium"
}
