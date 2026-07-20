variable "lco_keycloak_issuer" {
  description = "The Sovereign Identity URL at Liberty Center One"
  type        = string
}

variable "lco_keycloak_client_id" {
  description = "The Keycloak Client ID for the Workload Plane"
  type        = string
}

variable "lco_keycloak_client_secret" {
  description = "The Keycloak Client Secret for the Workload Plane"
  type        = string
  sensitive   = true
}

variable "lco_billing_api" {
  description = "The internal Sovereign Billing URL"
  type        = string
}

variable "environment" {
  description = "Environment name (e.g., prod, dev)"
  type        = string
  default     = "prod"
}

variable "docker_image" {
  description = "The Docker image for alti.code.studio"
  type        = string
}\n