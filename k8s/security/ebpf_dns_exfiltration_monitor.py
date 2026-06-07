#!/usr/bin/python3
from bcc import BPF
import socket
import struct

# eBPF C program to trace raw UDP packets targeting Port 53 (DNS)
# This acts as an active threat detection tripwire for Data Exfiltration and C2 Beacons.
bpf_text = """
#include <uapi/linux/ptrace.h>
#include <net/sock.h>
#include <bcc/proto.h>
#include <linux/sched.h>

struct data_t {
    u32 pid;
    u32 uid;
    char comm[TASK_COMM_LEN];
    u32 daddr; // Destination IP Address
    u16 dport; // Destination Port
};

BPF_PERF_OUTPUT(events);

// Hook the kernel's udp_sendmsg function
// We inspect every single UDP packet leaving a process.
int trace_udp_sendmsg(struct pt_regs *ctx, struct sock *sk, struct msghdr *msg, size_t len) {
    struct data_t data = {};
    
    // Check if family is IPv4
    u16 family = sk->__sk_common.skc_family;
    if (family != AF_INET) {
        return 0;
    }
    
    // Extract destination port and IP address
    u16 dport = sk->__sk_common.skc_dport;
    u32 daddr = sk->__sk_common.skc_daddr;
    
    // The port is in network byte order. ntohs(53) == 13568
    if (ntohs(dport) == 53) {
        data.pid = bpf_get_current_pid_tgid() >> 32;
        data.uid = bpf_get_current_uid_gid();
        bpf_get_current_comm(&data.comm, sizeof(data.comm));
        
        data.daddr = daddr;
        data.dport = ntohs(dport);
        
        events.perf_submit(ctx, &data, sizeof(data));
    }
    
    return 0;
}
"""

print("Compiling and loading eBPF program for DNS Exfiltration Monitoring...")

b = BPF(text=bpf_text)
b.attach_kprobe(event="udp_sendmsg", fn_name="trace_udp_sendmsg")

print("Monitoring for suspicious DNS (UDP/53) traffic... (Press Ctrl+C to exit)")

# The internal Kubernetes CoreDNS service IP (e.g., 10.96.0.10)
# In a real environment, this is dynamically retrieved from the node's /etc/resolv.conf
# We use a placeholder here for the cluster DNS IP range.
INTERNAL_DNS_PREFIX = "10." 

def print_event(cpu, data, size):
    event = b["events"].event(data)
    comm = event.comm.decode('utf-8', 'replace')
    
    # Convert integer IP to human readable string
    daddr_str = socket.inet_ntoa(struct.pack("<I", event.daddr))
    
    # Authorized applications that legitimately perform DNS lookups
    # NOTE: Even authorized apps should ONLY talk to the internal CoreDNS IPs!
    
    # If the destination IP is NOT our internal Kubernetes DNS, it's a massive red flag.
    # Malware (like cryptominers or C2 agents) often hardcode 8.8.8.8 or 1.1.1.1 to bypass
    # internal DNS logging and DNS sinkholes.
    if not daddr_str.startswith(INTERNAL_DNS_PREFIX):
        
        # Exclude legitimate daemonsets that might talk externally (like node-local-dns caching)
        if comm not in ["node-cache", "coredns"]:
            print(f"[DNS EXFILTRATION ALERT] Rogue External DNS Resolution Detected!")
            print(f"  -> PID: {event.pid}, UID: {event.uid}, Comm: {comm}")
            print(f"  -> Target DNS Server: {daddr_str}:{event.dport}")
            print(f"  -> CRITICAL: A microservice is attempting to contact an external public DNS server directly!")
            print(f"  -> This strongly indicates malware attempting to establish Command & Control (C2) or exfiltrating data via DNS tunneling.")

b["events"].open_perf_buffer(print_event)

try:
    while True:
        b.perf_buffer_poll()
except KeyboardInterrupt:
    print("\\nExiting eBPF DNS Monitor.")
