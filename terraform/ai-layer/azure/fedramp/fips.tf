# Azure FIPS 140-2 Enforcement
resource "azurerm_api_management" "fedramp_api" {
  name                = "api-fedramp-azure"
  location            = "USGov Virginia"
  resource_group_name = "rg-fedramp"
  publisher_name      = "AltiCode Studio"
  publisher_email     = "compliance@alticodestudio.com"
  
  sku_name = "Premium_1"

  security {
    enable_backend_ssl30  = false
    enable_backend_tls10  = false
    enable_backend_tls11  = false
    enable_frontend_ssl30 = false
    enable_frontend_tls10 = false
    enable_frontend_tls11 = false
  }
}
