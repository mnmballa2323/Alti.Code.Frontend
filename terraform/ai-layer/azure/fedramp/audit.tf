# Azure Government Cloud Audit Logging
resource "azurerm_monitor_log_profile" "fedramp_audit" {
  name = "audit-log-profile"

  categories = [
    "Action",
    "Delete",
    "Write",
  ]

  locations = [
    "usgovvirginia",
    "usgovtexas",
  ]

  retention_policy {
    enabled = true
    days    = 365 # 1 year retention for FedRAMP
  }
}
