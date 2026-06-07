#include <uapi/linux/ptrace.h>
#include <linux/sched.h>

BPF_HASH(execs, u64, u64);

int kprobe__sys_execve(struct pt_regs *ctx, const char __user *filename, const char __user *const __user *argv, const char __user *const __user *envp) {
    u64 pid = bpf_get_current_pid_tgid() >> 32;
    u64 zero = 0, *val;

    val = execs.lookup_or_init(&pid, &zero);
    (*val)++;

    bpf_trace_printk("eBPF Security Alert: Execve called by PID %d\\n", pid);
    return 0;
}
