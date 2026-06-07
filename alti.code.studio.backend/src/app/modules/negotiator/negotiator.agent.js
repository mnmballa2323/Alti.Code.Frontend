/**
 * Copyright (c) 2024 Inso Code
 * 
 * "The Negotiator" - Integration & Connectivity Agent
 * Responsible for scaffolding 3rd party integrations, webhooks, and mocks.
 */
import fs from 'fs/promises';
import path from 'path';
import { aiProvider } from '../ai/ai.provider.js';
import { logger } from '../../../shared/logger.js';

class NegotiatorAgent {
    constructor() {
        this.projectRoot = process.cwd();
        this.integrationsDir = path.resolve(this.projectRoot, 'src/app/modules/integrations');
    }

    /**
     * Scaffold a new integration module
     * @param {string} serviceName e.g., 'stripe', 'twilio'
     * @param {string} description Usage context
     */
    async scaffoldIntegration(serviceName, description) {
        logger.info(`🤝 Negotiator: Scaffolding integration for ${serviceName}...`);

        const prompt = `
        You are "The Negotiator", a Backend Integration Specialist.
        TASK: Create a Service Class for interacting with: ${serviceName}.
        Context: ${description}
        
        Requirements:
        1. Use 'axios' or specific SDK if common (e.g. stripe).
        2. Include methods for common operations based on the service name.
        3. Include error handling.
        4. Return ONLY the code for the service file.
        `;

        const response = await aiProvider.generate(prompt);
        const code = response.replace(/^```(javascript|js|ts)?|```$/g, '').trim();

        // Save file
        const dir = path.join(this.integrationsDir, serviceName);
        await fs.mkdir(dir, { recursive: true });

        const filePath = path.join(dir, `${serviceName}.service.js`);
        await fs.writeFile(filePath, code);

        logger.info(`✅ Negotiator: Created ${filePath}`);
        return { serviceName, filePath, code };
    }

    /**
     * Create a Mock for testing
     * @param {string} serviceName 
     */
    async generateMock(serviceName) {
        logger.info(`🤝 Negotiator: Generating mock for ${serviceName}...`);

        const prompt = `
        You are "The Negotiator".
        TASK: Create a Mock implementation for: ${serviceName}.
        It should export an object with the same methods as a typical service, but returning static dummy data.
        
        Return ONLY the code.
        `;

        const response = await aiProvider.generate(prompt);
        const code = response.replace(/^```(javascript|js|ts)?|```$/g, '').trim();

        const dir = path.join(this.integrationsDir, serviceName);
        await fs.mkdir(dir, { recursive: true });

        const filePath = path.join(dir, `${serviceName}.mock.js`);
        await fs.writeFile(filePath, code);

        return { serviceName, filePath, code };
    }

    /**
     * Scaffold a Webhook Handler
     * @param {string} serviceName 
     */
    async createWebhookHandler(serviceName) {
        logger.info(`🤝 Negotiator: Creating webhook handler for ${serviceName}...`);

        const prompt = `
        You are "The Negotiator".
        TASK: Create an Express Controller to handle webhooks from: ${serviceName}.
        
        Requirements:
        1. Verify signature if applicable (generic comment/placeholder).
        2. Switch/Case on event types.
        3. Log events.
        4. Return 200 OK immediately.
        
        Return ONLY the code.
        `;

        const response = await aiProvider.generate(prompt);
        const code = response.replace(/^```(javascript|js|ts)?|```$/g, '').trim();

        const dir = path.join(this.integrationsDir, serviceName);
        await fs.mkdir(dir, { recursive: true });

        const filePath = path.join(dir, `${serviceName}.webhook.js`);
        await fs.writeFile(filePath, code);

        return { serviceName, filePath, code };
    }
}

export const negotiatorAgent = new NegotiatorAgent();
