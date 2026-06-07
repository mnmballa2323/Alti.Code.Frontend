#!/usr/bin/python3
from bcc import BPF

# eBPF C program to trace mprotect syscalls to detect W^X (Write XOR Execute) memory violations
bpf_text = """
#include <uapi/linux/ptrace.h>
#include <linux/sched.h>
#include <linux/mm.h>

struct data_t {
    u32 pid;
    u32 uid;
    unsigned long start;
    size_t len;
    unsigned long prot;
    char comm[TASK_COMM_LEN];
};

BPF_PERF_OUTPUT(events);

// Hook sys_mprotect
// Attackers exploiting buffer overflows or injecting shellcode often need to mark 
// a region of memory as both Writable and Executable (W^X violation) so they can 
// write their malicious payload and then jump the instruction pointer to it.
TRACEPOINT_PROBE(syscalls, sys_enter_mprotect) {
    struct data_t data = {};
    
    data.pid = bpf_get_current_pid_tgid() >> 32;
    data.uid = bpf_get_current_uid_gid();
    data.start = args->start;
    data.len = args->len;
    data.prot = args->prot;
    
    bpf_get_current_comm(&data.comm, sizeof(data.comm));
    
    // PROT_WRITE is 0x2, PROT_EXEC is 0x4
    // We want to detect if a process requests memory that is BOTH writable and executable.
    // In secure environments, memory should either be Writable OR Executable, never both (W^X).
    
    #define PROT_WRITE 0x2
    #define PROT_EXEC  0x4
    
    if ((data.prot & PROT_WRITE) && (data.prot & PROT_EXEC)) {
        events.perf_submit(args, &data, sizeof(data));
    }
    
    return 0;
}
"""

print("Compiling and loading eBPF program for W^X Memory Violation Monitoring...")

b = BPF(text=bpf_text)

print("Monitoring for mprotect() Writable+Executable (RWX) memory allocations... (Press Ctrl+C to exit)")

def print_event(cpu, data, size):
    event = b["events"].event(data)
    comm = event.comm.decode('utf-8', 'replace')
    
    # Note: JIT compilers (like V8 for Node.js, or the Java JVM) frequently allocate RWX memory 
    # to compile and execute code on the fly. 
    # We filter out known JIT engines to avoid false positives, focusing on standard binaries.
    jit_engines = ["node", "java", "python", "ruby", "dotnet"]
    
    if comm not in jit_engines:
        print(f"[MEMORY EXPLOIT ALERT] W^X (Write XOR Execute) Violation Detected!")
        print(f"  -> PID: {event.pid}, UID: {event.uid}, Comm: {comm}")
        print(f"  -> Address: {hex(event.start)}, Length: {event.len} bytes")
        print(f"  -> Protection: {hex(event.prot)} (Contains PROT_WRITE | PROT_EXEC)")
        print(f"  -> CRITICAL: Potential Buffer Overflow Shellcode Injection or JIT-Spray Attack in progress!")

b["events"].open_perf_buffer(print_event)

try:
    while True:
        b.perf_buffer_poll()
except KeyboardInterrupt:
    print("\\nExiting eBPF mprotect Monitor.")
