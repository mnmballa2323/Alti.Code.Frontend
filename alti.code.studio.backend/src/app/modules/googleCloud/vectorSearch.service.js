import { IndexServiceClient, MatchServiceClient } from '@google-cloud/aiplatform';
import { logger } from '../../../shared/logger.js';
import config from '../../../../config/index.js';

const apiEndpoint = `${config.gcp.location}-aiplatform.googleapis.com`;

const indexClient = new IndexServiceClient({ apiEndpoint });
const matchClient = new MatchServiceClient({ apiEndpoint });

/**
 * Universal Agent Memory via Vertex AI Vector Search.
 * Provides 'Universe-Scale' context retrieval for the agentic swarm using Google's Matching Engine.
 */
class VertexVectorSearchService {
    constructor() {
        this.indexId = config.gcp.vector_index_id || 'alti-universal-memory';
        this.endpointId = config.gcp.vector_endpoint_id || 'alti-memory-endpoint';
        this.project = config.gcp.project_id;
        this.location = config.gcp.location || 'us-central1';
        
        this.indexName = `projects/${this.project}/locations/${this.location}/indexes/${this.indexId}`;
        this.endpointName = `projects/${this.project}/locations/${this.location}/indexEndpoints/${this.endpointId}`;
    }

    /**
     * Upsert embeddings into the Vertex AI Vector Search Index.
     */
    async upsertEmbeddings(datapoints) {
        logger.info(`🧠 [VectorSearch] Upserting ${datapoints.length} context shards to Vertex AI...`);
        
        try {
            // Map our application datapoints to Vertex AI Datapoints
            const vertexDatapoints = datapoints.map(dp => ({
                datapointId: dp.id,
                featureVector: dp.embedding,
            }));

            await indexClient.upsertDatapoints({
                index: this.indexName,
                datapoints: vertexDatapoints
            });
            
            logger.info('✅ [VectorSearch] Vertex AI Index updated successfully.');
            return { success: true, count: datapoints.length };
        } catch (error) {
            logger.error('Vertex AI Vector Search Error:', error.message);
            return { success: false, mode: 'fallback_failed' };
        }
    }

    /**
     * Retrieve the most relevant context shards for a given query embedding.
     */
    async queryContext(queryEmbedding, topK = 10) {
        logger.info(`🔍 [VectorSearch] Querying Vertex AI for top ${topK} context shards...`);
        
        try {
            const [response] = await matchClient.findNeighbors({
                indexEndpoint: this.endpointName,
                deployedIndexId: this.indexId,
                queries: [{
                    datapoint: {
                        featureVector: queryEmbedding
                    },
                    neighborCount: topK
                }],
                returnFullDatapoint: false,
            });
            
            if (!response.nearestNeighbors || response.nearestNeighbors.length === 0) {
                return [];
            }

            const neighbors = response.nearestNeighbors[0].neighbors.map(n => ({
                id: n.datapoint.datapointId,
                distance: n.distance
            }));

            logger.info(`✅ [VectorSearch] Found ${neighbors.length} neighbors.`);
            return neighbors;
        } catch (error) {
            logger.error('Vertex AI Query Error:', error.message);
            return [];
        }
    }
}

export const vertexVectorSearch = new VertexVectorSearchService();
