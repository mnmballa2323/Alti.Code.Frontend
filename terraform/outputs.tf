# ==============================================================================
# ALTI CODE STUDIO: GCP Sovereign Cloud Outputs
# ==============================================================================

output "commercial_vm_public_ip" {
  value       = var.enable_gcp_cloud ? google_compute_instance.commercial_node[0].network_interface[0].access_config[0].nat_ip : null
  description = "The public IP address of the commercial VM compute node"
}

output "dedicated_vm_public_ip" {
  value       = var.enable_gcp_dedicated ? google_compute_instance.dedicated_node[0].network_interface[0].access_config[0].nat_ip : null
  description = "The public IP address of the dedicated VM compute node"
}

output "commercial_postgres_ip" {
  value       = google_sql_database_instance.db_instance.private_ip_address
  description = "The private IP address of the PostgreSQL database instance"
}

output "commercial_redis_hostname" {
  value       = google_redis_instance.redis_cache.host
  description = "The private hostname/IP of the Redis instance"
}

output "commercial_redis_port" {
  value       = google_redis_instance.redis_cache.port
  description = "The private port of the Redis instance"
}

# Cloud Run
output "cloud_run_url" {
  value       = var.enable_cloud_run ? google_cloud_run_v2_service.backend[0].uri : null
  description = "Cloud Run backend service URL"
}

# Cloud CDN
output "cdn_ip_address" {
  value       = google_compute_global_address.cdn_ip.address
  description = "Global static IP for the CDN load balancer"
}

# Cloud Armor
output "waf_policy_name" {
  value       = google_compute_security_policy.production_waf.name
  description = "Cloud Armor WAF policy name"
}

# Artifact Registry
output "container_registry_url" {
  value       = "${var.region}-docker.pkg.dev/${var.gcp_project_id}/alti-registry"
  description = "Artifact Registry container URL"
}

# KMS
output "kms_keyring_name" {
  value       = google_kms_key_ring.sovereign_keyring.name
  description = "KMS keyring for envelope encryption"
}

# VPC
output "vpc_network_id" {
  value       = google_compute_network.vpc_network.id
  description = "VPC network ID"
}

# Database
output "alloydb_cluster_name" {
  value       = var.enable_alloydb ? "alti-alloydb-cluster" : null
  description = "AlloyDB cluster name (if enabled)"
}
