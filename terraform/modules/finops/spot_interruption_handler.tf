# EventBridge rule to capture EC2 Spot Instance Interruption Warnings
resource "aws_cloudwatch_event_rule" "spot_interruption_rule" {
  name        = "capture-spot-interruptions"
  description = "Captures 2-minute Spot Instance Interruption notices and triggers graceful node drain"

  event_pattern = jsonencode({
    source      = ["aws.ec2"]
    detail-type = ["EC2 Spot Instance Interruption Warning"]
  })
}

# IAM Role for the Lambda that drains the node
resource "aws_iam_role" "node_drainer_role" {
  name = "spot-node-drainer-role"

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

resource "aws_iam_role_policy" "node_drainer_policy" {
  name = "spot-node-drainer-policy"
  role = aws_iam_role.node_drainer_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = [
          "ec2:DescribeInstances"
        ]
        Effect   = "Allow"
        Resource = "*"
      },
      {
        Action = [
          "eks:DescribeCluster"
        ]
        Effect   = "Allow"
        Resource = "arn:aws:eks:*:*:cluster/${var.cluster_name}"
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

# The Lambda function (code assumed to be packaged in spot_drainer.zip)
# This function interacts with the Kubernetes API to cordon and drain the node
resource "aws_lambda_function" "spot_node_drainer" {
  filename      = "spot_drainer.zip"
  function_name = "spot-interruption-node-drainer"
  role          = aws_iam_role.node_drainer_role.arn
  handler       = "main.handler"
  runtime       = "python3.9"
  timeout       = 120 # Fast execution within the 2-minute window

  environment {
    variables = {
      CLUSTER_NAME = var.cluster_name
    }
  }
}

resource "aws_cloudwatch_event_target" "trigger_drainer_lambda" {
  rule      = aws_cloudwatch_event_rule.spot_interruption_rule.name
  target_id = "SpotNodeDrainerLambda"
  arn       = aws_lambda_function.spot_node_drainer.arn
}

resource "aws_lambda_permission" "allow_eventbridge_to_drainer" {
  statement_id  = "AllowExecutionFromEventBridge"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.spot_node_drainer.function_name
  principal     = "events.amazonaws.com"
  source_arn    = aws_cloudwatch_event_rule.spot_interruption_rule.arn
}
