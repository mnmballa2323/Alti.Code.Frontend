# Infinite Infrastructure Loop Runbook
# Mode: Safe
# Pattern: Infinite

## Objective
Continuously and autonomously improve the Multi-Cloud Infrastructure (AWS, Azure, GCP) for Inso Code.

## Execution Vectors
1. **Chaos Engineering**: Inject failure testing scripts into the K8s clusters to prove resilience.
2. **FinOps Optimization**: Write Terraform to automatically detect and replace idle instances with Spot instances where appropriate.
3. **eBPF Security**: Draft kernel-level eBPF monitoring scripts for the data plane nodes to detect anomalies.
4. **Custom Hardware Logic**: Configure AWS F1 FPGA instances for cryptographic acceleration.

## Loop Protocol
1. Select one vector.
2. Analyze the current Terraform state.
3. Write the necessary Terraform or scripting improvements.
4. Validate syntax (`terraform fmt`, `terraform validate` conceptually).
5. Commit the code using the `push_repo` Git retry script.
6. Sleep for 5 seconds.
7. Select the next vector.
8. Loop infinitely until the user explicitly sends a "STOP" message.

## Stop Conditions
- The user issues a "STOP" or "HALT" command.
- The Git repository becomes permanently unreachable.
