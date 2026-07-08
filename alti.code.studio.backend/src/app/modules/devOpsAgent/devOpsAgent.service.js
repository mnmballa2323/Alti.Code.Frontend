/**
 * Copyright (c) 2024 Inso Code
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { logger } from '../../../shared/logger.js';
import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';

const deployToCloud = async (provider, config) => {
  if (!provider || typeof provider !== 'string') {
    throw new Error('DevOpsAgentService: provider must be a non-empty string.');
  }
  if (!config || typeof config !== 'object') {
    throw new Error('DevOpsAgentService: config must be an object.');
  }
  logger.info(
    `🚀 DevOpsAgent: Starting deployment to ${provider} with config:`,
    config,
  );

  let result;
  const rootDir = process.cwd();
  // Assuming backend is at alti.code.studio.backend, go up one
  const projectRoot = path.join(rootDir, '..');

  try {
    switch (provider.toLowerCase()) {
      case 'aws':
      case 'gcp':
      case 'gcp':
        result = await generatePipelineFiles(
          projectRoot,
          provider.toLowerCase(),
          config,
        );
        break;
      default:
        throw new Error(
          `DevOpsAgentService: Unsupported cloud provider: ${provider}`,
        );
    }

    return {
      status: 'pipeline_generated',
      provider,
      deploymentId: `dep-${crypto.randomUUID().slice(0, 8)}`,
      files_created: result.files,
      details: result,
    };
  } catch (err) {
    logger.error(`Failed to generate pipeline for ${provider}: ${err.message}`);
    throw err;
  }
};

const generatePipelineFiles = async (projectRoot, provider, config) => {
  const githubDir = path.join(projectRoot, '.github', 'workflows');
  await fs.mkdir(githubDir, { recursive: true });

  let generatedFiles = [];

  // 1. Generate GitHub Actions Workflow
  const workflowContent = `
name: Deploy to ${provider.toUpperCase()}
on:
  push:
    branches:
      - main

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Code
        uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Deploy
        run: echo "Deploying to ${provider.toUpperCase()} using region ${config.region || 'default'}..."
`;
  const workflowPath = path.join(githubDir, `deploy-${provider}.yml`);
  await fs.writeFile(workflowPath, workflowContent.trim());
  generatedFiles.push(workflowPath);

  // 2. Generate generic docker-compose.yml if requested or by default
  const dockerContent = `
version: "3.8"
services:
  backend:
    build:
      context: ./alti.code.studio.backend
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
  frontend:
    build:
      context: ./alti.code.studio.frontend
    ports:
      - "5173:5173"
`;
  const dockerPath = path.join(projectRoot, 'docker-compose.yml');
  // Only write if it doesn't exist to avoid aggressively overwriting user customs
  try {
    await fs.access(dockerPath);
  } catch {
    await fs.writeFile(dockerPath, dockerContent.trim());
    generatedFiles.push(dockerPath);
  }

  logger.info(`📝 Wrote deployment pipeline configs for ${provider}`);

  return {
    region: config.region || 'default',
    files: generatedFiles,
  };
};

export const DevOpsAgentService = {
  deployToCloud,
};
