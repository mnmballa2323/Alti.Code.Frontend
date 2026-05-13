/**
 * Copyright (c) 2024 Alti.Code.Studio
 * 
 * "The Architect" - Infrastructure & DevOps Agent
 * Responsible for generating IaC (Terraform), Docker configs, and Kubernetes manifests.
 */
import fs from 'fs/promises';
import path from 'path';
import { aiProvider } from '../ai/ai.provider.js';
import { logger } from '../../../shared/logger.js';

class ArchitectAgent {
    constructor() {
        this.projectRoot = process.cwd();
        this.infraDir = path.resolve(this.projectRoot, 'infrastructure');
    }

    /**
     * Generate Terraform configuration
     * @param {string} provider 'aws', 'azure', 'gcp'
     * @param {Array} resources List of resources e.g. ['s3', 'lambda']
     */
    async generateTerraform(provider, resources) {
        logger.info(`🏗️ Architect: Designing ${provider} infrastructure...`);

        const prompt = `
        You are "The Architect", a Cloud Infrastructure Expert.
        TASK: Generate Terraform code for ${provider}.
        Resources to include: ${resources.join(', ')}.
        
        Requirements:
        1. Use best practices (modules, variables).
        2. output should be a single main.tf content.
        
        OUTPUT ONLY the Terraform code.
        `;

        const response = await aiProvider.generate(prompt);
        const tfCode = response.replace(/^```(hcl|terraform)?|```$/g, '').trim();

        const dir = path.join(this.infraDir, 'terraform', provider);
        await fs.mkdir(dir, { recursive: true });

        const filePath = path.join(dir, 'main.tf');
        await fs.writeFile(filePath, tfCode);

        return { provider, filePath, status: 'generated' };
    }

    /**
     * Create Docker configuration for the project
     * @param {string} stack e.g. 'node-backend', 'react-frontend'
     */
    async dockerize(stack) {
        logger.info(`🏗️ Architect: Dockerizing ${stack}...`);

        const prompt = `
        You are "The Architect".
        TASK: Create a production-ready Dockerfile for a ${stack} application.
        
        OUTPUT ONLY the Dockerfile content.
        `;

        const response = await aiProvider.generate(prompt);
        const dockerContent = response.replace(/^```(dockerfile)?|```$/g, '').trim();

        await fs.writeFile(path.join(this.projectRoot, 'Dockerfile'), dockerContent);
        return { status: 'dockerized', filePath: 'Dockerfile' };
    }

    /**
     * Generate Kubernetes manifests
     * @param {string} serviceName 
     */
    async generateK8s(serviceName) {
        logger.info(`🏗️ Architect: Generating K8s manifests for ${serviceName}...`);

        const prompt = `
        You are "The Architect".
        TASK: Create a Kubernetes Deployment and Service YAML for ${serviceName}.
        
        OUTPUT ONLY the YAML content.
        `;

        const response = await aiProvider.generate(prompt);
        const yamlContent = response.replace(/^```(yaml|yml)?|```$/g, '').trim();

        const dir = path.join(this.infraDir, 'k8s');
        await fs.mkdir(dir, { recursive: true });

        const filePath = path.join(dir, `${serviceName}-deployment.yaml`);
        await fs.writeFile(filePath, yamlContent);

        return { serviceName, filePath, status: 'generated' };
    }
}

export const architectAgent = new ArchitectAgent();
