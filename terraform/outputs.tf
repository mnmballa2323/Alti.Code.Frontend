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
