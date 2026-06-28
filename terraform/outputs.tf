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
  value       = var.enable_gcp_cloud || var.enable_gcp_dedicated ? module.database_commercial[0].postgres_ip : null
  description = "The private IP address of the commercial PostgreSQL database instance"
}

output "commercial_redis_hostname" {
  value       = var.enable_gcp_cloud || var.enable_gcp_dedicated ? module.database_commercial[0].redis_hostname : null
  description = "The private hostname/IP of the commercial Redis instance"
}

output "commercial_redis_port" {
  value       = var.enable_gcp_cloud || var.enable_gcp_dedicated ? module.database_commercial[0].redis_port : null
  description = "The private port of the commercial Redis instance"
}

output "government_postgres_ip" {
  value       = var.enable_gcp_government ? module.database_government[0].postgres_ip : null
  description = "The private IP address of the government PostgreSQL database instance"
}
