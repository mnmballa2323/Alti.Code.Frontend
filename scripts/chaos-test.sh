#!/usr/bin/env bash
# ==============================================================================
# ALTI CODE STUDIO: Chaos Engineering Test Runner
# ==============================================================================
# Runs chaos engineering experiments against the platform in a safe,
# controlled manner. Tests are in k8s/ directory.
#
# Usage:
#   ./scripts/chaos-test.sh [experiment] [--namespace NAMESPACE] [--dry-run]
#
# Experiments:
#   network   — Network latency, DNS, partition tests
#   memory    — Memory stress and OOM killer tests
#   cpu       — CPU exhaustion tests
#   io        — Disk I/O saturation tests
#   pod       — Pod eviction and autoscaler failure tests
#   all       — Run all experiments sequentially
#
# Prerequisites:
#   - kubectl configured with cluster access
#   - Chaos Mesh or LitmusChaos operator installed (for YAML-based tests)
#   - Python 3.8+ (for Python-based chaos scripts)
# ==============================================================================

set -euo pipefail

EXPERIMENT="${1:-all}"
NAMESPACE="${CHAOS_NAMESPACE:-alti-system}"
DRY_RUN=false
K8S_DIR="k8s"

# ── Parse flags ──
shift || true
while [[ $# -gt 0 ]]; do
  case $1 in
    --namespace) NAMESPACE="$2"; shift 2 ;;
    --dry-run)   DRY_RUN=true; shift ;;
    *) echo "Unknown flag: $1"; exit 1 ;;
  esac
done

echo "═══════════════════════════════════════════════════════"
echo "  🔥 CHAOS ENGINEERING TEST RUNNER"
echo "═══════════════════════════════════════════════════════"
echo "  Experiment:  ${EXPERIMENT}"
echo "  Namespace:   ${NAMESPACE}"
echo "  Dry Run:     ${DRY_RUN}"
echo "═══════════════════════════════════════════════════════"
echo ""

# ── Validation ──
if ! command -v kubectl &>/dev/null; then
  echo "❌ kubectl not found. Install kubectl first."
  exit 1
fi

run_yaml_experiment() {
  local file="$1"
  local name
  name=$(basename "$file" .yaml)
  echo "🧪 Running: ${name}"

  if [[ "$DRY_RUN" == "true" ]]; then
    echo "   [DRY RUN] Would apply: kubectl apply -f ${file} -n ${NAMESPACE}"
    return
  fi

  kubectl apply -f "${file}" -n "${NAMESPACE}" 2>/dev/null || {
    echo "   ⚠️  Failed to apply ${name} — CRD may not be installed"
    return
  }

  echo "   ⏳ Waiting 60s for experiment..."
  sleep 60

  echo "   🧹 Cleaning up..."
  kubectl delete -f "${file}" -n "${NAMESPACE}" --ignore-not-found 2>/dev/null || true
  echo "   ✅ ${name} complete"
  echo ""
}

run_python_experiment() {
  local file="$1"
  local name
  name=$(basename "$file" .py)
  echo "🐍 Running: ${name}"

  if [[ "$DRY_RUN" == "true" ]]; then
    echo "   [DRY RUN] Would run: python3 ${file}"
    return
  fi

  python3 "${file}" --namespace "${NAMESPACE}" 2>/dev/null || {
    echo "   ⚠️  Failed to run ${name}"
    return
  }
  echo "   ✅ ${name} complete"
  echo ""
}

# ── Experiment categories ──
run_network() {
  echo "📡 Category: NETWORK CHAOS"
  for f in "${K8S_DIR}"/chaos_network*.yaml "${K8S_DIR}"/chaos_dns*.yaml; do
    [[ -f "$f" ]] && run_yaml_experiment "$f"
  done
  for f in "${K8S_DIR}"/chaos_network*.py; do
    [[ -f "$f" ]] && run_python_experiment "$f"
  done
}

run_memory() {
  echo "🧠 Category: MEMORY CHAOS"
  for f in "${K8S_DIR}"/chaos_memory*.yaml "${K8S_DIR}"/chaos_oom*.yaml; do
    [[ -f "$f" ]] && run_yaml_experiment "$f"
  done
  for f in "${K8S_DIR}"/chaos_memory*.py; do
    [[ -f "$f" ]] && run_python_experiment "$f"
  done
}

run_cpu() {
  echo "⚡ Category: CPU CHAOS"
  for f in "${K8S_DIR}"/chaos_cpu*.yaml; do
    [[ -f "$f" ]] && run_yaml_experiment "$f"
  done
}

run_io() {
  echo "💾 Category: I/O CHAOS"
  for f in "${K8S_DIR}"/chaos_io*.yaml "${K8S_DIR}"/chaos_disk*.py "${K8S_DIR}"/chaos_inode*.yaml; do
    [[ -f "$f" ]] && run_yaml_experiment "$f"
  done
}

run_pod() {
  echo "🔄 Category: POD/AUTOSCALER CHAOS"
  for f in "${K8S_DIR}"/chaos_eviction*.yaml "${K8S_DIR}"/chaos_autoscaler*.yaml; do
    [[ -f "$f" ]] && run_yaml_experiment "$f"
  done
  for f in "${K8S_DIR}"/chaos_node*.py; do
    [[ -f "$f" ]] && run_python_experiment "$f"
  done
}

# ── Execute ──
case "${EXPERIMENT}" in
  network) run_network ;;
  memory)  run_memory ;;
  cpu)     run_cpu ;;
  io)      run_io ;;
  pod)     run_pod ;;
  all)
    run_network
    run_memory
    run_cpu
    run_io
    run_pod
    ;;
  *)
    echo "❌ Unknown experiment: ${EXPERIMENT}"
    echo "   Valid: network, memory, cpu, io, pod, all"
    exit 1
    ;;
esac

echo "═══════════════════════════════════════════════════════"
echo "  ✅ Chaos engineering tests complete"
echo "═══════════════════════════════════════════════════════"
