#!/usr/bin/python3
from bcc import BPF

# eBPF C program to trace Linux Kernel Keyring access (add_key, request_key, keyctl)
bpf_text = """
#include <uapi/linux/ptrace.h>
#include <linux/sched.h>
#include <linux/key.h>

struct data_t {
    u32 pid;
    u32 uid;
    int syscall_type; // 1 = add_key, 2 = request_key, 3 = keyctl
    char comm[TASK_COMM_LEN];
    char type_name[32];
    char desc_name[64];
};

BPF_PERF_OUTPUT(events);

// Hook sys_add_key
// Used to add or update a key in the kernel's key management facility.
TRACEPOINT_PROBE(syscalls, sys_enter_add_key) {
    struct data_t data = {};
    
    data.pid = bpf_get_current_pid_tgid() >> 32;
    data.uid = bpf_get_current_uid_gid();
    data.syscall_type = 1;
    
    bpf_get_current_comm(&data.comm, sizeof(data.comm));
    
    bpf_probe_read_user_str(&data.type_name, sizeof(data.type_name), args->_type);
    bpf_probe_read_user_str(&data.desc_name, sizeof(data.desc_name), args->_description);
    
    events.perf_submit(args, &data, sizeof(data));
    return 0;
}

// Hook sys_request_key
// Used by attackers to extract existing keys (like disk encryption passwords or AFS tokens) from the kernel
TRACEPOINT_PROBE(syscalls, sys_enter_request_key) {
    struct data_t data = {};
    
    data.pid = bpf_get_current_pid_tgid() >> 32;
    data.uid = bpf_get_current_uid_gid();
    data.syscall_type = 2;
    
    bpf_get_current_comm(&data.comm, sizeof(data.comm));
    
    bpf_probe_read_user_str(&data.type_name, sizeof(data.type_name), args->_type);
    bpf_probe_read_user_str(&data.desc_name, sizeof(data.desc_name), args->_description);
    
    events.perf_submit(args, &data, sizeof(data));
    return 0;
}

// Hook sys_keyctl
// The Swiss army knife for keyring management. Can read payloads, link/unlink keys, etc.
TRACEPOINT_PROBE(syscalls, sys_enter_keyctl) {
    struct data_t data = {};
    
    data.pid = bpf_get_current_pid_tgid() >> 32;
    data.uid = bpf_get_current_uid_gid();
    data.syscall_type = 3;
    
    bpf_get_current_comm(&data.comm, sizeof(data.comm));
    
    // keyctl doesn't take strings directly for type/desc, it operates on Key IDs.
    // We just alert that keyctl was invoked by a suspicious process.
    __builtin_strcpy(data.type_name, "KEYCTL_OP");
    
    events.perf_submit(args, &data, sizeof(data));
    return 0;
}
"""

print("Compiling and loading eBPF program for Kernel Keyring Monitoring...")

b = BPF(text=bpf_text)

print("Monitoring for Keyring syscalls (add_key, request_key, keyctl)... (Press Ctrl+C to exit)")

def print_event(cpu, data, size):
    event = b["events"].event(data)
    comm = event.comm.decode('utf-8', 'replace')
    type_name = event.type_name.decode('utf-8', 'replace')
    desc_name = event.desc_name.decode('utf-8', 'replace')
    
    # Authorized System processes that legitimately interact with the Kernel Keyring
    # e.g., sshd, systemd, key.dns_resolver, eCryptfs
    authorized_procs = ["systemd", "sshd", "docker", "dockerd", "containerd", "kubelet", "crio", "mount", "dnsmasq"]
    
    if comm not in authorized_procs:
        syscall_map = {1: "add_key", 2: "request_key", 3: "keyctl"}
        sys_name = syscall_map.get(event.syscall_type, "UNKNOWN")
        
        print(f"[KEYRING TAMPERING ALERT] Unauthorized Kernel Keyring Access Detected!")
        print(f"  -> PID: {event.pid}, UID: {event.uid}, Comm: {comm}")
        print(f"  -> Syscall: {sys_name}")
        if event.syscall_type != 3:
            print(f"  -> Key Type: {type_name}, Description: {desc_name}")
        print(f"  -> CRITICAL: Process is attempting to steal or tamper with highly sensitive Kernel memory keys (e.g., Disk Encryption, Kerberos)!")

b["events"].open_perf_buffer(print_event)

try:
    while True:
        b.perf_buffer_poll()
except KeyboardInterrupt:
    print("\\nExiting eBPF Keyring Monitor.")
