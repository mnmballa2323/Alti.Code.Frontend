#!/usr/bin/env python3
import os
import random
import time
from kubernetes import client, config

def main():
    print("Initializing Chaos Engineering: CoreDNS Killer Simulator")
    
    try:
        config.load_incluster_config()
    except config.ConfigException:
        config.load_kube_config()
        
    v1 = client.CoreV1Api()
    
    namespace = "kube-system"
    label_selector = "k8s-app=kube-dns"
    
    # Fetch CoreDNS pods
    print(f"Fetching CoreDNS pods in {namespace} with labels {label_selector}...")
    pods = v1.list_namespaced_pod(namespace, label_selector=label_selector)
    ready_pods = [p for p in pods.items if p.status.phase == "Running"]
    
    if not ready_pods:
        print("No running CoreDNS pods found to terminate.")
        return
        
    # Select random number of CoreDNS pods to kill (up to all of them)
    num_to_kill = random.randint(1, len(ready_pods))
    targets = random.sample(ready_pods, num_to_kill)
    
    print(f"[CHAOS] Terminating {num_to_kill} CoreDNS pods to test DNS resolution resilience...")
    
    for target in targets:
        pod_name = target.metadata.name
        print(f"[CHAOS] Deleting CoreDNS pod: {pod_name}")
        try:
            v1.delete_namespaced_pod(name=pod_name, namespace=namespace)
        except Exception as e:
            print(f"Failed to delete {pod_name}: {e}")
            
    print("[CHAOS] CoreDNS killer execution complete. Monitoring systems should observe temporary DNS degradation.")
    print("Kubernetes Deployment controller will automatically recreate the terminated pods.")

if __name__ == '__main__':
    main()
