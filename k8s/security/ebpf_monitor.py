#!/usr/bin/python3
from bcc import BPF
import time

# eBPF C program to trace execve (process executions) and detect potential anomalies
bpf_text = """
#include <uapi/linux/ptrace.h>
#include <linux/sched.h>
#include <linux/fs.h>

BPF_HASH(anomaly_count, u32, u64);

int trace_execve(struct pt_regs *ctx) {
    u32 pid = bpf_get_current_pid_tgid() >> 32;
    u32 uid = bpf_get_current_uid_gid();
    
    char comm[TASK_COMM_LEN];
    bpf_get_current_comm(&comm, sizeof(comm));
    
    // Simplistic anomaly detection: Flag specific process names often used in exploits
    if (comm[0] == 'n' && comm[1] == 'c') {
        u64 *val, zero = 0;
        val = anomaly_count.lookup_or_init(&uid, &zero);
        (*val)++;
        bpf_trace_printk("Anomaly detected! User %d executed netcat (nc). PID: %d\\n", uid, pid);
    }
    
    if (comm[0] == 'c' && comm[1] == 'u' && comm[2] == 'r' && comm[3] == 'l') {
        u64 *val, zero = 0;
        val = anomaly_count.lookup_or_init(&uid, &zero);
        (*val)++;
        bpf_trace_printk("Warning: curl executed by User %d. PID: %d\\n", uid, pid);
    }

    return 0;
}
"""

print("Compiling and loading eBPF program for kernel-level security monitoring...")

# Initialize BPF
b = BPF(text=bpf_text)

# Attach kprobe to sys_execve
b.attach_kprobe(event=b.get_syscall_fnname("execve"), fn_name="trace_execve")

print("Successfully loaded. Monitoring process executions for anomalies... (Press Ctrl+C to exit)")

# Trace output loop
try:
    while True:
        try:
            (task, pid, cpu, flags, ts, msg) = b.trace_fields()
            print(f"[{ts:.6f}] {msg.decode('utf-8')}")
        except ValueError:
            continue
except KeyboardInterrupt:
    print("\\nExiting eBPF Monitor.")
    
    # Print anomaly summary
    print("\\n--- Anomaly Summary by UID ---")
    anomaly_map = b.get_table("anomaly_count")
    for k, v in anomaly_map.items():
        print(f"UID: {k.value} -> Suspicious Executions: {v.value}")
