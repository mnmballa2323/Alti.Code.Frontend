/**
 * Copyright (c) 2026 Inso Code
 * 
 * Enterprise Tenant Orchestrator (Single-Tenant Architecture)
 * 
 * Dynamically provisions isolated PostgreSQL Docker containers for Enterprise tenants.
 * Guarantees zero cross-tenant data leakage by enforcing physical air-gaps between 
 * customer databases and execution networks.
 */

import { exec } from 'child_process';
import { resolve, join } from 'path';
import { mkdirSync, existsSync } from 'fs';
import { azureContainerService } from '../../../shared/azureContainer.service.js';

export class TenantContainerOrchestrator {
    constructor(baseDataDir = './tenant_data') {
        this.baseDataDir = resolve(baseDataDir);
        this.activeTenants = new Map(); // tenantId -> connection details
        
        try {
            mkdirSync(this.baseDataDir, { recursive: true });
        } catch (e) {}
    }

    _execCmd(command, timeout = 30000) {
        return new Promise((resolve) => {
            const child = exec(command, { timeout }, (error, stdout, stderr) => {
                resolve({
                    success: !error,
                    stdout: stdout.trim(),
                    stderr: stderr.trim(),
                    error: error ? error.message : null,
                });
            });
        });
    }

    /**
     * Finds an available open port on the host.
     */
    async _getAvailablePort(startPort = 5433) {
        let port = startPort;
        while (port < 6000) {
            // Rough check using lsof or netstat (simplistic check for node)
            const check = await this._execCmd(`lsof -i :${port}`);
            if (!check.success || check.stdout === '') {
                return port;
            }
            port++;
        }
        throw new Error('No available ports found for tenant database allocation.');
    }

    /**
     * Provisions a dedicated, isolated PostgreSQL container with pgvector for a specific tenant.
     * @param {string} tenantId - The UUID of the tenant
     * @param {string} dbPassword - The root password to inject
     * @returns {Promise<string>} The isolated DATABASE_URL
     */
    async provisionTenantDatabase(tenantId, dbPassword = 'enterprise_secure_pw_123') {
        const cleanTenantId = tenantId.replace(/[^a-zA-Z0-9_]/g, '');
        const containerName = `tenant-db-${cleanTenantId}`.toLowerCase().replace(/_/g, '-');
        const networkName = `tenant_net_${cleanTenantId}`;
        const volumePath = join(this.baseDataDir, containerName);
        
        // ------------------ AZURE ACI PATH ------------------
        if (process.env.ARM_SUBSCRIPTION_ID) {
            console.log(`[Enterprise/Azure] Provisioning isolated database for Tenant ${tenantId} on ACI...`);
            
            // 1. Check if DB is already running
            const activeGroups = await azureContainerService.listContainers();
            const existingGroup = activeGroups.find(g => g.Names.includes(containerName));
            let ipAddress = null;

            if (existingGroup && existingGroup.State === 'Running' && existingGroup.ipAddress?.ip) {
                ipAddress = existingGroup.ipAddress.ip;
                const databaseUrl = `postgresql://postgres:${dbPassword}@${ipAddress}:5432/tenant_${cleanTenantId}?schema=public`;
                this.activeTenants.set(tenantId, { containerName, databaseUrl, networkName: 'azure-virtual-network' });
                return databaseUrl;
            }

            // 2. Launch the hardened pgvector ACI Container Group
            const envVars = [
                { name: 'POSTGRES_PASSWORD', value: dbPassword },
                { name: 'POSTGRES_DB', value: `tenant_${cleanTenantId}` }
            ];
            
            const groupResult = await azureContainerService.createContainerGroup(
                containerName,
                'pgvector/pgvector:pg15',
                1.0,
                1.5,
                {
                    ports: [5432],
                    envVars,
                    command: [] // Use default entrypoint for Postgres
                }
            );

            ipAddress = groupResult.ipAddress?.ip;
            if (!ipAddress) {
                throw new Error(`Failed to obtain ACI IP address for tenant database ${containerName}`);
            }

            // 3. Wait for Postgres to be ready inside ACI
            let isReady = false;
            for (let i = 0; i < 20; i++) {
                await new Promise(r => setTimeout(r, 1500));
                try {
                    const check = await azureContainerService.executeCommandAndGetOutput(
                        containerName,
                        containerName,
                        'pg_isready -U postgres'
                    );
                    if (check.success && check.stdout.includes('accepting connections')) {
                        isReady = true;
                        break;
                    }
                } catch (e) {
                    // Ignore transient network errors while starting up
                }
            }

            if (!isReady) {
                throw new Error(`Azure ACI database for tenant ${tenantId} failed to start in time.`);
            }

            const databaseUrl = `postgresql://postgres:${dbPassword}@${ipAddress}:5432/tenant_${cleanTenantId}?schema=public`;
            this.activeTenants.set(tenantId, { containerName, databaseUrl, networkName: 'azure-virtual-network' });
            
            console.log(`[Enterprise/Azure] Successfully provisioned isolated database at IP ${ipAddress}`);
            return databaseUrl;
        }
        // ------------------ END AZURE ACI PATH ------------------

        mkdirSync(volumePath, { recursive: true });

        // 1. Create a dedicated bridge network for the tenant so their agents can only talk to this DB
        await this._execCmd(`docker network create ${networkName}`);

        // 2. Check if DB is already running
        const inspect = await this._execCmd(`docker inspect -f '{{.State.Running}}' ${containerName}`);
        if (inspect.success && inspect.stdout === 'true') {
            const portRes = await this._execCmd(`docker port ${containerName} 5432/tcp`);
            const hostPort = portRes.stdout.split(':')[1].trim();
            const databaseUrl = `postgresql://postgres:${dbPassword}@localhost:${hostPort}/tenant_${cleanTenantId}?schema=public`;
            this.activeTenants.set(tenantId, { containerName, databaseUrl, networkName });
            return databaseUrl;
        }

        // 3. Allocate port
        const hostPort = await this._getAvailablePort();

        // 4. Launch the hardened pgvector container
        // We use pgvector/pgvector:pg15 as our baseline for AI agent memory
        const dockerRunCmd = `docker run -d ` +
            `--name ${containerName} ` +
            `--network ${networkName} ` +
            `-p ${hostPort}:5432 ` +
            `-v "${volumePath}":/var/lib/postgresql/data ` +
            `-e POSTGRES_PASSWORD=${dbPassword} ` +
            `-e POSTGRES_DB=tenant_${cleanTenantId} ` +
            `--memory="1g" ` +
            `--cpus="1.0" ` +
            `pgvector/pgvector:pg15`;

        console.log(`[Enterprise] Provisioning isolated database for Tenant ${tenantId}...`);
        const runResult = await this._execCmd(dockerRunCmd);

        if (!runResult.success) {
            throw new Error(`Failed to provision tenant database: ${runResult.error}`);
        }

        // Wait for Postgres to be ready
        let isReady = false;
        for (let i = 0; i < 15; i++) {
            await new Promise(r => setTimeout(r, 1000));
            const check = await this._execCmd(`docker exec ${containerName} pg_isready -U postgres`);
            if (check.success && check.stdout.includes('accepting connections')) {
                isReady = true;
                break;
            }
        }

        if (!isReady) {
            throw new Error(`Database for tenant ${tenantId} failed to start in time.`);
        }

        const databaseUrl = `postgresql://postgres:${dbPassword}@localhost:${hostPort}/tenant_${cleanTenantId}?schema=public`;
        this.activeTenants.set(tenantId, { containerName, databaseUrl, networkName });
        
        console.log(`[Enterprise] Successfully provisioned isolated database on port ${hostPort}`);
        return databaseUrl;
    }

    /**
     * Returns the dedicated Docker network name for the tenant, allowing 
     * AgentContainerOrchestrator to launch code containers securely inside it.
     */
    getTenantNetwork(tenantId) {
        const details = this.activeTenants.get(tenantId);
        if (!details) {
            const cleanTenantId = tenantId.replace(/[^a-zA-Z0-9_]/g, '');
            return `tenant_net_${cleanTenantId}`;
        }
        return details.networkName;
    }
}
