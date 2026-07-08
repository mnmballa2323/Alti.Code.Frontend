import { Logging } from '@google-cloud/logging';
import { logger } from '../../../shared/logger.js';

class GcpLoggingServiceImpl {
  constructor() {
    this.logging = null;
    this.isInitialized = false;
    this.init();
  }

  init() {
    try {
      if (
        process.env.NODE_ENV !== 'test' ||
        process.env.GCP_REAL_SERVICES === 'true'
      ) {
        if (
          process.env.GOOGLE_APPLICATION_CREDENTIALS ||
          process.env.GCP_PROJECT_ID
        ) {
          this.logging = new Logging();
          this.isInitialized = true;
        }
      }
    } catch (e) {
      logger.warn(
        `⚠️ Google Cloud Logging initialization failed, falling back to local logger: ${e.message}`,
      );
      this.isInitialized = false;
    }
  }

  /**
   * Write an audit entry to Google Cloud Logging or fallback logger
   * @param {string} logName - Name of the log
   * @param {object} entry - The audit data
   * @param {string} severity - NOTICE, INFO, WARNING, ERROR, CRITICAL
   */
  async writeAuditLog(logName, entry, severity = 'NOTICE') {
    const timestamp = new Date().toISOString();
    const payload = {
      ...entry,
      platform: 'Alti.Code.Studio',
      cloudProvider: 'Google Cloud Platform',
      deploymentType: process.env.GCP_DEPLOYMENT_TYPE || 'commercial',
      timestamp,
    };

    if (this.isInitialized && this.logging) {
      try {
        const log = this.logging.log(logName);
        const metadata = {
          resource: { type: 'global' },
          severity: severity.toUpperCase(),
        };
        const logEntry = log.entry(metadata, payload);
        await log.write(logEntry);
        return;
      } catch (e) {
        logger.error(
          `❌ Google Cloud Logging write failed: ${e.message}. Falling back to standard console logger.`,
        );
      }
    }

    // Console Logger Fallback
    logger.info(
      `[GCP Audit Log] [${severity}] ${logName}: ${JSON.stringify(payload)}`,
    );
  }
}

const service = new GcpLoggingServiceImpl();

export const GcpLoggingServiceInstance = {
  writeAuditLog: (logName, entry, severity) =>
    service.writeAuditLog(logName, entry, severity),
};

export const CloudLoggingService = GcpLoggingServiceInstance;
export const GcpLoggingService = GcpLoggingServiceInstance;
export const gcpLoggingService = GcpLoggingServiceInstance;
