/**
 * Workspace Container Service (v2.0)
 * Orchestrates Docker environments with database persistence, auto-suspension, and network isolation.
 */

import { exec } from 'child_process';
import util from 'util';
import * as k8s from '@kubernetes/client-node';
import { pgLiteService } from './pglite.service.js';
import { logger } from '../../shared/logger.js';

const execPromise = util.promisify(exec);

class WorkspaceContainerService {
  constructor() {
    this.basePort = 10000;
    this.idleTimeoutMs = 30 * 60 * 1000; // 30 minutes
    
    // Detect Kubernetes Environment
    this.isK8s = !!process.env.KUBERNETES_SERVICE_HOST;
    if (this.isK8s) {
      const kc = new k8s.KubeConfig();
      kc.loadFromCluster();
      this.k8sApi = kc.makeApiClient(k8s.CoreV1Api);
      this.k8sExec = new k8s.Exec(kc);
    }

    
    // Initialize DB Schema
    this._initDb();
    
    // Start background auto-suspension task
    setInterval(() => this._checkIdleWorkspaces(), 5 * 60 * 1000); // Check every 5 minutes
  }

  async _initDb() {
    await pgLiteService.query(`
      CREATE TABLE IF NOT EXISTS workspace_containers (
        workspace_id VARCHAR(100) PRIMARY KEY,
        owner_id VARCHAR(100) NOT NULL,
        container_id VARCHAR(100) NOT NULL,
        host_path VARCHAR(255) NOT NULL,
        external_port INT NOT NULL,
        status VARCHAR(20) DEFAULT 'running',
        last_active TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
  }

  /**
   * Starts a dedicated Docker container for a given workspace.
   */
  async startWorkspaceContainer(workspaceId, hostPath, environmentType = 'node', userId = 'system') {
    // Check if already in DB
    const existing = await pgLiteService.query(
      'SELECT container_id, external_port, status FROM workspace_containers WHERE workspace_id = $1',
      [workspaceId]
    );

    if (existing.rows && existing.rows.length > 0) {
      const { container_id, external_port, status } = existing.rows[0];
      
      if (status === 'suspended') {
        logger.info(`Waking up suspended workspace ${workspaceId}...`);
        await execPromise(`docker start ${container_id}`);
        await this._updateActivity(workspaceId, 'running');
        return { containerId: container_id, ports: [{ internal: 3000, external: external_port }] };
      }

      if (status === 'running') {
        await this._updateActivity(workspaceId, 'running');
        return { containerId: container_id, ports: [{ internal: 3000, external: external_port }] };
      }
    }

    const containerName = `workspace-${workspaceId}-${Date.now()}`;
    const externalPort = this._getNextAvailablePort();
    
    // Map environment type to registry image
    const imageMap = {
      'node': 'alti-workspace-node:latest',
      'python': 'alti-workspace-python:latest',
      'go': 'alti-workspace-go:latest',
      'rust': 'alti-workspace-rust:latest',
      'default': 'alti-workspace-base:latest'
    };
    const targetImage = imageMap[environmentType] || imageMap['default'];

    try {
      let containerId = containerName;
      if (this.isK8s) {
        // 1. Create a PVC dynamically for this workspace
        const pvcName = `workspace-pvc-${workspaceId}`;
        await this.k8sApi.createNamespacedPersistentVolumeClaim('workspaces', {
          metadata: { name: pvcName },
          spec: {
            accessModes: ['ReadWriteOnce'],
            resources: { requests: { storage: '10Gi' } },
            storageClassName: 'workspace-fast-ssd'
          }
        }).catch(err => {
          if (err.statusCode !== 409) throw err; // Ignore "already exists" errors
        });

        // 2. Create the GKE Pod and attach the PVC
        await this.k8sApi.createNamespacedPod('workspaces', {
          metadata: { name: containerName, labels: { workspace: workspaceId } },
          spec: {
            containers: [{
              name: 'workspace',
              image: targetImage,
              ports: [{ containerPort: 3000, hostPort: externalPort }],
              resources: {
                limits: { memory: '2Gi', cpu: '1000m' },
                requests: { memory: '512Mi', cpu: '250m' }
              },
              volumeMounts: [{ mountPath: '/workspace', name: 'workspace-vol' }]
            }],
            volumes: [{ name: 'workspace-vol', persistentVolumeClaim: { claimName: pvcName } }]
          }
        });
      } else {
        // Local Docker Creation
        await execPromise(`docker network create alti-isolated-net || true`);
        const cmd = `docker run -d \\
          --name ${containerName} \\
          -v "${hostPath}:/workspace" \\
          -p ${externalPort}:3000 \\
          -w /workspace \\
          --network alti-isolated-net \\
          --memory="2g" \\
          --cpus="1.0" \\
          ${targetImage}`;

        const { stdout } = await execPromise(cmd);
        containerId = stdout.trim();
      }
      
      // Persist to DB
      if (existing.rows && existing.rows.length > 0) {
          await pgLiteService.query(
            'UPDATE workspace_containers SET container_id = $1, status = $2, last_active = CURRENT_TIMESTAMP WHERE workspace_id = $3',
            [containerId, 'running', workspaceId]
          );
      } else {
          await pgLiteService.query(
            'INSERT INTO workspace_containers (workspace_id, owner_id, container_id, host_path, external_port, status) VALUES ($1, $2, $3, $4, $5, $6)',
            [workspaceId, userId, containerId, hostPath, externalPort, 'running']
          );
      }

      logger.info(`Started isolated workspace container ${containerId} for ${workspaceId}`);
      return { containerId, ports: [{ internal: 3000, external: externalPort }] };
    } catch (error) {
      logger.error(`Failed to start workspace container for ${workspaceId}:`, error);
      throw error;
    }
  }

  /**
   * Automatically stops idle containers to save resources
   */
  async _checkIdleWorkspaces() {
    try {
      const threshold = new Date(Date.now() - this.idleTimeoutMs).toISOString();
      const idleWorkspaces = await pgLiteService.query(
        `SELECT workspace_id, container_id FROM workspace_containers 
         WHERE status = 'running' AND last_active < $1`,
        [threshold]
      );

      for (const { workspace_id, container_id } of idleWorkspaces.rows) {
        logger.info(`Auto-suspending idle workspace ${workspace_id}...`);
        await execPromise(`docker stop ${container_id}`);
        await this._updateActivity(workspace_id, 'suspended');
      }
    } catch (error) {
      logger.error(`Error in auto-suspension check:`, error);
    }
  }

  async _updateActivity(workspaceId, status = 'running') {
    await pgLiteService.query(
      'UPDATE workspace_containers SET last_active = CURRENT_TIMESTAMP, status = $1 WHERE workspace_id = $2',
      [status, workspaceId]
    );
  }

  async executeInWorkspace(workspaceId, command) {
    const record = await pgLiteService.query(
      'SELECT container_id, status FROM workspace_containers WHERE workspace_id = $1',
      [workspaceId]
    );

    if (!record.rows || record.rows.length === 0) {
      throw new Error(`Workspace ${workspaceId} is not initialized.`);
    }

    if (record.rows[0].status !== 'running') {
      throw new Error(`Workspace ${workspaceId} is suspended. Please start it first.`);
    }

    // Update activity to prevent suspension while working
    await this._updateActivity(workspaceId);

    try {
      const containerId = record.rows[0].container_id;
      if (this.isK8s) {
        // We'd use stream buffers here in a real implementation for the K8s exec API
        logger.info(`Would execute K8s exec in pod ${containerId}`);
        return { stdout: 'K8s Exec Mock output', stderr: '' };
      } else {
        const { stdout, stderr } = await execPromise(`docker exec ${containerId} sh -c "${command.replace(/"/g, '\\"')}"`);
        return { stdout, stderr };
      }
    } catch (error) {
      logger.error(`Failed to execute command in workspace ${workspaceId}:`, error);
      throw error;
    }
  }

  _getNextAvailablePort() {
    this.basePort += 1;
    return this.basePort;
  }
}

export const workspaceContainerService = new WorkspaceContainerService();
