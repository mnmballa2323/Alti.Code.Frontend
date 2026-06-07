/**
 * Powers Service — Plugin/Extension Marketplace
 *
 * Powers are bundles of: MCP server config + steering files + agent hooks.
 * They extend the AI's capabilities on-demand without MCP context overload.
 *
 * Installed powers stored in .alti/powers.json
 */

import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import { logger } from '../../../shared/logger.js';
import { steeringService } from '../steering/steering.service.js';
import { hooksService } from '../hooks/hooks.service.js';

// Built-in powers registry
const POWERS_REGISTRY = [
    {
        id: 'figma-to-code',
        name: 'Figma to Code',
        description: 'Transform Figma designs into production-ready components.',
        provider: 'Inso Code',
        category: 'Design',
        tags: ['design', 'ui', 'figma'],
        mcpConfig: { command: 'npx', args: ['-y', '@alti/mcp-figma'], env: { FIGMA_API_KEY: '' } },
        steering: [{ name: 'figma-conventions', content: '# Figma-to-Code\n\nWhen converting designs, use Tailwind CSS utility classes. Prefer semantic HTML elements. Extract reusable components for repeated UI patterns.' }],
        hooks: [],
    },
    {
        id: 'github-deep',
        name: 'GitHub Deep Integration',
        description: 'Create PRs, review code, manage issues and branches directly from the AI.',
        provider: 'Inso Code',
        category: 'DevOps',
        tags: ['git', 'github', 'ci/cd'],
        mcpConfig: { command: 'npx', args: ['-y', '@modelcontextprotocol/server-github'], env: { GITHUB_TOKEN: '' } },
        steering: [{ name: 'github-workflow', content: '# GitHub Workflow\n\nBranch naming: `feature/`, `fix/`, `chore/`.\nPR titles follow conventional commits: `feat:`, `fix:`, `docs:`.\nAlways run tests before creating a PR.' }],
        hooks: [{ name: 'Auto-commit docs on save', trigger: { type: 'file-save', filePattern: '*.md' }, action: { type: 'agent-prompt', value: 'Review the saved markdown file for broken links and formatting issues. Suggest corrections.' } }],
    },
    {
        id: 'terraform-iac',
        name: 'Terraform + IaC',
        description: 'Plan, apply, and review Terraform infrastructure with AI assistance.',
        provider: 'Inso Code',
        category: 'Infrastructure',
        tags: ['terraform', 'iac', 'cloud'],
        mcpConfig: null,
        steering: [{ name: 'terraform-standards', content: '# Terraform Standards\n\nUse modules for reusable infrastructure.\nAll resources must have tags: `environment`, `owner`, `project`.\nStore state in remote backend (GCS or S3).\nRun `terraform plan` before any apply.' }],
        hooks: [{ name: 'Validate Terraform on save', trigger: { type: 'file-save', filePattern: '*.tf' }, action: { type: 'shell-command', value: 'terraform validate' } }],
    },
    {
        id: 'supabase',
        name: 'Supabase Backend',
        description: 'Build, query, and manage your Supabase database and edge functions.',
        provider: 'Supabase',
        category: 'Database',
        tags: ['supabase', 'postgres', 'realtime'],
        mcpConfig: { command: 'npx', args: ['-y', '@supabase/mcp-server-supabase@latest', '--read-only'], env: { SUPABASE_ACCESS_TOKEN: '' } },
        steering: [{ name: 'supabase-conventions', content: '# Supabase Conventions\n\nUse Row Level Security (RLS) on all tables.\nEdge functions live in `supabase/functions/`.\nUse typed query builders via generated types.\nAlways handle Supabase auth errors explicitly.' }],
        hooks: [],
    },
    {
        id: 'stripe-payments',
        name: 'Stripe Payments',
        description: 'Integrate Stripe payment flows, webhooks, and customer management.',
        provider: 'Stripe',
        category: 'Payments',
        tags: ['stripe', 'payments', 'billing'],
        mcpConfig: { command: 'npx', args: ['-y', '@stripe/mcp', '--tools=all'], env: { STRIPE_SECRET_KEY: '' } },
        steering: [{ name: 'stripe-conventions', content: '# Stripe Integration\n\nAlways use webhook signature verification.\nStore only Stripe customer IDs, never raw card data.\nTest with Stripe\'s test keys before going live.\nHandle idempotency keys for all payment creation calls.' }],
        hooks: [],
    },
    {
        id: 'auto-test-gen',
        name: 'Auto Test Generator',
        description: 'Automatically generate unit tests whenever you save a source file.',
        provider: 'Inso Code',
        category: 'Testing',
        tags: ['testing', 'jest', 'automation'],
        mcpConfig: null,
        steering: [{ name: 'test-generation', content: '# Test Generation Standards\n\nFor each new function, generate a corresponding `.test.js` file.\nMock all external dependencies.\nTest happy path, error path, and edge cases.\nAssert on specific return values, not just truthiness.' }],
        hooks: [{ name: 'Generate tests on file save', trigger: { type: 'file-save', filePattern: '*.js' }, action: { type: 'agent-prompt', value: 'Analyze the saved file and generate comprehensive Jest unit tests for any exported functions that don\'t have tests yet. Place tests in the same directory.' } }],
    },
    {
        id: 'auto-doc',
        name: 'Auto Documentation',
        description: 'Keep your JSDoc and README files up-to-date automatically.',
        provider: 'Inso Code',
        category: 'Documentation',
        tags: ['docs', 'jsdoc', 'automation'],
        mcpConfig: null,
        steering: [{ name: 'documentation-standards', content: '# Documentation Standards\n\nAll exported functions must have JSDoc comments.\nREADME should reflect current API surface.\nChangelog entries follow Keep-a-Changelog format.\nInline comments for non-obvious logic only.' }],
        hooks: [{ name: 'Update JSDoc on save', trigger: { type: 'file-save', filePattern: '*.js' }, action: { type: 'agent-prompt', value: 'Review the saved file and add or update JSDoc comments for any exported functions missing documentation. Preserve existing comments.' } }],
    },
    {
        id: 'security-scan',
        name: 'Security Sentinel',
        description: 'Auto-scan code for vulnerabilities on every file save.',
        provider: 'Inso Code',
        category: 'Security',
        tags: ['security', 'SAST', 'vulnerabilities'],
        mcpConfig: null,
        steering: [{ name: 'security-standards', content: '# Security Standards\n\nNever commit secrets or API keys.\nValidate all user input at the boundary.\nSanitize all database query parameters.\nUse parameterized queries, never string concatenation.\nLog security events with correlation IDs.' }],
        hooks: [{ name: 'Scan for vulnerabilities', trigger: { type: 'file-save', filePattern: '*.js' }, action: { type: 'agent-prompt', value: 'Security-scan this file for: SQL injection, XSS, SSRF, hardcoded secrets, missing input validation, insecure deserialization. Report any issues found.' } }],
    },
];

class PowersService {
    constructor() {
        this.configDir = path.join(process.cwd(), '.alti');
        this.installedPath = path.join(this.configDir, 'powers.json');
    }

    async _ensureConfig() {
        await fs.mkdir(this.configDir, { recursive: true });
        try {
            await fs.access(this.installedPath);
        } catch {
            await fs.writeFile(this.installedPath, JSON.stringify([], null, 2));
        }
    }

    async _readInstalled() {
        await this._ensureConfig();
        const raw = await fs.readFile(this.installedPath, 'utf-8');
        return JSON.parse(raw);
    }

    async _writeInstalled(installed) {
        await this._ensureConfig();
        await fs.writeFile(this.installedPath, JSON.stringify(installed, null, 2));
    }

    // ─── LISTING ─────────────────────────────────────────────────────────────

    async listAvailablePowers() {
        const installed = await this._readInstalled();
        const installedIds = new Set(installed.map(p => p.id));
        return POWERS_REGISTRY.map(p => ({
            ...p,
            installed: installedIds.has(p.id),
        }));
    }

    async getInstalledPowers() {
        const installed = await this._readInstalled();
        return installed.map(p => ({
            ...p,
            details: POWERS_REGISTRY.find(r => r.id === p.id) || null,
        }));
    }

    async getPowerDetails(powerId) {
        const power = POWERS_REGISTRY.find(p => p.id === powerId);
        if (!power) throw new Error(`Power "${powerId}" not found in registry.`);
        const installed = await this._readInstalled();
        return { ...power, installed: installed.some(p => p.id === powerId) };
    }

    // ─── INSTALL / UNINSTALL ─────────────────────────────────────────────────

    /**
     * Install a power: add MCP config, unpack steering files, add hooks.
     * @param {string} powerId
     */
    async installPower(powerId) {
        const power = POWERS_REGISTRY.find(p => p.id === powerId);
        if (!power) throw new Error(`Power "${powerId}" not found.`);

        const installed = await this._readInstalled();
        if (installed.some(p => p.id === powerId)) {
            throw new Error(`Power "${powerId}" is already installed.`);
        }

        const results = { steering: [], hooks: [], mcp: null };

        // 1. Unpack steering files
        for (const s of power.steering || []) {
            try {
                await steeringService.createSteering(
                    `[${power.name}] ${s.name}`,
                    s.content,
                    { scope: 'workspace', inclusion: 'always' }
                );
                results.steering.push(s.name);
            } catch (e) {
                logger.warn(`Powers: steering "${s.name}" already exists, skipping.`);
            }
        }

        // 2. Create hooks
        for (const h of power.hooks || []) {
            try {
                const hook = await hooksService.createHook({
                    name: `[${power.name}] ${h.name}`,
                    trigger: h.trigger,
                    action: h.action,
                    enabled: true,
                });
                results.hooks.push(hook.id);
            } catch (e) {
                logger.warn(`Powers: hook "${h.name}" install failed: ${e.message}`);
            }
        }

        // 3. MCP config placeholder (user must fill in env vars)
        if (power.mcpConfig) {
            results.mcp = { ...power.mcpConfig, note: 'Fill in env vars in .alti/mcp.json' };
            // Write/update MCP config
            const mcpConfigPath = path.join(this.configDir, 'mcp.json');
            let mcpConfig = {};
            try {
                mcpConfig = JSON.parse(await fs.readFile(mcpConfigPath, 'utf-8'));
            } catch { }
            mcpConfig[powerId] = power.mcpConfig;
            await fs.writeFile(mcpConfigPath, JSON.stringify(mcpConfig, null, 2));
        }

        installed.push({
            id: powerId,
            name: power.name,
            installedAt: new Date().toISOString(),
            steeringFiles: results.steering,
            hookIds: results.hooks,
        });
        await this._writeInstalled(installed);

        logger.info(`⚡ Powers: installed "${power.name}"`);
        return { success: true, powerId, name: power.name, results };
    }

    /**
     * Uninstall a power: remove its steering files and hooks.
     * @param {string} powerId
     */
    async uninstallPower(powerId) {
        const installed = await this._readInstalled();
        const entry = installed.find(p => p.id === powerId);
        if (!entry) throw new Error(`Power "${powerId}" is not installed.`);

        const power = POWERS_REGISTRY.find(p => p.id === powerId);

        // Remove steering files
        for (const sName of entry.steeringFiles || []) {
            try {
                const filename = sName.toLowerCase().replace(/[^a-z0-9-_]/g, '-').replace(/-+/g, '-') + '.md';
                await steeringService.deleteSteering(filename);
            } catch (e) {
                logger.warn(`Powers: could not delete steering "${sName}": ${e.message}`);
            }
        }

        // Remove hooks
        for (const hookId of entry.hookIds || []) {
            try {
                await hooksService.deleteHook(hookId);
            } catch (e) {
                logger.warn(`Powers: could not delete hook "${hookId}": ${e.message}`);
            }
        }

        // Remove from MCP config
        if (power?.mcpConfig) {
            const mcpConfigPath = path.join(this.configDir, 'mcp.json');
            try {
                const mcpConfig = JSON.parse(await fs.readFile(mcpConfigPath, 'utf-8'));
                delete mcpConfig[powerId];
                await fs.writeFile(mcpConfigPath, JSON.stringify(mcpConfig, null, 2));
            } catch { }
        }

        const filtered = installed.filter(p => p.id !== powerId);
        await this._writeInstalled(filtered);

        logger.info(`⚡ Powers: uninstalled "${entry.name}"`);
        return { success: true, powerId, name: entry.name };
    }
}

export const powersService = new PowersService();
