# GKE Node Drain / Pod Eviction (BYOC / Airgap)

## Severity: P2
## Detection
- **Pod eviction events**: `kubectl get events --field-selector reason=Evicted` in the `alti-system` namespace
- **Node status**: Nodes showing `NotReady` or `SchedulingDisabled` in `kubectl get nodes`
- **Cloud Monitoring metric**: `kubernetes.io/node/status_condition` with condition `Ready=False`
- **Alerting policy**: `inso-code-gke-node-drain` fires on node NotReady or pod eviction events
- **Dashboard**: Check **Inso Code — Kubernetes Cluster** dashboard, panel "Node Status"
- **PagerDuty**: GKE cluster health check alerts

## Symptoms
- Pods in `alti-system` namespace are in `Pending`, `Evicted`, or `CrashLoopBackOff` state
- Workloads experience downtime during pod rescheduling
- Users report intermittent 502/503 errors from Ingress
- `kubectl top nodes` shows resource pressure on remaining nodes
- GKE cluster autoscaler logs show scaling events or failures
- Persistent volume claims may be stuck in `Pending` if zone-bound

## Root Cause
- **Node auto-upgrade**: GKE performing automatic node pool upgrade with rolling replacement
- **Resource pressure**: Node running low on CPU, memory, or ephemeral storage triggers eviction
- **Spot/preemptible preemption**: Spot VM nodes reclaimed by Google with 30-second notice
- **PodDisruptionBudget (PDB) misconfiguration**: PDB too restrictive, blocking node drain
- **Cluster autoscaler scale-down**: Autoscaler removing underutilized nodes
- **Manual drain**: Operator accidentally drained a node without confirming workload safety
- **Disk pressure**: Node ephemeral storage (`ephemeral-storage`) exceeded, triggering eviction

## Immediate Response (< 5 min)
1. **Check node status**:
   ```bash
   kubectl get nodes -o wide --context=gke_inso-code_us-central1_alti-byoc-cluster
   ```
2. **Check for evicted pods in the alti-system namespace**:
   ```bash
   kubectl get pods -n alti-system --field-selector=status.phase=Failed \
     --context=gke_inso-code_us-central1_alti-byoc-cluster

   kubectl get events -n alti-system --sort-by='.lastTimestamp' | tail -30
   ```
3. **Check node conditions** on affected nodes:
   ```bash
   kubectl describe node <NODE_NAME> \
     --context=gke_inso-code_us-central1_alti-byoc-cluster | \
     grep -A5 "Conditions:"
   ```
4. **Check PodDisruptionBudgets**:
   ```bash
   kubectl get pdb -n alti-system \
     --context=gke_inso-code_us-central1_alti-byoc-cluster
   ```
5. **Cordon affected node** to prevent new scheduling while investigating:
   ```bash
   kubectl cordon <NODE_NAME> \
     --context=gke_inso-code_us-central1_alti-byoc-cluster
   ```

## Resolution
1. **If node upgrade is draining pods** — verify it's expected and monitor:
   ```bash
   # Check ongoing operations
   gcloud container operations list \
     --cluster=alti-byoc-cluster \
     --region=us-central1 \
     --project=inso-code --filter="status=RUNNING"

   # Check node pool upgrade status
   gcloud container node-pools describe alti-system-pool \
     --cluster=alti-byoc-cluster \
     --region=us-central1 \
     --project=inso-code --format="value(management.autoUpgrade, version)"
   ```

2. **If resource pressure is evicting pods** — scale the node pool:
   ```bash
   # Increase node pool size
   gcloud container clusters resize alti-byoc-cluster \
     --node-pool=alti-system-pool \
     --num-nodes=5 \
     --region=us-central1 \
     --project=inso-code

   # Or enable autoscaling with higher max
   gcloud container clusters update alti-byoc-cluster \
     --enable-autoscaling \
     --node-pool=alti-system-pool \
     --min-nodes=3 --max-nodes=10 \
     --region=us-central1 \
     --project=inso-code
   ```

3. **If Spot preemption** — reschedule to on-demand nodes:
   ```bash
   # Add a non-spot node pool for critical workloads
   gcloud container node-pools create alti-system-stable \
     --cluster=alti-byoc-cluster \
     --region=us-central1 \
     --machine-type=e2-standard-4 \
     --num-nodes=3 \
     --no-enable-autoscaling \
     --project=inso-code

   # Taint spot nodes to prefer stable pool for critical workloads
   kubectl taint nodes -l cloud.google.com/gke-spot=true \
     spot-instance=true:PreferNoSchedule \
     --context=gke_inso-code_us-central1_alti-byoc-cluster
   ```

4. **If PDB is blocking drain** — adjust the budget:
   ```bash
   # Check current PDB configuration
   kubectl describe pdb alti-backend-pdb -n alti-system \
     --context=gke_inso-code_us-central1_alti-byoc-cluster

   # Update PDB to allow disruption (example: allow 1 unavailable)
   kubectl patch pdb alti-backend-pdb -n alti-system \
     --type=merge -p '{"spec":{"maxUnavailable":1}}' \
     --context=gke_inso-code_us-central1_alti-byoc-cluster
   ```

5. **Reschedule evicted pods**:
   ```bash
   # Delete evicted pods so the controller recreates them
   kubectl delete pods -n alti-system --field-selector=status.phase=Failed \
     --context=gke_inso-code_us-central1_alti-byoc-cluster

   # Verify pods are rescheduled
   kubectl get pods -n alti-system -o wide \
     --context=gke_inso-code_us-central1_alti-byoc-cluster
   ```

6. **Uncordon the node** if the issue is resolved:
   ```bash
   kubectl uncordon <NODE_NAME> \
     --context=gke_inso-code_us-central1_alti-byoc-cluster
   ```

## Verification
- All nodes are `Ready`:
  ```bash
  kubectl get nodes --context=gke_inso-code_us-central1_alti-byoc-cluster
  ```
- All pods in `alti-system` are `Running`:
  ```bash
  kubectl get pods -n alti-system \
    --context=gke_inso-code_us-central1_alti-byoc-cluster | \
    grep -v Running
  ```
- No recent eviction events:
  ```bash
  kubectl get events -n alti-system --field-selector reason=Evicted \
    --context=gke_inso-code_us-central1_alti-byoc-cluster
  ```
- Ingress is serving traffic normally:
  ```bash
  curl -s -o /dev/null -w "%{http_code}" https://byoc.alticode.studio/api/health
  ```
- Resource utilization is within bounds:
  ```bash
  kubectl top nodes --context=gke_inso-code_us-central1_alti-byoc-cluster
  kubectl top pods -n alti-system --context=gke_inso-code_us-central1_alti-byoc-cluster
  ```

## Prevention
- Configure PodDisruptionBudgets for all critical deployments (`minAvailable: 2` or `maxUnavailable: 1`)
- Use anti-affinity rules to spread pods across nodes and zones
- Set resource requests and limits on all pods to prevent resource pressure eviction
- Schedule GKE maintenance windows during low-traffic periods:
  ```bash
  gcloud container clusters update alti-byoc-cluster \
    --maintenance-window-start="2024-01-01T04:00:00Z" \
    --maintenance-window-end="2024-01-01T08:00:00Z" \
    --maintenance-window-recurrence="FREQ=WEEKLY;BYDAY=SU" \
    --region=us-central1 --project=inso-code
  ```
- Avoid Spot VMs for stateful or critical-path workloads
- Enable GKE Notifications for cluster events via Pub/Sub
- Set up `ephemeral-storage` requests on pods to prevent disk pressure eviction
- Implement pod priority classes: critical workloads get `system-cluster-critical`

## Escalation
- **If multiple nodes are NotReady simultaneously**: Page on-call SRE — `inso-code-p1`
- **If cluster autoscaler is unable to provision new nodes**: Check GCE quotas; open GCP Support case
- **If PVCs are stuck and data is at risk**: Escalate to storage/platform engineering lead
- **If BYOC customer cluster**: Coordinate with the customer's infrastructure team
- **Slack channel**: `#alti-incidents`
- **Runbook owner**: Platform Engineering team
