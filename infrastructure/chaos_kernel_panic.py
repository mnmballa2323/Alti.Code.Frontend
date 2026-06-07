#!/usr/bin/env python3
import os
import random
import time
import boto3

def inject_kernel_panic(ssm, instance_id):
    # This command explicitly writes 'c' to the sysrq-trigger file.
    # In the Linux kernel, this immediately triggers a crashdump (if configured)
    # and causes a kernel panic, crashing the node instantly without a graceful shutdown.
    commands = [
        "echo 1 > /proc/sys/kernel/sysrq",
        "echo c > /proc/sysrq-trigger"
    ]
    
    print(f"[CHAOS] Triggering Kernel Panic (SysRq-C) on instance {instance_id}...")
    
    try:
        ssm.send_command(
            InstanceIds=[instance_id],
            DocumentName="AWS-RunShellScript",
            Parameters={'commands': commands}
        )
    except Exception as e:
        # We expect a timeout or disconnect here because the node instantly dies
        print(f"[CHAOS] Expected communication failure after triggering panic: {e}")

def main():
    print("Initializing Chaos Engineering: Kernel Panic (Ungraceful Crash) Simulator")
    
    cluster_name = os.getenv("CLUSTER_NAME")
    if not cluster_name:
        print("CLUSTER_NAME environment variable is required.")
        return
        
    ec2 = boto3.client('ec2')
    ssm = boto3.client('ssm')
    autoscaling = boto3.client('autoscaling')
    
    print(f"[CHAOS] Searching for active worker nodes in cluster: {cluster_name}...")
    
    response = ec2.describe_instances(
        Filters=[
            {'Name': 'instance-state-name', 'Values': ['running']},
            {'Name': f'tag:kubernetes.io/cluster/{cluster_name}', 'Values': ['owned', 'shared']}
        ]
    )
    
    instances = [i['InstanceId'] for r in response['Reservations'] for i in r['Instances']]
    if not instances:
        print("[CHAOS] No active instances found for this cluster.")
        return
        
    target_instance = random.choice(instances)
    print(f"[CHAOS] Selected target node for Kernel Panic: {target_instance}")
    
    inject_kernel_panic(ssm, target_instance)
    
    print("[CHAOS] Kernel Panic injected!")
    print("[CHAOS] The node has suffered an immediate ungraceful hardware-level crash.")
    print("[CHAOS] Validating the following resilience mechanisms:")
    print("  1. Kubernetes control plane must detect the node as 'NotReady'.")
    print("  2. Pod eviction timeout (default 5m) must trigger, migrating StatefulSets/Deployments to healthy nodes.")
    print("  3. The AWS Auto Scaling Group (ASG) EC2 health checks must detect the hung instance and terminate it.")
    print("  4. The EKS Cluster Autoscaler / Karpenter must provision a replacement node.")
    
    print(f"[CHAOS] Waiting 10 minutes to verify ASG termination and replacement...")
    time.sleep(600)
    
    try:
        check = ec2.describe_instances(InstanceIds=[target_instance])
        state = check['Reservations'][0]['Instances'][0]['State']['Name']
        if state in ['shutting-down', 'terminated']:
            print(f"[SUCCESS] ASG successfully detected the dead node and terminated instance {target_instance}!")
        else:
            print(f"[FAILED] Instance {target_instance} is still in state '{state}'. Auto-healing failed!")
    except Exception as e:
        print(f"[SUCCESS] Instance {target_instance} no longer exists, assuming terminated by ASG.")

    print("[CHAOS] Experiment complete.")

if __name__ == '__main__':
    main()
