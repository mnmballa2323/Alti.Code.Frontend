# ==============================================================================
# ALTI CODE STUDIO: GCP Compute Node Provisioning
# ==============================================================================

# ------------------------------------------------------------------------------
# 1. Commercial VM (GCP Cloud)
# ------------------------------------------------------------------------------
resource "google_compute_instance" "commercial_node" {
  count        = var.enable_gcp_cloud ? 1 : 0
  name         = "alti-${var.customer_id}-commercial-node"
  machine_type = var.machine_type_commercial
  zone         = "${var.gcp_region_commercial}-a"

  can_ip_forward = false

  boot_disk {
    initialize_params {
      image = "ubuntu-os-cloud/ubuntu-2204-lts"
      size  = 250
      type  = "pd-ssd"
    }
    kms_key_self_link = var.gcp_kms_crypto_key != null ? var.gcp_kms_crypto_key : google_kms_crypto_key.db_disk_key.id
  }

  network_interface {
    subnetwork = google_compute_subnetwork.commercial_subnet[0].id
    access_config {
      # Allocates a public IP
    }
  }

  metadata = {
    ssh-keys = "gcpuser:${file(var.ssh_public_key_path)}"
  }

  shielded_instance_config {
    enable_secure_boot          = true
    enable_vtpm                 = true
    enable_integrity_monitoring = true
  }

  confidential_instance_config {
    enable_confidential_compute = var.enable_confidential_compute
  }

  service_account {
    scopes = ["cloud-platform"]
  }

  labels = {
    environment = var.environment
    sovereignty = "commercial"
  }
}

# ------------------------------------------------------------------------------
# 2. Government VM (GCP Government Cloud)
# ------------------------------------------------------------------------------
resource "google_compute_instance" "government_node" {
  count        = var.enable_gcp_government ? 1 : 0
  name         = "alti-${var.customer_id}-government-node"
  machine_type = var.machine_type_government
  zone         = "${var.gcp_region_government}-a"

  can_ip_forward = false

  boot_disk {
    initialize_params {
      image = "ubuntu-os-cloud/ubuntu-2204-lts"
      size  = 500
      type  = "pd-ssd"
    }
    kms_key_self_link = var.gcp_kms_crypto_key != null ? var.gcp_kms_crypto_key : google_kms_crypto_key.db_disk_key.id
  }

  network_interface {
    subnetwork = google_compute_subnetwork.government_subnet[0].id
    # No public access for government nodes by default
  }

  metadata = {
    enable-oslogin = "TRUE"
    ssh-keys       = "govuser:${file(var.ssh_public_key_path)}"
  }

  shielded_instance_config {
    enable_secure_boot          = true
    enable_vtpm                 = true
    enable_integrity_monitoring = true
  }

  confidential_instance_config {
    enable_confidential_compute = var.enable_confidential_compute
  }

  service_account {
    scopes = ["cloud-platform"]
  }

  labels = {
    environment = var.environment
    sovereignty = "us-government-il5"
  }
}

# ------------------------------------------------------------------------------
# 3. Dedicated Host and VM (GCP Sole-Tenant Nodes)
# ------------------------------------------------------------------------------
resource "google_compute_node_template" "commercial_node_template" {
  count     = var.enable_gcp_dedicated ? 1 : 0
  name      = "alti-${var.customer_id}-node-template"
  region    = var.gcp_region_commercial
  node_type = var.sole_tenant_node_type
}

resource "google_compute_node_group" "commercial_node_group" {
  count         = var.enable_gcp_dedicated ? 1 : 0
  name          = "alti-${var.customer_id}-node-group"
  zone          = "${var.gcp_region_commercial}-a"
  node_template = google_compute_node_template.commercial_node_template[0].id
  initial_size  = 1
}

resource "google_compute_instance" "dedicated_node" {
  count        = var.enable_gcp_dedicated ? 1 : 0
  name         = "alti-${var.customer_id}-dedicated-node"
  machine_type = var.machine_type_dedicated
  zone         = "${var.gcp_region_commercial}-a"

  can_ip_forward = false

  boot_disk {
    initialize_params {
      image = "ubuntu-os-cloud/ubuntu-2204-lts"
      size  = 500
      type  = "pd-ssd"
    }
    kms_key_self_link = var.gcp_kms_crypto_key != null ? var.gcp_kms_crypto_key : google_kms_crypto_key.db_disk_key.id
  }

  network_interface {
    subnetwork = google_compute_subnetwork.commercial_subnet[0].id
  }

  scheduling {
    node_affinities {
      key      = "compute.googleapis.com/node-group-name"
      operator = "IN"
      values   = [google_compute_node_group.commercial_node_group[0].name]
    }
  }

  metadata = {
    enable-oslogin = "TRUE"
    ssh-keys       = "dedicateduser:${file(var.ssh_public_key_path)}"
  }

  shielded_instance_config {
    enable_secure_boot          = true
    enable_vtpm                 = true
    enable_integrity_monitoring = true
  }

  confidential_instance_config {
    enable_confidential_compute = var.enable_confidential_compute
  }

  service_account {
    scopes = ["cloud-platform"]
  }

  labels = {
    environment = var.environment
    sovereignty = "commercial-dedicated"
  }
}
