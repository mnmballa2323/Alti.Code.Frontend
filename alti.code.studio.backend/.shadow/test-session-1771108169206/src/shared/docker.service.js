import Docker from 'dockerode';
import { logger } from './logger.js';
import fs from 'fs';

class DockerService {
    constructor() {
        this.client = null;
        this.isMockMode = false;
        this.init();
    }

    init() {
        try {
            // Auto-detect socket path
            const socketPath = process.platform === 'win32'
                ? '//./pipe/docker_engine'
                : '/var/run/docker.sock';

            // Check if socket exists (basic check, not perfect for named pipes but good heuristic)
            // For Windows named pipes, fs.existsSync might not work as expected, but Dockerode handles connection.
            // We'll try to instantiate and do a ping.

            this.client = new Docker({ socketPath });

            // We can't easily wait for async ping in constructor, 
            // so we'll do a lazy check or just let operations fail into mock mode?
            // Better: assume real, but catch errors in methods.

            // However, to be robust for "check_docker.js", let's verify connectivity.
            // But constructors cannot be async.
            // We'll expose an `ensureReady()` like JobQueueService.

        } catch (error) {
            logger.warn('⚠️ DockerService: Failed to initialize Docker client. Defaulting to MOCK MODE.');
            this.isMockMode = true;
        }
    }

    async ensureReady() {
        if (this.isMockMode) return;

        try {
            await this.client.ping();
            logger.info('✅ DockerService: Connected to Docker Daemon');
        } catch (error) {
            logger.warn(`⚠️ DockerService: Docker Daemon not unreachable (${error.message}). Switching to MOCK MODE.`);
            this.isMockMode = true;
        }
    }

    async listContainers(all = false) {
        await this.ensureReady();

        if (this.isMockMode) {
            logger.info('DockerService (Mock): Listing mock containers');
            return [
                {
                    Id: 'mock-container-123',
                    Names: ['/mock-refactor-agent'],
                    Image: 'refactor-agent:latest',
                    State: 'running',
                    Status: 'Up 2 hours'
                }
            ];
        }

        return this.client.listContainers({ all });
    }

    getContainer(id) {
        if (this.isMockMode) {
            return {
                inspect: async () => ({
                    Id: id,
                    Name: '/mock-container',
                    State: { Running: true }
                }),
                start: async () => logger.info(`DockerService (Mock): Started ${id}`),
                stop: async () => logger.info(`DockerService (Mock): Stopped ${id}`),
                exec: async (opts) => {
                    const cmd = opts.Cmd.join(' ');
                    logger.info(`DockerService (Mock): Executing '${cmd}' in ${id}`);
                    // return a stream-like object or promise depending on how we use it
                    // dockerode exec valid usage:
                    // container.exec(options, function(err, exec) { exec.start(options, ... ) })
                    // simplified for our service:
                    return {
                        start: async () => ({
                            output: 'Mock Output'
                        })
                    };
                }
            };
        }
        return this.client.getContainer(id);
    }

    async ensureEntireContainer() {
        await this.ensureReady();
        if (this.isMockMode) {
            logger.info('DockerService (Mock): Entire CLI container "ready"');
            return;
        }

        // In real implementation, we would list containers, check for 'entire-cli', and start if needed.
        // Since we are likely in mock mode or docker is broken, we skip complex logic here for now.
    }

    async runEntireCommand(args) {
        await this.ensureEntireContainer();

        if (this.isMockMode) {
            const cmd = args.join(' ');
            logger.info(`DockerService (Mock): Running 'entire ${cmd}'`);

            if (args.includes('--version')) {
                return 'entire version 1.0.0 (mock)';
            }
            return `Mock output for: entire ${cmd}`;
        }

        // Real implementation would use exec
        // const container = this.getContainer('entire-cli');
        // ... exec logic ...
        throw new Error('Real Docker execution not fully implemented yet');
    }
}

export const dockerService = new DockerService();
