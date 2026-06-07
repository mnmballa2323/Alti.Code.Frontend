#!/usr/bin/env python3
import os
import random
import time
import boto3

def inject_time_skew_ssm(ssm, instance_id, skew_seconds):
    # Command to disable NTP sync and aggressively skew the system clock
    commands = [
        "timedatectl set-ntp false",
        "systemctl stop chronyd || systemctl stop ntpd",
        f"date -s '@$(($(date +%s) + {skew_seconds}))'"
    ]
    
    print(f"[CHAOS] Injecting time skew of {skew_seconds} seconds into instance {instance_id}...")
    
    response = ssm.send_command(
        InstanceIds=[instance_id],
        DocumentName="AWS-RunShellScript",
        Parameters={'commands': commands}
    )
    return response['Command']['CommandId']

def revert_time_skew_ssm(ssm, instance_id):
    # Command to forcefully resync time with Amazon Time Sync Service
    commands = [
        "systemctl start chronyd || systemctl start ntpd",
        "timedatectl set-ntp true",
        "chronyc -a makestep || ntpd -gq"
    ]
    
    print(f"[CHAOS] Reverting time skew on instance {instance_id} and forcing NTP resync...")
    
    ssm.send_command(
        InstanceIds=[instance_id],
        DocumentName="AWS-RunShellScript",
        Parameters={'commands': commands}
    )

def main():
    print("Initializing Chaos Engineering: Clock Skew (NTP Failure) Simulator")
    
    cluster_name = os.getenv("CLUSTER_NAME")
    if not cluster_name:
        print("CLUSTER_NAME environment variable is required.")
        return
        
    ec2 = boto3.client('ec2')
    ssm = boto3.client('ssm')
    
    print(f"[CHAOS] Searching for active worker nodes in cluster: {cluster_name}...")
    
    # Find active worker nodes via tags
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
    print(f"[CHAOS] Selected target node: {target_instance}")
    
    # Skew time by +10 minutes (600 seconds). This is enough to break AWS API sigv4 limits (usually 5 mins)
    # and cause Raft consensus issues, while breaking short-lived OIDC tokens.
    skew_seconds = 600 
    chaos_duration = int(os.getenv("CHAOS_DURATION_SECONDS", 180))
    
    try:
        inject_time_skew_ssm(ssm, target_instance, skew_seconds)
        
        print("[CHAOS] Time skew initiated! The node's clock is now 10 minutes in the future.")
        print("[CHAOS] Expecting the following behaviors:")
        print("  1. Pods on this node may fail to authenticate with AWS APIs (Signature Expired).")
        print("  2. Kubelet may experience TLS handshake failures with the API server.")
        print("  3. Distributed databases (e.g., CockroachDB/Cassandra) may eject the node due to excessive clock drift.")
        print(f"[CHAOS] Holding chaos state for {chaos_duration} seconds...")
        
        time.sleep(chaos_duration)
        
    except Exception as e:
        print(f"[ERROR] Failed to execute SSM command: {e}")
    finally:
        revert_time_skew_ssm(ssm, target_instance)
        print("[CHAOS] Node clock restored. Experiment complete.")

if __name__ == '__main__':
    main()
