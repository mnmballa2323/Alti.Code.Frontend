#!/usr/bin/env python3
import os
import random
import time
import boto3

def main():
    print("Initializing Chaos Engineering: EBS Volume Detachment Simulator")
    
    cluster_name = os.getenv("CLUSTER_NAME")
    if not cluster_name:
        print("CLUSTER_NAME environment variable is required.")
        return
        
    ec2 = boto3.client('ec2')
    
    print(f"[CHAOS] Searching for attached EBS volumes belonging to cluster: {cluster_name}...")
    
    # Find volumes attached to instances in the cluster
    # Specifically looking for dynamically provisioned PVCs (usually tagged by the EBS CSI driver)
    response = ec2.describe_volumes(
        Filters=[
            {'Name': 'status', 'Values': ['in-use']},
            {'Name': f'tag:kubernetes.io/cluster/{cluster_name}', 'Values': ['owned', 'shared']}
        ]
    )
    
    volumes = response.get('Volumes', [])
    if not volumes:
        print("[CHAOS] No attached EBS volumes found for this cluster.")
        return
        
    # Pick a random volume to detach
    target_volume = random.choice(volumes)
    volume_id = target_volume['VolumeId']
    attachment = target_volume['Attachments'][0]
    instance_id = attachment['InstanceId']
    device = attachment['Device']
    
    print(f"[CHAOS] Selected target volume: {volume_id}")
    print(f"[CHAOS] Currently attached to instance {instance_id} at device {device}.")
    
    chaos_duration = int(os.getenv("CHAOS_DURATION_SECONDS", 180))
    
    try:
        print(f"[CHAOS] Forcefully detaching volume {volume_id} from instance {instance_id}...")
        ec2.detach_volume(VolumeId=volume_id, InstanceId=instance_id, Device=device, Force=True)
        
        print("[CHAOS] Detachment initiated! Storage layer should now experience I/O errors.")
        print("[CHAOS] Kubernetes EBS CSI driver must detect the lost attachment and either:")
        print("  1. Re-attach the volume to the same node.")
        print("  2. Evict the Pod and attach the volume to a healthy node.")
        print(f"[CHAOS] Holding chaos state for {chaos_duration} seconds before attempting manual recovery...")
        
        time.sleep(chaos_duration)
        
    except Exception as e:
        print(f"[ERROR] Failed to detach volume: {e}")
        return
        
    print(f"[CHAOS] Checking if Kubernetes self-healed volume {volume_id}...")
    
    recovery_check = ec2.describe_volumes(VolumeIds=[volume_id])['Volumes'][0]
    if recovery_check['State'] == 'in-use':
        new_instance = recovery_check['Attachments'][0]['InstanceId']
        print(f"[SUCCESS] Kubernetes EBS CSI driver successfully recovered and attached the volume to instance {new_instance}!")
    else:
        print(f"[WARNING] Volume {volume_id} is still in state '{recovery_check['State']}'.")
        print(f"[CHAOS] Attempting manual re-attachment to original instance {instance_id} as a fallback...")
        try:
            ec2.attach_volume(VolumeId=volume_id, InstanceId=instance_id, Device=device)
            print("[CHAOS] Manual attachment requested.")
        except Exception as e:
            print(f"[ERROR] Manual attachment failed: {e}")

    print("[CHAOS] Experiment complete.")

if __name__ == '__main__':
    main()
