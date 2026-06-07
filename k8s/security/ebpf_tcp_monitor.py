#!/usr/bin/python3
from bcc import BPF
import socket
import struct

# eBPF C program to trace tcp_v4_connect to detect anomalous outbound connections
bpf_text = """
#include <uapi/linux/ptrace.h>
#include <net/sock.h>
#include <bcc/proto.h>

BPF_HASH(currsock, u32, struct sock *);

// Event structure to send to userspace
struct ipv4_data_t {
    u64 ts_us;
    u32 pid;
    u32 uid;
    u32 saddr;
    u32 daddr;
    u16 dport;
    char comm[TASK_COMM_LEN];
};

BPF_PERF_OUTPUT(ipv4_events);

int trace_connect_entry(struct pt_regs *ctx, struct sock *sk) {
    u32 pid = bpf_get_current_pid_tgid() >> 32;
    u32 tid = bpf_get_current_pid_tgid();
    
    // Store socket pointer for retprobe
    currsock.update(&tid, &sk);
    return 0;
};

int trace_connect_return(struct pt_regs *ctx) {
    int ret = PT_REGS_RC(ctx);
    u32 tid = bpf_get_current_pid_tgid();
    
    struct sock **skp = currsock.lookup(&tid);
    if (skp == 0) {
        return 0; // missed entry
    }
    
    if (ret != 0) {
        // connect failed
        currsock.delete(&tid);
        return 0;
    }
    
    struct sock *sk = *skp;
    struct ipv4_data_t data = {};
    
    data.ts_us = bpf_ktime_get_ns() / 1000;
    data.pid = tid;
    data.uid = bpf_get_current_uid_gid();
    bpf_get_current_comm(&data.comm, sizeof(data.comm));
    
    data.saddr = sk->__sk_common.skc_rcv_saddr;
    data.daddr = sk->__sk_common.skc_daddr;
    data.dport = sk->__sk_common.skc_dport;
    
    // Only capture specific potentially anomalous ports (e.g. 22 SSH, 3389 RDP, or non-standard ports)
    u16 dport = ntohs(data.dport);
    if (dport == 22 || dport == 3389 || dport == 4444) {
        ipv4_events.perf_submit(ctx, &data, sizeof(data));
    }
    
    currsock.delete(&tid);
    return 0;
}
"""

print("Compiling and loading eBPF program for TCP outbound connection monitoring...")

b = BPF(text=bpf_text)
b.attach_kprobe(event="tcp_v4_connect", fn_name="trace_connect_entry")
b.attach_kretprobe(event="tcp_v4_connect", fn_name="trace_connect_return")

print("Monitoring outbound TCP connections on anomalous ports (22, 3389, 4444)... (Press Ctrl+C to exit)")

def inet_ntoa(addr):
    return socket.inet_ntoa(struct.pack("<I", addr))

def print_event(cpu, data, size):
    event = b["ipv4_events"].event(data)
    dest_ip = inet_ntoa(event.daddr)
    dest_port = socket.ntohs(event.dport)
    
    print(f"[ANOMALY] Outbound connection detected! PID: {event.pid}, UID: {event.uid}, Comm: {event.comm.decode('utf-8', 'replace')}")
    print(f"          Destination: {dest_ip}:{dest_port}")

b["ipv4_events"].open_perf_buffer(print_event)

try:
    while True:
        b.perf_buffer_poll()
except KeyboardInterrupt:
    print("\\nExiting eBPF TCP Monitor.")
