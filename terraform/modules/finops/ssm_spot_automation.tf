resource "aws_ssm_document" "idle_spot_replacement" {
  name            = "FinOps-IdleToSpotReplacement"
  document_type   = "Automation"
  document_format = "YAML"

  content = <<DOC
description: "Identifies idle On-Demand instances and replaces them with Spot instances"
schemaVersion: "0.3"
assumeRole: "{{ AutomationAssumeRole }}"
parameters:
  AutomationAssumeRole:
    type: String
    description: "(Optional) The ARN of the role that allows Automation to perform the actions on your behalf."
    default: ""
  InstanceId:
    type: String
    description: "(Required) The ID of the idle On-Demand instance to be replaced."
mainSteps:
  - name: verifyIdleStatus
    action: aws:executeAwsApi
    inputs:
      Service: cloudwatch
      Api: GetMetricStatistics
      Namespace: AWS/EC2
      MetricName: CPUUtilization
      Dimensions:
        - Name: InstanceId
          Value: "{{ InstanceId }}"
      StartTime: "{{ global:DATE_TIME | -24h }}"
      EndTime: "{{ global:DATE_TIME }}"
      Period: 86400
      Statistics:
        - Average
    outputs:
      - Name: AvgCpu
        Selector: "$.Datapoints[0].Average"
        Type: Float
  - name: checkThreshold
    action: aws:branch
    inputs:
      Choices:
        - NextStep: createReplacementAmi
          Variable: "{{ verifyIdleStatus.AvgCpu }}"
          NumericLessThan: 10.0
      Default: endAutomation
  - name: createReplacementAmi
    action: aws:createImage
    inputs:
      InstanceId: "{{ InstanceId }}"
      ImageName: "Spot-Replacement-{{ InstanceId }}-{{ global:DATE_TIME }}"
      NoReboot: true
  - name: launchSpotInstance
    action: aws:executeAwsApi
    inputs:
      Service: ec2
      Api: RequestSpotInstances
      InstanceCount: 1
      LaunchSpecification:
        ImageId: "{{ createReplacementAmi.ImageId }}"
        InstanceType: "t3.medium"
  - name: terminateIdleInstance
    action: aws:changeInstanceState
    inputs:
      InstanceIds:
        - "{{ InstanceId }}"
      DesiredState: terminated
  - name: endAutomation
    action: aws:sleep
    inputs:
      Duration: PT1S
DOC
}
