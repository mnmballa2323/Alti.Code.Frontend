#!/usr/bin/env python3
import os
import random
import time
import boto3

def get_role_policies(iam, role_name):
    # Get attached managed policies
    attached = iam.list_attached_role_policies(RoleName=role_name)['AttachedPolicies']
    # Get inline policies
    inline = iam.list_role_policies(RoleName=role_name)['PolicyNames']
    return attached, inline

def main():
    print("Initializing Chaos Engineering: IAM Permission Stripper Simulator")
    
    role_name = os.getenv("CHAOS_TARGET_IAM_ROLE")
    if not role_name:
        print("CHAOS_TARGET_IAM_ROLE environment variable is required.")
        return
        
    iam = boto3.client('iam')
    
    try:
        attached_policies, inline_policies = get_role_policies(iam, role_name)
    except Exception as e:
        print(f"Failed to fetch policies for role {role_name}: {e}")
        return
        
    if not attached_policies and not inline_policies:
        print(f"No policies found on role {role_name}. Nothing to strip.")
        return
        
    print(f"[CHAOS] Targeting IAM Role: {role_name}")
    print(f"[CHAOS] Found {len(attached_policies)} attached managed policies and {len(inline_policies)} inline policies.")
    
    # We will choose to strip ALL attached managed policies to simulate a massive permission loss
    stripped_policies = []
    for policy in attached_policies:
        policy_arn = policy['PolicyArn']
        print(f"[CHAOS] Detaching Managed Policy: {policy_arn}...")
        iam.detach_role_policy(RoleName=role_name, PolicyArn=policy_arn)
        stripped_policies.append(policy_arn)
        
    chaos_duration = int(os.getenv("CHAOS_DURATION_SECONDS", 120))
    print(f"[CHAOS] Role {role_name} has been stripped of permissions.")
    print(f"[CHAOS] Holding simulated IAM failure state for {chaos_duration} seconds...")
    print("[CHAOS] During this time, applications using this role via IRSA should encounter AccessDenied exceptions.")
    print("[CHAOS] Applications must not deadlock; they should retry with backoff or crash-loop gracefully.")
    
    time.sleep(chaos_duration)
    
    print(f"[CHAOS] Restoring IAM permissions to {role_name}...")
    for policy_arn in stripped_policies:
        print(f"[CHAOS] Re-attaching Managed Policy: {policy_arn}...")
        iam.attach_role_policy(RoleName=role_name, PolicyArn=policy_arn)
        
    print(f"[CHAOS] Permissions restored. Chaos experiment completed successfully.")

if __name__ == '__main__':
    main()
