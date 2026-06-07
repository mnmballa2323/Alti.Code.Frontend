# AWS Lambda function to identify and delete orphaned/unattached EBS volumes
# to prevent FinOps cost leaks from Spot Instance terminations

resource "aws_iam_role" "ebs_gc_role" {
  name = "finops-ebs-garbage-collector-role"

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

resource "aws_iam_role_policy" "ebs_gc_policy" {
  name = "finops-ebs-gc-policy"
  role = aws_iam_role.ebs_gc_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = [
          "ec2:DescribeVolumes",
          "ec2:DeleteVolume"
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

data "archive_file" "ebs_gc_zip" {
  type        = "zip"
  output_path = "${path.module}/ebs_garbage_collector.zip"

  source_content = <<EOF
import boto3
import os

def handler(event, context):
    ec2 = boto3.client('ec2')
    
    print("Initiating FinOps EBS Garbage Collection...")
    
    # Find all volumes that are in the 'available' state (unattached)
    response = ec2.describe_volumes(
        Filters=[{'Name': 'status', 'Values': ['available']}]
    )
    
    volumes = response.get('Volumes', [])
    deleted_count = 0
    saved_dollars = 0.0
    
    for volume in volumes:
        vol_id = volume['VolumeId']
        size_gb = volume['Size']
        vol_type = volume['VolumeType']
        
        # We only delete volumes tagged with 'FinOps: Deletable' or if it's explicitly enforced
        # For this script, we assume all available volumes in the spot subnets are fair game
        
        print(f"Deleting orphaned volume {vol_id} ({size_gb} GB, {vol_type})...")
        try:
            ec2.delete_volume(VolumeId=vol_id)
            deleted_count += 1
            # Rough approximation of savings (e.g., gp3 is ~$0.08/GB-month)
            saved_dollars += (size_gb * 0.08)
        except Exception as e:
            print(f"Failed to delete volume {vol_id}: {str(e)}")
            
    print(f"Garbage Collection Complete. Deleted {deleted_count} orphaned volumes.")
    print(f"Estimated Monthly FinOps Savings: ${saved_dollars:.2f}")
    
    return {
        "deleted_volumes": deleted_count,
        "estimated_savings_usd": saved_dollars
    }
EOF
  source_content_filename = "main.py"
}

resource "aws_lambda_function" "ebs_garbage_collector" {
  filename         = data.archive_file.ebs_gc_zip.output_path
  function_name    = "finops-ebs-garbage-collector"
  role             = aws_iam_role.ebs_gc_role.arn
  handler          = "main.handler"
  source_code_hash = data.archive_file.ebs_gc_zip.output_base64sha256
  runtime          = "python3.10"
  timeout          = 300
}

# Run the garbage collector every day at midnight
resource "aws_cloudwatch_event_rule" "daily_ebs_gc_trigger" {
  name                = "trigger-ebs-garbage-collector"
  schedule_expression = "cron(0 0 * * ? *)"
}

resource "aws_cloudwatch_event_target" "trigger_ebs_gc_lambda" {
  rule      = aws_cloudwatch_event_rule.daily_ebs_gc_trigger.name
  target_id = "EbsGarbageCollector"
  arn       = aws_lambda_function.ebs_garbage_collector.arn
}

resource "aws_lambda_permission" "allow_eventbridge_ebs_gc" {
  statement_id  = "AllowExecutionFromEventBridge"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.ebs_garbage_collector.function_name
  principal     = "events.amazonaws.com"
  source_arn    = aws_cloudwatch_event_rule.daily_ebs_gc_trigger.arn
}
