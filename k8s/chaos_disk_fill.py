#!/usr/bin/env python3
import os
import random
import time
from kubernetes import client, config

def execute_in_pod(v1_core, pod_name, namespace, command):
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
    print("Initializing Chaos Engineering: Disk Exhaustion Simulator (DiskPressure Tester)")
    
    try:
        config.load_incluster_config()
    except config.ConfigException:
        config.load_kube_config()
        
    v1 = client.CoreV1Api()
    namespace = os.getenv("CHAOS_NAMESPACE", "default")
    
    print(f"Fetching running pods in namespace: {namespace}")
    pods = v1.list_namespaced_pod(namespace)
    ready_pods = [p for p in pods.items if p.status.phase == "Running"]
    
    if not ready_pods:
        print(f"No running pods found in namespace {namespace}.")
        return
        
    target_pod = random.choice(ready_pods).metadata.name
    print(f"[CHAOS] Selected target pod: {target_pod}")
    
    # We write a massive file using dd to fill up the container's ephemeral storage layer
    # We attempt to write 5GB. Adjust block size and count depending on cluster limits.
    disk_fill_cmd = [
        "/bin/sh", "-c", 
        "echo 'Starting Disk Exhaustion...' && dd if=/dev/zero of=/tmp/chaos_dummy_file bs=1M count=5000 || echo 'Disk is completely full!'"
    ]
    
    print(f"[CHAOS] Injecting aggressive ephemeral storage consumption into {target_pod} (/tmp/chaos_dummy_file)...")
    execute_in_pod(v1, target_pod, namespace, disk_fill_cmd)
    
    print("[CHAOS] Disk fill initiated. The Kubelet will soon detect DiskPressure on the node.")
    print("[CHAOS] The pod should be evicted (status: Evicted) if it exceeds its ephemeral-storage limits.")
    
    time.sleep(15)
    
    try:
        updated_pod = v1.read_namespaced_pod(target_pod, namespace)
        print(f"[STATUS] Pod {target_pod} phase is currently: {updated_pod.status.phase}")
        if updated_pod.status.reason == "Evicted":
            print(f"[SUCCESS] Pod was successfully evicted due to DiskPressure! Ephemeral storage limits are working.")
    except Exception as e:
        print(f"Error checking pod status: {e}")

if __name__ == '__main__':
    main()
