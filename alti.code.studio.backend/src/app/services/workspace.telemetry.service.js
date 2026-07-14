/**
 * Workspace Telemetry Service
 * Collects real-time metrics (CPU, RAM) from Docker containers or Kubernetes Pods.
 */

import { exec } from 'child_process';
import util from 'util';
import * as k8s from '@kubernetes/client-node';
import { pgLiteService } from './pglite.service.js';
import { logger } from '../../shared/logger.js';

const execPromise = util.promisify(exec);

class WorkspaceTelemetryService {
  constructor() {
    this.isK8s = !!process.env.KUBERNETES_SERVICE_HOST;
    if (this.isK8s) {
      const kc = new k8s.KubeConfig();
      kc.loadFromCluster();
      // Metrics API client for Kubernetes
      this.metricsClient = new k8s.Metrics(kc);
    }
  }

  async getMetrics(workspaceId) {
    const record = await pgLiteService.query(
      'SELECT container_id, status FROM workspace_containers WHERE workspace_id = $1',
      [workspaceId]
    );

    if (!record.rows || record.rows.length === 0) {
      throw new Error('Workspace not found');
    }

    if (record.rows[0].status !== 'running') {
      return { cpuUsage: '0%', memUsage: '0MiB', status: 'suspended' };
    }

    const containerId = record.rows[0].container_id;

    if (this.isK8s) {
      return await this._getK8sMetrics(containerId, workspaceId);
    } else {
      return await this._getDockerMetrics(containerId);
    }
  }

  async _getK8sMetrics(podName, workspaceId) {
    try {
      const metrics = await this.metricsClient.getPodMetrics('workspaces', podName);
      if (metrics.containers && metrics.containers.length > 0) {
        const usage = metrics.containers[0].usage;
        return {
          cpuUsage: usage.cpu, // e.g., '100m'
          memUsage: usage.memory, // e.g., '512Mi'
          status: 'running'
        };
      }
      return { cpuUsage: 'N/A', memUsage: 'N/A', status: 'running' };
    } catch (error) {
      logger.error(`Failed to get K8s metrics for ${workspaceId}:`, error);
      return { cpuUsage: 'Error', memUsage: 'Error', status: 'unknown' };
    }
  }

  async _getDockerMetrics(containerId) {
    try {
      const { stdout } = await execPromise(`docker stats ${containerId} --no-stream --format "{{.CPUPerc}}|{{.MemUsage}}"`);
      const [cpuUsage, memUsage] = stdout.trim().split('|');
      return {
        cpuUsage: cpuUsage || '0%',
        memUsage: memUsage ? memUsage.split(' / ')[0] : '0MiB', // Extract just the usage part
        status: 'running'
      };
    } catch (error) {
      logger.error(`Failed to get Docker metrics for ${containerId}:`, error);
      return { cpuUsage: 'Error', memUsage: 'Error', status: 'unknown' };
    }
  }
}

export const workspaceTelemetryService = new WorkspaceTelemetryService();
