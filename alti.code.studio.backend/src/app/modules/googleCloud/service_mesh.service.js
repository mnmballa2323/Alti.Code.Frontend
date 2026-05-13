import { RegistrationServiceClient, LookupServiceClient } from '@google-cloud/service-directory';
import { logger } from '../../../shared/logger.js';
import config from '../../../../config/index.js';

/**
 * Google Cloud Service Directory (Autonomous RAG Service Mesh).
 * When the Swarm spins up thousands of parallel ingestion workers, a central
 * load balancer becomes a massive bottleneck. The parallel RAG workers register 
 * here to form an autonomous P2P Service Mesh, sharing vector shards via 
 * high-speed gRPC without routing through centralized IP tables.
 */
class GoogleServiceMesh {
    constructor() {
        try {
            this.registrationClient = new RegistrationServiceClient();
            this.lookupClient = new LookupServiceClient();
            
            this.namespacePath = this.registrationClient.namespacePath(
                config.gcp.project_id,
                config.gcp.location || 'us-central1',
                config.gcp.service_namespace || 'alti-rag-mesh'
            );
            
            logger.info('🕸️ [Service Mesh] Google Cloud Service Directory initialized for P2P routing.');
        } catch (error) {
            logger.warn('⚠️ [Service Mesh] Could not initialize Service Directory Client.');
        }
    }

    /**
     * Registers a newly spawned parallel worker node into the P2P Mesh.
     * @param {string} serviceName - e.g., 'rag-worker'
     * @param {string} endpointId - Unique ID of the node
     * @param {string} ipAddress - IP address of the worker
     * @param {number} port - gRPC port
     */
    async registerWorkerNode(serviceName, endpointId, ipAddress, port) {
        logger.info(`🕸️ [Service Mesh] Registering Swarm worker [${endpointId}] to Service Directory...`);
        
        try {
            const servicePath = `${this.namespacePath}/services/${serviceName}`;
            
            const request = {
                parent: servicePath,
                endpointId: endpointId,
                endpoint: {
                    address: ipAddress,
                    port: port,
                },
            };

            await this.registrationClient.createEndpoint(request);
            logger.info(`✅ [Service Mesh] Worker successfully registered to P2P RAG Mesh.`);
        } catch (error) {
            logger.error(`❌ [Service Mesh] Failed to register worker:`, error.message);
        }
    }

    /**
     * Resolves all active RAG workers in the mesh to distribute a workload.
     * @param {string} serviceName - e.g., 'rag-worker'
     */
    async discoverWorkers(serviceName) {
        logger.info(`🕸️ [Service Mesh] Discovering parallel RAG workers for distributed workload...`);
        
        try {
            const servicePath = `${this.namespacePath}/services/${serviceName}`;
            
            const request = {
                name: servicePath,
            };

            const [response] = await this.lookupClient.resolveService(request);
            logger.info(`✅ [Service Mesh] Discovered ${response.endpoints.length} active parallel workers.`);
            return response.endpoints;
        } catch (error) {
            logger.error(`❌ [Service Mesh] Failed to discover workers:`, error.message);
            return [];
        }
    }
}

export const serviceMesh = new GoogleServiceMesh();
