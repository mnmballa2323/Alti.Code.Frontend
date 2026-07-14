locals {
  is_aws_single_tenant = var.deployment_tier == "single-tenant"
  is_aws_fedramp       = var.deployment_tier == "fedramp"
  
  aws_effective_region = var.deployment_tier == "fedramp" ? "us-gov-west-1" : var.aws_region
  aws_partition        = var.deployment_tier == "fedramp" ? "aws-us-gov" : "aws"
}

provider "aws" {
  region  = local.aws_effective_region
  profile = var.aws_profile
}

resource "aws_bedrock_provisioned_model_throughput" "claude_provisioned" {
  count = local.is_aws_single_tenant ? 1 : 0

  provisioned_model_name = "alticodestudio-claude-single-tenant-${var.environment}"
  model_arn              = "arn:${local.aws_partition}:bedrock:${local.aws_effective_region}::foundation-model/anthropic.claude-3-5-sonnet-20240620-v1:0"
  model_units            = 1
}

resource "aws_iam_role" "bedrock_invoke_role" {
  name = "AltiCodeStudioBedrockInvokeRole-${var.environment}"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "bedrock.amazonaws.com"
        }
      }
    ]
  })
}

resource "aws_iam_policy" "bedrock_invoke_policy" {
  name        = "AltiCodeStudioBedrockInvokePolicy-${var.environment}"
  description = "Policy to invoke Anthropic Claude models exclusively"
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "bedrock:InvokeModel",
          "bedrock:InvokeModelWithResponseStream"
        ]
        Resource = local.is_aws_single_tenant ? [
          aws_bedrock_provisioned_model_throughput.claude_provisioned[0].provisioned_model_arn
        ] : [
          "arn:${local.aws_partition}:bedrock:${local.aws_effective_region}::foundation-model/anthropic.claude-3-5-sonnet-20240620-v1:0",
          "arn:${local.aws_partition}:bedrock:${local.aws_effective_region}::foundation-model/anthropic.claude-3-opus-20240229-v1:0",
          "arn:${local.aws_partition}:bedrock:${local.aws_effective_region}::foundation-model/anthropic.claude-3-haiku-20240307-v1:0"
        ]
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "bedrock_invoke_attach" {
  role       = aws_iam_role.bedrock_invoke_role.name
  policy_arn = aws_iam_policy.bedrock_invoke_policy.arn
}
