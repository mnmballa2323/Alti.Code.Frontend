# FinOps DynamoDB Auto Scaling Enforcer
# By default, DynamoDB tables require developers to manually specify Provisioned Read/Write Capacity Units.
# Human developers almost always over-provision "just in case", resulting in massive wasted spend during off-peak hours.
# This Terraform module defines a reusable standard that attaches Application Auto Scaling to DynamoDB tables,
# forcing them to dynamically scale RCUs and WCUs based on 70% target utilization.

variable "dynamodb_table_name" {
  type        = string
  description = "The name of the DynamoDB table to enforce FinOps Auto Scaling upon"
  default     = "alti-crypto-ledger-main"
}

# ---------------------------------------------------------
# READ CAPACITY AUTO SCALING
# ---------------------------------------------------------
resource "aws_appautoscaling_target" "dynamodb_read_target" {
  max_capacity       = 40000 # High ceiling for immense traffic spikes
  min_capacity       = 5     # Scale down to almost zero when idle
  resource_id        = "table/${var.dynamodb_table_name}"
  scalable_dimension = "dynamodb:table:ReadCapacityUnits"
  service_namespace  = "dynamodb"
}

resource "aws_appautoscaling_policy" "dynamodb_read_policy" {
  name               = "DynamoDBReadCapacityUtilization:${aws_appautoscaling_target.dynamodb_read_target.resource_id}"
  policy_type        = "TargetTrackingScaling"
  resource_id        = aws_appautoscaling_target.dynamodb_read_target.resource_id
  scalable_dimension = aws_appautoscaling_target.dynamodb_read_target.scalable_dimension
  service_namespace  = aws_appautoscaling_target.dynamodb_read_target.service_namespace

  target_tracking_scaling_policy_configuration {
    predefined_metric_specification {
      predefined_metric_type = "DynamoDBReadCapacityUtilization"
    }
    # Keep capacity perfectly tuned so that we are utilizing exactly 70% of provisioned throughput
    target_value = 70.0
    scale_in_cooldown  = 60 # Rapidly scale down after a spike to save money
    scale_out_cooldown = 10 # Scale out instantly when traffic hits
  }
}

# ---------------------------------------------------------
# WRITE CAPACITY AUTO SCALING
# ---------------------------------------------------------
resource "aws_appautoscaling_target" "dynamodb_write_target" {
  max_capacity       = 40000
  min_capacity       = 5
  resource_id        = "table/${var.dynamodb_table_name}"
  scalable_dimension = "dynamodb:table:WriteCapacityUnits"
  service_namespace  = "dynamodb"
}

resource "aws_appautoscaling_policy" "dynamodb_write_policy" {
  name               = "DynamoDBWriteCapacityUtilization:${aws_appautoscaling_target.dynamodb_write_target.resource_id}"
  policy_type        = "TargetTrackingScaling"
  resource_id        = aws_appautoscaling_target.dynamodb_write_target.resource_id
  scalable_dimension = aws_appautoscaling_target.dynamodb_write_target.scalable_dimension
  service_namespace  = aws_appautoscaling_target.dynamodb_write_target.service_namespace

  target_tracking_scaling_policy_configuration {
    predefined_metric_specification {
      predefined_metric_type = "DynamoDBWriteCapacityUtilization"
    }
    target_value       = 70.0
    scale_in_cooldown  = 60
    scale_out_cooldown = 10
  }
}
