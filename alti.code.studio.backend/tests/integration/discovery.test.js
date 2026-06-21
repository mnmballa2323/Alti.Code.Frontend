import { test, expect, vi } from 'vitest';
import { DiscoveryController } from '../../src/app/modules/discovery/discovery.controller.js';
import { mcpClientService } from '../../src/app/modules/mcp/mcp.client.js';
import { mcpGateway } from '../../src/app/modules/mcp/mcp_gateway.service.js';
import { capabilityRouter } from '../../src/app/modules/agents/capability.router.js';
import fs from 'fs';

test('DiscoveryController: dynamic ARD catalog compliance test', async () => {
    const req = {
        headers: {
            host: 'alti.code.studio:5000'
        },
        secure: false
    };

    let responseStatus = 200;
    let responseHeaders = {};
    let responseBody = null;

    let resolveTest;
    const testPromise = new Promise((resolve) => {
        resolveTest = resolve;
    });

    const res = {
        setHeader(name, value) {
            responseHeaders[name] = value;
            return this;
        },
        status(code) {
            responseStatus = code;
            return this;
        },
        json(body) {
            responseBody = body;
            resolveTest();
            return this;
        }
    };

    const next = (err) => {
        resolveTest(err);
    };

    DiscoveryController.getCatalog(req, res, next);
    const err = await testPromise;
    if (err) throw err;

    expect(responseStatus).toBe(200);
    expect(responseHeaders['Content-Type']).toBe('application/json');
    expect(responseBody).toBeDefined();

    expect(responseBody.specVersion).toBe('1.0');
    expect(responseBody.host).toBeDefined();
    expect(responseBody.host.displayName).toBe('Alti.Code.Studio');
    expect(responseBody.host.identifier).toBe('did:web:alti.code.studio');

    expect(Array.isArray(responseBody.entries)).toBe(true);
    expect(responseBody.entries.length).toBeGreaterThan(0);
});

test('DiscoveryController: resolveCatalog crawler and resolver test', async () => {
    const req = {
        body: {
            url: 'example-federated-domain.com'
        }
    };

    let responseStatus = 200;
    let responseBody = null;

    let resolveTest;
    const testPromise = new Promise((resolve) => {
        resolveTest = resolve;
    });

    const res = {
        status(code) {
            responseStatus = code;
            return this;
        },
        json(body) {
            responseBody = body;
            resolveTest();
            return this;
        }
    };

    let nextError = null;
    const next = (err) => {
        nextError = err;
        resolveTest();
    };

    const mockCatalog = {
        specVersion: '1.0',
        host: { displayName: 'Mock Domain', identifier: 'did:web:mock.com' },
        entries: []
    };

    const fetchSpy = vi.spyOn(global, 'fetch').mockImplementation(async (url) => {
        if (url.toString().includes('robots.txt')) {
            return {
                ok: true,
                text: async () => 'User-agent: *\nAgentmap: /manifest/ai-catalog.json'
            };
        }
        if (url.toString().includes('ai-catalog.json')) {
            return {
                ok: true,
                json: async () => mockCatalog
            };
        }
        return { ok: false };
    });

    DiscoveryController.resolveCatalog(req, res, next);
    await testPromise;

    if (nextError) {
        console.error('resolveCatalog failed with error:', nextError);
    }
    expect(nextError).toBeNull();

    expect(responseStatus).toBe(200);
    expect(responseBody).toBeDefined();
    expect(responseBody.success).toBe(true);
    expect(responseBody.catalogUrl).toBe('https://example-federated-domain.com/manifest/ai-catalog.json');
    expect(responseBody.catalog.host.displayName).toBe('Mock Domain');

    fetchSpy.mockRestore();
});

test('DiscoveryController: installResource tool setup test', async () => {
    const req = {
        body: {
            name: 'test-mcp-server',
            command: 'npx',
            args: ['-y', 'dummy-mcp-pkg'],
            env: { SOME_VAR: 'val' }
        }
    };

    let responseStatus = 200;
    let responseBody = null;

    let resolveTest;
    const testPromise = new Promise((resolve) => {
        resolveTest = resolve;
    });

    const res = {
        status(code) {
            responseStatus = code;
            return this;
        },
        json(body) {
            responseBody = body;
            resolveTest();
            return this;
        }
    };

    let nextError = null;
    const next = (err) => {
        nextError = err;
        resolveTest();
    };

    const writeSpy = vi.spyOn(fs, 'writeFileSync').mockImplementation(() => {});
    const existsSpy = vi.spyOn(fs, 'existsSync').mockReturnValue(false);
    const mkdirSpy = vi.spyOn(fs, 'mkdirSync').mockImplementation(() => {});
    const mountSpy = vi.spyOn(mcpGateway, 'mountServer').mockResolvedValue({ success: true, agentId: 'test-mcp-server_agent', toolsCount: 0 });

    DiscoveryController.installResource(req, res, next);
    await testPromise;

    if (nextError) {
        console.error('installResource failed with error:', nextError);
    }
    expect(nextError).toBeNull();

    expect(responseStatus).toBe(200);
    expect(responseBody).toBeDefined();
    expect(responseBody.success).toBe(true);
    expect(responseBody.message).toContain('installed');

    writeSpy.mockRestore();
    existsSpy.mockRestore();
    mkdirSpy.mockRestore();
    mountSpy.mockRestore();
});

test('DiscoveryController: persistent federated catalogs registry get and delete', async () => {
    let responseStatus = 200;
    let responseBody = null;

    let resolveTest;
    const testPromise = new Promise((resolve) => {
        resolveTest = resolve;
    });

    const res = {
        status(code) {
            responseStatus = code;
            return this;
        },
        json(body) {
            responseBody = body;
            resolveTest();
            return this;
        }
    };

    const next = () => {
        resolveTest();
    };

    const mockData = JSON.stringify([{ domain: 'test-domain.com', catalogUrl: 'http://test-domain.com/manifest/ai-catalog.json' }]);
    const readSpy = vi.spyOn(fs, 'readFileSync').mockReturnValue(mockData);
    const existsSpy = vi.spyOn(fs, 'existsSync').mockReturnValue(true);

    DiscoveryController.getFederatedCatalogs({}, res, next);
    await testPromise;

    expect(responseStatus).toBe(200);
    expect(responseBody.success).toBe(true);
    expect(responseBody.data.length).toBe(1);
    expect(responseBody.data[0].domain).toBe('test-domain.com');

    readSpy.mockRestore();
    existsSpy.mockRestore();
});

test('CapabilityRouter: findAndProvisionCapability self-provisioning check', async () => {
    const mockCatalogs = [
        {
            domain: 'test-fed.com',
            catalogUrl: 'https://test-fed.com/.well-known/ai-catalog.json',
            catalog: {
                specVersion: '1.0',
                entries: [
                    {
                        identifier: 'urn:air:test-fed.com:mcp-server:sqlite',
                        displayName: 'Mock Sqlite Server',
                        type: 'application/mcp-server-card+json',
                        capabilities: ['database', 'sql-queries'],
                        representativeQueries: ['run sqlite queries']
                    }
                ]
            }
        }
    ];

    const existsSpy = vi.spyOn(fs, 'existsSync').mockReturnValue(true);
    const readSpy = vi.spyOn(fs, 'readFileSync').mockImplementation((filePath) => {
        if (filePath.includes('federated_catalogs.json')) {
            return JSON.stringify(mockCatalogs);
        }
        if (filePath.includes('custom_mcp_servers.json')) {
            return JSON.stringify([]);
        }
        return '[]';
    });
    const writeSpy = vi.spyOn(fs, 'writeFileSync').mockImplementation(() => {});
    
    const mountSpy = vi.spyOn(mcpGateway, 'mountServer').mockResolvedValue({ success: true, agentId: 'sqlite_agent', toolsCount: 1 });

    const agentId = await capabilityRouter.findAndProvisionCapability('run sqlite queries');
    expect(agentId).toBe('sqlite_agent');

    existsSpy.mockRestore();
    readSpy.mockRestore();
    writeSpy.mockRestore();
    mountSpy.mockRestore();
});
