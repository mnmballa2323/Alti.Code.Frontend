# FinOps AWS Cost Anomaly Detection
# Deploys a machine learning monitor that tracks account spend in real-time.
# If an unexpected cost spike occurs (e.g. an infinite retry loop generating massive S3 GET requests,
# or a compromised developer key spinning up crypto-miners), this will instantly alert the FinOps team
# via SNS/PagerDuty, preventing "End of Month Bill Shock".

# 1. The Monitor assesses spend patterns
resource "aws_ce_anomaly_monitor" "finops_ml_monitor" {
  name              = "FinOps-Account-Spend-Monitor"
  monitor_type      = "DIMENSIONAL"
  monitor_dimension = "SERVICE"
}

# 2. SNS Topic for the alerts (e.g., routing to Slack or PagerDuty)
resource "aws_sns_topic" "finops_anomaly_alerts" {
  name = "finops-cost-anomaly-alerts"
}

# The AWS Cost Explorer service needs permission to publish to the SNS topic
resource "aws_sns_topic_policy" "finops_anomaly_alerts_policy" {
  arn = aws_sns_topic.finops_anomaly_alerts.arn

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = {
          Service = "costalerts.amazonaws.com"
        }
        Action   = "sns:Publish"
        Resource = aws_sns_topic.finops_anomaly_alerts.arn
      }
    ]
  })
}

# 3. The Subscription defines the threshold for the alert
resource "aws_ce_anomaly_subscription" "finops_alert_subscription" {
  name             = "FinOps-Critical-Spend-Spike"
  frequency        = "DAILY"
  monitor_arn_list = [aws_ce_anomaly_monitor.finops_ml_monitor.arn]

  # Alert if the ML model detects an anomaly that is expected to cost more than $50
  # For larger enterprise accounts, this might be set to $500 or $5000.
  threshold = 50.0

  subscriber {
    type    = "SNS"
    address = aws_sns_topic.finops_anomaly_alerts.arn
  }
}
