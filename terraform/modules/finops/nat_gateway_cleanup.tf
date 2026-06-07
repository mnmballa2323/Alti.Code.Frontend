resource "aws_cloudwatch_metric_alarm" "unused_nat_gateway" {
  alarm_name          = "unused-nat-gateway"
  comparison_operator = "LessThanThreshold"
  evaluation_periods  = "7"
  metric_name         = "BytesOutToDestination"
  namespace           = "AWS/NATGateway"
  period              = "86400"
  statistic           = "Sum"
  threshold           = "1000000" # Less than 1MB per day for a week

  alarm_description = "This metric monitors unused NAT Gateways. FinOps optimization rule."

  tags = {
    FinOps = "NAT-Gateway-Cleanup"
  }
}
