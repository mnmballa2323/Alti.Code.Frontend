# FinOps RDS Schedule Optimizer
# Automatically stops non-production RDS instances overnight and on weekends
# to drastically reduce Database compute costs.

variable "nonprod_rds_clusters" {
  description = "List of non-production RDS cluster identifiers to target for scheduled shutdown"
  type        = list(string)
  default     = ["dev-postgres-cluster", "staging-aurora-cluster"]
}

resource "aws_iam_role" "rds_scheduler_role" {
  name = "finops-rds-scheduler-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
      Principal = {
        Service = "events.amazonaws.com"
      }
    }]
  })
}

resource "aws_iam_role_policy" "rds_scheduler_policy" {
  name = "finops-rds-scheduler-policy"
  role = aws_iam_role.rds_scheduler_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = [
          "rds:StopDBCluster",
          "rds:StartDBCluster",
          "rds:StopDBInstance",
          "rds:StartDBInstance"
        ]
        Effect   = "Allow"
        Resource = "*"
      }
    ]
  })
}

# --- STOP SCHEDULER (Every Weekday at 8:00 PM UTC / 4:00 PM EST) ---
resource "aws_cloudwatch_event_rule" "stop_rds_schedule" {
  name                = "finops-stop-rds-schedule"
  description         = "Stop non-production databases at night to save costs"
  schedule_expression = "cron(0 20 ? * MON-FRI *)"
}

# Target using AWS Systems Manager API to Stop the RDS cluster
resource "aws_cloudwatch_event_target" "stop_rds_target" {
  count    = length(var.nonprod_rds_clusters)
  rule     = aws_cloudwatch_event_rule.stop_rds_schedule.name
  target_id = "StopRdsTarget-${count.index}"
  
  # The native API destination for RDS Operations via EventBridge
  arn      = "arn:aws:events:us-east-1:${data.aws_caller_identity.current.account_id}:api-destination/StopRDS"
  role_arn = aws_iam_role.rds_scheduler_role.arn

  # This uses an abstraction. For true Terraform native, you'd use a Lambda or Systems Manager Automation.
  # For the sake of the infrastructure loop, we'll configure a Systems Manager Automation Document target.
}

# Real implementation using Systems Manager Automation to stop the instance
resource "aws_cloudwatch_event_target" "ssm_stop_rds" {
  count    = length(var.nonprod_rds_clusters)
  rule     = aws_cloudwatch_event_rule.stop_rds_schedule.name
  target_id = "SsmStopRdsTarget-${count.index}"
  
  # AWS provides managed SSM documents for this exact purpose
  arn      = "arn:aws:ssm:us-east-1::document/AWS-StopRdsInstance"
  role_arn = aws_iam_role.rds_scheduler_role.arn
  
  input = jsonencode({
    InstanceId = [var.nonprod_rds_clusters[count.index]]
  })
}

# --- START SCHEDULER (Every Weekday at 12:00 PM UTC / 8:00 AM EST) ---
resource "aws_cloudwatch_event_rule" "start_rds_schedule" {
  name                = "finops-start-rds-schedule"
  description         = "Start non-production databases in the morning"
  schedule_expression = "cron(0 12 ? * MON-FRI *)"
}

resource "aws_cloudwatch_event_target" "ssm_start_rds" {
  count    = length(var.nonprod_rds_clusters)
  rule     = aws_cloudwatch_event_rule.start_rds_schedule.name
  target_id = "SsmStartRdsTarget-${count.index}"
  
  arn      = "arn:aws:ssm:us-east-1::document/AWS-StartRdsInstance"
  role_arn = aws_iam_role.rds_scheduler_role.arn
  
  input = jsonencode({
    InstanceId = [var.nonprod_rds_clusters[count.index]]
  })
}

data "aws_caller_identity" "current" {}
