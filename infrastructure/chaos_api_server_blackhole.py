#!/usr/bin/env python3
import os
import random
import time
import boto3

def inject_api_blackhole(ssm, instance_id, api_server_endpoint):
    # This command uses iptables to drop all outgoing traffic to the Kubernetes API Server.
    # We target the specific IP of the EKS API server endpoint.
    
    # Strip the https:// and port to get just the hostname/IP
    api_host = api_server_endpoint.replace("https://", "").split(":")[0]
    
    commands = [
        f"echo '[CHAOS] Resolving API Server IP for {api_host}..'",
        f"API_IP=$(dig +short {api_host} | head -n 1)",
        f"if [ -z \"$API_IP\" ]; then API_IP={api_host}; fi", # Fallback if it's already an IP
        "echo '[CHAOS] Applying iptables rule to DROP traffic to API Server ($API_IP:443)...'",
        f"iptables -A OUTPUT -p tcp -d $API_IP --dport 443 -j DROP"
    ]
    
    print(f"[CHAOS] Injecting API Server Blackhole on instance {instance_id}...")
    
    response = ssm.send_command(
        InstanceIds=[instance_id],
        DocumentName="AWS-RunShellScript",
        Parameters={'commands': commands}
    )
    return api_host

def revert_api_blackhole(ssm, instance_id, api_host):
    commands = [
        f"API_IP=$(dig +short {api_host} | head -n 1)",
        f"if [ -z \"$API_IP\" ]; then API_IP={api_host}; fi",
        "echo '[CHAOS] Removing iptables DROP rule for API Server...'",
        f"iptables -D OUTPUT -p tcp -d $API_IP --dport 443 -j DROP"
    ]
    
    print(f"[CHAOS] Reverting API Server Blackhole on instance {instance_id}...")
    
    ssm.send_command(
        InstanceIds=[instance_id],
        DocumentName="AWS-RunShellScript",
        Parameters={'commands': commands}
    )

def main():
    print("Initializing Chaos Engineering: Control Plane (API Server) Partition Simulator")
    
    cluster_name = os.getenv("CLUSTER_NAME")
    if not cluster_name:
        print("CLUSTER_NAME environment variable is required.")
        return
        
    eks = boto3.client('eks')
    ec2 = boto3.client('ec2')
    ssm = boto3.client('ssm')
    
    print(f"[CHAOS] Retrieving API Server endpoint for EKS cluster: {cluster_name}...")
    try:
        cluster_info = eks.describe_cluster(name=cluster_name)
        api_endpoint = cluster_info['cluster']['endpoint']
        print(f"[CHAOS] Target API Server: {api_endpoint}")
    except Exception as e:
        print(f"[ERROR] Could not retrieve EKS cluster info: {e}")
        return
    
    print(f"[CHAOS] Searching for active worker nodes...")
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
    print(f"[CHAOS] Selected target node for Control Plane Partition: {target_instance}")
    
    chaos_duration = int(os.getenv("CHAOS_DURATION_SECONDS", 180))
    api_host = None
    
    try:
        api_host = inject_api_blackhole(ssm, target_instance, api_endpoint)
        
        print(f"[CHAOS] API Server Blackhole initiated! Node {target_instance} is now severed from the Control Plane.")
        print("[CHAOS] Validating the following resilience mechanisms:")
        print("  1. Existing Pods on the node MUST continue running and serving traffic normally.")
        print("  2. The Kubelet will fail to report node status, causing the node to become 'NotReady' in the API.")
        print("  3. Controllers/Operators running on this node will fail API calls and should gracefully backoff, not crash-loop endlessly.")
        print(f"[CHAOS] Holding chaos state for {chaos_duration} seconds...")
        
        time.sleep(chaos_duration)
        
    except Exception as e:
        print(f"[ERROR] Failed to execute Chaos: {e}")
    finally:
        if api_host:
            revert_api_blackhole(ssm, target_instance, api_host)
            print("[CHAOS] Control Plane connection restored. Node should return to 'Ready' status shortly.")

if __name__ == '__main__':
    main()
