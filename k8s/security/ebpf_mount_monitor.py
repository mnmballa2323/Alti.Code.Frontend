#!/usr/bin/python3
from bcc import BPF

# eBPF C program to trace mount syscalls to detect Container Breakouts via Host Filesystem mounting
bpf_text = """
#include <uapi/linux/ptrace.h>
#include <linux/sched.h>
#include <linux/fs.h>

struct data_t {
    u32 pid;
    u32 uid;
    char comm[TASK_COMM_LEN];
    char source[NAME_MAX];
    char target[NAME_MAX];
    char fstype[16];
    unsigned long flags;
};

BPF_PERF_OUTPUT(events);

// Hook sys_mount
// Privileged containers (or attackers who have gained CAP_SYS_ADMIN) often break out 
// into the Host OS by mounting the Host's underlying block device (e.g., /dev/sda1 or /dev/nvme0n1)
// into their container namespace, allowing them to freely read/write Host files.
TRACEPOINT_PROBE(syscalls, sys_enter_mount) {
    struct data_t data = {};
    
    data.pid = bpf_get_current_pid_tgid() >> 32;
    data.uid = bpf_get_current_uid_gid();
    data.flags = args->flags;
    
    bpf_get_current_comm(&data.comm, sizeof(data.comm));
    
    // Read the mount parameters
    bpf_probe_read_user_str(&data.source, sizeof(data.source), args->dev_name);
    bpf_probe_read_user_str(&data.target, sizeof(data.target), args->dir_name);
    bpf_probe_read_user_str(&data.fstype, sizeof(data.fstype), args->type);
    
    // Pass to userspace for evaluation
    events.perf_submit(args, &data, sizeof(data));
    return 0;
}
"""

print("Compiling and loading eBPF program for Mount Namespace (Container Breakout) Monitoring...")

b = BPF(text=bpf_text)

print("Monitoring for mount() syscalls... (Press Ctrl+C to exit)")

def print_event(cpu, data, size):
    event = b["events"].event(data)
    comm = event.comm.decode('utf-8', 'replace')
    source = event.source.decode('utf-8', 'replace')
    target = event.target.decode('utf-8', 'replace')
    fstype = event.fstype.decode('utf-8', 'replace')
    
    # Kubelet, containerd, and systemd legitimately perform mounts constantly.
    # We filter them out to focus entirely on application workloads attempting to mount.
    authorized_procs = ["systemd", "kubelet", "containerd", "dockerd", "mount", "crio", "runc", "containerd-shim"]
    
    if comm not in authorized_procs:
        # Additionally, we only care about mounting physical block devices or procfs/sysfs 
        # (tmpfs or cgroup mounts are generally less risky)
        sensitive_fs = ["ext4", "xfs", "proc", "sysfs", "btrfs"]
        
        if fstype in sensitive_fs or source.startswith("/dev/"):
            print(f"[CONTAINER BREAKOUT ALERT] Unauthorized Host Filesystem Mount Detected!")
            print(f"  -> PID: {event.pid}, UID: {event.uid}, Comm: {comm}")
            print(f"  -> Source Device: {source}")
            print(f"  -> Target Mount Point: {target} (FS Type: {fstype})")
            print(f"  -> CRITICAL: A container is attempting to map the Host OS block device to escape namespace isolation!")

b["events"].open_perf_buffer(print_event)

try:
    while True:
        b.perf_buffer_poll()
except KeyboardInterrupt:
    print("\\nExiting eBPF Mount Monitor.")
