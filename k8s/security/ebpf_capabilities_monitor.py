#!/usr/bin/python3
from bcc import BPF

# eBPF C program to trace cap_capable to detect unexpected privilege requests
bpf_text = """
#include <uapi/linux/ptrace.h>
#include <linux/sched.h>
#include <linux/capability.h>

struct data_t {
    u32 pid;
    u32 uid;
    int cap;
    int audit;
    char comm[TASK_COMM_LEN];
};

BPF_PERF_OUTPUT(events);

// Hook into the kernel's capability check function
// This function is called every time a process attempts a privileged operation
int kprobe__cap_capable(struct pt_regs *ctx, const struct cred *cred, 
                        struct user_namespace *targ_ns, int cap, int audit) {
    struct data_t data = {};
    
    data.pid = bpf_get_current_pid_tgid() >> 32;
    data.uid = bpf_get_current_uid_gid();
    data.cap = cap;
    data.audit = audit;
    
    bpf_get_current_comm(&data.comm, sizeof(data.comm));
    
    // We only want to alert on highly sensitive capabilities being requested
    // CAP_SYS_ADMIN (21) - The "root" capability, allows almost everything
    // CAP_SYS_PTRACE (19) - Allows tracing/injecting into other processes
    // CAP_SYS_MODULE (16) - Allows inserting kernel modules
    // CAP_MAC_ADMIN (33) - Allows overriding Mandatory Access Control (AppArmor/SELinux)
    
    if (cap == 21 || cap == 19 || cap == 16 || cap == 33) {
        events.perf_submit(ctx, &data, sizeof(data));
    }
    
    return 0;
}
"""

print("Compiling and loading eBPF program for Linux Capabilities Monitoring...")

b = BPF(text=bpf_text)

print("Monitoring for privileged capability checks (e.g., CAP_SYS_ADMIN)... (Press Ctrl+C to exit)")

def get_cap_name(cap):
    # Mapping of capability numbers to names
    cap_map = {
        16: "CAP_SYS_MODULE",
        19: "CAP_SYS_PTRACE",
        21: "CAP_SYS_ADMIN",
        33: "CAP_MAC_ADMIN"
    }
    return cap_map.get(cap, f"UNKNOWN ({cap})")

def print_event(cpu, data, size):
    event = b["events"].event(data)
    comm = event.comm.decode('utf-8', 'replace')
    cap_name = get_cap_name(event.cap)
    
    # Authorized system daemons that legitimately require CAP_SYS_ADMIN
    authorized_binaries = ["systemd", "dockerd", "containerd", "kubelet", "sshd"]
    
    if comm not in authorized_binaries:
        print(f"[PRIVILEGE ESCALATION ALERT] Unauthorized process requesting highly restricted capability!")
        print(f"  -> PID: {event.pid}, UID: {event.uid}, Comm: {comm}")
        print(f"  -> Requested Capability: {cap_name}")
        
        if event.cap == 21:
            print("  -> CRITICAL: Process requested CAP_SYS_ADMIN (Full system compromise possible).")
        elif event.cap == 16:
            print("  -> WARNING: Process attempting to load kernel modules.")

b["events"].open_perf_buffer(print_event)

try:
    while True:
        b.perf_buffer_poll()
except KeyboardInterrupt:
    print("\\nExiting eBPF Capabilities Monitor.")
