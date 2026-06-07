#!/usr/bin/python3
from bcc import BPF

# eBPF C program to trace ptrace syscalls to detect process injection / memory reading
bpf_text = """
#include <uapi/linux/ptrace.h>
#include <linux/sched.h>

struct data_t {
    u32 pid;
    u32 uid;
    u32 target_pid;
    long request;
    char comm[TASK_COMM_LEN];
};

BPF_PERF_OUTPUT(events);

// Hook sys_ptrace
TRACEPOINT_PROBE(syscalls, sys_enter_ptrace) {
    struct data_t data = {};
    
    data.pid = bpf_get_current_pid_tgid() >> 32;
    data.uid = bpf_get_current_uid_gid();
    data.request = args->request;
    data.target_pid = args->pid;
    
    bpf_get_current_comm(&data.comm, sizeof(data.comm));
    
    // We send all ptrace requests to userspace for analysis
    events.perf_submit(args, &data, sizeof(data));
    return 0;
}
"""

print("Compiling and loading eBPF program for ptrace (Process Injection) Monitoring...")

b = BPF(text=bpf_text)

print("Monitoring for ptrace() calls... (Press Ctrl+C to exit)")

# PTRACE constants
PTRACE_TRACEME = 0
PTRACE_PEEKTEXT = 1
PTRACE_PEEKDATA = 2
PTRACE_POKETEXT = 4
PTRACE_POKEDATA = 5
PTRACE_CONT = 7
PTRACE_ATTACH = 16

def get_request_name(req):
    req_map = {
        0: "PTRACE_TRACEME",
        1: "PTRACE_PEEKTEXT",
        2: "PTRACE_PEEKDATA",
        4: "PTRACE_POKETEXT",
        5: "PTRACE_POKEDATA",
        7: "PTRACE_CONT",
        16: "PTRACE_ATTACH"
    }
    return req_map.get(req, f"UNKNOWN ({req})")

def print_event(cpu, data, size):
    event = b["events"].event(data)
    comm = event.comm.decode('utf-8', 'replace')
    req_name = get_request_name(event.request)
    
    # In a production Kubernetes node, applications rarely use ptrace except for debuggers (gdb, strace)
    # If a web server or database process starts using ptrace, it's highly indicative of an exploit
    # attempting to inject shellcode into another process or scrape memory for secrets.
    
    if comm not in ["strace", "gdb", "perf", "sysdig"]:
        print(f"[PROCESS INJECTION ALERT] Suspicious ptrace() Call Detected!")
        print(f"  -> Attacker PID: {event.pid}, UID: {event.uid}, Comm: {comm}")
        print(f"  -> Target PID: {event.target_pid}")
        print(f"  -> Request Type: {req_name}")
        
        if event.request in [PTRACE_POKETEXT, PTRACE_POKEDATA]:
            print("  -> CRITICAL: Process is actively overwriting target memory (Shellcode Injection)!")
        elif event.request in [PTRACE_PEEKTEXT, PTRACE_PEEKDATA]:
            print("  -> WARNING: Process is reading target memory (Secret Scraping)!")

b["events"].open_perf_buffer(print_event)

try:
    while True:
        b.perf_buffer_poll()
except KeyboardInterrupt:
    print("\\nExiting eBPF Ptrace Monitor.")
