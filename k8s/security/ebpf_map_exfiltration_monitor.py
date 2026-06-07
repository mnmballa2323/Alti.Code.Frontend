#!/usr/bin/python3
from bcc import BPF

# eBPF C program to trace the bpf() syscall specifically for Map Exfiltration.
# Advanced attackers may dump existing eBPF maps (like Cilium connection tracking, 
# Katran load balancer tables, or Tetragon security state) to steal data, 
# bypass firewalls, or understand the cluster topology without deploying any new malware.
bpf_text = """
#include <uapi/linux/ptrace.h>
#include <uapi/linux/bpf.h>
#include <linux/sched.h>

struct data_t {
    u32 pid;
    u32 uid;
    int cmd;
    char comm[TASK_COMM_LEN];
};

BPF_PERF_OUTPUT(events);

// Hook the bpf() syscall
TRACEPOINT_PROBE(syscalls, sys_enter_bpf) {
    struct data_t data = {};
    
    data.pid = bpf_get_current_pid_tgid() >> 32;
    data.uid = bpf_get_current_uid_gid();
    data.cmd = args->cmd;
    
    bpf_get_current_comm(&data.comm, sizeof(data.comm));
    
    // We are specifically interested in map reading operations.
    // BPF_MAP_LOOKUP_ELEM (1) - Read a single element
    // BPF_MAP_GET_NEXT_KEY (4) - Iterate over the entire map (dumping)
    if (data.cmd == BPF_MAP_LOOKUP_ELEM || data.cmd == BPF_MAP_GET_NEXT_KEY) {
        events.perf_submit(args, &data, sizeof(data));
    }
    
    return 0;
}
"""

print("Compiling and loading eBPF program for BPF Map Exfiltration Monitoring...")

b = BPF(text=bpf_text)

print("Monitoring for BPF Map read/dump operations (sys_bpf)... (Press Ctrl+C to exit)")

def print_event(cpu, data, size):
    event = b["events"].event(data)
    comm = event.comm.decode('utf-8', 'replace')
    
    # Map the command integer to a readable string
    cmd_map = {
        1: "BPF_MAP_LOOKUP_ELEM",
        4: "BPF_MAP_GET_NEXT_KEY (Iterating/Dumping)"
    }
    cmd_name = cmd_map.get(event.cmd, f"UNKNOWN_{event.cmd}")
    
    # Authorized network and security tools that legitimately read BPF maps
    authorized_procs = ["cilium-agent", "bpftool", "agent", "falco", "tracee", "python3", "python", "bcc", "kube-proxy"]
    
    if comm not in authorized_procs:
        print(f"[BPF MAP EXFILTRATION ALERT] Unauthorized eBPF Map Access Detected!")
        print(f"  -> PID: {event.pid}, UID: {event.uid}, Comm: {comm}")
        print(f"  -> BPF Command: {cmd_name}")
        print(f"  -> CRITICAL: Process is attempting to read or dump sensitive in-kernel eBPF Maps!")
        if event.cmd == 4:
            print(f"  -> SEVERITY: HIGH. BPF_MAP_GET_NEXT_KEY indicates the attacker is dumping the entire map contents (e.g., stealing Cilium Conntrack tables).")

b["events"].open_perf_buffer(print_event)

try:
    while True:
        b.perf_buffer_poll()
except KeyboardInterrupt:
    print("\\nExiting BPF Map Exfiltration Monitor.")
