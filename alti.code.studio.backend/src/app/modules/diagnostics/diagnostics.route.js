import express from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { prisma } from '../../../config/prisma.js';
import { neo4jService } from '../../services/neo4j.service.js';
import { aiProvider } from '../ai/ai.provider.js';

export const diagnosticsRouter = express.Router();

export const handleHealthRequest = async (req, res) => {
    const status = {
        database: 'DOWN',
        neo4j: 'DOWN',
        ai: 'DOWN',
        disk: 'DOWN',
        memory: 'DOWN'
    };

    let overallSuccess = true;

    // 1. PostgreSQL (Prisma) Health
    try {
        await prisma.$queryRaw`SELECT 1`;
        status.database = 'UP';
    } catch (err) {
        status.database = `DOWN: ${err.message}`;
        overallSuccess = false;
    }

    // 2. Neo4j Health
    try {
        await neo4jService.executeCypher('RETURN 1');
        status.neo4j = 'UP';
    } catch (err) {
        status.neo4j = `DOWN: ${err.message}`;
        overallSuccess = false;
    }

    // 3. AI Provider Health
    try {
        const aiInfo = aiProvider.getInfo();
        if (aiInfo && aiInfo.active) {
            status.ai = {
                status: 'UP',
                activeProvider: aiInfo.active,
                providerName: aiInfo.name,
                availableProviders: aiInfo.available
            };
        } else {
            status.ai = 'DOWN: No active provider';
            overallSuccess = false;
        }
    } catch (err) {
        status.ai = `DOWN: ${err.message}`;
        overallSuccess = false;
    }

    // 4. Disk Write Health
    try {
        const testPath = path.resolve('./logs/workspaces/disk_health_check.txt');
        fs.mkdirSync(path.dirname(testPath), { recursive: true });
        fs.writeFileSync(testPath, 'health check', 'utf8');
        fs.unlinkSync(testPath);
        status.disk = 'UP';
    } catch (err) {
        status.disk = `DOWN: ${err.message}`;
        overallSuccess = false;
    }

    // 5. Memory Statistics
    try {
        const mem = process.memoryUsage();
        status.memory = {
            status: 'UP',
            heapUsedMb: Math.round(mem.heapUsed / 1024 / 1024 * 100) / 100,
            heapTotalMb: Math.round(mem.heapTotal / 1024 / 1024 * 100) / 100,
            rssMb: Math.round(mem.rss / 1024 / 1024 * 100) / 100
        };
    } catch (err) {
        status.memory = `DOWN: ${err.message}`;
        overallSuccess = false;
    }

    const statusCode = overallSuccess ? 200 : 500;
    return res.status(statusCode).json({
        status: overallSuccess ? 'UP' : 'DEGRADED',
        timestamp: new Date().toISOString(),
        details: status
    });
};

diagnosticsRouter.get('/health', handleHealthRequest);
export default diagnosticsRouter;
