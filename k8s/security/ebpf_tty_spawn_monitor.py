#!/usr/bin/python3
from bcc import BPF

# eBPF C program to trace openat syscalls targeting /dev/ptmx (Pseudo-Terminal Multiplexer)
bpf_text = """
#include <uapi/linux/ptrace.h>
#include <linux/fs.h>
#include <linux/sched.h>

struct data_t {
    u32 pid;
    u32 uid;
    char comm[TASK_COMM_LEN];
    char filename[NAME_MAX];
};

BPF_PERF_OUTPUT(events);

// Hook sys_openat
// Attackers use pseudo-terminals (PTYs) to upgrade their basic, restricted reverse shells 
// into fully interactive TTY sessions. Opening /dev/ptmx is the standard kernel mechanism 
// to allocate a new PTY master/slave pair.
TRACEPOINT_PROBE(syscalls, sys_enter_openat) {
    struct data_t data = {};
    
    data.pid = bpf_get_current_pid_tgid() >> 32;
    data.uid = bpf_get_current_uid_gid();
    
    bpf_get_current_comm(&data.comm, sizeof(data.comm));
    
    // The filename is passed in the 2nd argument of openat
    bpf_probe_read_user_str(&data.filename, sizeof(data.filename), args->filename);
    
    // 0x70746d78 is 'p', 't', 'm', 'x' (in little endian, but string matching in eBPF C is tricky)
    // We will pass the string up to userspace to evaluate for /dev/ptmx
    // to keep the eBPF program fast and avoid complex string comparisons in kernel space.
    events.perf_submit(args, &data, sizeof(data));
    
    return 0;
}
"""

print("Compiling and loading eBPF program for Interactive PTY/TTY Spawning Monitoring...")

b = BPF(text=bpf_text)

print("Monitoring for processes opening /dev/ptmx (Reverse Shell Upgrades)... (Press Ctrl+C to exit)")

def print_event(cpu, data, size):
    event = b["events"].event(data)
    comm = event.comm.decode('utf-8', 'replace')
    filename = event.filename.decode('utf-8', 'replace')
    
    # We strictly filter for the PTY multiplexer device
    if filename == "/dev/ptmx" or filename == "/dev/tty":
        
        # Legitimate container runtimes or SSH daemons open PTYs constantly.
        # We only care when an unexpected binary (like a web server or python app) 
        # suddenly tries to spawn an interactive terminal!
        legitimate_ttys = ["sshd", "containerd-shim", "docker-runc", "runc", "bash", "zsh", "tmux", "screen"]
        
        if comm not in legitimate_ttys:
            print(f"[REVERSE SHELL UPGRADE ALERT] Interactive PTY Spawning Detected!")
            print(f"  -> PID: {event.pid}, UID: {event.uid}, Comm: {comm}")
            print(f"  -> Target Device: {filename}")
            print(f"  -> CRITICAL: A web application or microservice just attempted to spawn a fully interactive terminal session!")

b["events"].open_perf_buffer(print_event)

try:
    while True:
        b.perf_buffer_poll()
except KeyboardInterrupt:
    print("\\nExiting eBPF PTY Monitor.")
