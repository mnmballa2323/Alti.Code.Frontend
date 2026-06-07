#!/usr/bin/env python3
import os
import random
import time
import subprocess
from kubernetes import client, config

def execute_in_pod(v1_core, pod_name, namespace, command):
    """Execute a shell command inside a Kubernetes pod."""
    from kubernetes.stream import stream
    try:
        resp = stream(v1_core.connect_get_namespaced_pod_exec,
                      pod_name,
                      namespace,
                      command=command,
                      stderr=True, stdin=False,
                      stdout=True, tty=False)
        return resp
    except Exception as e:
        print(f"Failed to execute command in {pod_name}: {e}")
        return None

def main():
    print("Initializing Chaos Engineering: Network Latency Simulator")
    
    try:
        config.load_incluster_config()
    except config.ConfigException:
        config.load_kube_config()
        
    v1 = client.CoreV1Api()
    
    # Target specific namespace or default
    namespace = os.getenv("CHAOS_NAMESPACE", "default")
    
    # Get pods in the namespace
    pods = v1.list_namespaced_pod(namespace)
    ready_pods = [p for p in pods.items if p.status.phase == "Running"]
    
    if not ready_pods:
        print(f"No running pods found in namespace {namespace} for network chaos.")
        return
        
    # Select a random pod
    target_pod = random.choice(ready_pods).metadata.name
    print(f"[CHAOS] Selected target pod: {target_pod}")
    
    # Traffic Control commands to add latency (requires NET_ADMIN capabilities or privileged container)
    # Adds 200ms delay with 50ms jitter
    tc_add_cmd = ["/bin/sh", "-c", "tc qdisc add dev eth0 root netem delay 200ms 50ms distribution normal"]
    tc_del_cmd = ["/bin/sh", "-c", "tc qdisc del dev eth0 root"]
    
    print(f"[CHAOS] Injecting 200ms network latency into {target_pod}")
    execute_in_pod(v1, target_pod, namespace, tc_add_cmd)
    
    chaos_duration = int(os.getenv("CHAOS_DURATION_SECONDS", 30))
    print(f"[CHAOS] Holding network latency for {chaos_duration} seconds...")
    time.sleep(chaos_duration)
    
    print(f"[CHAOS] Removing network latency from {target_pod}")
    execute_in_pod(v1, target_pod, namespace, tc_del_cmd)
    
    print("[CHAOS] Network restoration complete.")

if __name__ == '__main__':
    main()
