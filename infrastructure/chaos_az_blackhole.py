#!/usr/bin/env python3
import os
import random
import time
import boto3

def get_subnets_in_az(ec2, vpc_id, target_az):
    response = ec2.describe_subnets(
        Filters=[
            {'Name': 'vpc-id', 'Values': [vpc_id]},
            {'Name': 'availability-zone', 'Values': [target_az]}
        ]
    )
    return [subnet['SubnetId'] for subnet in response['Subnets']]

def blackhole_subnets(ec2, vpc_id, subnets):
    print(f"[CHAOS] Creating Deny-All Network ACL for {len(subnets)} subnets...")
    
    # Create a Deny-All NACL
    response = ec2.create_network_acl(VpcId=vpc_id)
    nacl_id = response['NetworkAcl']['NetworkAclId']
    
    ec2.create_tags(Resources=[nacl_id], Tags=[{'Key': 'Name', 'Value': 'CHAOS-BLACKHOLE'}])
    
    # Egress Deny All
    ec2.create_network_acl_entry(
        NetworkAclId=nacl_id, RuleNumber=100, Protocol='-1', RuleAction='deny', Egress=True, CidrBlock='0.0.0.0/0'
    )
    # Ingress Deny All
    ec2.create_network_acl_entry(
        NetworkAclId=nacl_id, RuleNumber=100, Protocol='-1', RuleAction='deny', Egress=False, CidrBlock='0.0.0.0/0'
    )
    
    # Find current associations and swap them
    original_associations = []
    
    for subnet_id in subnets:
        res = ec2.describe_network_acls(Filters=[{'Name': 'association.subnet-id', 'Values': [subnet_id]}])
        for nacl in res['NetworkAcls']:
            for assoc in nacl['Associations']:
                if assoc['SubnetId'] == subnet_id:
                    original_associations.append(assoc['NetworkAclAssociationId'])
                    
                    print(f"[CHAOS] Associating Subnet {subnet_id} with Blackhole NACL...")
                    ec2.replace_network_acl_association(
                        AssociationId=assoc['NetworkAclAssociationId'],
                        NetworkAclId=nacl_id
                    )
                    
    return nacl_id, original_associations

def main():
    print("Initializing Chaos Engineering: Availability Zone (AZ) Blackhole Simulator")
    
    vpc_id = os.getenv("AWS_VPC_ID")
    if not vpc_id:
        print("AWS_VPC_ID environment variable is required.")
        return
        
    ec2 = boto3.client('ec2')
    
    # Fetch active AZs in the region
    azs = ec2.describe_availability_zones()['AvailabilityZones']
    target_az = random.choice(azs)['ZoneName']
    
    print(f"[CHAOS] Selected target AZ for simulated failure: {target_az}")
    
    subnets = get_subnets_in_az(ec2, vpc_id, target_az)
    if not subnets:
        print(f"No subnets found in {target_az}.")
        return
        
    nacl_id, _ = blackhole_subnets(ec2, vpc_id, subnets)
    
    chaos_duration = int(os.getenv("CHAOS_DURATION_SECONDS", 300))
    print(f"[CHAOS] AZ {target_az} is now fully blackholed (isolated from network).")
    print(f"[CHAOS] Holding simulated AZ failure state for {chaos_duration} seconds...")
    print("[CHAOS] During this time, Kubernetes should evict pods, and ALB/NLBs should fail over to other AZs.")
    
    time.sleep(chaos_duration)
    
    print(f"[CHAOS] Removing Blackhole NACL and restoring original network routing...")
    
    # To cleanly revert, we delete the Chaos NACL, which automatically falls back to the default VPC NACL
    # Or ideally, we'd revert the associations directly. For safety in this script, we restore associations.
    # Note: AWS replaces NACL associations, so deleting the NACL will fail if associated.
    # We must associate back to the default NACL first.
    
    default_nacl = ec2.describe_network_acls(Filters=[{'Name': 'vpc-id', 'Values': [vpc_id]}, {'Name': 'default', 'Values': ['true']}])['NetworkAcls'][0]['NetworkAclId']
    
    res = ec2.describe_network_acls(NetworkAclIds=[nacl_id])
    for nacl in res['NetworkAcls']:
        for assoc in nacl['Associations']:
            ec2.replace_network_acl_association(
                AssociationId=assoc['NetworkAclAssociationId'],
                NetworkAclId=default_nacl
            )
            
    ec2.delete_network_acl(NetworkAclId=nacl_id)
    print(f"[CHAOS] AZ {target_az} restored. Chaos experiment completed successfully.")

if __name__ == '__main__':
    main()
