#!/usr/bin/python3
from bcc import BPF

# eBPF C program to trace symlink/symlinkat syscalls to detect symlink attacks
bpf_text = """
#include <uapi/linux/ptrace.h>
#include <linux/fs.h>
#include <linux/sched.h>

struct data_t {
    u32 pid;
    u32 uid;
    char comm[TASK_COMM_LEN];
    char oldname[NAME_MAX];
    char newname[NAME_MAX];
};

BPF_PERF_OUTPUT(events);

// Hook sys_symlinkat
TRACEPOINT_PROBE(syscalls, sys_enter_symlinkat) {
    struct data_t data = {};
    
    data.pid = bpf_get_current_pid_tgid() >> 32;
    data.uid = bpf_get_current_uid_gid();
    bpf_get_current_comm(&data.comm, sizeof(data.comm));
    
    // args->oldname is the target of the symlink
    // args->newname is the name of the symlink being created
    bpf_probe_read_user_str(&data.oldname, sizeof(data.oldname), args->oldname);
    bpf_probe_read_user_str(&data.newname, sizeof(data.newname), args->newname);
    
    events.perf_submit(args, &data, sizeof(data));
    return 0;
}
"""

print("Compiling and loading eBPF program for Symlink Attack Monitoring...")

b = BPF(text=bpf_text)

print("Monitoring for symlinkat() syscalls... (Press Ctrl+C to exit)")

def print_event(cpu, data, size):
    event = b["events"].event(data)
    comm = event.comm.decode('utf-8', 'replace')
    oldname = event.oldname.decode('utf-8', 'replace')
    newname = event.newname.decode('utf-8', 'replace')
    
    # We alert specifically on attempts to symlink highly sensitive system files
    # which is a common pattern in privilege escalation exploits (e.g. symlink races)
    sensitive_targets = ["/etc/shadow", "/etc/passwd", "/root/.ssh", "/etc/kubernetes", "/var/run/docker.sock", "/run/containerd/containerd.sock"]
    
    is_sensitive = any(target in oldname for target in sensitive_targets)
    
    if is_sensitive:
        print(f"[SYMLINK EXPLOIT ALERT] Suspicious Symlink Creation Detected!")
        print(f"  -> PID: {event.pid}, UID: {event.uid}, Comm: {comm}")
        print(f"  -> Target (oldname): {oldname}")
        print(f"  -> Link (newname): {newname}")
        print(f"  -> CRITICAL: Potential privilege escalation or file-overwrite exploit detected!")

b["events"].open_perf_buffer(print_event)

try:
    while True:
        b.perf_buffer_poll()
except KeyboardInterrupt:
    print("\\nExiting eBPF Symlink Monitor.")
