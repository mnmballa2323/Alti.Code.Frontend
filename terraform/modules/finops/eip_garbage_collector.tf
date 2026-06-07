# AWS Lambda function to identify and release unattached Elastic IPs (EIPs)
# Unattached EIPs incur an hourly charge. Spot instance churn often leaves these behind.

resource "aws_iam_role" "eip_gc_role" {
  name = "finops-eip-garbage-collector-role"

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

resource "aws_iam_role_policy" "eip_gc_policy" {
  name = "finops-eip-gc-policy"
  role = aws_iam_role.eip_gc_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = [
          "ec2:DescribeAddresses",
          "ec2:ReleaseAddress"
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

data "archive_file" "eip_gc_zip" {
  type        = "zip"
  output_path = "${path.module}/eip_garbage_collector.zip"

  source_content = <<EOF
import boto3
import os

def handler(event, context):
    ec2 = boto3.client('ec2')
    
    print("Initiating FinOps Elastic IP (EIP) Garbage Collection...")
    
    # Retrieve all EIPs for the account in the current region
    response = ec2.describe_addresses()
    addresses = response.get('Addresses', [])
    
    released_count = 0
    saved_dollars = 0.0
    
    for address in addresses:
        # An EIP is unattached if it lacks an 'InstanceId' or 'NetworkInterfaceId'
        if 'InstanceId' not in address and 'NetworkInterfaceId' not in address:
            allocation_id = address.get('AllocationId')
            public_ip = address.get('PublicIp')
            
            print(f"Releasing unattached Elastic IP {public_ip} (AllocationId: {allocation_id})...")
            try:
                if allocation_id:
                    ec2.release_address(AllocationId=allocation_id)
                else:
                    # For EC2-Classic (rare but supported by the API)
                    ec2.release_address(PublicIp=public_ip)
                    
                released_count += 1
                # AWS charges ~$0.005 per hour for an unattached EIP -> ~$3.60 per month
                saved_dollars += 3.60
            except Exception as e:
                print(f"Failed to release EIP {public_ip}: {str(e)}")
                
    print(f"EIP Garbage Collection Complete. Released {released_count} unattached IPs.")
    print(f"Estimated Monthly FinOps Savings: ${saved_dollars:.2f}")
    
    return {
        "released_eips": released_count,
        "estimated_savings_usd": saved_dollars
    }
EOF
  source_content_filename = "main.py"
}

resource "aws_lambda_function" "eip_garbage_collector" {
  filename         = data.archive_file.eip_gc_zip.output_path
  function_name    = "finops-eip-garbage-collector"
  role             = aws_iam_role.eip_gc_role.arn
  handler          = "main.handler"
  source_code_hash = data.archive_file.eip_gc_zip.output_base64sha256
  runtime          = "python3.10"
  timeout          = 60
}

# Run the garbage collector every day at 1 AM
resource "aws_cloudwatch_event_rule" "daily_eip_gc_trigger" {
  name                = "trigger-eip-garbage-collector"
  schedule_expression = "cron(0 1 * * ? *)"
}

resource "aws_cloudwatch_event_target" "trigger_eip_gc_lambda" {
  rule      = aws_cloudwatch_event_rule.daily_eip_gc_trigger.name
  target_id = "EipGarbageCollector"
  arn       = aws_lambda_function.eip_garbage_collector.arn
}

resource "aws_lambda_permission" "allow_eventbridge_eip_gc" {
  statement_id  = "AllowExecutionFromEventBridge"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.eip_garbage_collector.function_name
  principal     = "events.amazonaws.com"
  source_arn    = aws_cloudwatch_event_rule.daily_eip_gc_trigger.arn
}
