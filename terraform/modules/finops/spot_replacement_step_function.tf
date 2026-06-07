# AWS Step Function for Orchestrating Idle-to-Spot Replacements
# This state machine provides a robust workflow for evaluating and replacing instances

resource "aws_iam_role" "step_function_role" {
  name = "spot-replacement-sfn-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
      Principal = {
        Service = "states.amazonaws.com"
      }
    }]
  })
}

resource "aws_iam_role_policy" "sfn_policy" {
  name = "spot-replacement-sfn-policy"
  role = aws_iam_role.step_function_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = [
          "lambda:InvokeFunction"
        ]
        Effect   = "Allow"
        Resource = aws_lambda_function.idle_instance_replacement.arn
      },
      {
        Action = [
          "ec2:DescribeInstances",
          "ec2:RequestSpotInstances",
          "ec2:TerminateInstances"
        ]
        Effect   = "Allow"
        Resource = "*"
      }
    ]
  })
}

resource "aws_sfn_state_machine" "spot_replacement_workflow" {
  name     = "Idle-To-Spot-Replacement-Workflow"
  role_arn = aws_iam_role.step_function_role.arn

  definition = jsonencode({
    Comment = "A state machine that automates the replacement of idle On-Demand instances with Spot instances."
    StartAt = "EvaluateInstance"
    States = {
      EvaluateInstance = {
        Type     = "Task"
        Resource = aws_lambda_function.idle_instance_replacement.arn
        Next     = "IsIdle"
      }
      IsIdle = {
        Type = "Choice"
        Choices = [
          {
            Variable      = "$.is_idle"
            BooleanEquals = true
            Next          = "RequestSpotInstance"
          }
        ]
        Default = "EndWorkflow"
      }
      RequestSpotInstance = {
        Type     = "Task"
        Resource = "arn:aws:states:::aws-sdk:ec2:requestSpotInstances"
        Parameters = {
          InstanceCount = 1
          LaunchSpecification = {
            ImageId      = "$.image_id"
            InstanceType = "$.instance_type"
            SubnetId     = "$.subnet_id"
          }
        }
        Next = "TerminateOldInstance"
      }
      TerminateOldInstance = {
        Type     = "Task"
        Resource = "arn:aws:states:::aws-sdk:ec2:terminateInstances"
        Parameters = {
          InstanceIds = ["$.old_instance_id"]
        }
        Next = "EndWorkflow"
      }
      EndWorkflow = {
        Type = "Succeed"
      }
    }
  })
}

resource "aws_cloudwatch_event_rule" "trigger_sfn_daily" {
  name                = "trigger-spot-replacement-sfn"
  description         = "Trigger the Spot Replacement Step Function daily"
  schedule_expression = "rate(1 day)"
}

resource "aws_cloudwatch_event_target" "sfn_target" {
  rule      = aws_cloudwatch_event_rule.trigger_sfn_daily.name
  target_id = "SpotReplacementWorkflow"
  arn       = aws_sfn_state_machine.spot_replacement_workflow.arn
  role_arn  = aws_iam_role.step_function_role.arn
}
