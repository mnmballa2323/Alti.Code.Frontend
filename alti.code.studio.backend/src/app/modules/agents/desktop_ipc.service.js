/**
 * Copyright (c) 2024 Inso Code
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { WebSocketServer } from 'ws';
import { logger } from '../../../shared/logger.js';
import zlib from 'zlib';
import util from 'util';
import { socketService } from '../../services/socket.service.js';

const gzip = util.promisify(zlib.gzip);
const gunzip = util.promisify(zlib.gunzip);

class DesktopIpcService {
    constructor() {
        this.wss = null;
    }

    /**
     * Boots the specialized IPC server for the Desktop App.
     * @param {number} port 
     */
    start(port = 8081) {
        this.wss = new WebSocketServer({ port });
        
        logger.info(`🖥️ [Desktop IPC] Native Binary Bridge listening on ws://localhost:${port}`);

        this.wss.on('connection', (ws) => {
            logger.info('⚡ [Desktop IPC] Tauri Rust Client Connected via Native Binary Stream.');

            // Strictly enforce binary transmission mode to reject slow JSON payloads
            ws.binaryType = 'arraybuffer';

            ws.on('message', async (data, isBinary) => {
                if (!isBinary) {
                    logger.warn('⚠️ [Desktop IPC] Received non-binary payload. Rejecting. (Strict Binary Mode Enforced)');
                    return;
                }

                try {
                    // Phase 2 Optimization: Offload network by decompressing gzip buffers
                    const decompressed = await gunzip(data);
                    const jsonString = decompressed.toString('utf-8');
                    logger.debug(`⚡ [Desktop IPC] Decompressed ${data.byteLength} bytes from Rust into ${decompressed.length} byte AST.`);
                    
                    const payload = JSON.parse(jsonString);
                    
                    // Process Desktop OS-level events (e.g. native file system edits)
                    if (payload.type === 'FS_READ_ACK') {
                        logger.info(`📂 [Desktop IPC] Native FS Read Acknowledged for ${payload.path}`);
                        socketService.broadcast('desktop_ipc', 'fs_read_success', { path: payload.path, content: payload.content });
                    } else if (payload.type === 'FS_WRITE_ACK') {
                        logger.info(`💾 [Desktop IPC] Native FS Write Acknowledged for ${payload.path}`);
                        socketService.broadcast('desktop_ipc', 'fs_write_success', { path: payload.path });
                    }
                    
                } catch (err) {
                    logger.error(`❌ [Desktop IPC] Binary Decode Failed: ${err.message}`);
                }
            });

            ws.on('close', () => {
                logger.info('🖥️ [Desktop IPC] Tauri Rust Client Disconnected.');
            });
        });
    }

    /**
     * Broadcasts massive codebase updates (AST diffs) as compressed binary to the Tauri app.
     * @param {Object} stateObject 
     */
    async broadcastBinaryState(stateObject) {
        if (!this.wss) return;

        try {
            const jsonString = JSON.stringify(stateObject);
            // Gzip the payload for ultra-low latency transfer to Rust
            const compressedBuffer = await gzip(Buffer.from(jsonString, 'utf-8'));

            this.wss.clients.forEach((client) => {
                if (client.readyState === 1 /* WebSocket.OPEN */) {
                    client.send(compressedBuffer, { binary: true });
                }
            });
            logger.debug(`⚡ [Desktop IPC] Broadcasted ${compressedBuffer.length} bytes to Rust native UI.`);
        } catch (err) {
            logger.error(`❌ [Desktop IPC] Broadcast Failed: ${err.message}`);
        }
    }

    /**
     * Dispatches a specific action command to the native Desktop environment.
     * @param {string} commandType The action to perform (e.g., 'WRITE_FILE', 'READ_FILE')
     * @param {Object} payload The command arguments
     */
    async sendCommand(commandType, payload) {
        logger.info(`📤 [Desktop IPC] Dispatching Native Command: ${commandType}`);
        const commandWrapper = {
            type: commandType,
            data: payload,
            timestamp: Date.now()
        };
        await this.broadcastBinaryState(commandWrapper);
    }
}

export const desktopIpcService = new DesktopIpcService();
