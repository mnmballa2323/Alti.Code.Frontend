// @ts-check
/**
 * Copyright (c) 2024 Alti.Code.Studio
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 *
 * Enterprise-Grade Specialist Agent
 * Hardened under Project Aegis v2.0
 */

import axios from 'axios';
import fs from 'fs';
import FormData from 'form-data';
import { logger } from '../../../../shared/logger.js';

class EngineAgent {
    constructor() {
        this.agentName = 'Engine';
        this.role = 'AI/Data Specialist';
        this.capabilities = ['ai_graph', 'ai_rag', 'ocr', 'ingest'];
        this.engineUrl = process.env.ENGINE_URL || 'http://nemo_engine:8000'; // Docker service name
    }

    async execute(action, args) {
        logger.info(`[Engine] Executing ${action}`);
        try {
            switch (action) {
                case 'analyzeGraph':
                    return await this.analyzeGraph(args.dependencyMatrix);
                case 'ingestFile':
                    return await this.ingestFile(args.filePath);
                case 'embed':
                    return await this.embedText(args.text);
                case 'health':
                    return await this.checkHealth();
                default:
                    throw new Error(`Unknown action: ${action}`);
            }
        } catch (error) {
            logger.error(`[Engine] Action ${action} failed:`, error.message);
            throw error;
        }
    }

    async analyzeGraph(dependencyMatrix) {
        // dependencyMatrix should be [[source, target], ...]
        const response = await axios.post(`${this.engineUrl}/analyze/graph`, {
            text: JSON.stringify(dependencyMatrix) // API expects JSON string in 'text' field for now
        });
        return response.data;
    }

    async ingestFile(filePath) {
        if (!fs.existsSync(filePath)) {
            throw new Error(`File not found: ${filePath}`);
        }

        const form = new FormData();
        form.append('file', fs.createReadStream(filePath));

        const response = await axios.post(`${this.engineUrl}/ingest/file`, form, {
            headers: {
                ...form.getHeaders()
            }
        });
        return response.data;
    }

    async embedText(text) {
        const response = await axios.post(`${this.engineUrl}/embed`, {
            text: text
        });
        return response.data;
    }

    async indexDocuments(documents) {
        // documents: [{text, metadata}]
        const response = await axios.post(`${this.engineUrl}/rag/index`, {
            documents: documents
        });
        return response.data;
    }

    async ask(query) {
        const response = await axios.post(`${this.engineUrl}/rag/query`, {
            query: query
        });
        return response.data;
    }

    async checkHealth() {
        try {
            const response = await axios.get(`${this.engineUrl}/health`, { timeout: 2000 });
            return response.data;
        } catch (e) {
            return { status: 'offline', error: e.message };
        }
    }
}

export const engineAgent = Object.freeze(new EngineAgent());
