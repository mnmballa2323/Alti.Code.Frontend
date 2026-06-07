#!/usr/bin/python3
from bcc import BPF

# eBPF C program to trace dynamic kernel instrumentation (register_kprobe)
# to detect advanced Linux Rootkits and unauthorized kernel hooking.
bpf_text = """
#include <uapi/linux/ptrace.h>
#include <linux/sched.h>

struct data_t {
    u32 pid;
    u32 uid;
    char comm[TASK_COMM_LEN];
    // The name of the kernel function the attacker is attempting to hook
    char symbol_name[64];
};

BPF_PERF_OUTPUT(events);

// Hook register_kprobe inside the kernel
// Kprobes are used to dynamically break into any kernel routine. 
// Advanced adversaries and kernel rootkits use Kprobes to hijack syscalls 
// (e.g., hooking sys_getdents64 to hide malicious processes from 'ps' or 'top').
int trace_register_kprobe(struct pt_regs *ctx, void *kp) {
    struct data_t data = {};
    
    data.pid = bpf_get_current_pid_tgid() >> 32;
    data.uid = bpf_get_current_uid_gid();
    
    bpf_get_current_comm(&data.comm, sizeof(data.comm));
    
    // The symbol name of the kprobe is embedded in the struct kprobe pointer passed as an arg.
    // However, safely extracting strings from opaque kernel structs in eBPF is tricky across kernel versions.
    // For this generic monitor, we will alert that a kprobe registration event occurred.
    __builtin_strcpy(data.symbol_name, "KPROBE_REGISTRATION_EVENT");
    
    events.perf_submit(ctx, &data, sizeof(data));
    return 0;
}
"""

print("Compiling and loading eBPF program for Kernel Rootkit (Kprobe) Monitoring...")

b = BPF(text=bpf_text)

# We attach a kprobe to the kernel's own register_kprobe function!
b.attach_kprobe(event="register_kprobe", fn_name="trace_register_kprobe")

print("Monitoring for dynamic Kernel hooking (register_kprobe)... (Press Ctrl+C to exit)")

def print_event(cpu, data, size):
    event = b["events"].event(data)
    comm = event.comm.decode('utf-8', 'replace')
    symbol = event.symbol_name.decode('utf-8', 'replace')
    
    # Ignore legitimate telemetry daemons that use kprobes (like Datadog, Falco, or our own BCC monitors)
    authorized_procs = ["agent", "falco", "tracee", "python3", "python", "bcc"]
    
    if comm not in authorized_procs:
        print(f"[ROOTKIT ALERT] Unauthorized Kernel Kprobe Registration Detected!")
        print(f"  -> PID: {event.pid}, UID: {event.uid}, Comm: {comm}")
        print(f"  -> CRITICAL: A rogue binary is attempting to dynamically hook and rewrite Linux Kernel functions!")
        print(f"  -> Highly indicative of an advanced, stealthy Linux Rootkit attempting to hide processes, files, or network connections.")

b["events"].open_perf_buffer(print_event)

try:
    while True:
        b.perf_buffer_poll()
except KeyboardInterrupt:
    print("\\nExiting eBPF Kprobe Monitor.")
