import { google } from 'googleapis';
import { logger } from '../../../shared/logger.js';
import config from '../../../../config/index.js';

/**
 * Google Workspace Admin Service.
 * Empowers the Swarm to programmatically provision or suspend 
 * developer Google Workspace accounts based on platform events.
 */
class GoogleWorkspaceAdminService {
    constructor() {
        this.auth = new google.auth.GoogleAuth({
            scopes: [
                'https://www.googleapis.com/auth/admin.directory.user'
            ],
        });
    }

    /**
     * Provisions a new Google Workspace User account autonomously.
     * @param {string} firstName 
     * @param {string} lastName 
     * @param {string} email 
     * @param {string} password 
     */
    async provisionDeveloperAccount(firstName, lastName, email, password) {
        logger.info(`🧑‍💻 [Workspace-Admin] Swarm is provisioning Workspace account for ${email}...`);
        try {
            const authClient = await this.auth.getClient();
            const admin = google.admin({ version: 'directory_v1', auth: authClient });

            const response = await admin.users.insert({
                requestBody: {
                    name: {
                        givenName: firstName,
                        familyName: lastName,
                    },
                    primaryEmail: email,
                    password: password,
                    changePasswordAtNextLogin: true,
                }
            });

            logger.info(`✅ [Workspace-Admin] Account provisioned. ID: ${response.data.id}`);
            return response.data;
        } catch (error) {
            logger.error(`❌ [Workspace-Admin] Failed to provision account:`, error.message);
            throw error;
        }
    }

    /**
     * Suspends a Google Workspace User account (e.g., during offboarding).
     * @param {string} email 
     */
    async suspendDeveloperAccount(email) {
        logger.info(`🛑 [Workspace-Admin] Swarm is suspending Workspace account for ${email}...`);
        try {
            const authClient = await this.auth.getClient();
            const admin = google.admin({ version: 'directory_v1', auth: authClient });

            const response = await admin.users.update({
                userKey: email,
                requestBody: {
                    suspended: true,
                }
            });

            logger.info(`✅ [Workspace-Admin] Account suspended successfully.`);
            return response.data;
        } catch (error) {
            logger.error(`❌ [Workspace-Admin] Failed to suspend account:`, error.message);
            throw error;
        }
    }
}

export const workspaceAdminService = new GoogleWorkspaceAdminService();
