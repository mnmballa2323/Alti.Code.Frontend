/**
 * Copyright (c) 2024 Alti.Code.Studio
 * 
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { DefaultAzureCredential } from '@azure/identity';
import { ContainerInstanceManagementClient } from '@azure/arm-containerinstance';
import { logger } from './logger.js';
import WebSocket from 'ws';

class AzureContainerService {
    constructor() {
        this.client = null;
        this.subscriptionId = process.env.ARM_SUBSCRIPTION_ID || null;
        this.resourceGroupName = process.env.AZURE_RESOURCE_GROUP || 'alti-code-studio-rg';
        this.location = process.env.AZURE_LOCATION || 'eastus2';
        this.isMockMode = false;
        this.init();
    }

    init() {
        try {
            if (!this.subscriptionId) {
                logger.warn('⚠️ AzureContainerService: ARM_SUBSCRIPTION_ID not set. Defaulting to MOCK MODE.');
                this.isMockMode = true;
                return;
            }
            
            const credential = new DefaultAzureCredential();
            this.client = new ContainerInstanceManagementClient(credential, this.subscriptionId);
        } catch (error) {
            logger.error(`❌ AzureContainerService: Failed to initialize Azure SDK client (${error.message}). Defaulting to MOCK MODE.`);
            this.isMockMode = true;
        }
    }

    async ensureReady() {
        if (this.isMockMode) return;
        try {
            // Azure SDK doesn't have a direct ping, but we can list container groups to verify access
            await this.client.containerGroups.list({ top: 1 }).next();
            logger.info('✅ AzureContainerService: Successfully connected to Azure Resource Manager (ARM)');
        } catch (error) {
            logger.warn(`⚠️ AzureContainerService: Azure credentials or subscription unreachable (${error.message}). Switching to MOCK MODE.`);
            this.isMockMode = true;
        }
    }

    async listContainers(all = false) {
        await this.ensureReady();

        if (this.isMockMode) {
            logger.info('AzureContainerService (Mock): Listing mock sandboxes');
            return [
                {
                    Id: 'mock-aci-sandbox-123',
                    Names: ['/user-sandbox-mock'],
                    Image: 'alti-agent-sandbox:latest',
                    State: 'running',
                    Status: 'Succeeded',
                    ipAddress: { ip: '127.0.0.1' }
                }
            ];
        }

        try {
            const containers = [];
            const result = this.client.containerGroups.listByResourceGroup(this.resourceGroupName);
            for await (const group of result) {
                containers.push({
                    Id: group.id,
                    Names: [group.name],
                    Image: group.containers[0]?.image || 'unknown',
                    State: group.instanceView?.state || 'unknown',
                    Status: group.provisioningState,
                    ipAddress: group.ipAddress
                });
            }
            return containers;
        } catch (error) {
            logger.error('AzureContainerService: Failed to list container groups:', error.message);
            return [];
        }
    }

    async createContainerGroup(name, image = 'alti-agent-sandbox:latest', cpu = 1.0, memoryInGb = 1.5, options = {}) {
        await this.ensureReady();

        if (this.isMockMode) {
            logger.info(`AzureContainerService (Mock): Created container group ${name} (Image: ${image})`);
            return {
                id: `mock-${name}`,
                name,
                state: 'Succeeded',
                ipAddress: { ip: '127.0.0.1' }
            };
        }

        try {
            logger.info(`🚀 AzureContainerService: Deploying user sandbox container group "${name}"...`);
            
            const ports = options.ports || [80];
            const envVars = options.envVars || [];
            const command = options.command || ['tail', '-f', '/dev/null'];
            const ipType = options.ipType || process.env.AZURE_ACI_IP_TYPE || 'Public';

            const containerGroup = {
                location: this.location,
                containers: [
                    {
                        name: name,
                        image: image,
                        resources: {
                            requests: {
                                cpu: cpu,
                                memoryInGB: memoryInGb
                            }
                        },
                        ports: ports.map(p => ({ port: p })),
                        environmentVariables: envVars.length > 0 ? envVars : undefined,
                        command: command
                    }
                ],
                osType: 'Linux',
                ipAddress: {
                    type: ipType,
                    ports: ports.map(p => ({ protocol: 'TCP', port: p }))
                }
            };

            const result = await this.client.containerGroups.beginCreateOrUpdateAndWait(
                this.resourceGroupName,
                name,
                containerGroup
            );

            logger.info(`✅ AzureContainerService: User sandbox "${name}" successfully deployed.`);
            return result;
        } catch (error) {
            logger.error(`❌ AzureContainerService: Failed to deploy container group "${name}":`, error.message);
            throw error;
        }
    }

    async deleteContainerGroup(name) {
        await this.ensureReady();

        if (this.isMockMode) {
            logger.info(`AzureContainerService (Mock): Deleted container group ${name}`);
            return;
        }

        try {
            logger.info(`🗑️ AzureContainerService: Tearing down user sandbox "${name}"...`);
            await this.client.containerGroups.beginDeleteAndWait(this.resourceGroupName, name);
            logger.info(`✅ AzureContainerService: Sandbox "${name}" deleted.`);
        } catch (error) {
            logger.error(`❌ AzureContainerService: Failed to delete container group "${name}":`, error.message);
            throw error;
        }
    }

    getContainer(id) {
        return {
            inspect: async () => {
                if (this.isMockMode) {
                    return { Id: id, Name: `/${id}`, State: { Running: true } };
                }
                try {
                    const group = await this.client.containerGroups.get(this.resourceGroupName, id);
                    return {
                        Id: group.id,
                        Name: group.name,
                        State: { Running: group.instanceView?.state === 'Running' }
                    };
                } catch (error) {
                    return { Id: id, State: { Running: false } };
                }
            },
            start: async () => {
                if (this.isMockMode) return;
                await this.client.containerGroups.start(this.resourceGroupName, id);
            },
            stop: async () => {
                if (this.isMockMode) return;
                await this.client.containerGroups.stop(this.resourceGroupName, id);
            },
            exec: async (opts) => {
                const cmd = opts.Cmd.join(' ');
                if (this.isMockMode) {
                    logger.info(`AzureContainerService (Mock): Executing '${cmd}' in ${id}`);
                    return { start: async () => ({ output: 'Mock Output' }) };
                }

                try {
                    const result = await this.executeCommandAndGetOutput(id, id, cmd);
                    return {
                        start: async () => ({
                            output: result.stdout || result.stderr || ''
                        })
                    };
                } catch (error) {
                    logger.error(`❌ AzureContainerService: Exec command failed: ${error.message}`);
                    throw error;
                }
            }
        };
    }

    async executeCommandAndGetOutput(groupName, containerName, command) {
        await this.ensureReady();
        if (this.isMockMode) {
            return { stdout: 'Mock Output', stderr: '', success: true, exitCode: 0 };
        }

        try {
            logger.info(`📟 AzureContainerService: Executing inside ACI container "${groupName}/${containerName}": ${command}`);
            const execResponse = await this.client.containers.executeCommand(
                this.resourceGroupName,
                groupName,
                containerName,
                {
                    command: command,
                    terminalSize: { rows: 24, cols: 80 }
                }
            );

            if (!execResponse.webSocketUri) {
                throw new Error('No webSocketUri returned from executeCommand');
            }

            return new Promise((resolve, reject) => {
                const ws = new WebSocket(execResponse.webSocketUri);
                let stdout = '';
                let stderr = '';
                let errorOccurred = null;

                ws.on('open', () => {
                    // Connection opened
                });

                ws.on('message', (data) => {
                    if (Buffer.isBuffer(data)) {
                        if (data.length > 0 && (data[0] === 1 || data[0] === 2)) {
                            const type = data[0];
                            const content = data.slice(1).toString('utf8');
                            if (type === 1) {
                                stdout += content;
                            } else {
                                stderr += content;
                            }
                        } else {
                            stdout += data.toString('utf8');
                        }
                    } else {
                        stdout += data.toString();
                    }
                });

                ws.on('error', (err) => {
                    errorOccurred = err;
                });

                ws.on('close', (code, reason) => {
                    if (errorOccurred) {
                        reject(errorOccurred);
                    } else {
                        resolve({
                            success: code === 1000 || code === 1005 || code === 0,
                            stdout: stdout.trim(),
                            stderr: stderr.trim(),
                            exitCode: code
                        });
                    }
                });
            });
        } catch (error) {
            logger.error(`❌ AzureContainerService: executeCommandAndGetOutput failed: ${error.message}`);
            throw error;
        }
    }

    async writeFileToContainer(groupName, containerName, containerFilePath, content) {
        if (this.isMockMode) {
            logger.info(`AzureContainerService (Mock): Writing file to mock container ${containerFilePath}`);
            return;
        }
        const base64Content = Buffer.from(content).toString('base64');
        const command = `sh -c "mkdir -p \\"$(dirname "${containerFilePath}")\\" && echo '${base64Content}' | base64 -d > \\"${containerFilePath}\\""`;
        const result = await this.executeCommandAndGetOutput(groupName, containerName, command);
        if (!result.success) {
            throw new Error(`Failed to write file to container: ${result.stderr || 'unknown error'}`);
        }
    }

    async readFileFromContainer(groupName, containerName, containerFilePath) {
        if (this.isMockMode) {
            logger.info(`AzureContainerService (Mock): Reading file from mock container ${containerFilePath}`);
            return 'Mock File Content';
        }
        const command = `cat "${containerFilePath}"`;
        const result = await this.executeCommandAndGetOutput(groupName, containerName, command);
        if (!result.success) {
            throw new Error(`Failed to read file from container: ${result.stderr || 'unknown error'}`);
        }
        return result.stdout;
    }
}

export const azureContainerService = new AzureContainerService();
