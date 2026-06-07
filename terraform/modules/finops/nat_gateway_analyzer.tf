# FinOps NAT Gateway Cost Analyzer
# AWS NAT Gateways charge per-GB of data processed. If an internal pod is pulling 
# massive docker images from DockerHub or downloading huge datasets from the internet,
# NAT Gateway costs can easily exceed thousands of dollars per month.
# This module deploys an Athena Table and a Glue crawler to query VPC Flow Logs, 
# allowing FinOps to identify exactly which internal IP addresses are burning NAT bandwidth.

resource "aws_s3_bucket" "vpc_flow_logs" {
  bucket = "alti-finops-vpc-flow-logs"
}

# 1. Enable VPC Flow Logs on the main VPC, routing to S3
resource "aws_flow_log" "main_vpc_flow_log" {
  log_destination      = aws_s3_bucket.vpc_flow_logs.arn
  log_destination_type = "s3"
  traffic_type         = "ALL"
  vpc_id               = var.vpc_id # Assume passed from main VPC module
}

# 2. Athena Database for querying the logs
resource "aws_athena_database" "finops_db" {
  name   = "finops_cost_analysis"
  bucket = aws_s3_bucket.vpc_flow_logs.bucket
}

# 3. Athena Named Query to find top NAT Gateway consumers
# This query filters for traffic where the source is the NAT Gateway's ENI,
# sums the total bytes, and groups by the internal destination IP.
resource "aws_athena_named_query" "top_nat_talkers" {
  name     = "Find Top NAT Gateway Bandwidth Consumers"
  database = aws_athena_database.finops_db.name
  query    = <<EOF
SELECT 
  dstaddr as Internal_IP, 
  SUM(bytes)/1024/1024/1024 AS Total_GB_Downloaded,
  SUM(bytes)/1024/1024/1024 * 0.045 AS Estimated_NAT_Cost_USD
FROM 
  vpc_flow_logs
WHERE 
  srcaddr = 'NAT_GATEWAY_PRIVATE_IP' -- Replaced dynamically or via JOIN in prod
GROUP BY 
  dstaddr 
ORDER BY 
  Total_GB_Downloaded DESC 
LIMIT 50;
EOF
}

# 4. AWS Glue Crawler to automatically map the S3 Flow Logs into the Athena Table
resource "aws_iam_role" "glue_crawler_role" {
  name = "finops-glue-crawler-role"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
      Principal = { Service = "glue.amazonaws.com" }
    }]
  })
}

resource "aws_iam_role_policy_attachment" "glue_service_role" {
  role       = aws_iam_role.glue_crawler_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSGlueServiceRole"
}

resource "aws_iam_role_policy" "glue_s3_access" {
  name = "finops-glue-s3-access"
  role = aws_iam_role.glue_crawler_role.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action   = ["s3:GetObject", "s3:ListBucket"]
      Effect   = "Allow"
      Resource = [aws_s3_bucket.vpc_flow_logs.arn, "${aws_s3_bucket.vpc_flow_logs.arn}/*"]
    }]
  })
}

resource "aws_glue_crawler" "vpc_flow_logs_crawler" {
  database_name = aws_athena_database.finops_db.name
  name          = "finops-vpc-flow-logs-crawler"
  role          = aws_iam_role.glue_crawler_role.arn

  s3_target {
    path = "s3://${aws_s3_bucket.vpc_flow_logs.bucket}/"
  }
  
  # Run nightly
  schedule = "cron(0 1 * * ? *)"
}
