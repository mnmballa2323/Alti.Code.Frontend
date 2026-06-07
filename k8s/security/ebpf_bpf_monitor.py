#!/usr/bin/python3
from bcc import BPF

# eBPF C program to trace the bpf() syscall to detect rogue eBPF programs
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

// Hook sys_bpf which is used to load eBPF programs and manipulate maps
TRACEPOINT_PROBE(syscalls, sys_enter_bpf) {
    struct data_t data = {};
    
    data.pid = bpf_get_current_pid_tgid() >> 32;
    data.uid = bpf_get_current_uid_gid();
    data.cmd = args->cmd;
    
    bpf_get_current_comm(&data.comm, sizeof(data.comm));
    
    // We are particularly interested in BPF_PROG_LOAD (5) and BPF_MAP_CREATE (0)
    if (data.cmd == BPF_PROG_LOAD || data.cmd == BPF_MAP_CREATE) {
        events.perf_submit(args, &data, sizeof(data));
    }
    
    return 0;
}
"""

print("Compiling and loading eBPF program for Rogue eBPF/Rootkit Monitoring...")

b = BPF(text=bpf_text)

print("Monitoring for suspicious bpf() syscalls... (Press Ctrl+C to exit)")

# BPF commands
BPF_MAP_CREATE = 0
BPF_PROG_LOAD = 5

def get_cmd_name(cmd):
    if cmd == BPF_MAP_CREATE: return "BPF_MAP_CREATE"
    if cmd == BPF_PROG_LOAD: return "BPF_PROG_LOAD"
    return f"UNKNOWN ({cmd})"

def print_event(cpu, data, size):
    event = b["events"].event(data)
    comm = event.comm.decode('utf-8', 'replace')
    cmd_name = get_cmd_name(event.cmd)
    
    # Authorized tools that load eBPF programs in our cluster
    authorized_binaries = ["python3", "cilium-agent", "tetragon", "falco", "tracee"]
    
    # In this specific test script we are running via python3, so we might see ourselves.
    # In production, even python3 loading BPF would be heavily scrutinized based on context.
    
    if comm not in authorized_binaries:
        print(f"[ROGUE eBPF ALERT] Unauthorized process attempting to load eBPF program!")
        print(f"  -> Attacker PID: {event.pid}, UID: {event.uid}, Comm: {comm}")
        print(f"  -> Operation: {cmd_name}")
        print(f"  -> CRITICAL: Potential eBPF rootkit installation detected!")

b["events"].open_perf_buffer(print_event)

try:
    while True:
        b.perf_buffer_poll()
except KeyboardInterrupt:
    print("\\nExiting Rogue eBPF Monitor.")
