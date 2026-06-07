#!/usr/bin/python3
from bcc import BPF

# eBPF C program to trace dynamic userspace instrumentation (uprobe_register)
# to detect attackers hooking OpenSSL/Golang TLS functions to steal plaintext HTTPS data.
bpf_text = """
#include <uapi/linux/ptrace.h>
#include <linux/sched.h>
#include <linux/fs.h>
#include <linux/dcache.h>

struct data_t {
    u32 pid;
    u32 uid;
    char comm[TASK_COMM_LEN];
    // The inode/path to the binary/library being hooked (e.g., libssl.so)
    unsigned long inode_num;
    unsigned long offset;
};

BPF_PERF_OUTPUT(events);

// Hook uprobe_register
// Uprobes (Userspace Probes) allow eBPF programs to break into any userspace application.
// A classic advanced attack is to attach a uprobe to OpenSSL's SSL_read and SSL_write functions.
// This allows the attacker to dump passwords and credit cards in plaintext *before* they 
// are encrypted and sent over the network, completely bypassing TLS/HTTPS!
int trace_uprobe_register(struct pt_regs *ctx, struct inode *inode, loff_t offset, void *uc) {
    struct data_t data = {};
    
    data.pid = bpf_get_current_pid_tgid() >> 32;
    data.uid = bpf_get_current_uid_gid();
    
    bpf_get_current_comm(&data.comm, sizeof(data.comm));
    
    data.inode_num = inode->i_ino;
    data.offset = offset;
    
    events.perf_submit(ctx, &data, sizeof(data));
    return 0;
}
"""

print("Compiling and loading eBPF program for Userspace TLS/SSL Hooking (Uprobe) Monitoring...")

b = BPF(text=bpf_text)

# We attach a kprobe to the kernel's internal uprobe_register function
b.attach_kprobe(event="uprobe_register", fn_name="trace_uprobe_register")

print("Monitoring for Userspace dynamic hooking (uprobe_register)... (Press Ctrl+C to exit)")

def print_event(cpu, data, size):
    event = b["events"].event(data)
    comm = event.comm.decode('utf-8', 'replace')
    
    # Ignore legitimate telemetry or profiling daemons (like Pixie, Tetragon, or BCC tools)
    authorized_procs = ["pixie-agent", "pem", "tetragon", "bcc", "python3", "bpftrace"]
    
    if comm not in authorized_procs:
        print(f"[TLS HOOKING ALERT] Unauthorized Userspace Uprobe Registration Detected!")
        print(f"  -> PID: {event.pid}, UID: {event.uid}, Comm: {comm}")
        print(f"  -> Target Inode: {event.inode_num}, Binary Offset: {hex(event.offset)}")
        print(f"  -> CRITICAL: A rogue binary is attempting to dynamically hook a userspace application!")
        print(f"  -> WARNING: If the target is 'libssl.so', the attacker is actively stealing plaintext HTTPS payloads!")

b["events"].open_perf_buffer(print_event)

try:
    while True:
        b.perf_buffer_poll()
except KeyboardInterrupt:
    print("\\nExiting eBPF Uprobe Monitor.")
