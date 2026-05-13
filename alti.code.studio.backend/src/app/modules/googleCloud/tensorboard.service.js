import { TensorboardServiceClient } from '@google-cloud/aiplatform';
import { logger } from '../../../shared/logger.js';
import config from '../../../../config/index.js';

/**
 * Google Vertex AI TensorBoard Service.
 * Visualizes the Swarm's intelligence, tracking reasoning evaluation scores,
 * test pass rates, and codebase loss functions over time natively in GCP.
 */
class GoogleTensorBoardService {
    constructor() {
        try {
            this.client = new TensorboardServiceClient();
            // Assumes a pre-created TensorBoard instance in the GCP project
            this.tensorboardName = `projects/${config.gcp.project_id}/locations/${config.gcp.location}/tensorboards/${config.gcp.tensorboard_id || 'alti-swarm-metrics'}`;
            logger.info('📊 [TensorBoard] Google Vertex TensorBoard Client initialized.');
        } catch (error) {
            logger.warn('⚠️ [TensorBoard] Could not initialize TensorBoard Client.');
        }
    }

    /**
     * Logs a scalar metric (e.g., Evaluation Score) to TensorBoard.
     * @param {string} experimentName 
     * @param {string} runName 
     * @param {string} metricId 
     * @param {number} value 
     */
    async logScalar(experimentName, runName, metricId, value) {
        logger.info(`📈 [TensorBoard] Logging metric ${metricId}=${value} to Vertex AI...`);
        
        try {
            const timeSeriesName = `${this.tensorboardName}/experiments/${experimentName}/runs/${runName}/timeSeries/${metricId}`;
            
            const request = {
                tensorboardTimeSeries: timeSeriesName,
                timeSeriesData: [
                    {
                        tensorboardTimeSeriesId: metricId,
                        valueType: 'SCALAR',
                        values: [
                            {
                                wallTime: {
                                    seconds: Math.floor(Date.now() / 1000),
                                },
                                scalar: { value: value },
                            },
                        ],
                    },
                ],
            };

            await this.client.writeTensorboardRunData(request);
            logger.info(`✅ [TensorBoard] Metric logged successfully.`);
        } catch (error) {
            logger.error(`❌ [TensorBoard] Failed to log metric:`, error.message);
        }
    }
}

export const tensorboardService = new GoogleTensorBoardService();
