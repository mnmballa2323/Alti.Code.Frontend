# ==============================================================================
# ALTI CODE STUDIO: Cloud Bigtable — High-Performance NoSQL
# ==============================================================================

resource "google_bigtable_instance" "platform" {
  name    = "alti-bigtable"
  project = var.gcp_project_id

  cluster {
    cluster_id   = "alti-bigtable-cluster"
    zone         = "${var.region}-a"
    num_nodes    = var.bigtable_num_nodes
    storage_type = "SSD"
  }

  deletion_protection = var.environment == "prod" ? true : false

  labels = {
    environment = var.environment
    managed-by  = "terraform"
  }
}

resource "google_bigtable_table" "agent_telemetry" {
  name          = "agent-telemetry"
  instance_name = google_bigtable_instance.platform.name
  project       = var.gcp_project_id

  column_family {
    family = "metrics"
  }

  column_family {
    family = "events"
  }

  column_family {
    family = "traces"
  }
}

resource "google_bigtable_table" "embedding_cache" {
  name          = "embedding-cache"
  instance_name = google_bigtable_instance.platform.name
  project       = var.gcp_project_id

  column_family {
    family = "vectors"
  }

  column_family {
    family = "metadata"
  }
}
