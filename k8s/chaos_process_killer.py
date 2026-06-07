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
    print("Initializing Chaos Engineering: Process Killer Simulator (Liveness Probe Tester)")
    
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
    
    # We find the main process (PID 1) and send SIGKILL
    # This simulates a hard crash of the application without the container itself cleanly exiting
    # which tests if the Kubernetes Liveness Probes properly detect the deadlock/crash.
    kill_cmd = [
        "/bin/sh", "-c", 
        "echo 'Simulating fatal application crash...' && kill -9 1"
    ]
    
    print(f"[CHAOS] Injecting SIGKILL (kill -9) into PID 1 of {target_pod}...")
    execute_in_pod(v1, target_pod, namespace, kill_cmd)
    
    print("[CHAOS] Process crash initiated. Kubernetes should detect container exit or failing Liveness probe.")
    print("Monitoring pod restart count...")
    
    time.sleep(10)
    
    try:
        updated_pod = v1.read_namespaced_pod(target_pod, namespace)
        for container_status in updated_pod.status.container_statuses:
            restarts = container_status.restart_count
            print(f"[STATUS] Container {container_status.name} Restart Count: {restarts}")
            if restarts > 0:
                print(f"[SUCCESS] Pod {target_pod} container {container_status.name} was successfully restarted by the Kubelet!")
    except Exception as e:
        print(f"Error checking pod status: {e}")

if __name__ == '__main__':
    main()
