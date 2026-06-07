#!/usr/bin/env python3
import os
import random
import time
import json
import subprocess

# Chaos Engineering: Istio Envoy Sidecar Crash Simulator
# In a service mesh, the sidecar proxies all traffic. If Envoy dies, the application 
# loses all network connectivity, even if the primary application container remains perfectly healthy.
# This tests if Kubernetes liveness probes are properly configured to monitor the proxy, 
# and whether the mesh gracefully retries/fails over to healthy endpoints.

def main():
    print("Initializing Chaos Engineering: Envoy Sidecar Crash Simulator")
    
    # Require kubectl to be configured
    try:
        subprocess.run(["kubectl", "version", "--client"], check=True, capture_output=True)
    except FileNotFoundError:
        print("[ERROR] kubectl not found in PATH. Chaos execution aborted.")
        return
        
    print("[CHAOS] Searching for Pods with injected Istio sidecars (istio-proxy)...")
    
    try:
        # Find all pods across all namespaces that have the istio-proxy container running
        cmd = "kubectl get pods --all-namespaces -o json"
        result = subprocess.run(cmd, shell=True, capture_output=True, text=True, check=True)
        pods_data = json.loads(result.stdout)
        
        targetable_pods = []
        for pod in pods_data.get('items', []):
            if pod['status']['phase'] != 'Running':
                continue
                
            containers = pod['spec'].get('containers', [])
            has_envoy = any(c['name'] == 'istio-proxy' for c in containers)
            
            if has_envoy:
                targetable_pods.append({
                    'namespace': pod['metadata']['namespace'],
                    'name': pod['metadata']['name']
                })
                
        if not targetable_pods:
            print("[CHAOS] No Istio-injected Pods found in the cluster.")
            return
            
        # Select a random pod to target
        target = random.choice(targetable_pods)
        ns = target['namespace']
        name = target['name']
        
        print(f"[CHAOS] Selected target Pod: {ns}/{name}")
        
        chaos_duration = int(os.getenv("CHAOS_DURATION_SECONDS", 120))
        
        # We will loop and continuously kill Envoy for the duration of the chaos experiment
        # This prevents the container from cleanly restarting and forces a crashloop
        print(f"[CHAOS] Initiating continuous SIGKILL on istio-proxy for {chaos_duration} seconds...")
        print("[CHAOS] Validating Mesh Resilience:")
        print("  1. Upstream clients should instantly receive 503s and trigger circuit breakers/retries.")
        print("  2. The Kubernetes Liveness Probe for istio-proxy should fail, eventually restarting the entire Pod.")
        
        end_time = time.time() + chaos_duration
        
        while time.time() < end_time:
            try:
                # Execute a kill command inside the istio-proxy container targeting the Envoy PID (usually 1 or 15)
                kill_cmd = f"kubectl exec -n {ns} {name} -c istio-proxy -- kill -9 1"
                subprocess.run(kill_cmd, shell=True, capture_output=True)
                print(f"[CHAOS] Envoy process terminated in {name}.")
            except Exception:
                pass
                
            time.sleep(5) # Wait for the container runtime to restart it, then kill it again
            
        print("[CHAOS] Envoy sidecar crashloop ceased. Allowing container to recover.")
        print("[CHAOS] Experiment complete.")
        
    except Exception as e:
        print(f"[ERROR] Chaos injection failed: {e}")

if __name__ == '__main__':
    main()
