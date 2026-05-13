/**
 * Copyright (c) 2024 Alti.Code.Studio
 * 
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { logger } from '../../../shared/logger.js';
import fs from 'fs/promises';
import path from 'path';

const applyInfrastructure = async (tool, stackName) => {
    if (!tool || typeof tool !== 'string') {
        throw new Error('IacAgentService: tool must be a non-empty string.');
    }
    if (!stackName || typeof stackName !== 'string') {
        throw new Error('IacAgentService: stackName must be a non-empty string.');
    }
    logger.info(`🚀 IaC Agent: Applying infrastructure using ${tool} for stack: ${stackName}`);

    try {
        const rootDir = process.cwd();
        // Go up one level to the workspace root and into an infrastructure folder
        const infraDir = path.join(rootDir, '..', 'infrastructure', stackName);
        await fs.mkdir(infraDir, { recursive: true });

        let generatedFiles = [];

        if (tool.toLowerCase() === 'terraform') {
            const tfContent = `
# Generated Terraform configuration for stack: ${stackName}

provider "google" {
  project = var.project_id
  region  = "us-central1"
}

resource "google_compute_network" "vpc_network" {
  name = "${stackName}-vpc"
  auto_create_subnetworks = false
}

resource "google_compute_subnetwork" "subnet" {
  name          = "${stackName}-subnet"
  ip_cidr_range = "10.0.1.0/24"
  region        = "us-central1"
  network       = google_compute_network.vpc_network.id
}
`;
            const mainTfPath = path.join(infraDir, 'main.tf');
            await fs.writeFile(mainTfPath, tfContent.trim());
            generatedFiles.push(mainTfPath);
            logger.info(`📝 Wrote Terraform architecture to ${mainTfPath}`);
        } else if (tool.toLowerCase() === 'kubernetes') {
            const k8sContent = `
# Generated Kubernetes deployment for stack: ${stackName}
apiVersion: apps/v1
kind: Deployment
metadata:
  name: ${stackName}-deployment
  labels:
    app: ${stackName}
spec:
  replicas: 3
  selector:
    matchLabels:
      app: ${stackName}
  template:
    metadata:
      labels:
        app: ${stackName}
    spec:
      containers:
      - name: ${stackName}-container
        image: gcr.io/my-project/${stackName}:latest
        ports:
        - containerPort: 8080
`;
            const deployYamlPath = path.join(infraDir, 'deployment.yaml');
            await fs.writeFile(deployYamlPath, k8sContent.trim());
            generatedFiles.push(deployYamlPath);
            logger.info(`📝 Wrote Kubernetes manifest to ${deployYamlPath}`);
        } else {
            // Default generic config writer
            const genericPath = path.join(infraDir, 'config.json');
            await fs.writeFile(genericPath, JSON.stringify({ stack: stackName, tool, timestamp: Date.now() }, null, 2));
            generatedFiles.push(genericPath);
        }

        return {
            status: 'success',
            tool,
            stack: stackName,
            files_generated: generatedFiles.length,
            locations: generatedFiles,
        };
    } catch (err) {
        logger.error(`Failed to generate IaC for ${stackName}: ${err.message}`);
        throw err;
    }
};

export const IacAgentService = {
    applyInfrastructure,
};
