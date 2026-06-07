# FinOps ECR Lifecycle Optimizer
# Automatically purges old, untagged, and obsolete Docker images from AWS Elastic Container Registry (ECR)
# to prevent massive, hidden storage costs caused by high-velocity CI/CD pipelines.

variable "ecr_repository_names" {
  description = "List of ECR repository names to apply the strict FinOps lifecycle policy to"
  type        = list(string)
  default     = []
}

# The Lifecycle Policy defines the rules for image retention
locals {
  ecr_finops_policy = jsonencode({
    rules = [
      {
        rulePriority = 1
        description  = "Expire untagged (dangling) images older than 7 days"
        selection = {
          tagStatus   = "untagged"
          countType   = "sinceImagePushed"
          countUnit   = "days"
          countNumber = 7
        }
        action = {
          type = "expire"
        }
      },
      {
        rulePriority = 2
        description  = "Keep only the last 5 'latest' or 'prod' tagged images for quick rollbacks"
        selection = {
          tagStatus     = "tagged"
          tagPrefixList = ["latest", "prod", "main", "release"]
          countType     = "imageCountMoreThan"
          countNumber   = 5
        }
        action = {
          type = "expire"
        }
      },
      {
        rulePriority = 3
        description  = "Expire ephemeral development/PR images ('dev-', 'pr-', 'test-') older than 14 days"
        selection = {
          tagStatus     = "tagged"
          tagPrefixList = ["dev-", "pr-", "test-", "feature-"]
          countType     = "sinceImagePushed"
          countUnit     = "days"
          countNumber   = 14
        }
        action = {
          type = "expire"
        }
      },
      {
        rulePriority = 4
        description  = "Global fallback: Expire ANY image (regardless of tag) older than 90 days to enforce aggressive cost controls"
        selection = {
          tagStatus   = "any"
          countType   = "sinceImagePushed"
          countUnit   = "days"
          countNumber = 90
        }
        action = {
          type = "expire"
        }
      }
    ]
  })
}

resource "aws_ecr_lifecycle_policy" "finops_ecr_cleanup" {
  count      = length(var.ecr_repository_names)
  repository = var.ecr_repository_names[count.index]

  policy = local.ecr_finops_policy
}
