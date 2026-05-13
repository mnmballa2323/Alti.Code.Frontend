/**
 * Copyright (c) 2024 Alti.Code.Studio
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { WebSocketServer } from 'ws';
import { logger } from '../../../shared/logger.js';
import { swarmBrain } from '../agents/swarm_brain.js';
import { GoogleGenAiService } from '../googleGenAi/googleGenAi.service.js';
import { dlpService } from '../googleCloud/dlp.service.js';

class LspGateway {
    constructor() {
        this.wss = null;
        this.activeSessions = new Map();
        
        // In-memory representation of what the user is typing, before they hit save.
        // This is crucial for true autonomous "telepathy".
        this.shadowBuffers = new Map(); 
        
        // Debounce timers for predictive autocomplete to avoid hammering Vertex AI on every keystroke
        this.typingDebouncers = new Map();
    }

    /**
     * Attaches the LSP WebSocket server to an existing HTTP server.
     * @param {import('http').Server} httpServer 
     */
    initialize(httpServer) {
        if (!httpServer) {
            logger.error("LSP Gateway requires a valid HTTP server to bind to.");
            return;
        }

        this.wss = new WebSocketServer({ server: httpServer, path: '/api/v1/lsp/telepathy' });

        this.wss.on('connection', (ws, req) => {
            const sessionId = req.headers['sec-websocket-key'];
            logger.info(`🔮 LSP Telepathy: IDE Session Connected [${sessionId}]`);
            this.activeSessions.set(sessionId, ws);

            ws.on('message', async (message) => {
                await this.handleLspMessage(sessionId, message.toString());
            });

            ws.on('close', () => {
                logger.info(`🔮 LSP Telepathy: IDE Session Disconnected [${sessionId}]`);
                this.activeSessions.delete(sessionId);
                // Optionally clear shadow buffers for this session
            });
            
            // Handshake
            ws.send(JSON.stringify({ jsonrpc: "2.0", method: "telepathy/ready", params: {} }));
        });
        
        logger.info('🔮 LSP Telepathy Gateway Initialized and listening on /api/v1/lsp/telepathy');
    }

    /**
     * Parses incoming Language Server Protocol (JSON-RPC) messages from the Desktop IDE.
     * @param {string} sessionId 
     * @param {string} rawMessage 
     */
    async handleLspMessage(sessionId, rawMessage) {
        try {
            const msg = JSON.parse(rawMessage);
            
            // Core LSP Methods
            if (msg.method === 'textDocument/didChange') {
                const { textDocument, contentChanges } = msg.params;
                const newText = contentChanges[0].text;
                const uri = textDocument.uri;
                
                // Track live unsaved keystrokes in the shadow buffer
                this.shadowBuffers.set(uri, newText);
                
                // 1. Google Cloud DLP Real-Time Vulnerability Scanning
                // We scan the buffer for secrets and PII *as they type*, before it's even saved to disk.
                try {
                    const dlpResult = await dlpService.scanForSecrets(newText);
                    if (dlpResult && dlpResult.length > 0) {
                        logger.warn(`🚨 LSP Telepathy: Hardcoded secret detected in ${uri} via Google Cloud DLP. Pushing auto-remediation...`);
                        
                        // Push an auto-remediation suggestion directly to the IDE replacing the secret with a GCP Secret Manager Ref
                        this.pushSuggestion(uri, {
                            type: 'security_remediation',
                            message: 'Google Cloud DLP detected a hardcoded secret. Press Tab to securely migrate to Secret Manager.',
                            replacement: 'await SecretManagerService.getSecret("MIGRATED_SECRET_1")',
                            line: msg.params.cursorLine || 1
                        });
                    }
                } catch(e) {
                    // Fail silently to not disrupt typing
                }

                // 2. Vertex AI Gemini Flash Ambient Autocomplete (Debounced)
                if (this.typingDebouncers.has(uri)) {
                    clearTimeout(this.typingDebouncers.get(uri));
                }
                
                this.typingDebouncers.set(uri, setTimeout(async () => {
                    try {
                        logger.info(`🧠 LSP Telepathy: Triggering Vertex AI Gemini Flash prediction for ${uri}...`);
                        const prompt = `You are a sub-100ms latency autocomplete engine. Provide only the exact next lines of code to complete this buffer. Do not use markdown. Do not repeat the prompt. BUFFER:\n${newText}\n\nCOMPLETE HERE:\n`;
                        
                        // Use gemini-3.1-flash for extreme speed
                        const completion = await GoogleGenAiService.generateContent(prompt, 'gemini-3.1-flash', 0.2);
                        
                        if (completion && completion.content) {
                            this.pushSuggestion(uri, {
                                type: 'ghost_text',
                                text: completion.content.trim()
                            });
                        }
                    } catch(e) {
                        logger.error(`⚠️ LSP Telepathy: Autocomplete failure: ${e.message}`);
                    }
                }, 800)); // 800ms debounce
            } 
            else if (msg.method === 'telepathy/intentTrigger') {
                // Custom AI method: The IDE detected the user dwelling their cursor 
                // or explicitly asking the Swarm to generate a large feature block.
                const { uri, cursorLine, contextBuffer, intent } = msg.params;
                logger.info(`🧠 Telepathy Intent Triggered at ${uri}:${cursorLine}. Intent: ${intent}`);
                
                // Dispatch this ambient context directly into the OODA loop of the Swarm.
                // The Swarm will generate the code asynchronously using its full reasoning pipeline.
                const taskResult = await swarmBrain.executeTask(`User is at line ${cursorLine} in file ${uri}. The current file content is:\n\n${contextBuffer}\n\nThe user's intent is: ${intent}. Please write the required code.`, []);
                
                if (taskResult) {
                    this.pushSuggestion(uri, {
                        type: 'swarm_injection',
                        text: taskResult
                    });
                }
            }

        } catch (err) {
            logger.error(`LSP Gateway failed to parse incoming RPC: ${err.message}`);
        }
    }
    
    /**
     * Pushes an autonomous AST suggestion back to the IDE client.
     * @param {string} uri 
     * @param {Object} astPatch 
     */
    pushSuggestion(uri, astPatch) {
        const payload = JSON.stringify({
            jsonrpc: "2.0",
            method: "telepathy/suggestion",
            params: {
                uri,
                patch: astPatch
            }
        });
        
        // Broadcast to all active IDE sessions (or target specific session ID if known)
        for (const [id, ws] of this.activeSessions.entries()) {
            if (ws.readyState === 1) { // OPEN
                ws.send(payload);
            }
        }
    }
}

export const lspGateway = new LspGateway();
