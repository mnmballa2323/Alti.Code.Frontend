# GCP AI Hardware & Hybrid Quantum Architecture
# - Google Cloud TPU v5p for massive parallel transformer inference
# - Google Quantum AI (Cirq Vertex Interface)

provider "google" {
  project = "alti-code-studio-prod"
  region  = "us-central1"
}

# ==========================================
# GKE Node Pool: TPU v5p
# ==========================================
resource "google_container_node_pool" "tpu_v5p_nodes" {
  name       = "tpu-v5p-pool"
  cluster    = "alti-data-plane-cluster" # Replaced dynamically
  
  # TPU v5p Pod provisioning requires strict capacity reservations
  node_count = 1

  node_config {
    machine_type = "ct5p-hightmem-4t" # TPU v5p instance
    
    oauth_scopes = [
      "https://www.googleapis.com/auth/cloud-platform"
    ]

    labels = {
      "accelerator"      = "tpu-v5p"
      "alti.code.studio" = "ai-inference-engine"
    }

    taints = [
      {
        key    = "google.com/tpu"
        value  = "present"
        effect = "NO_SCHEDULE"
      }
    ]
  }

  management {
    auto_repair  = true
    auto_upgrade = false # Avoid unexpected TPU disruptions
  }
}

# ==========================================
# Vertex AI Quantum Integration
# ==========================================
# Enable required APIs for Quantum integrations and AI Platform
resource "google_project_service" "vertex_ai" {
  service = "aiplatform.googleapis.com"
  disable_on_destroy = false
}

resource "google_project_service" "quantum_api" {
  # Note: Requires an active research partnership with Google Quantum AI
  service = "quantum.googleapis.com" 
  disable_on_destroy = false
}

# IAM Binding to allow GKE Workload Identity to submit Quantum tasks
resource "google_project_iam_binding" "quantum_submitter" {
  project = "alti-code-studio-prod"
  role    = "roles/quantum.submitter"

  members = [
    "serviceAccount:alti-inference-sa@alti-code-studio-prod.iam.gserviceaccount.com"
  ]
}
