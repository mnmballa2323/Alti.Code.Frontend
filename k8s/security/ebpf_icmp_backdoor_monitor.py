#!/usr/bin/python3
from bcc import BPF

# eBPF C program to trace incoming ICMP packets to detect magic ping backdoors
bpf_text = """
#include <uapi/linux/ptrace.h>
#include <net/sock.h>
#include <bcc/proto.h>
#include <linux/ip.h>
#include <linux/icmp.h>

struct data_t {
    u32 src_ip;
    u32 dst_ip;
    u16 data_len;
    u8 icmp_type;
    u8 icmp_code;
};

BPF_PERF_OUTPUT(events);

// Hook into icmp_rcv which processes incoming ICMP packets
int trace_icmp_rcv(struct pt_regs *ctx, struct sk_buff *skb) {
    struct data_t data = {};
    
    // Extract IP header
    struct iphdr ip;
    bpf_probe_read_kernel(&ip, sizeof(ip), skb->head + skb->network_header);
    
    // Extract ICMP header
    struct icmphdr icmp;
    bpf_probe_read_kernel(&icmp, sizeof(icmp), skb->head + skb->transport_header);
    
    data.src_ip = ip.saddr;
    data.dst_ip = ip.daddr;
    data.icmp_type = icmp.type;
    data.icmp_code = icmp.code;
    
    // Calculate the length of the ICMP payload (Total IP length - IP header - ICMP header)
    // Note: This is an approximation for alerting purposes
    u16 tot_len = ntohs(ip.tot_len);
    u16 ip_hlen = ip.ihl * 4;
    if (tot_len > ip_hlen + sizeof(icmp)) {
        data.data_len = tot_len - ip_hlen - sizeof(icmp);
    } else {
        data.data_len = 0;
    }
    
    // We are particularly interested in Echo Requests (type 8) with unusually large payloads
    // Standard ping payloads are typically 56 or 64 bytes.
    if (data.icmp_type == ICMP_ECHO && data.data_len > 128) {
        events.perf_submit(ctx, &data, sizeof(data));
    }
    
    return 0;
}
"""

print("Compiling and loading eBPF program for ICMP Magic Ping Backdoor Monitoring...")

b = BPF(text=bpf_text)
# Attach to the kernel function responsible for receiving ICMP packets
b.attach_kprobe(event="icmp_rcv", fn_name="trace_icmp_rcv")

print("Monitoring for anomalous ICMP Echo Requests (pings)... (Press Ctrl+C to exit)")

def int_to_ip(ip_int):
    import struct
    import socket
    return socket.inet_ntoa(struct.pack("<L", ip_int))

def print_event(cpu, data, size):
    event = b["events"].event(data)
    src_ip = int_to_ip(event.src_ip)
    dst_ip = int_to_ip(event.dst_ip)
    
    print(f"[ICMP BACKDOOR ALERT] Anomalous Ping Detected!")
    print(f"  -> Source IP: {src_ip}")
    print(f"  -> Target IP: {dst_ip}")
    print(f"  -> Payload Size: {event.data_len} bytes")
    print(f"  -> CRITICAL: Payload size significantly exceeds standard ICMP frames. Possible covert C2 channel or exfiltration attempt!")

b["events"].open_perf_buffer(print_event)

try:
    while True:
        b.perf_buffer_poll()
except KeyboardInterrupt:
    print("\\nExiting eBPF ICMP Monitor.")
