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
    print("Initializing Chaos Engineering: Memory Stress Simulator (OOM Tester)")
    
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
    
    # Use stress-ng to allocate 90% of available memory to trigger OOM kills
    # If stress-ng is not installed, fallback to a simple python memory eater
    stress_cmd = [
        "/bin/sh", "-c", 
        "if command -v stress-ng > /dev/null; then stress-ng --vm 1 --vm-bytes 90% -t 60s; else python3 -c 'a=[]; \nwhile True: a.append(\" \"*10**6)'; fi"
    ]
    
    print(f"[CHAOS] Injecting aggressive memory consumption into {target_pod}...")
    execute_in_pod(v1, target_pod, namespace, stress_cmd)
    
    print(f"[CHAOS] Memory stress initiated. Monitoring for OOMKilled events...")
    time.sleep(10)
    
    # Check pod status to see if it was OOMKilled
    updated_pod = v1.read_namespaced_pod(target_pod, namespace)
    for container_status in updated_pod.status.container_statuses:
        if container_status.state.terminated and container_status.state.terminated.reason == "OOMKilled":
            print(f"[SUCCESS] Pod {target_pod} container {container_status.name} was successfully OOMKilled!")
            return
            
    print(f"[INFO] Pod {target_pod} survived the memory stress test or is still struggling.")

if __name__ == '__main__':
    main()
