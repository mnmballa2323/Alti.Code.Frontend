resource "aws_config_config_rule" "eip_attached" {
  name = "eip-attached"

  source {
    owner             = "AWS"
    source_identifier = "EIP_ATTACHED"
  }

  description = "Checks whether all Elastic IP addresses that are allocated to a VPC are attached to EC2 instances or in-use ENIs. FinOps optimization rule."

  tags = {
    FinOps = "EIP-Cleanup"
  }
}
