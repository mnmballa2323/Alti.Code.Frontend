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
     * @returns {Promise<object>} The execution result containing stdout, stderr, and status
     */
    async executeCode(code, language = 'python') {
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
                return {
                    success: false,
                    stdout: '',
                    stderr: `Execution API Error: ${response.statusText}`,
                    status: 'error'
                };
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
