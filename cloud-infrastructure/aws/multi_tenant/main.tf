provider "aws" {
  region = "us-east-1"
}

resource "aws_ecs_cluster" "main" {
  name = "alti-code-studio-multi-${var.environment}"
}

resource "aws_ecs_task_definition" "app" {
  family                   = "alti-code-studio-task"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = 256
  memory                   = 512

  container_definitions = jsonencode([{
    name      = "alti-code-studio"
    image     = var.docker_image
    essential = true
    environment = [
      { name = "KEYCLOAK_ISSUER", value = var.lco_keycloak_issuer },
      { name = "KEYCLOAK_CLIENT_ID", value = var.lco_keycloak_client_id },
      { name = "KEYCLOAK_CLIENT_SECRET", value = var.lco_keycloak_client_secret },
      { name = "LCO_BILLING_API", value = var.lco_billing_api }
    ]
    portMappings = [{
      containerPort = 3000
      hostPort      = 3000
    }]
  }])
}\n