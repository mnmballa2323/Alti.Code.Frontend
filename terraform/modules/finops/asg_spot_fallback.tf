variable "vpc_zone_identifiers" {
  description = "List of subnet IDs for the ASG"
  type        = list(string)
}

variable "launch_template_id" {
  description = "ID of the launch template"
  type        = string
}

variable "launch_template_version" {
  description = "Version of the launch template"
  type        = string
  default     = "$Latest"
}

resource "aws_autoscaling_group" "spot_optimized_asg" {
  name                      = "finops-spot-optimized-asg"
  vpc_zone_identifier       = var.vpc_zone_identifiers
  min_size                  = 2
  max_size                  = 20
  desired_capacity          = 5
  health_check_grace_period = 300
  health_check_type         = "EC2"

  mixed_instances_policy {
    instances_distribution {
      # FinOps: aggressively prefer Spot instances over On-Demand
      on_demand_base_capacity                  = 1
      on_demand_percentage_above_base_capacity = 10
      spot_allocation_strategy                 = "price-capacity-optimized"
    }

    launch_template {
      launch_template_specification {
        launch_template_id = var.launch_template_id
        version            = var.launch_template_version
      }

      # Diversify instance types to reduce spot interruption risk
      override {
        instance_type     = "t3.large"
        weighted_capacity = "1"
      }
      override {
        instance_type     = "t3a.large"
        weighted_capacity = "1"
      }
      override {
        instance_type     = "m5.large"
        weighted_capacity = "1"
      }
      override {
        instance_type     = "m5a.large"
        weighted_capacity = "1"
      }
    }
  }

  tag {
    key                 = "FinOps"
    value               = "Spot-Mixed-Instances"
    propagate_at_launch = true
  }

  tag {
    key                 = "Environment"
    value               = "Production"
    propagate_at_launch = true
  }
}

# Auto Scaling Policy to scale down aggressively if CPU is low
resource "aws_autoscaling_policy" "scale_down_idle" {
  name                   = "scale-down-idle-instances"
  autoscaling_group_name = aws_autoscaling_group.spot_optimized_asg.name
  adjustment_type        = "ChangeInCapacity"
  scaling_adjustment     = -1
  cooldown               = 300
}

resource "aws_cloudwatch_metric_alarm" "low_cpu_alarm" {
  alarm_name          = "low-cpu-idle-detection"
  comparison_operator = "LessThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "CPUUtilization"
  namespace           = "AWS/EC2"
  period              = "300"
  statistic           = "Average"
  threshold           = "10" # Below 10% CPU is considered idle
  alarm_description   = "This metric monitors ec2 cpu utilization for idle detection"
  alarm_actions       = [aws_autoscaling_policy.scale_down_idle.arn]

  dimensions = {
    AutoScalingGroupName = aws_autoscaling_group.spot_optimized_asg.name
  }
}
