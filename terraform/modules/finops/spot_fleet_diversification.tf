# AWS Spot Fleet Configuration
# Highly resilient and cost-optimized compute layer prioritizing Spot Instance diversification

resource "aws_iam_role" "spot_fleet_role" {
  name = "aws-ec2-spot-fleet-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
      Principal = {
        Service = "spotfleet.amazonaws.com"
      }
    }]
  })
}

resource "aws_iam_role_policy_attachment" "spot_fleet_role_attachment" {
  role       = aws_iam_role.spot_fleet_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonEC2SpotFleetTaggingRole"
}

resource "aws_spot_fleet_request" "diversified_finops_fleet" {
  iam_fleet_role      = aws_iam_role.spot_fleet_role.arn
  allocation_strategy = "priceCapacityOptimized"
  target_capacity     = 20
  valid_until         = "2029-12-31T23:59:59Z"
  
  # Ensure instances are replaced immediately if interrupted
  terminate_instances_with_expiration = true
  replace_unhealthy_instances         = true

  # Instance type diversification to mitigate mass interruptions
  launch_specification {
    instance_type     = "t3.large"
    ami               = var.ami_id
    subnet_id         = var.subnet_ids[0]
    weighted_capacity = 1
    
    tags = {
      FinOps = "SpotFleet"
      Type   = "Diversified"
    }
  }

  launch_specification {
    instance_type     = "t3a.large"
    ami               = var.ami_id
    subnet_id         = var.subnet_ids[1]
    weighted_capacity = 1
  }

  launch_specification {
    instance_type     = "m5.large"
    ami               = var.ami_id
    subnet_id         = var.subnet_ids[0]
    weighted_capacity = 2 # m5 is more powerful, counts as 2 units towards target_capacity
  }

  launch_specification {
    instance_type     = "m5a.large"
    ami               = var.ami_id
    subnet_id         = var.subnet_ids[1]
    weighted_capacity = 2
  }

  depends_on = [aws_iam_role_policy_attachment.spot_fleet_role_attachment]
}

variable "ami_id" {
  description = "The AMI ID to use for the Spot Fleet"
  type        = string
}

variable "subnet_ids" {
  description = "List of subnet IDs across different Availability Zones"
  type        = list(string)
}
