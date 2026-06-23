import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import httpStatus from 'http-status';
import { parseOKF, validateOKF } from '../../src/app/modules/knowledgeCatalog/okf.parser.js';
import { knowledgeCatalogService } from '../../src/app/modules/knowledgeCatalog/knowledgeCatalog.service.js';
import { knowledgeCatalogEnricher } from '../../src/app/modules/knowledgeCatalog/knowledgeCatalog.enricher.js';
import { okfGovernanceMiddleware } from '../../src/app/middlewares/okfGovernanceMiddleware.js';
import { prisma } from '../../src/config/prisma.js';
import { socketService } from '../../src/app/services/socket.service.js';
import { neo4jService } from '../../src/app/services/neo4j.service.js';
import { azureSovereignCompatService } from '../../src/app/modules/ai/azureSovereignCompat.service.js';

vi.mock('../../src/app/modules/ai/ai.provider.js', () => ({
    aiProvider: {
        generate: vi.fn().mockResolvedValue('Mock enriched markdown content body.')
    }
}));

// Mock services to prevent external calls in testing environment
vi.mock('../../src/config/prisma.js', () => ({
    prisma: {
        okfConcept: {
            upsert: vi.fn().mockResolvedValue({ id: 'mock-concept-id' })
        },
        auditLog: {
            create: vi.fn().mockResolvedValue({ id: 'mock-audit-id' })
        },
        $executeRawUnsafe: vi.fn().mockResolvedValue(1),
        $queryRawUnsafe: vi.fn().mockResolvedValue([
            { id: 'mock-id', conceptId: 'tables/users', type: 'PostgreSQL Table', title: 'User', similarity: 0.95 }
        ])
    }
}));

vi.mock('../../src/app/modules/audit/audit.service.js', () => ({
    AuditService: {
        log: vi.fn().mockResolvedValue(true)
    }
}));

vi.mock('../../src/app/services/socket.service.js', () => ({
    socketService: {
        broadcast: vi.fn()
    }
}));

vi.mock('../../src/app/services/neo4j.service.js', () => ({
    neo4jService: {
        executeCypher: vi.fn().mockResolvedValue([])
    }
}));

vi.mock('../../src/app/modules/ai/azureSovereignCompat.service.js', () => ({
    azureSovereignCompatService: {
        getEmbeddings: vi.fn().mockResolvedValue(new Array(768).fill(0.1))
    }
}));

describe('Knowledge Catalog OKF Parser & Validator Tests', () => {
    it('should parse valid OKF markdown document with frontmatter and sections', () => {
        const validOKF = `---
type: Playbook
title: Orders Freshness Alert Triage
description: Triage order freshness pipeline alerts.
tags: [alerts, oncall]
---

# Details

Step 1: Check standard dashboards.
Step 2: Restart pipeline if stuck.

# Citations

[1] [Alert Dashboard](https://example.com/alerts)
`;

        const parsed = parseOKF(validOKF);
        expect(parsed.frontmatter.type).toBe('Playbook');
        expect(parsed.frontmatter.title).toBe('Orders Freshness Alert Triage');
        expect(parsed.frontmatter.description).toBe('Triage order freshness pipeline alerts.');
        expect(parsed.frontmatter.tags).toContain('alerts');
        expect(parsed.sections.details).toContain('Step 1: Check standard dashboards.');
        expect(parsed.citations[0].title).toBe('Alert Dashboard');
    });

    it('should fail validation when "type" field is missing in frontmatter', () => {
        const invalidFrontmatter = {
            title: 'Missing Type'
        };
        const validation = validateOKF(invalidFrontmatter);
        expect(validation.isValid).toBe(false);
        expect(validation.error).toContain("Required field 'type' is missing");
    });

    it('should pass validation when "type" field is present in frontmatter', () => {
        const validFrontmatter = {
            type: 'BigQuery Table',
            title: 'Orders'
        };
        const validation = validateOKF(validFrontmatter);
        expect(validation.isValid).toBe(true);
    });
});

describe('Knowledge Catalog Service local operations', () => {
    beforeAll(() => {
        vi.spyOn(fs, 'writeFileSync').mockImplementation(() => {});
        vi.spyOn(fs, 'mkdirSync').mockImplementation(() => {});
        vi.spyOn(fs, 'existsSync').mockReturnValue(true);
    });

    afterAll(() => {
        vi.restoreAllMocks();
    });

    it('should correctly list local bundle items', () => {
        vi.spyOn(fs, 'readdirSync').mockReturnValue(['orders.md', 'users.md']);
        const statMock = {
            isDirectory: () => false,
            isFile: () => true
        };
        vi.spyOn(fs, 'statSync').mockReturnValue(statMock);

        const list = knowledgeCatalogService.listLocalBundle();
        expect(list).toContain('orders');
        expect(list).toContain('users');
    });

    it('should correctly initialize a local OKF bundle by parsing prisma/schema.prisma', async () => {
        const mockSchema = `
model User {
  id    String @id
  email String @unique
}
`;
        vi.spyOn(fs, 'readFileSync').mockReturnValue(mockSchema);
        vi.spyOn(fs, 'existsSync').mockImplementation((p) => p.includes('schema.prisma') || p.includes('catalog'));

        const result = await knowledgeCatalogService.initLocalBundle();
        expect(result.success).toBe(true);
        expect(result.count).toBeGreaterThan(0);
    });
});

describe('Knowledge Catalog Autonomous Enricher Loop', () => {
    it('should successfully run autonomous enrichment loop over local bundle', async () => {
        vi.spyOn(knowledgeCatalogService, 'listLocalBundle').mockReturnValue(['tables/user']);
        vi.spyOn(knowledgeCatalogService, 'getLocalConcept').mockReturnValue({
            frontmatter: { type: 'PostgreSQL Table', title: 'User' },
            body: '# Schema\n\n| Column | Type |\n|---|---|\n| id | String |'
        });
        vi.spyOn(knowledgeCatalogService, 'updateLocalConcept').mockReturnValue(true);

        const result = await knowledgeCatalogEnricher.enrichBundle();
        expect(result.success).toBe(true);
        expect(result.enrichedCount).toBe(1);
    });
});

describe('Knowledge Catalog Integration & Middleware', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should sync local catalog to PostgreSQL, pgvector, Neo4j, and WebSockets', async () => {
        vi.spyOn(knowledgeCatalogService, 'listLocalBundle').mockReturnValue(['tables/users']);
        vi.spyOn(knowledgeCatalogService, 'getLocalConcept').mockReturnValue({
            frontmatter: { type: 'PostgreSQL Table', title: 'User', timestamp: new Date().toISOString() },
            body: '# Schema\n\n[1] [User Schema](file://prisma/schema.prisma)\n'
        });

        await knowledgeCatalogService.syncLocalToServices();

        expect(prisma.okfConcept.upsert).toHaveBeenCalled();
        expect(azureSovereignCompatService.getEmbeddings).toHaveBeenCalledWith('# Schema\n\n[1] [User Schema](file://prisma/schema.prisma)\n');
        expect(prisma.$executeRawUnsafe).toHaveBeenCalled();
        expect(neo4jService.executeCypher).toHaveBeenCalled();
        expect(socketService.broadcast).toHaveBeenCalledWith('swarm', 'okf_concept_updated', expect.any(Object));
    });

    it('should query the catalog semantically via pgvector', async () => {
        const results = await knowledgeCatalogService.searchCatalogSemantically('query text', 3);
        expect(azureSovereignCompatService.getEmbeddings).toHaveBeenCalledWith('query text');
        expect(prisma.$queryRawUnsafe).toHaveBeenCalled();
        expect(results[0].conceptId).toBe('tables/users');
    });

    it('should govern routing requests and enforce Zero-Trust validation based on OKF spec', async () => {
        const mockConcept = {
            frontmatter: { type: 'API Endpoint', title: 'AUTH API' },
            body: '- **Authentication**: Zero-Trust IAP Required\n- **Compliance Boundary**: FedRAMP boundary applied'
        };

        vi.spyOn(knowledgeCatalogService, 'getLocalConcept').mockReturnValue(mockConcept);

        const req = {
            path: '/api/v1/auth',
            headers: {},
            user: { id: 'usr_123' },
            ip: '203.0.113.5' // public IP outside FedRAMP
        };

        const res = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn()
        };

        const next = vi.fn((err) => {
            if (err) console.log('=== MIDDLEWARE ERROR ===', err);
        });

        await okfGovernanceMiddleware(req, res, next);

        console.log('NEXT CALLS:', next.mock.calls);
        console.log('RES.STATUS CALLS:', res.status.mock.calls);

        // Should return 401 Unauthorized because missing JWT authorization header / IAP claim
        expect(res.status).toHaveBeenCalledWith(httpStatus.UNAUTHORIZED);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            success: false,
            error: expect.stringContaining('IAP token required')
        }));
    });
});
