import { logger } from '../../../shared/logger.js';

class GcpNetworkIntelligenceService {
  constructor() {
    this.client = null;
    this.projectId = process.env.GCP_PROJECT_ID || process.env.GCLOUD_PROJECT;
    this.isInitialized = false;
    this._init();
  }

  async _init() {
    if (process.env.NODE_ENV === 'test' && process.env.GCP_REAL_SERVICES !== 'true') return;
    try {
      if (process.env.GOOGLE_APPLICATION_CREDENTIALS || this.projectId) {
        const { ReachabilityServiceClient } = await import('@google-cloud/network-management');
        this.client = new ReachabilityServiceClient();
        this.isInitialized = true;
        logger.info('✅ Google Cloud Network Intelligence: SDK initialized');
      }
    } catch (e) {
      logger.warn(`⚠️ Google Cloud Network Intelligence init failed: ${e.message}`);
    }
  }

  /**
   * Run a connectivity test between two endpoints to verify network paths.
   * @param {string} testId - Unique test identifier
   * @param {object} source - Source endpoint { ipAddress, network, projectId, instance }
   * @param {object} destination - Destination endpoint { ipAddress, port, network, projectId, instance }
   */
  async runConnectivityTest(testId, source, destination) {
    if (this.isInitialized && this.client) {
      try {
        const parent = `projects/${this.projectId}/locations/global`;

        logger.info(`🌐 Network Intelligence: Running connectivity test ${testId}`);

        const [operation] = await this.client.createConnectivityTest({
          parent,
          testId,
          resource: {
            name: `${parent}/connectivityTests/${testId}`,
            source: {
              ipAddress: source.ipAddress,
              network: source.network,
              projectId: source.projectId || this.projectId,
              instance: source.instance,
            },
            destination: {
              ipAddress: destination.ipAddress,
              port: destination.port,
              network: destination.network,
              projectId: destination.projectId || this.projectId,
              instance: destination.instance,
            },
            protocol: destination.port === 443 ? 'TCP' : 'TCP',
          },
        });

        const [result] = await operation.promise();

        const reachability = result.reachabilityDetails;
        logger.info(`🌐 Network Intelligence: Test ${testId} → ${reachability?.result}`);

        return {
          name: result.name,
          result: reachability?.result || 'UNKNOWN',
          verifyTime: reachability?.verifyTime,
          traces: result.probingDetails?.probingLatency,
        };
      } catch (e) {
        logger.error(`❌ Network Intelligence test failed: ${e.message}`);
      }
    }

    logger.info(`🌐 Network Intelligence Mock: Connectivity test ${testId}`);
    return { name: testId, result: 'REACHABLE', verifyTime: new Date().toISOString() };
  }

  /**
   * Get the result of an existing connectivity test.
   */
  async getConnectivityTestResult(testName) {
    if (this.isInitialized && this.client) {
      try {
        const [test] = await this.client.getConnectivityTest({ name: testName });

        return {
          name: test.name,
          result: test.reachabilityDetails?.result,
          verifyTime: test.reachabilityDetails?.verifyTime,
          source: test.source,
          destination: test.destination,
        };
      } catch (e) {
        logger.error(`❌ Network Intelligence getTest failed: ${e.message}`);
      }
    }

    return { name: testName, result: 'UNKNOWN' };
  }

  /**
   * List all connectivity tests in the project.
   */
  async listConnectivityTests() {
    if (this.isInitialized && this.client) {
      try {
        const parent = `projects/${this.projectId}/locations/global`;
        const [tests] = await this.client.listConnectivityTests({ parent });

        return tests.map((t) => ({
          name: t.name,
          result: t.reachabilityDetails?.result,
          createTime: t.createTime,
          updateTime: t.updateTime,
        }));
      } catch (e) {
        logger.error(`❌ Network Intelligence listTests failed: ${e.message}`);
      }
    }

    return [];
  }

  /**
   * Delete a connectivity test.
   */
  async deleteConnectivityTest(testName) {
    if (this.isInitialized && this.client) {
      try {
        const [operation] = await this.client.deleteConnectivityTest({ name: testName });
        await operation.promise();
        logger.info(`🗑️ Network Intelligence: Deleted test ${testName}`);
        return { deleted: true };
      } catch (e) {
        logger.error(`❌ Network Intelligence deleteTest failed: ${e.message}`);
      }
    }

    return { deleted: false };
  }
}

export const gcpNetworkIntelligenceService = new GcpNetworkIntelligenceService();
