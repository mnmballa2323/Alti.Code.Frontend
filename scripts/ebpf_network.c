#include <uapi/linux/ptrace.h>
#include <net/sock.h>
#include <bcc/proto.h>

BPF_HASH(connections, u32, u64);

int kretprobe__tcp_v4_connect(struct pt_regs *ctx) {
    struct sock *sk = (struct sock *) PT_REGS_PARM1(ctx);
    u32 pid = bpf_get_current_pid_tgid() >> 32;
    
    u32 daddr = sk->__sk_common.skc_daddr;
    u16 dport = sk->__sk_common.skc_dport;

    bpf_trace_printk("eBPF Security Alert: TCP Connect by PID %d to %pI4:%d\\n", pid, &daddr, ntohs(dport));
    
    return 0;
}
