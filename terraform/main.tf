terraform {
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 4.0"
    }
  }
  backend "gcs" {
    # Placeholder for remote state
    bucket  = "alti-code-studio-tf-state"
    prefix  = "prod/terraform.tfstate"
  }
}

provider "google" {
  project = var.project_id
  region  = var.region
}

module "compute" {
  source = "./modules/compute"
  
  project_id   = var.project_id
  environment  = var.environment
  zone         = var.zone
  machine_type = var.machine_type
}
