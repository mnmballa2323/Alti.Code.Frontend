variable "cluster_name" {
  description = "Name of the EKS cluster"
  type        = string
}

resource "aws_autoscaling_schedule" "scale_down_nightly" {
  scheduled_action_name  = "${var.cluster_name}-scale-down-nightly"
  min_size               = 0
  max_size               = 1
  desired_capacity       = 0
  recurrence             = "0 22 * * *"
  autoscaling_group_name = aws_autoscaling_group.non_prod_nodes.name
}

resource "aws_autoscaling_schedule" "scale_up_morning" {
  scheduled_action_name  = "${var.cluster_name}-scale-up-morning"
  min_size               = 1
  max_size               = 3
  desired_capacity       = 2
  recurrence             = "0 7 * * *"
  autoscaling_group_name = aws_autoscaling_group.non_prod_nodes.name
}

resource "aws_autoscaling_group" "non_prod_nodes" {
  name                      = "${var.cluster_name}-non-prod-asg"
  max_size                  = 3
  min_size                  = 1
  desired_capacity          = 2
  vpc_zone_identifier       = var.subnet_ids
  health_check_type         = "EC2"
  health_check_grace_period = 300
}

variable "subnet_ids" {
  type = list(string)
}
