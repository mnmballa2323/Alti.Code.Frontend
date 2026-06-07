# FinOps CloudWatch Log Retention Enforcer
# AWS CloudWatch Logs default to "Never Expire" retention.
# This Terraform module deploys a Lambda that runs daily, sweeping all Log Groups
# in the region and forcing them to a 14-day retention limit if they are missing one.
# This eliminates runaway FinOps log storage costs.

resource "aws_iam_role" "log_retention_enforcer_role" {
  name = "finops-cw-retention-enforcer-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
      Principal = {
        Service = "lambda.amazonaws.com"
      }
    }]
  })
}

resource "aws_iam_role_policy" "log_retention_enforcer_policy" {
  name = "finops-cw-retention-enforcer-policy"
  role = aws_iam_role.log_retention_enforcer_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = [
          "logs:DescribeLogGroups",
          "logs:PutRetentionPolicy"
        ]
        Effect   = "Allow"
        Resource = "arn:aws:logs:*:*:log-group:*"
      },
      {
        Action = [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents"
        ]
        Effect   = "Allow"
        Resource = "arn:aws:logs:*:*:*"
      }
    ]
  })
}

data "archive_file" "log_retention_enforcer_zip" {
  type        = "zip"
  output_path = "${path.module}/cloudwatch_retention_enforcer.zip"

  source_content = <<EOF
import boto3
import os

def handler(event, context):
    logs = boto3.client('logs')
    
    print("Initiating FinOps CloudWatch Log Retention Enforcement...")
    
    # We enforce a strict 14-day retention for all standard logs to prevent infinite storage bloat
    target_retention_days = int(os.environ.get('TARGET_RETENTION_DAYS', '14'))
    
    paginator = logs.get_paginator('describe_log_groups')
    
    enforced_count = 0
    
    for page in paginator.paginate():
        for group in page.get('logGroups', []):
            group_name = group.get('logGroupName')
            current_retention = group.get('retentionInDays')
            
            # If the log group has no retention policy (Never Expire)
            # or its retention policy is longer than our strict target limit
            if not current_retention or current_retention > target_retention_days:
                
                # Exclude critical audit trails (like CloudTrail) which should be kept for compliance
                if "CloudTrail" in group_name or "audit" in group_name.lower():
                    print(f"Skipping audit log group: {group_name}")
                    continue
                    
                print(f"Enforcing {target_retention_days}-day retention on Log Group: {group_name}")
                try:
                    logs.put_retention_policy(
                        logGroupName=group_name,
                        retentionInDays=target_retention_days
                    )
                    enforced_count += 1
                except Exception as e:
                    print(f"Failed to update {group_name}: {str(e)}")
                    
    print(f"CloudWatch Retention Enforcement Complete. Updated {enforced_count} Log Groups.")
    
    return {
        "updated_log_groups": enforced_count,
        "enforced_retention_days": target_retention_days
    }
EOF
  source_content_filename = "main.py"
}

resource "aws_lambda_function" "log_retention_enforcer" {
  filename         = data.archive_file.log_retention_enforcer_zip.output_path
  function_name    = "finops-cw-retention-enforcer"
  role             = aws_iam_role.log_retention_enforcer_role.arn
  handler          = "main.handler"
  source_code_hash = data.archive_file.log_retention_enforcer_zip.output_base64sha256
  runtime          = "python3.10"
  timeout          = 300 # Scanning thousands of log groups can take a few minutes
  
  environment {
    variables = {
      TARGET_RETENTION_DAYS = "14"
    }
  }
}

# Run the enforcer every Sunday at 3 AM
resource "aws_cloudwatch_event_rule" "weekly_retention_enforcer_trigger" {
  name                = "trigger-finops-retention-enforcer"
  schedule_expression = "cron(0 3 ? * SUN *)"
}

resource "aws_cloudwatch_event_target" "trigger_retention_enforcer_lambda" {
  rule      = aws_cloudwatch_event_rule.weekly_retention_enforcer_trigger.name
  target_id = "LogRetentionEnforcer"
  arn       = aws_lambda_function.log_retention_enforcer.arn
}

resource "aws_lambda_permission" "allow_eventbridge_retention_enforcer" {
  statement_id  = "AllowExecutionFromEventBridge"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.log_retention_enforcer.function_name
  principal     = "events.amazonaws.com"
  source_arn    = aws_cloudwatch_event_rule.weekly_retention_enforcer_trigger.arn
}
