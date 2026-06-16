import { GoogleAuth } from 'google-auth-library';
import { logger } from '../../../shared/logger.js';

class GoogleDynamicSessionsService {
    constructor() {
        this.projectId = process.env.GOOGLE_CLOUD_PROJECT || 'alti-code-studio';
        this.location = process.env.GOOGLE_CLOUD_REGION || 'us-central1';
        this.auth = new GoogleAuth({
            scopes: ['https://www.googleapis.com/auth/cloud-platform']
        });
    }

    /**
     * Executes arbitrary code in a Google Cloud Run Dynamic Session (gVisor sandbox)
     * @param {string} code - The source code to execute
     * @param {string} language - The language environment ('python', 'nodejs')
     * @param {object} [options] - Configurations (agentId)
     * @returns {Promise<object>} The execution result containing stdout, stderr, and status
     */
    async executeCode(code, language = 'python', options = {}) {
        try {
            logger.info(`⚡ Executing ${language} code in Google Cloud Run Dynamic Session sandbox...`);
            
            const client = await this.auth.getClient();
            const accessToken = await client.getAccessToken();
            
            // Note: Dynamic Sessions API requires the execution environment to be pre-created
            // Format: projects/{project}/locations/{location}/environments/{environment}
            const environmentName = `projects/${this.projectId}/locations/${this.location}/environments/alti-sandbox-${language}`;
            
            // The Sessions API endpoint
            const url = `https://${this.location}-run.googleapis.com/v1/${environmentName}:executeCode`;

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${accessToken.token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    code: code,
                    language: language
                })
            });

            if (!response.ok) {
                const errorText = await response.text();
                logger.error(`❌ Dynamic Session execution failed: ${response.status} - ${errorText}`);
                logger.warn(`⚠️ Google Cloud Run Dynamic Session was unavailable (HTTP ${response.status}). Activating Local/Docker Sandbox Fallback...`);
                return await this._executeCodeLocal(code, language, options);
            }

            const result = await response.json();
            
            logger.info(`✅ Dynamic Session executed successfully. Status: ${result.status}`);
            
            return {
                success: result.status === 'OK',
                stdout: result.stdout || '',
                stderr: result.stderr || '',
                status: result.status
            };

        } catch (error) {
            logger.error(`❌ Error invoking Cloud Run Dynamic Sessions: ${error.message}`);
            logger.warn(`⚠️ Google Cloud Run Dynamic Session was unauthenticated or offline. Activating Local/Docker Sandbox Fallback...`);
            return await this._executeCodeLocal(code, language, options);
        }
    }

    /**
     * Fallback local sandbox execution engine.
     * Integrates CodeExecutionSandbox or DockerWorkspaceManager based on language.
     * Gracefully cascades to high-fidelity Mock Sandbox if Docker daemon is not running.
     * @param {string} code - The source code to execute
     * @param {string} language - The execution environment language ('python', 'javascript', 'nodejs')
     * @param {object} [options] - Configuration parameters (agentId)
     * @returns {Promise<object>} The execution result in the same envelope format
     */
    async _executeCodeLocal(code, language = 'python', options = {}) {
        logger.info(`🔄 Running fallback execution locally for language: ${language}...`);
        
        try {
            const provider = options.provider || process.env.SANDBOX_PROVIDER || 'local';
            if (provider === 'crabbox') {
                logger.info(`🦀 Routing local execution to Crabbox for language: ${language}...`);
                const { crabboxService } = await import('../crabbox/crabbox.service.js');
                const { resolve, join } = await import('path');
                const { writeFileSync, mkdirSync, rmSync } = await import('fs');

                const agentId = options.agentId || 'generic';
                const cleanAgentId = agentId.replace(/[^a-zA-Z0-9_]/g, '_');
                const workspacePath = resolve(`./logs/workspaces/agent_${cleanAgentId}`);
                const tempExt = language === 'python' ? 'py' : 'js';
                const tempFileName = `temp_exec_crabbox_${Math.random().toString(36).substring(2, 9)}.${tempExt}`;
                const tempFilePath = join(workspacePath, tempFileName);

                mkdirSync(workspacePath, { recursive: true });
                writeFileSync(tempFilePath, code, 'utf8');

                try {
                    const runtimeCmd = language === 'python' ? 'python' : 'node';
                    const result = await crabboxService.run(`${runtimeCmd} ${tempFileName}`, {
                        id: options.leaseId,
                        provider: options.crabboxProvider,
                        class: options.crabboxClass,
                        cwd: workspacePath
                    });

                    return {
                        success: result.success,
                        stdout: result.stdout || '',
                        stderr: result.stderr || '',
                        status: result.success ? 'OK' : 'FAILED'
                    };
                } finally {
                    try {
                        rmSync(tempFilePath, { force: true });
                    } catch (e) {}
                }
            }

            if (language === 'nodejs' || language === 'javascript') {
                const { CodeExecutionSandbox } = await import('../sandbox/code_execution_sandbox.js');
                const result = await CodeExecutionSandbox.execute(code, options);
                return {
                    success: result.success,
                    stdout: result.logs ? result.logs.join('\n') : '',
                    stderr: result.errors ? result.errors.join('\n') : '',
                    status: result.success ? 'OK' : 'FAILED'
                };
            } else if (language === 'python') {
                const { DockerWorkspaceManager } = await import('../sandbox/docker_workspace_manager.js');
                
                const agentId = options.agentId || 'generic';
                const cleanAgentId = agentId.replace(/[^a-zA-Z0-9_]/g, '_');
                const workspacePath = `./logs/workspaces/agent_${cleanAgentId}`;
                const manager = new DockerWorkspaceManager(workspacePath);
                
                const hasDocker = await manager.checkDockerAvailability();
                const startTime = Date.now();
                
                if (hasDocker) {
                    const result = await manager.executeOssCode(`agent_${cleanAgentId}`, code, workspacePath, {
                        language: 'python',
                        timeoutMs: 5000
                    });
                    return {
                        success: result.success,
                        stdout: result.logs ? result.logs.join('\n') : '',
                        stderr: result.errors ? result.errors.join('\n') : '',
                        status: result.success ? 'OK' : 'FAILED'
                    };
                } else {
                    logger.warn(`⚠️ Docker not available locally. Cascading python execution to local python command...`);
                    const targetHostPath = manager.baseSandboxDir;
                    const { join } = await import('path');
                    const tempFileName = `temp_exec_python_${Math.random().toString(36).substring(2, 9)}.py`;
                    const tempHostPath = join(targetHostPath, tempFileName);
                    
                    const { writeFileSync, mkdirSync, rmSync } = await import('fs');
                    mkdirSync(targetHostPath, { recursive: true });
                    writeFileSync(tempHostPath, code, 'utf8');
                    
                    let runResult = await manager._execCmd(`python3 "${tempHostPath}"`, 5000);
                    if (!runResult.success && runResult.error && runResult.error.includes('not found')) {
                        runResult = await manager._execCmd(`python "${tempHostPath}"`, 5000);
                    }
                    
                    try {
                        rmSync(tempHostPath, { force: true });
                    } catch (e) {}
                    
                    const success = runResult.success;
                    return {
                        success: success,
                        stdout: runResult.stdout || '',
                        stderr: runResult.stderr || (runResult.error ? runResult.error : ''),
                        status: success ? 'OK' : 'FAILED'
                    };
                }
            } else {
                return {
                    success: false,
                    stdout: '',
                    stderr: `Unsupported local fallback language: ${language}`,
                    status: 'error'
                };
            }
        } catch (error) {
            logger.error(`❌ Local fallback execution crashed: ${error.message}`);
            return {
                success: false,
                stdout: '',
                stderr: error.message,
                status: 'error'
            };
        }
    }
}

export const dynamicSessionsService = new GoogleDynamicSessionsService();
