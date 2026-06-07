#!/usr/bin/python3
from bcc import BPF
import time

# eBPF C program to trace commit_creds and detect potential privilege escalation
bpf_text = """
#include <uapi/linux/ptrace.h>
#include <linux/sched.h>
#include <linux/cred.h>

struct data_t {
    u32 pid;
    u32 old_uid;
    u32 new_uid;
    char comm[TASK_COMM_LEN];
};

BPF_PERF_OUTPUT(events);

int trace_commit_creds(struct pt_regs *ctx, struct cred *new) {
    struct data_t data = {};
    
    // Get the task struct and current credentials
    struct task_struct *task = (struct task_struct *)bpf_get_current_task();
    
    u32 pid = bpf_get_current_pid_tgid() >> 32;
    u32 old_uid = bpf_get_current_uid_gid(); // This gets the euid from bpf helper
    
    // Read the new UID from the new credentials struct
    u32 new_uid;
    bpf_probe_read_kernel(&new_uid, sizeof(new_uid), &new->uid.val);
    
    // We only care about escalation TO root (UID 0) from a NON-ROOT user
    if (new_uid == 0 && old_uid != 0) {
        data.pid = pid;
        data.old_uid = old_uid;
        data.new_uid = new_uid;
        bpf_get_current_comm(&data.comm, sizeof(data.comm));
        
        events.perf_submit(ctx, &data, sizeof(data));
    }
    
    return 0;
}
"""

print("Compiling and loading eBPF program for Privilege Escalation Monitoring...")

b = BPF(text=bpf_text)

# Attach kprobe to commit_creds
b.attach_kprobe(event="commit_creds", fn_name="trace_commit_creds")

print("Monitoring for suspicious privilege escalations to root (UID 0)... (Press Ctrl+C to exit)")

def print_event(cpu, data, size):
    event = b["events"].event(data)
    comm = event.comm.decode('utf-8', 'replace')
    
    print(f"[CRITICAL ANOMALY] Privilege Escalation Detected!")
    print(f"  -> PID: {event.pid}, Comm: {comm}")
    print(f"  -> UID Transition: {event.old_uid} -> {event.new_uid} (ROOT)")
    
    # Filter expected escalation paths
    if comm not in ["sudo", "su", "sshd", "login"]:
        print("  -> ALERT: This escalation bypassed standard authentication binaries! Possible Kernel Exploit.")

b["events"].open_perf_buffer(print_event)

try:
    while True:
        b.perf_buffer_poll()
except KeyboardInterrupt:
    print("\\nExiting eBPF Privilege Monitor.")
