/**
 * Copyright (c) 2024 Inso Code
 * 
 * The Historian
 * Maintains a persistent chronicle of Hive activities and decisions.
 */

import { logger } from '../../../shared/logger.js';
import fs from 'fs/promises';
import path from 'path';
import { ragService } from '../memory/rag.service.js';

class HistorianAgent {
    constructor() {
        this.name = "The Historian";
        this.agentName = "historian";
        this.capabilities = ['recordEvent', 'queryHistory', 'getChronicle'];
        this.chroniclePath = path.join(process.cwd(), 'data', 'chronicle.json');
        this.ensureChronicle();
    }

    async ensureChronicle() {
        try {
            const dir = path.dirname(this.chroniclePath);
            await fs.mkdir(dir, { recursive: true });
            try {
                await fs.access(this.chroniclePath);
            } catch {
                await fs.writeFile(this.chroniclePath, JSON.stringify([], null, 2));
            }
        } catch (error) {
            logger.error('📜 Historian: Failed to initialize chronicle', error);
        }
    }

    async execute(action, args) {
        logger.info(`📜 Historian: Executing ${action}`);
        switch (action) {
            case 'recordEvent': return this.recordEvent(args.sessionId, args.agent, args.action, args.details);
            case 'queryHistory': return this.queryHistory(args.query);
            case 'getChronicle': return this.getChronicle();
            default: return { error: `Unknown action: ${action}` };
        }
    }

    async recordEvent(sessionId, agent, action, details = {}) {
        const event = {
            id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
            timestamp: new Date().toISOString(),
            sessionId,
            agent,
            action,
            details
        };

        return this._enqueueWrite(event);
    }

    // ... (getChronicle and queryHistory remain same)

    _enqueueWrite(event) {
        if (!this.writeQueue) this.writeQueue = Promise.resolve();

        // Chain promises to ensure sequential execution
        this.writeQueue = this.writeQueue.then(async () => {
            try {
                const data = await this._readChronicle();
                data.push(event);
                await this._writeChronicle(data);
                logger.info(`📜 Historian: Recorded event [${event.agent} -> ${event.action}]`);

                // Add to Vector Memory for long-term semantic search
                const memoryText = `Timestamp: ${event.timestamp}\nSession: ${event.sessionId}\nAgent: ${event.agent}\nAction: ${event.action}\nDetails: ${JSON.stringify(event.details)}`;
                await ragService.createIndex([memoryText], {
                    source: 'historian',
                    agent: event.agent,
                    action: event.action,
                    sessionId: event.sessionId
                });

                return { status: 'recorded', eventId: event.id };
            } catch (error) {
                logger.error('📜 Historian: Failed to record event', error);
                return { status: 'failed', error: error.message };
            }
        });

        return this.writeQueue;
    }

    async getChronicle() {
        return this._readChronicle();
    }

    // Simple query for now
    async queryHistory(query) {
        const data = await this._readChronicle();
        if (!query) return data;

        return data.filter(evt =>
            JSON.stringify(evt).toLowerCase().includes(query.toLowerCase())
        );
    }

    async _readChronicle() {
        try {
            const content = await fs.readFile(this.chroniclePath, 'utf8');
            return JSON.parse(content);
        } catch (error) {
            return [];
        }
    }

    async _writeChronicle(data) {
        await fs.writeFile(this.chroniclePath, JSON.stringify(data, null, 2));
    }
}

export const historianAgent = new HistorianAgent();
