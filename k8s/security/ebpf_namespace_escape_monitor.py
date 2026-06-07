#!/usr/bin/python3
from bcc import BPF

# eBPF C program to trace the setns() syscall to detect namespace/container escapes
bpf_text = """
#include <uapi/linux/ptrace.h>
#include <linux/sched.h>
#include <linux/nsproxy.h>

struct data_t {
    u32 pid;
    u32 uid;
    int fd;
    int nstype;
    char comm[TASK_COMM_LEN];
};

BPF_PERF_OUTPUT(events);

// Hook sys_setns which is used to join existing namespaces (often the host's namespaces)
TRACEPOINT_PROBE(syscalls, sys_enter_setns) {
    struct data_t data = {};
    
    data.pid = bpf_get_current_pid_tgid() >> 32;
    data.uid = bpf_get_current_uid_gid();
    data.fd = args->fd;
    data.nstype = args->nstype;
    
    bpf_get_current_comm(&data.comm, sizeof(data.comm));
    
    // We forward all setns calls. In userspace we will filter based on the process name.
    events.perf_submit(args, &data, sizeof(data));
    return 0;
}
"""

print("Compiling and loading eBPF program for Namespace Escape Monitoring...")

b = BPF(text=bpf_text)

print("Monitoring for setns() syscalls (Container Escapes)... (Press Ctrl+C to exit)")

# Linux Namespace Constants (from include/uapi/linux/sched.h)
CLONE_NEWCGROUP = 0x02000000
CLONE_NEWUTS    = 0x04000000
CLONE_NEWIPC    = 0x08000000
CLONE_NEWUSER   = 0x10000000
CLONE_NEWPID    = 0x20000000
CLONE_NEWNET    = 0x40000000

def get_ns_name(nstype):
    if nstype == 0: return "ANY (Deduced from FD)"
    flags = []
    if nstype & CLONE_NEWCGROUP: flags.append("CGROUP")
    if nstype & CLONE_NEWUTS: flags.append("UTS")
    if nstype & CLONE_NEWIPC: flags.append("IPC")
    if nstype & CLONE_NEWUSER: flags.append("USER")
    if nstype & CLONE_NEWPID: flags.append("PID")
    if nstype & CLONE_NEWNET: flags.append("NET")
    return " | ".join(flags) if flags else f"UNKNOWN ({nstype})"

def print_event(cpu, data, size):
    event = b["events"].event(data)
    comm = event.comm.decode('utf-8', 'replace')
    ns_name = get_ns_name(event.nstype)
    
    # Authorized container runtimes that legitimately use setns
    authorized_binaries = ["docker", "dockerd", "containerd", "runc", "kubelet", "crio", "podman"]
    
    if comm not in authorized_binaries:
        print(f"[NAMESPACE ESCAPE ALERT] Unauthorized process attempting to join a namespace!")
        print(f"  -> Attacker PID: {event.pid}, UID: {event.uid}, Comm: {comm}")
        print(f"  -> Namespace Type: {ns_name} (FD: {event.fd})")
        print(f"  -> CRITICAL: Potential Docker/Kubernetes container breakout detected! Process is attempting to breach sandbox isolation.")

b["events"].open_perf_buffer(print_event)

try:
    while True:
        b.perf_buffer_poll()
except KeyboardInterrupt:
    print("\\nExiting Namespace Escape Monitor.")
