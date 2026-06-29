/**
 * Copyright (c) 2026 Inso Code
 *
 * customAgent.service.js — Persistence and routing for custom user-created agents.
 * Optimized with in-memory caching and non-blocking background disk flushes.
 */

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import { logger } from '../../../shared/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Save file path inside database / workspace boundary
const AGENTS_FILE_PATH = path.join(
  __dirname,
  '../../../../data/custom_agents.json',
);

// In-memory cache to eliminate multiple disk reads
let cachedAgents = null;

// Initialize folder structure
function ensureDirectoryExists() {
  const dir = path.dirname(AGENTS_FILE_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

/**
 * Lazy loads all custom agents into the in-memory cache.
 */
function getAgentsCache() {
  if (!fs.existsSync(AGENTS_FILE_PATH)) {
    cachedAgents = [];
    return cachedAgents;
  }
  if (cachedAgents !== null) {
    return cachedAgents;
  }
  try {
    ensureDirectoryExists();
    if (fs.existsSync(AGENTS_FILE_PATH)) {
      const rawData = fs.readFileSync(AGENTS_FILE_PATH, 'utf-8');
      cachedAgents = JSON.parse(rawData);
    } else {
      cachedAgents = [];
    }
  } catch (err) {
    logger.error('Failed to load custom agents from disk:', err);
    cachedAgents = [];
  }
  return cachedAgents;
}

/**
 * Synchronous disk flush to avoid race conditions.
 */
function flushAgentsCacheToDisk() {
  if (cachedAgents === null) return;
  try {
    fs.writeFileSync(
      AGENTS_FILE_PATH,
      JSON.stringify(cachedAgents, null, 2),
      'utf-8',
    );
  } catch (err) {
    logger.error('Failed to save custom agents to disk:', err);
  }
}

/**
 * Creates a new custom agent.
 */
function createAgent({
  name,
  description = '',
  prompt = '',
  tools = [],
  userId,
}) {
  const agents = getAgentsCache();
  const newAgent = {
    id: `custom-agent-${crypto.randomUUID()}`,
    name,
    description,
    prompt,
    tools,
    userId,
    createdAt: new Date().toISOString(),
  };

  agents.push(newAgent);
  flushAgentsCacheToDisk();
  logger.info(`🤖 Custom agent created successfully: ${name} [${newAgent.id}]`);
  return newAgent;
}

/**
 * Retrieves custom agents for a user.
 */
function getAgents(userId) {
  const agents = getAgentsCache();
  return agents.filter(agent => !userId || agent.userId === userId);
}

/**
 * Retrieves a single custom agent.
 */
function getAgentById(id) {
  const agents = getAgentsCache();
  return agents.find(agent => agent.id === id) || null;
}

/**
 * Deletes a custom agent.
 */
function deleteAgent(id, userId) {
  const agents = getAgentsCache();
  const index = agents.findIndex(
    agent => agent.id === id && (!userId || agent.userId === userId),
  );

  if (index === -1) return false;

  const deletedAgent = agents.splice(index, 1)[0];
  flushAgentsCacheToDisk();
  logger.info(
    `🗑️ Custom agent deleted successfully: ${deletedAgent.name} [${id}]`,
  );
  return true;
}

export const CustomAgentService = {
  createAgent,
  getAgents,
  getAgentById,
  deleteAgent,
};
