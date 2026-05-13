import { google } from 'googleapis';
import { logger } from '../../../shared/logger.js';
import config from '../../../../config/index.js';

/**
 * Google Workspace Integration Service.
 * Provides the Agent Swarm with the ability to read technical specs from Docs,
 * analyze architecture diagrams from Drive, and email reports via Gmail.
 */
class GoogleWorkspaceService {
    constructor() {
        this.auth = new google.auth.GoogleAuth({
            scopes: [
                'https://www.googleapis.com/auth/drive.readonly',
                'https://www.googleapis.com/auth/documents.readonly',
                'https://www.googleapis.com/auth/gmail.send'
            ],
        });
    }

    /**
     * Reads a Google Doc to provide the Agent with architectural context.
     * @param {string} documentId - The ID of the Google Doc
     */
    async readTechnicalSpec(documentId) {
        logger.info(`📄 [Workspace] Swarm is reading technical spec from Google Doc: ${documentId}`);
        try {
            const authClient = await this.auth.getClient();
            const docs = google.docs({ version: 'v1', auth: authClient });
            
            const response = await docs.documents.get({ documentId });
            
            let textContent = '';
            response.data.body.content.forEach(element => {
                if (element.paragraph) {
                    element.paragraph.elements.forEach(el => {
                        if (el.textRun) {
                            textContent += el.textRun.content;
                        }
                    });
                }
            });
            
            logger.info('✅ [Workspace] Technical spec parsed successfully.');
            return textContent;
        } catch (error) {
            logger.error(`❌ [Workspace] Failed to read Google Doc:`, error.message);
            throw error;
        }
    }

    /**
     * Sends an autonomous email report from the Swarm to an Administrator.
     */
    async emailAdministrator(subject, htmlBody) {
        logger.info(`📧 [Workspace] Swarm is dispatching email report via Gmail API...`);
        try {
            const authClient = await this.auth.getClient();
            const gmail = google.gmail({ version: 'v1', auth: authClient });
            
            const adminEmail = config.admin_email || 'admin@insocode.com';
            
            // Construct RFC 2822 formatted email
            const emailLines = [];
            emailLines.push(`To: ${adminEmail}`);
            emailLines.push('Content-Type: text/html; charset=utf-8');
            emailLines.push('MIME-Version: 1.0');
            emailLines.push(`Subject: =?utf-8?B?${Buffer.from(subject).toString('base64')}?=`);
            emailLines.push('');
            emailLines.push(htmlBody);

            const email = emailLines.join('\r\n');
            const encodedEmail = Buffer.from(email).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

            const response = await gmail.users.messages.send({
                userId: 'me',
                requestBody: {
                    raw: encodedEmail
                }
            });

            logger.info(`✅ [Workspace] Email report sent successfully. Message ID: ${response.data.id}`);
            return response.data;
        } catch (error) {
            logger.error(`❌ [Workspace] Failed to send email via Gmail API:`, error.message);
            throw error;
        }
    }
}

export const workspaceService = new GoogleWorkspaceService();
