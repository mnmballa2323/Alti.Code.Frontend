provider "aws" {
  region = "us-gov-west-1" # AWS GovCloud
}

resource "aws_instance" "app" {
  ami           = "ami-0c55b159cbfafe1f0" # GovCloud AL2 AMI
  instance_type = "m5.large"
  
  tags = {
    Name = "alti-code-studio-gov-${var.environment}"
    Compliance = "FedRAMP-High"
  }

  user_data = <<-EOF
              #!/bin/bash
              yum update -y
              amazon-linux-extras install docker
              service docker start
              usermod -a -G docker ec2-user
              docker run -d -p 80:3000 \
                -e KEYCLOAK_ISSUER="${var.lco_keycloak_issuer}" \
                -e KEYCLOAK_CLIENT_ID="${var.lco_keycloak_client_id}" \
                -e KEYCLOAK_CLIENT_SECRET="${var.lco_keycloak_client_secret}" \
                -e LCO_BILLING_API="${var.lco_billing_api}" \
                ${var.docker_image}
              EOF
}\n