import { BigQuery } from '@google-cloud/bigquery';
import config from '../../../../config/index.js';
import { logger } from '../../../shared/logger.js';
import ApiError from '../../../errors/ApiError.js';
import httpStatus from 'http-status';

const bigquery = new BigQuery({
    projectId: config.gcp.project_id
});

/**
 * Stream agentic productivity metrics to BigQuery
 * This enables 'Universe-Best' analytics for the coding swarm.
 * @param {string} datasetId 
 * @param {string} tableId 
 * @param {object} rows - Rows to insert
 */
const streamMetrics = async (datasetId, tableId, rows) => {
    try {
        const dataset = bigquery.dataset(datasetId);
        const table = dataset.table(tableId);

        await table.insert(rows);
        logger.info(`📊 [BigQuery] Streamed ${rows.length} metrics to ${tableId}`);
    } catch (error) {
        logger.error('BigQuery Streaming Error:', error);
        // Soft fail to not block agent performance
    }
};

/**
 * Perform AI-powered productivity analysis using BigQuery SQL
 */
const runProductivityAnalysis = async (query) => {
    try {
        const options = {
            query: query,
            location: 'US',
        };

        const [job] = await bigquery.createQueryJob(options);
        const [rows] = await job.getQueryResults();

        return rows;
    } catch (error) {
        logger.error('BigQuery Analysis Error:', error);
        throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, `BigQuery Analysis failed: ${error.message}`);
    }
};

export const BigQueryService = {
    streamMetrics,
    runProductivityAnalysis
};
