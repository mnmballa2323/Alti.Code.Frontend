import { WebSocketServer } from 'ws';
import setupWSConnection from 'y-websocket/bin/utils.js';
import { logger } from '../../../shared/logger.js';

class CrdtSocketService {
    constructor() {
        this.name = 'CrdtSocketService';
        this.wss = null;
    }

    init(server) {
        logger.info('🔗 Initializing Yjs CRDT WebSocket Bridge on /api/internal/crdt');

        this.wss = new WebSocketServer({ noServer: true });

        this.wss.on('connection', (conn, req) => {
            const docName = req.url.split('/').pop() || 'monaco';
            logger.info(`🔗 Yjs Client connected. Synced to document: ${docName}`);

            // Wire the connection to the y-websocket server logic
            setupWSConnection.setupWSConnection(conn, req, { docName });
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
