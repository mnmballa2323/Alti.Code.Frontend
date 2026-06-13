/**
 * Copyright (c) 2026 Alti.Code.Studio
 * 
 * SCIM 2.0 Provisioning Service
 * Automates Identity Access Management (IAM) sync with IdPs like Okta, Azure AD, Ping.
 */

import { prisma } from '../../../config/prisma.js';
import { logger } from '../../../shared/logger.js';
import { auditLogService } from '../security/auditLog.service.js';

class ScimService {
    
    /**
     * Create User from SCIM Payload
     */
    async createUser(scimPayload, tenantId) {
        try {
            const email = scimPayload.emails?.find(e => e.primary)?.value || scimPayload.userName;
            const firstName = scimPayload.name?.givenName || '';
            const lastName = scimPayload.name?.familyName || '';
            
            // Map EntraID / Okta custom attributes to ABAC clearance
            const clearanceLevel = parseInt(scimPayload.urn_ietf_params_scim_schemas_extension_enterprise_2_0_User?.clearanceLevel || '1', 10);

            const user = await prisma.user.create({
                data: {
                    email,
                    tenantId,
                    provider: 'scim',
                    role: 'user',
                    clearanceLevel,
                    // By default generate a random password, user must SSO to get in
                    password: Math.random().toString(36).slice(-10)
                }
            });

            await auditLogService.logAction({
                tenantId,
                userId: 'system', // Provisioned by system
                action: 'SCIM_USER_CREATE',
                resource: `User:${user.id}`,
                status: 'SUCCESS',
                metadata: { email, clearanceLevel }
            });

            return this.formatScimUser(user);
        } catch (error) {
            logger.error(`[SCIM] Failed to create user: ${error.message}`);
            throw error;
        }
    }

    /**
     * Deactivate User (Soft Delete or Access Revocation)
     */
    async deactivateUser(scimId, tenantId) {
        try {
            const user = await prisma.user.update({
                where: { id: scimId },
                data: { role: 'unauthorized' } // Revoke access
            });

            await auditLogService.logAction({
                tenantId,
                userId: 'system',
                action: 'SCIM_USER_DEACTIVATE',
                resource: `User:${user.id}`,
                status: 'SUCCESS'
            });

            return this.formatScimUser(user);
        } catch (error) {
            logger.error(`[SCIM] Failed to deactivate user: ${error.message}`);
            throw error;
        }
    }

    formatScimUser(user) {
        return {
            schemas: ["urn:ietf:params:scim:schemas:core:2.0:User"],
            id: user.id,
            userName: user.email,
            active: user.role !== 'unauthorized',
            emails: [{ primary: true, value: user.email }]
        };
    }
}

export const scimService = new ScimService();
