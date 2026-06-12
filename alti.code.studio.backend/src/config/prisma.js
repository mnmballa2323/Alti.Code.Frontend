/**
 * Copyright (c) 2026 Inso Code
 * 
 * Database connection client bridging to the shared platform database services.
 * Maintains backwards compatibility for Inso Code.
 */

import { prisma, getTenantPrisma, connectPrisma } from '../app/platform/db/prismaClient.js';

export { prisma, getTenantPrisma, connectPrisma };
