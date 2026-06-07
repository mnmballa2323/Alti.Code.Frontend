#!/usr/bin/python3
from bcc import BPF
import time

# eBPF C program to trace vfs_unlink to detect suspicious file deletions (e.g., log wiping)
bpf_text = """
#include <uapi/linux/ptrace.h>
#include <linux/fs.h>
#include <linux/sched.h>
#include <linux/dcache.h>

struct data_t {
    u32 pid;
    u32 uid;
    char comm[TASK_COMM_LEN];
    char fname[NAME_MAX];
};

BPF_PERF_OUTPUT(events);

int trace_vfs_unlink(struct pt_regs *ctx, struct inode *dir, struct dentry *dentry) {
    u32 uid = bpf_get_current_uid_gid();
    
    struct data_t data = {};
    data.pid = bpf_get_current_pid_tgid() >> 32;
    data.uid = uid;
    bpf_get_current_comm(&data.comm, sizeof(data.comm));
    
    // Read the filename being unlinked
    struct qstr d_name = dentry->d_name;
    bpf_probe_read_kernel_str(&data.fname, sizeof(data.fname), d_name.name);
    
    // We send all unlinks to userspace for Python-side filtering (more flexible string matching)
    events.perf_submit(ctx, &data, sizeof(data));
    
    return 0;
}
"""

print("Compiling and loading eBPF program for File Deletion/Log Wiping Monitoring...")

b = BPF(text=bpf_text)
b.attach_kprobe(event="vfs_unlink", fn_name="trace_vfs_unlink")

print("Monitoring for suspicious deletions (e.g., auth.log, syslog, history files)... (Press Ctrl+C to exit)")

# Target files that attackers commonly delete to cover their tracks
SENSITIVE_DELETIONS = [
    "auth.log",
    "syslog",
    "messages",
    "secure",
    "wtmp",
    "btmp",
    "utmp",
    "lastlog",
    ".bash_history",
    ".zsh_history"
]

def print_event(cpu, data, size):
    event = b["events"].event(data)
    filename = event.fname.decode('utf-8', 'replace')
    comm = event.comm.decode('utf-8', 'replace')
    
    # Check if the unlinked file matches known sensitive log/history files
    if filename in SENSITIVE_DELETIONS or filename.endswith("_history"):
        print(f"[ANTI-FORENSICS ALERT] Suspicious File Deletion Detected!")
        print(f"  -> PID: {event.pid}, UID: {event.uid}, Comm: {comm}")
        print(f"  -> Deleted File: {filename}")
        
        if comm not in ["logrotate", "rm"]:
            print("  -> CRITICAL: Deletion originated from an unusual binary!")

b["events"].open_perf_buffer(print_event)

try:
    while True:
        b.perf_buffer_poll()
except KeyboardInterrupt:
    print("\\nExiting eBPF Deletion Monitor.")
