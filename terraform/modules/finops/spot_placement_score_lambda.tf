# AWS Lambda that queries the EC2 Spot Placement Score API
# to dynamically direct compute resources to the AZs/Regions with the most unused capacity

resource "aws_iam_role" "spot_placement_scorer_role" {
  name = "spot-placement-scorer-role"

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

resource "aws_iam_role_policy" "spot_placement_scorer_policy" {
  name = "spot-placement-scorer-policy"
  role = aws_iam_role.spot_placement_scorer_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = [
          "ec2:GetSpotPlacementScores"
        ]
        Effect   = "Allow"
        Resource = "*"
      },
      {
        Action = [
          "ssm:PutParameter"
        ]
        Effect   = "Allow"
        Resource = "arn:aws:ssm:*:*:parameter/finops/spot-optimal-az"
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

# Python lambda code inline for simplicity
data "archive_file" "spot_placement_scorer_zip" {
  type        = "zip"
  output_path = "${path.module}/spot_placement_scorer.zip"

  source_content = <<EOF
import boto3
import os
import json

def handler(event, context):
    ec2 = boto3.client('ec2')
    ssm = boto3.client('ssm')
    
    # We want to deploy 20 t3.large instances
    target_capacity = 20
    instance_requirements = {
        'InstanceTypes': ['t3.large', 'm5.large', 'c5.large'],
        'TargetCapacity': target_capacity
    }
    
    print("Querying EC2 Spot Placement Scores...")
    response = ec2.get_spot_placement_scores(
        InstanceTypes=['t3.large', 'm5.large'],
        TargetCapacity=target_capacity,
        RegionNames=['us-east-1', 'us-east-2', 'us-west-2']
    )
    
    scores = response.get('SpotPlacementScores', [])
    if not scores:
        print("No scores available.")
        return
        
    # Sort by score descending (10 is highest availability)
    scores.sort(key=lambda x: x['Score'], reverse=True)
    best_placement = scores[0]
    
    print(f"Optimal Placement: Region={best_placement['Region']}, AZ={best_placement.get('AvailabilityZoneId', 'ANY')}, Score={best_placement['Score']}")
    
    # Write the optimal placement to SSM Parameter Store so Karpenter/Terraform can read it dynamically
    ssm.put_parameter(
        Name='/finops/spot-optimal-az',
        Value=json.dumps(best_placement),
        Type='String',
        Overwrite=True,
        Tier='Standard'
    )
    
    return best_placement
EOF
  source_content_filename = "main.py"
}

resource "aws_lambda_function" "spot_placement_scorer" {
  filename         = data.archive_file.spot_placement_scorer_zip.output_path
  function_name    = "finops-spot-placement-scorer"
  role             = aws_iam_role.spot_placement_scorer_role.arn
  handler          = "main.handler"
  source_code_hash = data.archive_file.spot_placement_scorer_zip.output_base64sha256
  runtime          = "python3.10"
  timeout          = 30
}

# Run the lambda every hour
resource "aws_cloudwatch_event_rule" "hourly_scorer_trigger" {
  name                = "trigger-spot-placement-scorer"
  schedule_expression = "rate(1 hour)"
}

resource "aws_cloudwatch_event_target" "trigger_lambda" {
  rule      = aws_cloudwatch_event_rule.hourly_scorer_trigger.name
  target_id = "SpotPlacementScorer"
  arn       = aws_lambda_function.spot_placement_scorer.arn
}

resource "aws_lambda_permission" "allow_eventbridge" {
  statement_id  = "AllowExecutionFromEventBridge"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.spot_placement_scorer.function_name
  principal     = "events.amazonaws.com"
  source_arn    = aws_cloudwatch_event_rule.hourly_scorer_trigger.arn
}
