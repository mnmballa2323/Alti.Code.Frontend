# FinOps Savings Plan Recommendation Exporter
# Compute Savings Plans offer up to 72% discounts compared to On-Demand pricing.
# This module deploys a scheduled AWS Lambda function that automatically queries the 
# AWS Cost Explorer API for optimal Savings Plan recommendations based on the last 30 days of usage.
# It exports these recommendations to a centralized FinOps S3 bucket for executive review.

resource "aws_s3_bucket" "finops_reports" {
  bucket = "alti-finops-savings-plan-reports"
}

resource "aws_iam_role" "savings_plan_exporter_role" {
  name = "finops-savings-plan-exporter-role"

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

resource "aws_iam_role_policy" "savings_plan_exporter_policy" {
  name = "finops-savings-plan-exporter-policy"
  role = aws_iam_role.savings_plan_exporter_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = [
          "ce:GetSavingsPlansPurchaseRecommendation"
        ]
        Effect   = "Allow"
        Resource = "*" # Cost Explorer APIs do not support resource-level permissions
      },
      {
        Action = [
          "s3:PutObject"
        ]
        Effect   = "Allow"
        Resource = "${aws_s3_bucket.finops_reports.arn}/*"
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

data "archive_file" "savings_plan_exporter_zip" {
  type        = "zip"
  output_path = "${path.module}/savings_plan_exporter.zip"

  source_content = <<EOF
import boto3
import json
import os
import datetime

def handler(event, context):
    ce_client = boto3.client('ce')
    s3_client = boto3.client('s3')
    
    bucket_name = os.environ['REPORT_BUCKET']
    
    print("Fetching AWS Compute Savings Plan Recommendations...")
    
    # We ask AWS for a recommendation based on the last 30 days of usage,
    # for a 1-year No Upfront Compute Savings Plan.
    try:
        response = ce_client.get_savings_plans_purchase_recommendation(
            SavingsPlansType='COMPUTE_SP',
            TermInYears='ONE_YEAR',
            PaymentOption='NO_UPFRONT',
            LookbackPeriodInDays='THIRTY_DAYS'
        )
        
        # Serialize the complex boto3 response dictionary to JSON string
        report_data = json.dumps(response.get('SavingsPlansPurchaseRecommendation', {}), indent=2, default=str)
        
        # Generate a timestamped file name
        date_str = datetime.datetime.now().strftime("%Y-%m-%d")
        file_key = f"savings-plan-recommendations/{date_str}_recommendation.json"
        
        print(f"Uploading recommendation report to s3://{bucket_name}/{file_key}")
        
        s3_client.put_object(
            Bucket=bucket_name,
            Key=file_key,
            Body=report_data,
            ContentType='application/json'
        )
        
        print("Export complete.")
        return {"status": "success", "file": file_key}
        
    except Exception as e:
        print(f"Failed to generate Savings Plan Report: {str(e)}")
        raise e
EOF
  source_content_filename = "main.py"
}

resource "aws_lambda_function" "savings_plan_exporter" {
  filename         = data.archive_file.savings_plan_exporter_zip.output_path
  function_name    = "finops-savings-plan-exporter"
  role             = aws_iam_role.savings_plan_exporter_role.arn
  handler          = "main.handler"
  source_code_hash = data.archive_file.savings_plan_exporter_zip.output_base64sha256
  runtime          = "python3.10"
  timeout          = 60
  
  environment {
    variables = {
      REPORT_BUCKET = aws_s3_bucket.finops_reports.bucket
    }
  }
}

# Run the exporter every Monday morning at 8 AM
resource "aws_cloudwatch_event_rule" "weekly_sp_exporter_trigger" {
  name                = "trigger-finops-sp-exporter"
  schedule_expression = "cron(0 8 ? * MON *)"
}

resource "aws_cloudwatch_event_target" "trigger_sp_exporter_lambda" {
  rule      = aws_cloudwatch_event_rule.weekly_sp_exporter_trigger.name
  target_id = "SavingsPlanExporter"
  arn       = aws_lambda_function.savings_plan_exporter.arn
}

resource "aws_lambda_permission" "allow_eventbridge_sp_exporter" {
  statement_id  = "AllowExecutionFromEventBridge"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.savings_plan_exporter.function_name
  principal     = "events.amazonaws.com"
  source_arn    = aws_cloudwatch_event_rule.weekly_sp_exporter_trigger.arn
}
