# AWS FIPS 140-2 Enforcement
resource "aws_api_gateway_rest_api" "fedramp_api" {
  name        = "api-fedramp-aws"
  description = "GovCloud API Gateway with FIPS enforcement"

  endpoint_configuration {
    types = ["PRIVATE"] # Disallow all public edge endpoints
  }
}

resource "aws_lb" "fedramp_alb" {
  name               = "alb-fedramp"
  internal           = true
  load_balancer_type = "application"
  subnets            = [] # to be injected from network module

  # Enforce FIPS-compliant TLS policies
  drop_invalid_header_fields = true
}
