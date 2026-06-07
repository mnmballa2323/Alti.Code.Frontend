#!/usr/bin/python3
from bcc import BPF

# eBPF C program to trace dup2 syscall to detect potential reverse shells
bpf_text = """
#include <uapi/linux/ptrace.h>
#include <linux/sched.h>
#include <linux/fs.h>

struct data_t {
    u32 pid;
    u32 uid;
    int oldfd;
    int newfd;
    char comm[TASK_COMM_LEN];
};

BPF_PERF_OUTPUT(events);

// hook sys_dup2
TRACEPOINT_PROBE(syscalls, sys_enter_dup2) {
    int oldfd = args->oldfd;
    int newfd = args->newfd;
    
    // Reverse shells typically redirect standard I/O (0, 1, 2) to a socket FD.
    // If the newfd is 0 (stdin), 1 (stdout), or 2 (stderr), it warrants inspection.
    if (newfd == 0 || newfd == 1 || newfd == 2) {
        struct data_t data = {};
        data.pid = bpf_get_current_pid_tgid() >> 32;
        data.uid = bpf_get_current_uid_gid();
        data.oldfd = oldfd;
        data.newfd = newfd;
        bpf_get_current_comm(&data.comm, sizeof(data.comm));
        
        // Filter out highly noisy legitimate processes
        if (data.comm[0] != 'b' || data.comm[1] != 'a' || data.comm[2] != 's' || data.comm[3] != 'h') {
           // We could filter bash, but reverse shells often USE bash.
           // In a real environment, we would correlate this oldfd to a socket struct.
        }
        
        events.perf_submit(args, &data, sizeof(data));
    }
    return 0;
}
"""

print("Compiling and loading eBPF program for Reverse Shell Detection...")

b = BPF(text=bpf_text)

print("Monitoring for suspicious dup2() calls (potential reverse shell I/O redirection)... (Press Ctrl+C to exit)")

def print_event(cpu, data, size):
    event = b["events"].event(data)
    comm = event.comm.decode('utf-8', 'replace')
    
    # We alert specifically on shells (sh, bash, dash, zsh, perl, python, nc) redirecting to 0/1/2
    suspicious_bins = ["sh", "bash", "dash", "zsh", "nc", "netcat", "perl", "python"]
    
    if comm in suspicious_bins:
        print(f"[REVERSE SHELL ALERT] Suspicious I/O Redirection Detected!")
        print(f"  -> PID: {event.pid}, UID: {event.uid}, Comm: {comm}")
        print(f"  -> dup2({event.oldfd}, {event.newfd})")

b["events"].open_perf_buffer(print_event)

try:
    while True:
        b.perf_buffer_poll()
except KeyboardInterrupt:
    print("\\nExiting eBPF Reverse Shell Monitor.")
