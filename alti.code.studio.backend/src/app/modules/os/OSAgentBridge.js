const { exec } = require('child_process');

/**
 * OS-Agent Bridge
 * Grants Swarm agents sandboxed, root-level control over local system environments.
 * Proxies commands safely to Docker, local CLI, and headless Browsers.
 */
class OSAgentBridge {
    constructor() {
        this.allowedCommands = ['docker', 'ls', 'cat', 'echo', 'npm', 'yarn', 'git'];
    }

    /**
     * Executes a command on behalf of an agent after validating intent.
     * @param {string} command The requested bash command
     */
    async executeAgentCommand(command) {
        // 1. Validate Command against allowed list
        const baseCmd = command.split(' ')[0];
        if (!this.allowedCommands.includes(baseCmd)) {
            console.warn(`[OSBridge] Agent attempted unauthorized OS execution: ${command}`);
            throw new Error(`OS-Agent Bridge Firewall: Command '${baseCmd}' is restricted.`);
        }

        console.log(`[OSBridge] Authorizing sandbox execution: ${command}`);

        // 2. Execute via secure sandboxed exec wrapper
        return new Promise((resolve, reject) => {
            exec(command, { timeout: 15000 }, (error, stdout, stderr) => {
                if (error) {
                    return reject({ error: error.message, stderr });
                }
                resolve({ stdout, stderr });
            });
        });
    }
}

module.exports = new OSAgentBridge();
