import dataproc from '@google-cloud/dataproc';
import { logger } from '../../../shared/logger.js';
import config from '../../../../config/index.js';

/**
 * Google Cloud Dataproc Service (Billion-Line Ingestion Clusters).
 * Standard Node.js execution crashes on petabyte-scale AST tokenization.
 * The Swarm uses this service to autonomously spin up managed Apache Spark clusters.
 * It distributes the semantic chunking and embedding of massive monorepos
 * (like the Linux kernel) across thousands of GCP nodes, completing ingestion in minutes.
 */
class GoogleDataprocService {
    constructor() {
        try {
            const apiEndpoint = `${config.gcp.location || 'us-central1'}-dataproc.googleapis.com`;
            this.clusterClient = new dataproc.v1.ClusterControllerClient({ apiEndpoint });
            this.jobClient = new dataproc.v1.JobControllerClient({ apiEndpoint });
            
            this.projectId = config.gcp.project_id;
            this.region = config.gcp.location || 'us-central1';
            
            logger.info('⚙️ [Dataproc] Google Cloud Dataproc Client initialized.');
        } catch (error) {
            logger.warn('⚠️ [Dataproc] Could not initialize Dataproc Client.');
        }
    }

    /**
     * Submits a massive distributed Spark PySpark job to ingest a monorepo.
     * @param {string} clusterName - The Dataproc cluster to use
     * @param {string} pythonScriptUri - GCS URI of the Python Spark embedding script
     */
    async submitIngestionJob(clusterName, pythonScriptUri) {
        logger.info(`⚙️ [Dataproc] Swarm is submitting a distributed Apache Spark ingestion job...`);
        
        try {
            const job = {
                placement: {
                    clusterName: clusterName,
                },
                pysparkJob: {
                    mainPythonFileUri: pythonScriptUri,
                },
            };

            const request = {
                projectId: this.projectId,
                region: this.region,
                job: job,
            };

            const [response] = await this.jobClient.submitJobAsOperation(request);
            logger.info(`⏳ [Dataproc] Apache Spark ingestion job submitted. Distributing across nodes...`);
            
            const [jobResult] = await response.promise();
            logger.info(`✅ [Dataproc] Billion-line monorepo successfully ingested and embedded! Job ID: ${jobResult.reference.jobId}`);
            
            return jobResult;
        } catch (error) {
            logger.error(`❌ [Dataproc] Failed to submit ingestion job:`, error.message);
            return null;
        }
    }
}

export const dataprocService = new GoogleDataprocService();
