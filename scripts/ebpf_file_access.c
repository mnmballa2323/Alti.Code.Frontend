#include <uapi/linux/ptrace.h>
#include <linux/sched.h>
#include <linux/fs.h>

BPF_HASH(file_reads, u32, u64);

int kprobe__vfs_read(struct pt_regs *ctx, struct file *file, char __user *buf, size_t count, loff_t *pos) {
    u32 pid = bpf_get_current_pid_tgid() >> 32;

    // Filter to only trace specific restricted directories or patterns, 
    // for this script we trace all VFS reads and output PID.
    // In production, attach to specific file dentry.
    
    bpf_trace_printk("eBPF Security Alert: VFS Read by PID %d\\n", pid);
    
    return 0;
}
