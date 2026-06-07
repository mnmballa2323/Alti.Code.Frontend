#!/usr/bin/python3
from bcc import BPF

# eBPF C program to trace chmod/fchmodat syscalls to detect SUID/SGID backdoor creation
bpf_text = """
#include <uapi/linux/ptrace.h>
#include <linux/fs.h>
#include <linux/sched.h>

struct data_t {
    u32 pid;
    u32 uid;
    int mode;
    char comm[TASK_COMM_LEN];
    char filename[NAME_MAX];
};

BPF_PERF_OUTPUT(events);

// Hook sys_fchmodat
TRACEPOINT_PROBE(syscalls, sys_enter_fchmodat) {
    struct data_t data = {};
    
    data.pid = bpf_get_current_pid_tgid() >> 32;
    data.uid = bpf_get_current_uid_gid();
    data.mode = args->mode;
    
    bpf_get_current_comm(&data.comm, sizeof(data.comm));
    bpf_probe_read_user_str(&data.filename, sizeof(data.filename), args->filename);
    
    // SUID bit is 04000, SGID bit is 02000 in octal
    // We want to alert specifically if an attacker is setting these bits on a binary
    // to leave a persistent privilege escalation backdoor.
    
    if ((data.mode & 04000) || (data.mode & 02000)) {
        events.perf_submit(args, &data, sizeof(data));
    }
    
    return 0;
}

// Hook sys_chmod
TRACEPOINT_PROBE(syscalls, sys_enter_chmod) {
    struct data_t data = {};
    
    data.pid = bpf_get_current_pid_tgid() >> 32;
    data.uid = bpf_get_current_uid_gid();
    data.mode = args->mode;
    
    bpf_get_current_comm(&data.comm, sizeof(data.comm));
    bpf_probe_read_user_str(&data.filename, sizeof(data.filename), args->filename);
    
    if ((data.mode & 04000) || (data.mode & 02000)) {
        events.perf_submit(args, &data, sizeof(data));
    }
    
    return 0;
}
"""

print("Compiling and loading eBPF program for SUID/SGID Backdoor Monitoring...")

b = BPF(text=bpf_text)

print("Monitoring for chmod() calls setting SUID/SGID bits... (Press Ctrl+C to exit)")

def print_event(cpu, data, size):
    event = b["events"].event(data)
    comm = event.comm.decode('utf-8', 'replace')
    filename = event.filename.decode('utf-8', 'replace')
    
    # Check which bit was set
    bits = []
    if event.mode & 0o4000: bits.append("SUID")
    if event.mode & 0o2000: bits.append("SGID")
    bit_str = " + ".join(bits)
    
    # Legitimate installations (like apt/dpkg) sometimes set SUID on specific binaries like sudo or ping.
    # In an immutable Kubernetes cluster running microservices, this should almost NEVER happen post-boot.
    
    print(f"[BACKDOOR ALERT] Suspicious File Permission Change Detected!")
    print(f"  -> PID: {event.pid}, UID: {event.uid}, Comm: {comm}")
    print(f"  -> Target File: {filename}")
    print(f"  -> Bits Set: {bit_str} (Mode: {oct(event.mode)})")
    print(f"  -> CRITICAL: Process is attempting to create a persistent privilege escalation backdoor!")

b["events"].open_perf_buffer(print_event)

try:
    while True:
        b.perf_buffer_poll()
except KeyboardInterrupt:
    print("\\nExiting eBPF SUID Monitor.")
