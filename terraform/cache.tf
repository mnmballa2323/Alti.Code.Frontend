# Provision Google Cloud Memorystore for Redis for distributed caching, queue management, and session syncing
resource "google_redis_instance" "redis_cache" {
  name           = "inso-production-redis"
  tier           = var.redis_tier       # Parameterized High availability tier
  memory_size_gb = var.redis_memory_size_gb # Parameterized Memory capacity

  region                  = var.region
  authorized_network      = google_compute_network.private_network.id
  connect_mode            = "PRIVATE_SERVICE_ACCESS"
  redis_version           = "REDIS_7_0"
  display_name            = "Inso Production Redis Cache"

  depends_on = [google_service_networking_connection.private_vpc_connection]

  maintenance_policy {
    weekly_maintenance_window {
      day = "SUNDAY"
      start_time {
        hours   = 2
        minutes = 0
        seconds = 0
        nanos   = 0
      }
    }
  }
}

output "redis_host" {
  value       = google_redis_instance.redis_cache.host
  description = "The IP address of the private Redis instance"
}

output "redis_port" {
  value       = google_redis_instance.redis_cache.port
  description = "The connection port of the private Redis instance"
}
