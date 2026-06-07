#!/usr/bin/python3
from bcc import BPF
import time

# eBPF C program to trace vfs_open and detect unauthorized file access
bpf_text = """
#include <uapi/linux/ptrace.h>
#include <linux/fs.h>
#include <linux/sched.h>

struct data_t {
    u32 pid;
    u32 uid;
    char comm[TASK_COMM_LEN];
    char fname[NAME_MAX];
};

BPF_PERF_OUTPUT(events);

int trace_vfs_open(struct pt_regs *ctx, struct path *path, struct file *file) {
    u32 uid = bpf_get_current_uid_gid();
    
    struct data_t data = {};
    data.pid = bpf_get_current_pid_tgid() >> 32;
    data.uid = uid;
    bpf_get_current_comm(&data.comm, sizeof(data.comm));
    
    // Read the filename from the path dentry
    struct dentry *dentry = path->dentry;
    struct qstr d_name = dentry->d_name;
    bpf_probe_read_kernel_str(&data.fname, sizeof(data.fname), d_name.name);
    
    // Detect access to sensitive files
    // String matching is restricted in BPF, so we check first characters or use userspace filtering.
    // We send all opens of 'shadow', 'passwd', 'id_rsa' to userspace.
    
    if (data.fname[0] == 's' && data.fname[1] == 'h' && data.fname[2] == 'a' && data.fname[3] == 'd' && data.fname[4] == 'o' && data.fname[5] == 'w') {
        events.perf_submit(ctx, &data, sizeof(data));
    } else if (data.fname[0] == 'i' && data.fname[1] == 'd' && data.fname[2] == '_' && data.fname[3] == 'r' && data.fname[4] == 's' && data.fname[5] == 'a') {
        events.perf_submit(ctx, &data, sizeof(data));
    }
    
    return 0;
}
"""

print("Compiling and loading eBPF program for Sensitive File Access Monitoring...")

b = BPF(text=bpf_text)
b.attach_kprobe(event="vfs_open", fn_name="trace_vfs_open")

print("Monitoring access to 'shadow' and 'id_rsa' files... (Press Ctrl+C to exit)")

def print_event(cpu, data, size):
    event = b["events"].event(data)
    filename = event.fname.decode('utf-8', 'replace')
    comm = event.comm.decode('utf-8', 'replace')
    
    print(f"[ANOMALY] Sensitive file accessed! PID: {event.pid}, UID: {event.uid}, Comm: {comm}, File: {filename}")
    
    # Simple heuristic: If the reader is not root (UID 0) or a trusted system process, alert strongly
    if event.uid != 0 and comm not in ["sshd", "login"]:
        print("  -> CRITICAL: Non-root or unexpected process reading sensitive material.")

b["events"].open_perf_buffer(print_event)

try:
    while True:
        b.perf_buffer_poll()
except KeyboardInterrupt:
    print("\\nExiting eBPF File Monitor.")
