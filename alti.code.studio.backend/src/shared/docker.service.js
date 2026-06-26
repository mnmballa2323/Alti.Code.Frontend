/**
 * Copyright (c) 2024 Inso Code
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import Docker from 'dockerode';
import { logger } from './logger.js';
import { gcpContainerService } from './gcpContainer.service.js';
import fs from 'fs';

class DockerService {
  constructor() {
    this.client = null;
    this.isMockMode = false;
    this.init();
  }

  init() {
    if (process.env.GCP_PROJECT_ID) {
      logger.info(
        '☁️ DockerService: Google Cloud environment detected. Using GCP GKE/Cloud Run Sandboxes.',
      );
      return;
    }
    try {
      // Auto-detect socket path
      const socketPath =
        process.platform === 'win32'
          ? '//./pipe/docker_engine'
          : '/var/run/docker.sock';

      this.client = new Docker({ socketPath });
    } catch (error) {
      logger.warn(
        '⚠️ DockerService: Failed to initialize Docker client. Defaulting to MOCK MODE.',
      );
      this.isMockMode = true;
    }
  }

  async ensureReady() {
    if (process.env.GCP_PROJECT_ID) return;
    if (this.isMockMode) return;

    try {
      await this.client.ping();
      logger.info('✅ DockerService: Connected to Docker Daemon');
    } catch (error) {
      logger.warn(
        `⚠️ DockerService: Docker Daemon not unreachable (${error.message}). Switching to MOCK MODE.`,
      );
      this.isMockMode = true;
    }
  }

  async listContainers(all = false) {
    if (process.env.GCP_PROJECT_ID) {
      return gcpContainerService.listContainers(all);
    }
    await this.ensureReady();

    if (this.isMockMode) {
      logger.info('DockerService (Mock): Listing mock containers');
      return [
        {
          Id: 'mock-container-123',
          Names: ['/mock-refactor-agent'],
          Image: 'refactor-agent:latest',
          State: 'running',
          Status: 'Up 2 hours',
        },
      ];
    }

    return this.client.listContainers({ all });
  }

  getContainer(id) {
    if (process.env.GCP_PROJECT_ID) {
      return gcpContainerService.getContainer(id);
    }
    if (this.isMockMode) {
      return {
        inspect: async () => ({
          Id: id,
          Name: '/mock-container',
          State: { Running: true },
        }),
        start: async () => logger.info(`DockerService (Mock): Started ${id}`),
        stop: async () => logger.info(`DockerService (Mock): Stopped ${id}`),
        exec: async opts => {
          const cmd = opts.Cmd.join(' ');
          logger.info(`DockerService (Mock): Executing '${cmd}' in ${id}`);
          return {
            start: async () => ({
              output: 'Mock Output',
            }),
          };
        },
      };
    }
    return this.client.getContainer(id);
  }

  async ensureEntireContainer() {
    if (process.env.GCP_PROJECT_ID) {
      await gcpContainerService.createContainerGroup('entire-cli');
      return;
    }
    await this.ensureReady();
    if (this.isMockMode) {
      logger.info('DockerService (Mock): Entire CLI container "ready"');
      return;
    }
  }

  async runEntireCommand(args) {
    if (process.env.GCP_PROJECT_ID) {
      await this.ensureEntireContainer();
      const container = this.getContainer('entire-cli');
      const execResult = await container.exec({ Cmd: args });
      const execRun = await execResult.start();
      return execRun.output;
    }

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
    throw new Error('Real Docker execution not fully implemented yet');
  }
}

export const dockerService = new DockerService();
