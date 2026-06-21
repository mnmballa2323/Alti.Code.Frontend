/**
 * Copyright (c) 2026 Alti.Code.Studio
 * 
 * Dynamic Agentic Resource Discovery (ARD) Catalog Controller.
 * Supports catalog generation, external catalog crawling/resolving, and dynamic tool installation.
 */

import { agentRegistry } from '../agents/agent.registry.js';
import { mcpClientService } from '../mcp/mcp.client.js';
import { catchAsync } from '../../../shared/catchAsync.js';
import httpStatus from 'http-status';
import fs from 'fs';
import path from 'path';

// Serve local catalog
const getCatalog = catchAsync(async (req, res) => {
    const rawAgents = agentRegistry.list() || [];
    
    // Select the key core agents to keep the catalog payload clean and highly focused
    const coreAgentNames = [
        'architect', 'weaver', 'sentinel', 'auditor', 'polyglot', 'ceo', 'cfo', 'cto',
        'developer', 'designer', 'tester', 'agent_s', 'browser_use', 'fazm',
        'code_review', 'refactor', 'security', 'compliance', 'database', 'mcp'
    ];
    
    const selectedAgents = rawAgents.filter(a => 
        coreAgentNames.includes(a.name) || 
        (a.name && a.name.length < 15 && !a.name.includes('_'))
    ).slice(0, 40);

    const hostHeader = req.headers.host || 'alti.code.studio';
    const domainOnly = hostHeader.split(':')[0];
    const protocol = req.secure ? 'https' : 'http';
    const baseUrl = `${protocol}://${hostHeader}`;

    const entries = [];

    // 1. Map Agents
    for (const agent of selectedAgents) {
        const nameFormatted = agent.name.charAt(0).toUpperCase() + agent.name.slice(1);
        entries.push({
            identifier: `urn:air:${domainOnly}:agent:${agent.name}`,
            displayName: `${nameFormatted} Agent`,
            type: "application/x-agent+json",
            url: `${baseUrl}/api/v1/agents/status`,
            capabilities: agent.capabilities || ["autonomous_agentic_workflow", "codebase_context_solving"],
            representativeQueries: [
                `ask the ${agent.name} agent to help solve my task`,
                `use the ${agent.name} agent for domain expert intelligence`
            ]
        });
    }

    // 2. Map MCP Servers
    const mcpServers = [];
    if (mcpClientService && mcpClientService.clients instanceof Map) {
        for (const serverName of mcpClientService.clients.keys()) {
            mcpServers.push({
                name: serverName,
                description: `Model Context Protocol server running tools for ${serverName}`
            });
        }
    }

    // Fallback static list of presets if no active clients yet
    if (mcpServers.length === 0) {
        const presets = ['local-sqlite', 'github', 'graphify', 'fazm', 'puppeteer', 'codebase-memory'];
        presets.forEach(p => mcpServers.push({
            name: p,
            description: `Model Context Protocol server running tools for ${p}`
        }));
    }

    for (const mcp of mcpServers) {
        const nameFormatted = mcp.name.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
        entries.push({
            identifier: `urn:air:${domainOnly}:mcp-server:${mcp.name}`,
            displayName: `${nameFormatted} MCP Server`,
            type: "application/mcp-server-card+json",
            url: `${baseUrl}/api/v1/mcp/tools`,
            capabilities: ["model_context_protocol", "tool_execution_environment"],
            representativeQueries: [
                `connect to the ${mcp.name} mcp server`,
                `run tools from the ${mcp.name} server`
            ]
        });
    }

    const catalog = {
        specVersion: "1.0",
        host: {
            displayName: "Alti.Code.Studio",
            identifier: `did:web:${domainOnly}`,
            documentationUrl: `${baseUrl}/docs`
        },
        entries
    };

    res.setHeader('Content-Type', 'application/json');
    res.status(httpStatus.OK).json(catalog);
});

// Helper for HTTP fetch with a timeout limit
async function fetchWithTimeout(resource, options = {}) {
    const { timeout = 8000 } = options;
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    try {
        const response = await fetch(resource, {
            ...options,
            signal: controller.signal
        });
        clearTimeout(id);
        return response;
    } catch (err) {
        clearTimeout(id);
        throw err;
    }
}

// Helper to save a resolved catalog to federated registry
function saveToFederatedRegistry(parsedUrl, origin, catalogUrl, catalogData) {
    const federatedFilePath = path.join(process.cwd(), '.alti/federated_catalogs.json');
    let federated = [];
    if (fs.existsSync(federatedFilePath)) {
        try {
            const fileData = fs.readFileSync(federatedFilePath, 'utf8');
            federated = JSON.parse(fileData);
        } catch (err) {
            console.error('Failed to parse federated catalogs JSON:', err);
        }
    }
    const dirPath = path.dirname(federatedFilePath);
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
    const domain = parsedUrl.hostname;
    const existingIdx = federated.findIndex(f => f.domain === domain || f.catalogUrl === catalogUrl);
    const catalogEntry = {
        domain,
        origin,
        catalogUrl,
        displayName: catalogData.host?.displayName || domain,
        identifier: catalogData.host?.identifier || `did:web:${domain}`,
        lastResolvedAt: new Date().toISOString(),
        catalog: catalogData
    };
    if (existingIdx > -1) {
        federated[existingIdx] = catalogEntry;
    } else {
        federated.push(catalogEntry);
    }
    fs.writeFileSync(federatedFilePath, JSON.stringify(federated, null, 2), 'utf8');
}

// Resolve external catalog via robots.txt Agentmap or well-known URI
const resolveCatalog = catchAsync(async (req, res) => {
    let target = req.body.url;
    if (!target) {
        return res.status(httpStatus.BAD_REQUEST).json({
            success: false,
            message: "Target URL or domain is required."
        });
    }

    // Standardize URL schema
    target = target.trim();
    if (!/^https?:\/\//i.test(target)) {
        target = `https://${target}`;
    }

    let parsedUrl;
    try {
        parsedUrl = new URL(target);
    } catch (err) {
        return res.status(httpStatus.BAD_REQUEST).json({
            success: false,
            message: "Invalid URL provided."
        });
    }

    const origin = parsedUrl.origin;
    let catalogUrl = null;

    // 1. Try robots.txt Agentmap lookup
    try {
        const robotsRes = await fetchWithTimeout(`${origin}/robots.txt`);
        if (robotsRes.ok) {
            const text = await robotsRes.text();
            const lines = text.split('\n');
            for (const line of lines) {
                if (line.trim().toLowerCase().startsWith('agentmap:')) {
                    const extracted = line.substring(line.indexOf(':') + 1).trim();
                    if (/^https?:\/\//i.test(extracted)) {
                        catalogUrl = extracted;
                    } else {
                        catalogUrl = `${origin}${extracted.startsWith('/') ? '' : '/'}${extracted}`;
                    }
                    break;
                }
            }
        }
    } catch (err) {
        console.warn(`Discovery: Failed to crawl robots.txt for ${origin}: ${err.message}`);
    }

    // 2. Fallback to Well-Known path if not found in robots.txt
    if (!catalogUrl) {
        catalogUrl = `${origin}/.well-known/ai-catalog.json`;
    }

    // 3. Fetch catalog payload
    try {
        const catalogRes = await fetchWithTimeout(catalogUrl);
        if (!catalogRes.ok) {
            // Fallback second attempt using HTTP if HTTPS failed (for local dev)
            if (origin.startsWith('https://') && origin.includes('localhost') || origin.includes('127.0.0.1')) {
                const httpCatalogUrl = catalogUrl.replace(/^https:/i, 'http:');
                const secondRes = await fetchWithTimeout(httpCatalogUrl);
                if (secondRes.ok) {
                    const catalogData = await secondRes.json();
                    saveToFederatedRegistry(parsedUrl, origin, httpCatalogUrl, catalogData);
                    return res.status(httpStatus.OK).json({
                        success: true,
                        catalogUrl: httpCatalogUrl,
                        catalog: catalogData
                    });
                }
            }
            throw new Error(`Catalog server returned status ${catalogRes.status}`);
        }

        const catalogData = await catalogRes.json();
        
        // Basic schema verification
        if (!catalogData.specVersion || !catalogData.host || !Array.isArray(catalogData.entries)) {
            return res.status(httpStatus.UNPROCESSABLE_ENTITY).json({
                success: false,
                message: "Discovered catalog is not conformant to the ARD specification schema.",
                catalog: catalogData
            });
        }

        saveToFederatedRegistry(parsedUrl, origin, catalogUrl, catalogData);

        return res.status(httpStatus.OK).json({
            success: true,
            catalogUrl,
            catalog: catalogData
        });
    } catch (err) {
        return res.status(httpStatus.BAD_GATEWAY).json({
            success: false,
            message: `Failed to retrieve ARD ai-catalog.json at ${catalogUrl}: ${err.message}`
        });
    }
});

// Install discovered remote capability locally
const installResource = catchAsync(async (req, res) => {
    const { name, title, description, command, args, env } = req.body;
    if (!name || !command) {
        return res.status(httpStatus.BAD_REQUEST).json({
            success: false,
            message: "Capability name and run command are required for installation."
        });
    }

    const customServersFilePath = path.join(process.cwd(), '.alti/custom_mcp_servers.json');
    let servers = [];

    if (fs.existsSync(customServersFilePath)) {
        try {
            const fileData = fs.readFileSync(customServersFilePath, 'utf8');
            servers = JSON.parse(fileData);
        } catch (err) {
            console.error('Failed to parse custom MCP servers JSON:', err);
        }
    }

    const dirPath = path.dirname(customServersFilePath);
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }

    const existingIndex = servers.findIndex(s => s.name === name);
    const newServer = {
        name,
        title: title || name,
        description: description || `ARD Discovered Model Context Protocol server`,
        command,
        args: args || [],
        env: env || {},
        installedVia: "ard-spec-discovery",
        installedAt: new Date().toISOString()
    };

    if (existingIndex > -1) {
        servers[existingIndex] = newServer;
    } else {
        servers.push(newServer);
    }

    fs.writeFileSync(customServersFilePath, JSON.stringify(servers, null, 2), 'utf8');

    // Instantly spin up, connect, and mount the new server locally as a swarm agent
    try {
        const { mcpGateway } = await import('../mcp/mcp_gateway.service.js');
        await mcpGateway.mountServer(name, { command, args: args || [], env: env || {} });
    } catch (connectErr) {
        console.warn(`Dynamic mount failed for newly installed MCP server ${name}:`, connectErr.message);
    }

    res.status(httpStatus.OK).json({
        success: true,
        message: `Capability [${name}] installed and activated successfully.`,
        data: servers
    });
});

// Get all tracked federated catalogs
const getFederatedCatalogs = catchAsync(async (req, res) => {
    const federatedFilePath = path.join(process.cwd(), '.alti/federated_catalogs.json');
    let federated = [];
    if (fs.existsSync(federatedFilePath)) {
        try {
            const fileData = fs.readFileSync(federatedFilePath, 'utf8');
            federated = JSON.parse(fileData);
        } catch (err) {
            console.error('Failed to parse federated catalogs JSON:', err);
        }
    }
    res.status(httpStatus.OK).json({
        success: true,
        data: federated
    });
});

// Remove a tracked federated catalog
const removeFederatedCatalog = catchAsync(async (req, res) => {
    const { domain } = req.params;
    if (!domain) {
        return res.status(httpStatus.BAD_REQUEST).json({
            success: false,
            message: "Domain is required for removal."
        });
    }
    const federatedFilePath = path.join(process.cwd(), '.alti/federated_catalogs.json');
    let federated = [];
    if (fs.existsSync(federatedFilePath)) {
        try {
            const fileData = fs.readFileSync(federatedFilePath, 'utf8');
            federated = JSON.parse(fileData);
        } catch (err) {
            console.error('Failed to parse federated catalogs JSON:', err);
        }
    }
    const filtered = federated.filter(f => f.domain !== domain && f.origin !== domain);
    fs.writeFileSync(federatedFilePath, JSON.stringify(filtered, null, 2), 'utf8');
    res.status(httpStatus.OK).json({
        success: true,
        message: `Federated catalog for domain [${domain}] removed successfully.`,
        data: filtered
    });
});

// Sync all tracked federated catalogs in background
export async function syncFederatedCatalogs() {
    const federatedFilePath = path.join(process.cwd(), '.alti/federated_catalogs.json');
    if (!fs.existsSync(federatedFilePath)) return;

    let federated = [];
    try {
        const fileData = fs.readFileSync(federatedFilePath, 'utf8');
        federated = JSON.parse(fileData);
    } catch (err) {
        console.error('Sync: Failed to parse federated catalogs:', err.message);
        return;
    }

    console.log(`🔄 [DiscoverySync] Syncing ${federated.length} tracked federated catalogs...`);

    for (let i = 0; i < federated.length; i++) {
        const entry = federated[i];
        try {
            const res = await fetchWithTimeout(entry.catalogUrl);
            if (res.ok) {
                const catalogData = await res.json();
                if (catalogData.specVersion && catalogData.host && Array.isArray(catalogData.entries)) {
                    federated[i] = {
                        ...entry,
                        displayName: catalogData.host?.displayName || entry.domain,
                        identifier: catalogData.host?.identifier || entry.identifier,
                        lastResolvedAt: new Date().toISOString(),
                        catalog: catalogData
                    };
                    console.log(`✅ [DiscoverySync] Successfully updated catalog for: ${entry.domain}`);
                }
            }
        } catch (err) {
            console.warn(`⚠️ [DiscoverySync] Failed to sync catalog for ${entry.domain}: ${err.message}`);
        }
    }

    try {
        fs.writeFileSync(federatedFilePath, JSON.stringify(federated, null, 2), 'utf8');
    } catch (err) {
        console.error('Sync: Failed to write federated catalogs back to disk:', err.message);
    }
}

export const DiscoveryController = {
    getCatalog,
    resolveCatalog,
    installResource,
    getFederatedCatalogs,
    removeFederatedCatalog
};
