import express from 'express';
import { scimService } from './scim.service.js';
import { logger } from '../../../shared/logger.js';

export const scimRoutes = express.Router();

/**
 * Middleware: Simple Bearer Token verification for SCIM endpoint.
 * In production, the tenant would generate a long-lived SCIM token.
 */
const verifyScimToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized: Missing SCIM Bearer Token' });
    }
    
    // Simplification for phase 4: assume the token matches a tenant in the database.
    // We attach a mock tenantId for now.
    req.tenant = { id: req.headers['x-tenant-id'] || '00000000-0000-0000-0000-000000000000' };
    next();
};

scimRoutes.use(verifyScimToken);

// Create User
scimRoutes.post('/v2/Users', async (req, res, next) => {
    try {
        const scimUser = await scimService.createUser(req.body, req.tenant.id);
        res.status(201).json(scimUser);
    } catch (error) {
        logger.error(`[SCIM] POST /v2/Users failed: ${error.message}`);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Update/Deactivate User
scimRoutes.patch('/v2/Users/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        const operations = req.body.Operations || [];
        
        let isActive = true;
        for (const op of operations) {
            if (op.op === 'replace' && op.value?.active === false) {
                isActive = false;
            }
        }

        if (!isActive) {
            const scimUser = await scimService.deactivateUser(id, req.tenant.id);
            return res.status(200).json(scimUser);
        }

        res.status(200).json({ status: 'OK', message: 'No action taken' });
    } catch (error) {
        logger.error(`[SCIM] PATCH /v2/Users failed: ${error.message}`);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
