import boto3
import os
import datetime

def handler(event, context):
    ec2 = boto3.client('ec2')
    cloudwatch = boto3.client('cloudwatch')
    
    threshold = float(os.environ.get('CPU_THRESHOLD', '5.0'))
    
    # Get all running on-demand instances
    instances = ec2.describe_instances(
        Filters=[
            {'Name': 'instance-state-name', 'Values': ['running']},
            {'Name': 'instance-lifecycle', 'Values': ['normal']}
        ]
    )
    
    idle_instances = []
    
    for reservation in instances['Reservations']:
        for instance in reservation['Instances']:
            instance_id = instance['InstanceId']
            
            # Check CPU utilization for the last 24 hours
            metrics = cloudwatch.get_metric_statistics(
                Namespace='AWS/EC2',
                MetricName='CPUUtilization',
                Dimensions=[{'Name': 'InstanceId', 'Value': instance_id}],
                StartTime=datetime.datetime.utcnow() - datetime.timedelta(days=1),
                EndTime=datetime.datetime.utcnow(),
                Period=86400,
                Statistics=['Average']
            )
            
            if metrics['Datapoints']:
                avg_cpu = metrics['Datapoints'][0]['Average']
                if avg_cpu < threshold:
                    print(f"Instance {instance_id} is idle (CPU: {avg_cpu}%). Replacing with spot instance.")
                    idle_instances.append(instance_id)
                    
                    # Terminate idle instance
                    ec2.terminate_instances(InstanceIds=[instance_id])
                    
                    # Launch a similar Spot instance (Simplified logic)
                    ec2.run_instances(
                        ImageId=instance['ImageId'],
                        InstanceType=instance['InstanceType'],
                        MinCount=1,
                        MaxCount=1,
                        SubnetId=instance['SubnetId'],
                        SecurityGroupIds=[sg['GroupId'] for sg in instance['SecurityGroups']],
                        InstanceMarketOptions={'MarketType': 'spot'}
                    )
                    
    return {
        'statusCode': 200,
        'body': f'Replaced {len(idle_instances)} idle instances.'
    }
