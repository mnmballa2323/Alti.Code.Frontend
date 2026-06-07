resource "aws_budgets_budget" "finops_ec2_budget" {
  name              = "finops-ec2-spot-enforcement-budget"
  budget_type       = "COST"
  limit_amount      = "1000.0"
  limit_unit        = "USD"
  time_unit         = "MONTHLY"
  time_period_start = "2026-06-01_00:00"

  cost_filter {
    name = "Service"
    values = [
      "Amazon Elastic Compute Cloud - Compute",
    ]
  }

  notification {
    comparison_operator        = "GREATER_THAN"
    threshold                  = 80
    threshold_type             = "PERCENTAGE"
    notification_type          = "ACTUAL"
    subscriber_email_addresses = ["finops-alerts@alticodestudio.com"]
  }
}

resource "aws_iam_role" "budget_action_role" {
  name = "aws-budgets-action-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = {
          Service = "budgets.amazonaws.com"
        }
        Action = "sts:AssumeRole"
      }
    ]
  })
}

resource "aws_iam_role_policy" "budget_ssm_policy" {
  name = "aws-budgets-ssm-policy"
  role = aws_iam_role.budget_action_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "ssm:StartAutomationExecution"
        ]
        Resource = "arn:aws:ssm:*:*:document/FinOps-IdleToSpotReplacement"
      },
      {
        Effect = "Allow"
        Action = [
          "ec2:DescribeInstances"
        ]
        Resource = "*"
      }
    ]
  })
}

resource "aws_budgets_budget_action" "force_spot_replacement" {
  budget_name        = aws_budgets_budget.finops_ec2_budget.name
  action_type        = "RUN_SSM_DOCUMENTS"
  approval_model     = "AUTOMATIC"
  status             = "READY"
  execution_role_arn = aws_iam_role.budget_action_role.arn

  action_threshold {
    action_threshold_type  = "PERCENTAGE"
    action_threshold_value = 90
  }

  definition {
    ssm_action_definition {
      action_sub_type = "STOP_EC2_INSTANCES" # Fallback action type
      region          = "us-east-1"
      instance_ids    = ["i-1234567890abcdef0"] # Placeholder; typically dynamically populated or applied to tags
    }
  }
}
