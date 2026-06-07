#include <uapi/linux/ptrace.h>
#include <linux/sched.h>
#include <linux/fs.h>

BPF_HASH(execs, u32, u64);

int kprobe__sys_execve(struct pt_regs *ctx, const char __user *filename, const char __user *const __user *argv, const char __user *const __user *envp) {
    u32 pid = bpf_get_current_pid_tgid() >> 32;

    char comm[TASK_COMM_LEN];
    bpf_get_current_comm(&comm, sizeof(comm));

    // Monitor unapproved or suspicious process executions in sensitive pods
    bpf_trace_printk("eBPF Security Alert: sys_execve by PID %d (%s)\\n", pid, comm);
    
    return 0;
}
