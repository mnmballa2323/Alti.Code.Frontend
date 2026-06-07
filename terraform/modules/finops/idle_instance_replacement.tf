resource "aws_iam_role" "idle_instance_lambda_role" {
  name = "idle-instance-replacement-role"

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

resource "aws_iam_policy" "idle_instance_lambda_policy" {
  name        = "idle-instance-replacement-policy"
  description = "Permissions for Lambda to detect and replace idle instances"
  
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = [
          "ec2:DescribeInstances",
          "ec2:TerminateInstances",
          "ec2:RunInstances",
          "cloudwatch:GetMetricStatistics"
        ]
        Effect   = "Allow"
        Resource = "*"
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

resource "aws_iam_role_policy_attachment" "lambda_policy_attach" {
  role       = aws_iam_role.idle_instance_lambda_role.name
  policy_arn = aws_iam_policy.idle_instance_lambda_policy.arn
}

data "archive_file" "idle_lambda_zip" {
  type        = "zip"
  source_file = "${path.module}/index.py"
  output_path = "${path.module}/idle_replacement_payload.zip"
}

resource "aws_lambda_function" "idle_instance_replacement" {
  filename         = data.archive_file.idle_lambda_zip.output_path
  function_name    = "replace-idle-with-spot"
  role             = aws_iam_role.idle_instance_lambda_role.arn
  handler          = "index.handler"
  runtime          = "python3.9"
  source_code_hash = data.archive_file.idle_lambda_zip.output_base64sha256

  environment {
    variables = {
      CPU_THRESHOLD = "5"
    }
  }
}

resource "aws_cloudwatch_event_rule" "daily_idle_check" {
  name                = "daily-idle-instance-check"
  description         = "Triggers Lambda to check for idle instances daily"
  schedule_expression = "rate(1 day)"
}

resource "aws_cloudwatch_event_target" "trigger_lambda" {
  rule      = aws_cloudwatch_event_rule.daily_idle_check.name
  target_id = "idle_replacement_lambda"
  arn       = aws_lambda_function.idle_instance_replacement.arn
}

resource "aws_lambda_permission" "allow_cloudwatch" {
  statement_id  = "AllowExecutionFromCloudWatch"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.idle_instance_replacement.function_name
  principal     = "events.amazonaws.com"
  source_arn    = aws_cloudwatch_event_rule.daily_idle_check.arn
}
