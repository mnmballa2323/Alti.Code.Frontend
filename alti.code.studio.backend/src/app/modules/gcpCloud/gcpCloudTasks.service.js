import { logger } from '../../../shared/logger.js';

class GcpCloudTasksService {
  constructor() {
    this.client = null;
    this.projectId = process.env.GCP_PROJECT_ID || process.env.GCLOUD_PROJECT;
    this.region = process.env.GCP_REGION || 'us-central1';
    this.isInitialized = false;
    this._init();
  }

  async _init() {
    if (process.env.NODE_ENV === 'test' && process.env.GCP_REAL_SERVICES !== 'true') return;
    try {
      if (process.env.GOOGLE_APPLICATION_CREDENTIALS || this.projectId) {
        const { CloudTasksClient } = await import('@google-cloud/tasks');
        this.client = new CloudTasksClient();
        this.isInitialized = true;
        logger.info('✅ Google Cloud Tasks: SDK initialized');
      }
    } catch (e) {
      logger.warn(`⚠️ Google Cloud Tasks init failed: ${e.message}`);
    }
  }

  /**
   * Create an HTTP task in a Cloud Tasks queue.
   * @param {string} queueName - Short queue name (resolved to full path)
   * @param {string} url - Target HTTP endpoint URL
   * @param {object} payload - JSON payload to send
   * @param {number} [scheduleTimeMs] - Optional schedule time in epoch milliseconds
   */
  async createHttpTask(queueName, url, payload, scheduleTimeMs) {
    const queuePath = `projects/${this.projectId}/locations/${this.region}/queues/${queueName}`;

    if (this.isInitialized && this.client) {
      try {
        const task = {
          httpRequest: {
            httpMethod: 'POST',
            url,
            body: Buffer.from(JSON.stringify(payload)).toString('base64'),
            headers: { 'Content-Type': 'application/json' },
          },
        };

        if (scheduleTimeMs) {
          task.scheduleTime = { seconds: Math.floor(scheduleTimeMs / 1000) };
        }

        const [response] = await this.client.createTask({ parent: queuePath, task });
        logger.info(`✅ Cloud Tasks: Task created — ${response.name}`);
        return { name: response.name, scheduleTime: response.scheduleTime };
      } catch (e) {
        logger.error(`❌ Cloud Tasks createTask failed: ${e.message}`);
      }
    }

    logger.info(`⚡ Cloud Tasks Mock: Created task in ${queueName} → ${url}`);
    return { name: `${queuePath}/tasks/mock-${Date.now()}`, scheduleTime: null };
  }

  /**
   * Delete a task by its full resource name.
   */
  async deleteTask(taskName) {
    if (this.isInitialized && this.client) {
      try {
        await this.client.deleteTask({ name: taskName });
        logger.info(`✅ Cloud Tasks: Deleted task ${taskName}`);
        return { deleted: true };
      } catch (e) {
        logger.error(`❌ Cloud Tasks deleteTask failed: ${e.message}`);
      }
    }
    return { deleted: false };
  }

  /**
   * List tasks in a queue.
   */
  async listTasks(queueName) {
    const queuePath = `projects/${this.projectId}/locations/${this.region}/queues/${queueName}`;

    if (this.isInitialized && this.client) {
      try {
        const [tasks] = await this.client.listTasks({ parent: queuePath });
        return tasks.map((t) => ({
          name: t.name,
          scheduleTime: t.scheduleTime,
          createTime: t.createTime,
          dispatchCount: t.dispatchCount,
          responseCount: t.responseCount,
        }));
      } catch (e) {
        logger.error(`❌ Cloud Tasks listTasks failed: ${e.message}`);
      }
    }

    return [];
  }
}

export const gcpCloudTasksService = new GcpCloudTasksService();
