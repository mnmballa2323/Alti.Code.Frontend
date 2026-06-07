#!/usr/bin/python3
from bcc import BPF

# eBPF C program to trace vfs_write specifically targeting the Magic SysRq trigger
bpf_text = """
#include <uapi/linux/ptrace.h>
#include <linux/fs.h>
#include <linux/sched.h>
#include <linux/dcache.h>

struct data_t {
    u32 pid;
    u32 uid;
    char comm[TASK_COMM_LEN];
    char trigger_char;
};

BPF_PERF_OUTPUT(events);

// We hook the vfs_write function. 
// A more targeted approach is to hook write_sysrq_trigger directly if available, 
// but hooking vfs_write and checking the filename is a generic approach.
// For eBPF simplicity without string manipulation overhead, we hook sysrq_write directly
// which is the handler for /proc/sysrq-trigger.

// The kernel function that handles writes to /proc/sysrq-trigger is `write_sysrq_trigger`
// Hooking this is extremely efficient and exact.
int trace_write_sysrq_trigger(struct pt_regs *ctx, struct file *file, const char __user *buf, size_t count) {
    struct data_t data = {};
    
    data.pid = bpf_get_current_pid_tgid() >> 32;
    data.uid = bpf_get_current_uid_gid();
    bpf_get_current_comm(&data.comm, sizeof(data.comm));
    
    // Read the first character the user is attempting to write (the sysrq command)
    if (count > 0) {
        bpf_probe_read_user(&data.trigger_char, 1, buf);
    } else {
        data.trigger_char = '?';
    }
    
    events.perf_submit(ctx, &data, sizeof(data));
    return 0;
}
"""

print("Compiling and loading eBPF program for Magic SysRq Monitoring...")

b = BPF(text=bpf_text)

# Attach to the specific procfs write handler for sysrq
b.attach_kprobe(event="write_sysrq_trigger", fn_name="trace_write_sysrq_trigger")

print("Monitoring for Magic SysRq abuse (echo > /proc/sysrq-trigger)... (Press Ctrl+C to exit)")

def print_event(cpu, data, size):
    event = b["events"].event(data)
    comm = event.comm.decode('utf-8', 'replace')
    trigger = chr(event.trigger_char)
    
    # Map SysRq characters to their kernel actions for better alerting context
    sysrq_map = {
        'b': 'Immediate reboot without sync or unmount',
        'c': 'Crash the system (trigger a kernel panic)',
        'e': 'Send SIGTERM to all processes, except init',
        'f': 'Call the OOM killer to kill a memory hog process',
        'i': 'Send SIGKILL to all processes, except init',
        'o': 'Shut off the system',
        's': 'Sync all mounted filesystems',
        'u': 'Remount all mounted filesystems read-only'
    }
    
    action = sysrq_map.get(trigger, 'Unknown Kernel Action')
    
    print(f"[SYSRQ ABUSE ALERT] Unauthorized Kernel Magic SysRq Execution!")
    print(f"  -> PID: {event.pid}, UID: {event.uid}, Comm: {comm}")
    print(f"  -> Trigger Character: '{trigger}' ({action})")
    print(f"  -> CRITICAL: A rogue binary or attacker is attempting to execute low-level kernel interrupts.")
    if trigger == 'c':
        print(f"  -> SEVERITY: MAXIMUM. Attacker is intentionally causing a Kernel Panic to induce a Denial of Service!")

b["events"].open_perf_buffer(print_event)

try:
    while True:
        b.perf_buffer_poll()
except KeyboardInterrupt:
    print("\\nExiting eBPF SysRq Monitor.")
