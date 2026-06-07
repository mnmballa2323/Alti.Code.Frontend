#!/usr/bin/python3
from bcc import BPF

# eBPF C program to trace module loading syscalls to detect rootkits
bpf_text = """
#include <uapi/linux/ptrace.h>
#include <linux/sched.h>
#include <linux/fs.h>

struct data_t {
    u32 pid;
    u32 uid;
    char comm[TASK_COMM_LEN];
    int is_finit; // 0 for init_module, 1 for finit_module
};

BPF_PERF_OUTPUT(events);

// Hook sys_init_module (loads module from memory)
TRACEPOINT_PROBE(syscalls, sys_enter_init_module) {
    struct data_t data = {};
    data.pid = bpf_get_current_pid_tgid() >> 32;
    data.uid = bpf_get_current_uid_gid();
    bpf_get_current_comm(&data.comm, sizeof(data.comm));
    data.is_finit = 0;
    
    events.perf_submit(args, &data, sizeof(data));
    return 0;
}

// Hook sys_finit_module (loads module from file descriptor)
TRACEPOINT_PROBE(syscalls, sys_enter_finit_module) {
    struct data_t data = {};
    data.pid = bpf_get_current_pid_tgid() >> 32;
    data.uid = bpf_get_current_uid_gid();
    bpf_get_current_comm(&data.comm, sizeof(data.comm));
    data.is_finit = 1;
    
    events.perf_submit(args, &data, sizeof(data));
    return 0;
}
"""

print("Compiling and loading eBPF program for Kernel Module (Rootkit) Monitoring...")

b = BPF(text=bpf_text)

print("Monitoring for init_module() and finit_module() calls... (Press Ctrl+C to exit)")

def print_event(cpu, data, size):
    event = b["events"].event(data)
    comm = event.comm.decode('utf-8', 'replace')
    call_type = "finit_module (from file)" if event.is_finit else "init_module (from memory)"
    
    print(f"[ROOTKIT ALERT] Kernel Module Loading Detected!")
    print(f"  -> PID: {event.pid}, UID: {event.uid}, Comm: {comm}")
    print(f"  -> Syscall: {call_type}")
    
    # In a healthy Kubernetes node, kernel modules are rarely loaded after boot.
    # We alert heavily if the process doing the loading is not a known system daemon.
    if comm not in ["systemd-udevd", "modprobe", "insmod"]:
        print("  -> CRITICAL: Kernel module loaded by unauthorized binary! Immediate investigation required.")

b["events"].open_perf_buffer(print_event)

try:
    while True:
        b.perf_buffer_poll()
except KeyboardInterrupt:
    print("\\nExiting eBPF Module Monitor.")
