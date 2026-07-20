provider "google" {
  project = "alti-code-studio"
  region  = "us-central1"
}

resource "google_container_cluster" "primary" {
  name     = "alti-code-studio-single-${var.environment}"
  location = "us-central1"

  remove_default_node_pool = true
  initial_node_count       = 1
}

resource "google_container_node_pool" "primary_nodes" {
  name       = "alti-dedicated-pool"
  location   = "us-central1"
  cluster    = google_container_cluster.primary.name
  node_count = 3

  node_config {
    machine_type = "e2-standard-4"
  }
}\n