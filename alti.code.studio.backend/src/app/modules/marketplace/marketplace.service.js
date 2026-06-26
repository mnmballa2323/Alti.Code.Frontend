import { logger } from '../../../shared/logger.js';
import fs from 'fs/promises';
import path from 'path';

/**
 * @fileoverview MarketplaceService — Agent Store & Plugin System (v3.1.0)
 *
 * Uses a file-based JSON registry (`plugins/registry.json`) as the source of
 * truth for installed agents. Available-agent catalog is loaded from
 * `plugins/catalog.json` (shipped with the platform) so the registry
 * contains only *installed* entries.
 */

const COMMUNITY_CATALOG = [
  {
    id: 'agent.python.datascience',
    name: 'Python Data Scientist',
    description:
      'Specializes in pandas, numpy, polars, and machine learning pipelines.',
    author: 'Inso Code.Community',
    category: 'data',
    price: 'Free',
    version: '1.2.0',
    downloads: 14502,
  },
  {
    id: 'agent.rust.systems',
    name: 'Rust Systems Engineer',
    description:
      'Writes memory-safe, performant bare-metal and embedded Rust code.',
    author: 'RustyBot',
    category: 'systems',
    price: 'Free',
    version: '2.0.1',
    downloads: 8321,
  },
  {
    id: 'agent.solidity.auditor',
    name: 'Web3 Solidity Auditor',
    description:
      'Detects reentrancy attacks, integer overflows, and EVM vulnerabilities.',
    author: 'CryptoSec',
    category: 'security',
    price: '$4.99/mo',
    version: '1.0.4',
    downloads: 2100,
  },
  {
    id: 'agent.swift.ios',
    name: 'Swift iOS Engineer',
    description:
      'Expert in SwiftUI, Combine, async/await, and UIKit for Apple platforms.',
    author: 'AppleCraft',
    category: 'mobile',
    price: 'Free',
    version: '1.1.0',
    downloads: 5440,
  },
  {
    id: 'agent.kotlin.android',
    name: 'Kotlin Android Engineer',
    description:
      'Jetpack Compose, Coroutines, Hilt DI, and Material 3 specialist.',
    author: 'DroidLabs',
    category: 'mobile',
    price: 'Free',
    version: '1.0.2',
    downloads: 4210,
  },
  {
    id: 'agent.terraform.iac',
    name: 'Terraform IaC Master',
    description:
      'Writes production-grade Terraform for AWS, GCP, and Azure with modules.',
    author: 'InfraWizard',
    category: 'infrastructure',
    price: '$2.99/mo',
    version: '3.0.0',
    downloads: 7801,
  },
  {
    id: 'agent.graphql.api',
    name: 'GraphQL API Architect',
    description:
      'Schema-first design, subscriptions, DataLoader batching, and federation.',
    author: 'APIFirst',
    category: 'backend',
    price: 'Free',
    version: '1.0.0',
    downloads: 3320,
  },
  {
    id: 'agent.vue.frontend',
    name: 'Vue 3 Frontend Specialist',
    description:
      'Composition API, Pinia, Nuxt 3, and Vite optimisation expert.',
    author: 'VueMasters',
    category: 'frontend',
    price: 'Free',
    version: '2.1.0',
    downloads: 6100,
  },
];

class MarketplaceService {
  constructor() {
    this.pluginsDir = path.join(
      process.cwd(),
      'src/app/modules/agents/plugins',
    );
    this.registryPath = path.join(this.pluginsDir, 'registry.json');
  }

  // ─── Private Helpers ─────────────────────────────────────────────────────

  async _ensurePluginsDir() {
    await fs.mkdir(this.pluginsDir, { recursive: true });
  }

  async _readRegistry() {
    try {
      const raw = await fs.readFile(this.registryPath, 'utf8');
      return JSON.parse(raw);
    } catch {
      return {};
    }
  }

  async _writeRegistry(registry) {
    await this._ensurePluginsDir();
    await fs.writeFile(
      this.registryPath,
      JSON.stringify(registry, null, 2),
      'utf8',
    );
  }

  // ─── Public API ───────────────────────────────────────────────────────────

  /**
   * Returns the full community catalog. Each entry has an `installed` flag
   * derived from the local registry.
   *
   * @param {{ search?: string, category?: string }} [opts]
   * @returns {Promise<Object[]>}
   */
  async listAvailableAgents(opts = {}) {
    const registry = await this._readRegistry();
    const { search = '', category = '' } = opts;

    let agents = COMMUNITY_CATALOG.map(a => ({
      ...a,
      installed: Boolean(registry[a.id]),
    }));

    if (search) {
      const q = search.toLowerCase();
      agents = agents.filter(
        a =>
          a.name.toLowerCase().includes(q) ||
          a.description.toLowerCase().includes(q) ||
          a.category.toLowerCase().includes(q),
      );
    }

    if (category) {
      agents = agents.filter(a => a.category === category.toLowerCase());
    }

    return agents;
  }

  /**
   * Returns details for a single agent by ID.
   *
   * @param {string} agentId
   * @returns {Promise<Object>}
   */
  async getAgentDetails(agentId) {
    const registry = await this._readRegistry();
    const catalogEntry = COMMUNITY_CATALOG.find(a => a.id === agentId);
    if (!catalogEntry)
      throw new Error(`Agent "${agentId}" not found in catalog.`);
    return { ...catalogEntry, installed: Boolean(registry[agentId]) };
  }

  /**
   * Returns all currently installed agents from the local registry.
   *
   * @returns {Promise<Object[]>}
   */
  async listInstalledAgents() {
    const registry = await this._readRegistry();
    return Object.values(registry);
  }

  /**
   * Installs an agent by ID:
   * 1. Validates it exists in the catalog.
   * 2. Generates a plugin `.js` file in the plugins directory.
   * 3. Writes the entry to `registry.json`.
   *
   * @param {string} agentId
   * @param {string} [requestedVersion] — optional version override
   * @returns {Promise<{ success: boolean, message: string, [key: string]: any }>}
   */
  async installAgent(agentId, requestedVersion) {
    await this._ensurePluginsDir();

    const catalogEntry = COMMUNITY_CATALOG.find(a => a.id === agentId);
    if (!catalogEntry) {
      return {
        success: false,
        message: `Agent "${agentId}" not found in community catalog.`,
      };
    }

    const registry = await this._readRegistry();
    if (registry[agentId]) {
      return {
        success: false,
        message: `Agent "${agentId}" is already installed (v${registry[agentId].version}).`,
      };
    }

    const version = requestedVersion || catalogEntry.version;
    const safeId = agentId.replace(/[^a-zA-Z0-9.]/g, '_');
    const pluginPath = path.join(this.pluginsDir, `${safeId}.js`);

    const pluginCode = `/**
 * Auto-Generated Marketplace Plugin
 * Agent ID: ${agentId}
 * Version: ${version}
 * Installed At: ${new Date().toISOString()}
 */
import { BaseSpecialistAgent } from '../base_specialist.agent.js';
import { logger } from '../../../../shared/logger.js';

export class PluginAgent extends BaseSpecialistAgent {
    constructor() {
        super();
        this.name = '${catalogEntry.name}';
        this.manifest = {
            id: '${agentId}',
            version: '${version}',
            capabilities: ['community_skill', 'marketplace_plugin'],
            author: '${catalogEntry.author}',
        };
        logger.info(\`🧩 Plugin Loaded: \${this.name} v${version}\`);
    }

    async execute(task, data) {
        logger.info(\`🧩 \${this.name} executing: \${task}\`);
        return {
            status: 'success',
            agent: this.name,
            version: '${version}',
            result: \`[\${this.name}] Executed: \${task}\`,
        };
    }
}

export const pluginInstance = new PluginAgent();
`;

    await fs.writeFile(pluginPath, pluginCode, 'utf8');

    registry[agentId] = {
      id: agentId,
      name: catalogEntry.name,
      version,
      author: catalogEntry.author,
      category: catalogEntry.category,
      installedAt: new Date().toISOString(),
      pluginPath,
    };
    await this._writeRegistry(registry);

    logger.info(`✅ Marketplace: Installed ${agentId} v${version}`);
    return {
      success: true,
      message: `Agent "${catalogEntry.name}" (v${version}) installed successfully! Reload the agent registry to activate.`,
      agentId,
      version,
      pluginPath,
    };
  }

  /**
   * Uninstalls an agent: removes its `.js` file and registry entry.
   *
   * @param {string} agentId
   * @returns {Promise<{ success: boolean, message: string }>}
   */
  async uninstallAgent(agentId) {
    const registry = await this._readRegistry();

    if (!registry[agentId]) {
      return {
        success: false,
        message: `Agent "${agentId}" is not installed.`,
      };
    }

    const { pluginPath, name, version } = registry[agentId];

    try {
      await fs.unlink(pluginPath);
    } catch (e) {
      logger.warn(
        `⚠️  Could not remove plugin file for ${agentId}: ${e.message}`,
      );
    }

    delete registry[agentId];
    await this._writeRegistry(registry);

    logger.info(`🗑️  Marketplace: Uninstalled ${agentId} v${version}`);
    return {
      success: true,
      message: `Agent "${name}" (v${version}) has been uninstalled.`,
    };
  }
}

export const marketplaceService = new MarketplaceService();
