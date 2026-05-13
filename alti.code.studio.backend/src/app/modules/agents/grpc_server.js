import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import path from 'path';
import { fileURLToPath } from 'url';
import { logger } from '../../../shared/logger.js';
import config from '../../../../config/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PROTO_PATH = path.join(__dirname, 'agent_message.proto');

/**
 * Google gRPC Server (HTTP/2).
 * Operates in parallel with the Express REST API. 
 * Dedicated exclusively to hyper-optimized, binary Agent-to-Agent (A2A) 
 * codebase streaming and IPC payloads.
 */
class AgentGrpcServer {
    constructor() {
        this.server = new grpc.Server();
        this.port = config.grpc_port || 50051;
        this.init();
    }

    init() {
        try {
            // Load the Google Protocol Buffer Schema
            const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
                keepCase: true,
                longs: String,
                enums: String,
                defaults: true,
                oneofs: true
            });

            // If we actually defined a service in the proto, we would bind it here.
            // Since we just defined the message schema for now, we'll log its availability.
            logger.info('🗜️ [gRPC] Protocol Buffers loaded successfully.');
            
            // Example service binding (mock):
            // this.server.addService(agentProto.AgentSwarm.service, { streamCodebase: this.streamCodebase });
        } catch (error) {
            logger.warn('⚠️ [gRPC] Failed to load Protobufs. Ensure agent_message.proto exists.');
        }
    }

    start() {
        this.server.bindAsync(
            `0.0.0.0:${this.port}`,
            grpc.ServerCredentials.createInsecure(),
            (error, port) => {
                if (error) {
                    logger.error('❌ [gRPC] Server failed to bind:', error.message);
                    return;
                }
                this.server.start();
                logger.info(`⚡ [gRPC] High-Velocity Agent IPC Server running on HTTP/2 port ${port}`);
            }
        );
    }
}

export const grpcServer = new AgentGrpcServer();
