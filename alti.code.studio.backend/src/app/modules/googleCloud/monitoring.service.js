import monitoring from '@google-cloud/monitoring';
import config from '../../../../config/index.js';
import { logger } from '../../../shared/logger.js';

/**
 * Google Cloud Monitoring (Apache 2.0 SDK) Service.
 * Allows the Alti Code Studio Swarm to autonomously emit custom, high-fidelity 
 * performance and FinOps metrics directly into Google Cloud Operations Suite.
 */
class GoogleCloudMonitoringService {
    constructor() {
        this.client = new monitoring.MetricServiceClient();
        this.projectId = config.gcp_project_id || process.env.GOOGLE_CLOUD_PROJECT || 'alti-code-studio';
    }

    /**
     * Autonomously emits a custom AI Swarm metric to Google Cloud Monitoring.
     * @param {string} metricType - e.g., 'custom.googleapis.com/swarm/tokens_consumed'
     * @param {number} value - The numerical value of the metric
     * @param {object} labels - Key-value pair tags (e.g., { model: 'gemini-3.1-pro' })
     */
    async emitCustomMetric(metricType, value, labels = {}) {
        try {
            const dataPoint = {
                interval: {
                    endTime: {
                        seconds: Date.now() / 1000,
                    },
                },
                value: {
                    doubleValue: value,
                },
            };

            const timeSeriesData = {
                metric: {
                    type: metricType,
                    labels: labels,
                },
                resource: {
                    type: 'global',
                    labels: {
                        project_id: this.projectId,
                    },
                },
                points: [dataPoint],
            };

            const request = {
                name: this.client.projectPath(this.projectId),
                timeSeries: [timeSeriesData],
            };

            // Non-blocking fire-and-forget to avoid slowing down Swarm
            this.client.createTimeSeries(request).then(() => {
                // Silently succeed to prevent log flooding
            }).catch(err => {
                logger.warn(`⚠️ [Cloud Monitoring] Failed to emit metric: ${err.message}`);
            });

        } catch (error) {
            logger.error(`❌ [Cloud Monitoring] Error structuring metric:`, error.message);
        }
    }
}

export const cloudMonitoringService = new GoogleCloudMonitoringService();
