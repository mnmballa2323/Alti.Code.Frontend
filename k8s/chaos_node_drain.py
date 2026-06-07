#!/usr/bin/env python3
import os
import random
import time
from kubernetes import client, config

def main():
    print("Initializing Chaos Engineering: Node Drain Simulator")
    
    # Load kubernetes configuration
    try:
        config.load_incluster_config()
    except config.ConfigException:
        config.load_kube_config()
        
    v1 = client.CoreV1Api()
    
    # Fetch all nodes
    nodes = v1.list_node()
    ready_nodes = []
    
    for node in nodes.items:
        # Check if node is ready
        for condition in node.status.conditions:
            if condition.type == 'Ready' and condition.status == 'True':
                # Skip control plane nodes to prevent cluster collapse
                labels = node.metadata.labels or {}
                if 'node-role.kubernetes.io/control-plane' not in labels and 'node-role.kubernetes.io/master' not in labels:
                    ready_nodes.append(node.metadata.name)
    
    if not ready_nodes:
        print("No eligible worker nodes found for chaos injection.")
        return

    # Select a random worker node
    target_node = random.choice(ready_nodes)
    print(f"[CHAOS] Selected target node for simulated failure: {target_node}")
    
    # Cordon the node (mark unschedulable)
    body = {
        "spec": {
            "unschedulable": True
        }
    }
    v1.patch_node(target_node, body)
    print(f"[CHAOS] Cordoned node {target_node}")
    
    # Simulate a "drain" by deleting pods on the node (excluding daemonsets and kube-system)
    pods = v1.list_pod_for_all_namespaces(field_selector=f'spec.nodeName={target_node}')
    for pod in pods.items:
        if pod.metadata.namespace == 'kube-system':
            continue
            
        owner_refs = pod.metadata.owner_references or []
        is_daemonset = any(ref.kind == 'DaemonSet' for ref in owner_refs)
        
        if not is_daemonset:
            print(f"[CHAOS] Evicting pod {pod.metadata.namespace}/{pod.metadata.name}")
            try:
                v1.delete_namespaced_pod(pod.metadata.name, pod.metadata.namespace)
            except Exception as e:
                print(f"Failed to evict {pod.metadata.name}: {e}")
                
    # Hold the failure state for a defined duration
    chaos_duration = int(os.getenv('CHAOS_DURATION_SECONDS', 60))
    print(f"[CHAOS] Holding simulated failure state for {chaos_duration} seconds...")
    time.sleep(chaos_duration)
    
    # Uncordon the node to restore cluster capacity
    print(f"[CHAOS] Restoring node {target_node}")
    body = {
        "spec": {
            "unschedulable": False
        }
    }
    v1.patch_node(target_node, body)
    print("[CHAOS] Node restored. Chaos experiment completed successfully.")

if __name__ == '__main__':
    main()
