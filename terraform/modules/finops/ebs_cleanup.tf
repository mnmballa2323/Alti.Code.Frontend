resource "aws_config_config_rule" "ec2_volume_inuse_check" {
  name = "ec2-volume-inuse-check"

  source {
    owner             = "AWS"
    source_identifier = "EC2_VOLUME_INUSE_CHECK"
  }

  description = "Checks whether EBS volumes are attached to EC2 instances. FinOps optimization rule."

  tags = {
    FinOps = "EBS-Cleanup"
  }
}
