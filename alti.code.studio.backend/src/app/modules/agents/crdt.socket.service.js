import { WebSocketServer } from 'ws';
import setupWSConnection, { setPersistence } from 'y-websocket/bin/utils';
import { logger } from '../../../shared/logger.js';
import * as Y from 'yjs';
import { FirestoreSyncService } from '../azureCloud/azureCosmosDb.service.js';
import { memorystoreService } from '../azureCloud/azureCache.service.js';

class CrdtSocketService {
    constructor() {
        this.name = 'CrdtSocketService';
        this.wss = null;
    }

    init(server) {
        logger.info('🔗 Initializing Yjs CRDT WebSocket Bridge on /api/internal/crdt');

        // 🔥 Universe-Scale Multiplayer Persistence via Google Firestore & Cloud KMS
        setPersistence({
            bindState: async (docName, ydoc) => {
                const persistedState = await FirestoreSyncService.loadDocState(docName);
                if (persistedState) {
                    Y.applyUpdate(ydoc, persistedState);
                }
            },
            writeState: async (docName, ydoc) => {
                const state = Y.encodeStateAsUpdate(ydoc);
                await FirestoreSyncService.persistCrdtUpdate(docName, state);
            }
        });

        this.wss = new WebSocketServer({ noServer: true });

        this.wss.on('connection', (conn, req) => {
            const docName = req.url.split('/').pop() || 'monaco';
            logger.info(`🔗 Yjs Client connected. Synced to document: ${docName}`);

            // Wire the connection to the y-websocket server logic
            setupWSConnection.setupWSConnection(conn, req, { docName });
            
            // Get the server-side Y.Doc instance
            const docs = setupWSConnection.docs || new Map();
            const ydoc = docs.get(docName);

            if (ydoc) {
                // 1. Publish local changes to Cloud Memorystore (Redis)
                ydoc.on('update', (update, origin) => {
                    // Prevent infinite loops by checking origin
                    if (origin !== 'memorystore-pubsub') {
                        const base64Update = Buffer.from(update).toString('base64');
                        memorystoreService.publishCrdtUpdate(docName, base64Update);
                    }
                });

                // 2. Subscribe to remote changes from other Cloud Run nodes
                memorystoreService.subscribeToCrdt(docName, (base64Update) => {
                    try {
                        const update = Buffer.from(base64Update, 'base64');
                        Y.applyUpdate(ydoc, update, 'memorystore-pubsub');
                    } catch (e) {
                        logger.error(`❌ Failed to apply remote CRDT update: ${e.message}`);
                    }
                });
            }
        });

        // Upgrade specific HTTP connections to the CRDT WebSocket server
        server.on('upgrade', (request, socket, head) => {
            if (request.url.startsWith('/api/internal/crdt')) {
                this.wss.handleUpgrade(request, socket, head, (ws) => {
                    this.wss.emit('connection', ws, request);
                });
            }
        });
    }
}

export const crdtSocketService = new CrdtSocketService();
