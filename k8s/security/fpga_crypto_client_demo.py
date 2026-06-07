#!/usr/bin/env python3
import os
import time
import requests
import json
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.asymmetric import padding
import base64

def generate_sample_payload():
    return b"This is a highly sensitive financial transaction payload requiring hardware signature."

def main():
    print("Initializing FPGA Crypto Accelerator Client Demo...")
    
    # The URL of the crypto accelerator service deployed in K8s (Cycle 28)
    crypto_service_url = os.getenv("FPGA_CRYPTO_URL", "https://crypto-accelerator-svc.security.svc.cluster.local:8443")
    
    payload = generate_sample_payload()
    print(f"Original Payload: {payload.decode()}")
    
    # Prepare payload for the hardware accelerator
    request_data = {
        "operation": "sign",
        "algorithm": "RSA-4096-SHA256",
        "data": base64.b64encode(payload).decode('utf-8')
    }
    
    print(f"Sending payload to FPGA Hardware Accelerator at {crypto_service_url}...")
    
    try:
        # Note: verify=False for demo internal PKI, production uses mounted CA
        start_time = time.perf_counter()
        response = requests.post(f"{crypto_service_url}/api/v1/hardware-crypto", json=request_data, verify=False, timeout=2.0)
        end_time = time.perf_counter()
        
        response.raise_for_status()
        
        result = response.json()
        signature_b64 = result.get("signature")
        
        print(f"[SUCCESS] FPGA Hardware Signature generated in {(end_time - start_time)*1000:.2f} ms")
        print(f"Signature (Base64): {signature_b64}")
        
    except requests.exceptions.RequestException as e:
        print(f"[ERROR] Failed to communicate with FPGA Crypto Service: {e}")
        print("Note: In a local test environment, the Kubernetes Service might not be reachable without port-forwarding.")

if __name__ == '__main__':
    main()
