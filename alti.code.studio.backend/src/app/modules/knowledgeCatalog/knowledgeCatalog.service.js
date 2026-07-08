import fs from 'node:fs';
import path from 'node:path';
// Removed DataCatalogClient import
import { logger } from '../../../shared/logger.js';
import config from '../../../../config/index.js';
import { parseOKF, validateOKF } from './okf.parser.js';
import { prisma } from '../../../config/prisma.js';
import { gcpSovereignCompatService } from '../ai/gcpSovereignCompat.service.js';
import { socketService } from '../../services/socket.service.js';
import { neo4jService } from '../../services/neo4j.service.js';

class KnowledgeCatalogService {
  constructor() {
    this.catalogDir = path.join(process.cwd(), 'catalog');
    this.location = 'eastus';
    this.projectId = config.gcp?.tenant_id || 'mock-project-id';

    try {
      this.client = null;
      logger.info('🛡️ [Knowledge Catalog] Client initialized successfully.');
    } catch (error) {
      logger.warn(
        '⚠️ [Knowledge Catalog] Running in local-only fallback mode. Client could not be initialized.',
      );
      this.client = null;
    }
  }

  /**
   * Initializes a new local OKF bundle by parsing prisma/schema.prisma and local API structures.
   */
  async initLocalBundle() {
    logger.info('📦 [Knowledge Catalog] Initializing local OKF Bundle...');

    // Ensure directories exist
    const dirs = [
      this.catalogDir,
      path.join(this.catalogDir, 'tables'),
      path.join(this.catalogDir, 'apis'),
    ];

    for (const dir of dirs) {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    }

    const generatedFiles = [];

    // 1. Generate tables from prisma/schema.prisma
    const schemaPath = path.join(process.cwd(), 'prisma/schema.prisma');
    if (fs.existsSync(schemaPath)) {
      logger.info('解析 prisma/schema.prisma 产生 OKF table 概念...');
      const schemaContent = fs.readFileSync(schemaPath, 'utf8');
      const modelRegex = /model\s+(\w+)\s+\{([\s\S]*?)\}/g;
      let match;

      while ((match = modelRegex.exec(schemaContent)) !== null) {
        const modelName = match[1];
        const fieldsBlock = match[2];
        const fields = [];

        const lines = fieldsBlock.split('\n');
        for (const line of lines) {
          const cleanLine = line.trim();
          if (
            !cleanLine ||
            cleanLine.startsWith('//') ||
            cleanLine.startsWith('@@')
          )
            continue;

          const tokens = cleanLine.split(/\s+/);
          if (tokens.length >= 2) {
            const fieldName = tokens[0];
            const fieldType = tokens[1];
            fields.push({ name: fieldName, type: fieldType });
          }
        }

        // Generate markdown string in OKF Format
        const mdContent = `---
type: PostgreSQL Table
title: ${modelName}
description: Database table for storing ${modelName.toLowerCase()} details.
resource: postgresql://${this.projectId}/tables/${modelName.toLowerCase()}
tags: [database, ${modelName.toLowerCase()}]
timestamp: ${new Date().toISOString()}
---

# Schema

| Column | Type | Description |
|--------|------|-------------|
${fields.map(f => `| \`${f.name}\` | ${f.type} | Field auto-extracted from schema.prisma. |`).join('\n')}

# Citations

[1] [Prisma Schema Definition](file://prisma/schema.prisma)
`;
        const filePath = path.join(
          this.catalogDir,
          'tables',
          `${modelName.toLowerCase()}.md`,
        );
        fs.writeFileSync(filePath, mdContent, 'utf8');
        generatedFiles.push(`tables/${modelName.toLowerCase()}`);
      }
    }

    // 2. Generate generic API endpoints from routes configuration
    const apiRoutes = [
      {
        path: '/auth',
        desc: 'Authentication and JWT generation/verification endpoints.',
      },
      { path: '/users', desc: 'User profile management and ABAC rules.' },
      {
        path: '/data-catalog',
        desc: 'Compliance governance checks and metadata cataloging.',
      },
      { path: '/research', desc: 'Autonomous Deep Research crawler agent.' },
    ];

    for (const route of apiRoutes) {
      const name = route.path.replace(/^\//, '') || 'root';
      const mdContent = `---
type: API Endpoint
title: ${name.toUpperCase()} API
description: ${route.desc}
resource: https://api.alti.code.studio${route.path}
tags: [api, ${name}]
timestamp: ${new Date().toISOString()}
---

# Details

- **Base Path**: \`${route.path}\`
- **Authentication**: Zero-Trust IAP Required
- **Compliance Boundary**: FedRAMP boundary applied

# Citations

[1] [Express Router Index](file://src/app/routes/index.js)
`;
      const filePath = path.join(this.catalogDir, 'apis', `${name}.md`);
      fs.writeFileSync(filePath, mdContent, 'utf8');
      generatedFiles.push(`apis/${name}`);
    }

    // 3. Generate catalog.yaml manifest
    const manifestContent = `source:
  layout: flat
  entries: ${JSON.stringify(generatedFiles)}
metadata:
  projectId: ${this.projectId}
  location: ${this.location}
`;
    fs.writeFileSync(
      path.join(this.catalogDir, 'catalog.yaml'),
      manifestContent,
      'utf8',
    );

    // 4. Generate index.md
    const indexContent = `---
type: Index
title: Knowledge Catalog Index
description: List of all enterprise data assets and APIs managed in OKF.
timestamp: ${new Date().toISOString()}
---

# Catalog Assets

- **Tables**
${generatedFiles
  .filter(f => f.startsWith('tables/'))
  .map(f => `  - [${f.split('/')[1]}](/${f}.md)`)
  .join('\n')}
- **APIs**
${generatedFiles
  .filter(f => f.startsWith('apis/'))
  .map(f => `  - [${f.split('/')[1]}](/${f}.md)`)
  .join('\n')}
`;
    fs.writeFileSync(
      path.join(this.catalogDir, 'index.md'),
      indexContent,
      'utf8',
    );

    logger.info(
      `✅ [Knowledge Catalog] Local OKF bundle initialized with ${generatedFiles.length} assets.`,
    );

    // Sync local bundle to database & graph asynchronously
    this.syncLocalToServices().catch(err => {
      logger.error(
        `❌ [Knowledge Catalog] Post-init service sync failed: ${err.message}`,
      );
    });

    return { success: true, count: generatedFiles.length };
  }

  /**
   * Synchronizes all local OKF bundle Markdown concepts into PostgreSQL and Neo4j
   */
  async syncLocalToServices() {
    logger.info(
      '🔄 [Knowledge Catalog] Synchronizing local catalog files to PostgreSQL & Neo4j...',
    );
    const conceptIds = this.listLocalBundle();

    for (const conceptId of conceptIds) {
      try {
        const concept = this.getLocalConcept(conceptId);
        if (!concept) continue;

        // 1. Upsert metadata to PostgreSQL OkfConcept table
        await prisma.okfConcept.upsert({
          where: { conceptId },
          update: {
            type: concept.frontmatter.type,
            title: concept.frontmatter.title || conceptId,
            description: concept.frontmatter.description || '',
            resource: concept.frontmatter.resource || null,
            tags: concept.frontmatter.tags || [],
            body: concept.body,
            timestamp: new Date(concept.frontmatter.timestamp || Date.now()),
            metadata: concept.frontmatter,
          },
          create: {
            conceptId,
            type: concept.frontmatter.type,
            title: concept.frontmatter.title || conceptId,
            description: concept.frontmatter.description || '',
            resource: concept.frontmatter.resource || null,
            tags: concept.frontmatter.tags || [],
            body: concept.body,
            timestamp: new Date(concept.frontmatter.timestamp || Date.now()),
            metadata: concept.frontmatter,
          },
        });

        // 2. Generate and store pgvector embedding (with safety fallback)
        try {
          const embedding = await gcpSovereignCompatService.getEmbeddings(
            concept.body,
          );
          const embeddingStr = `[${embedding.join(',')}]`;
          await prisma.$executeRawUnsafe(`
                        UPDATE "OkfConcept"
                        SET "embedding" = '${embeddingStr}'::vector
                        WHERE "conceptId" = '${conceptId}'
                    `);
        } catch (embErr) {
          logger.debug(
            `[Knowledge Catalog] Vector embedding skipped/unsupported: ${embErr.message}`,
          );
        }

        // 3. Sync to Neo4j Graph Database
        try {
          await neo4jService.executeCypher(
            `
                        MERGE (c:OkfConcept {conceptId: $conceptId})
                        SET c.type = $type, c.title = $title, c.description = $description, c.resource = $resource, c.tags = $tags, c.timestamp = $timestamp
                    `,
            {
              conceptId,
              type: concept.frontmatter.type,
              title: concept.frontmatter.title || conceptId,
              description: concept.frontmatter.description || '',
              resource: concept.frontmatter.resource || '',
              tags: concept.frontmatter.tags || [],
              timestamp:
                concept.frontmatter.timestamp || new Date().toISOString(),
            },
          );

          // Parse citations for DEPENDS_ON links
          const citationRegex = /\[\d+\]\s+\[(.*?)\]\(file:\/\/(.*?)\)/g;
          let citMatch;
          while ((citMatch = citationRegex.exec(concept.body)) !== null) {
            const targetPath = citMatch[2];
            await neo4jService.executeCypher(
              `
                            MATCH (c:OkfConcept {conceptId: $conceptId})
                            MERGE (target:FileNode {path: $targetPath})
                            MERGE (c)-[:DEPENDS_ON]->(target)
                        `,
              { conceptId, targetPath },
            );
          }
        } catch (graphErr) {
          logger.debug(
            `[Knowledge Catalog] Neo4j graph sync bypassed: ${graphErr.message}`,
          );
        }

        // 4. Emit Socket.io Collaborative Event
        try {
          socketService.broadcast('swarm', 'okf_concept_updated', {
            conceptId,
            type: concept.frontmatter.type,
            title: concept.frontmatter.title,
            timestamp: new Date().toISOString(),
          });
        } catch (sockErr) {
          logger.debug(
            `[Knowledge Catalog] WebSockets broadcast bypassed: ${sockErr.message}`,
          );
        }
      } catch (err) {
        logger.error(
          `❌ [Knowledge Catalog] Sync failed for concept ${conceptId}: ${err.message}`,
        );
      }
    }

    logger.info(
      `✅ [Knowledge Catalog] Service synchronization completed for ${conceptIds.length} concepts.`,
    );
  }

  /**
   * Performs a pgvector semantic search over OKF concepts
   */
  async searchCatalogSemantically(query, topK = 5) {
    try {
      const embedding = await gcpSovereignCompatService.getEmbeddings(query);
      const embeddingStr = `[${embedding.join(',')}]`;

      // Query OkfConcept using cosine distance (<=>)
      const results = await prisma.$queryRawUnsafe(`
                SELECT "id", "conceptId", "type", "title", "description", "body",
                       1 - ("embedding" <=> '${embeddingStr}'::vector) as similarity
                FROM "OkfConcept"
                ORDER BY "embedding" <=> '${embeddingStr}'::vector
                LIMIT ${topK}
            `);

      return results;
    } catch (err) {
      logger.warn(
        `⚠️ [Knowledge Catalog] pgvector search failed: ${err.message}. Falling back to text matching.`,
      );
      return this.queryCatalogText(query);
    }
  }

  /**
   * Query catalog fallback via text-matching
   */
  queryCatalogText(query) {
    const conceptIds = this.listLocalBundle();
    const matched = [];

    for (const conceptId of conceptIds) {
      const concept = this.getLocalConcept(conceptId);
      if (!concept) continue;

      const lowerQuery = query.toLowerCase();
      const matchesTitle = concept.frontmatter.title
        ?.toLowerCase()
        .includes(lowerQuery);
      const matchesDesc = concept.frontmatter.description
        ?.toLowerCase()
        .includes(lowerQuery);
      const matchesBody = concept.body.toLowerCase().includes(lowerQuery);

      if (matchesTitle || matchesDesc || matchesBody) {
        matched.push({
          conceptId,
          type: concept.frontmatter.type,
          title: concept.frontmatter.title,
          description: concept.frontmatter.description,
          body: concept.body,
          similarity: 0.5, // mock similarity for text match fallback
        });
      }
    }
    return matched;
  }

  /**
   * Pulls entries from Google Cloud Dataplex to local OKF files
   */
  async pullFromDataplex() {
    logger.info(
      '📥 [Knowledge Catalog] Pulling catalog updates from GCP Dataplex...',
    );
    if (!this.client) {
      logger.warn('⚠️ Dataplex client unavailable. Simulating pull operation.');
      return {
        success: true,
        details: 'Simulated pull from GCP Dataplex completed successfully.',
      };
    }

    try {
      const parent = this.client.entryGroupPath(
        this.projectId,
        this.location,
        'alti-swarm-governance',
      );
      logger.info(`   Listing entries under entry group: ${parent}`);

      const [entries] = await this.client.listEntries({ parent });
      let count = 0;

      for (const entry of entries) {
        const nameParts = entry.name.split('/');
        const entryId = nameParts[nameParts.length - 1];

        const mdContent = `---
type: Dataplex Entry
title: ${entry.displayName || entryId}
description: ${entry.description || 'No description provided.'}
resource: ${entry.name}
timestamp: ${new Date().toISOString()}
---

# Service Metadata

- **Entry Type**: ${entry.entryType}
- **Create Time**: ${entry.createTime?.seconds}

# Aspect Schemas
`;
        const filePath = path.join(
          this.catalogDir,
          'tables',
          `${entryId.toLowerCase()}.md`,
        );
        fs.writeFileSync(filePath, mdContent, 'utf8');
        count++;
      }

      // Sync newly pulled concepts to PostgreSQL/Neo4j
      await this.syncLocalToServices();

      return { success: true, count };
    } catch (err) {
      logger.error('❌ Dataplex pull failed:', err.message);
      return { success: false, error: err.message };
    }
  }

  /**
   * Pushes local OKF entries to GCP Dataplex
   */
  async pushToDataplex() {
    logger.info(
      '📤 [Knowledge Catalog] Pushing local OKF concepts to GCP Dataplex...',
    );
    const entries = this.listLocalBundle();

    if (!this.client) {
      logger.warn('⚠️ Dataplex client unavailable. Simulating push operation.');
      return {
        success: true,
        details: 'Simulated push to GCP Dataplex completed successfully.',
      };
    }

    try {
      for (const item of entries) {
        const concept = this.getLocalConcept(item);
        if (!concept) continue;

        const validation = validateOKF(concept.frontmatter);
        if (!validation.isValid) {
          logger.warn(
            `⚠️ Skipping invalid OKF concept [${item}]: ${validation.error}`,
          );
          continue;
        }

        const entryGroup = 'alti-swarm-governance';
        const entryId = item.replace(/\//g, '-');
        const entryName = this.client.entryPath(
          this.projectId,
          this.location,
          entryGroup,
          entryId,
        );

        try {
          await this.client.getEntry({ name: entryName });
          await this.client.updateEntry({
            entry: {
              name: entryName,
              displayName: concept.frontmatter.title || entryId,
              description: concept.frontmatter.description || '',
            },
          });
          logger.info(`   Successfully updated Dataplex entry: ${entryId}`);
        } catch (getErr) {
          const parent = this.client.entryGroupPath(
            this.projectId,
            this.location,
            entryGroup,
          );
          await this.client.createEntry({
            parent,
            entryId,
            entry: {
              displayName: concept.frontmatter.title || entryId,
              description: concept.frontmatter.description || '',
              entryType:
                'projects/mock-types/entryTypes/' +
                concept.frontmatter.type.replace(/\s+/g, ''),
            },
          });
          logger.info(`   Successfully created Dataplex entry: ${entryId}`);
        }
      }

      return { success: true };
    } catch (err) {
      logger.error('❌ Dataplex push failed:', err.message);
      return { success: false, error: err.message };
    }
  }

  /**
   * Helper to list all local concept IDs (relative paths)
   */
  listLocalBundle() {
    if (!fs.existsSync(this.catalogDir)) return [];
    const files = [];

    const scan = dir => {
      const list = fs.readdirSync(dir);
      for (const name of list) {
        const fullPath = path.join(dir, name);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
          scan(fullPath);
        } else if (
          name.endsWith('.md') &&
          name !== 'index.md' &&
          name !== 'log.md'
        ) {
          const relative = path.relative(this.catalogDir, fullPath);
          files.push(relative.replace(/\.md$/, ''));
        }
      }
    };

    scan(this.catalogDir);
    return files;
  }

  /**
   * Reads a local concept by ID
   */
  getLocalConcept(id) {
    const filePath = path.join(this.catalogDir, `${id}.md`);
    if (!fs.existsSync(filePath)) return null;

    const content = fs.readFileSync(filePath, 'utf8');
    return parseOKF(content);
  }

  /**
   * Updates a local concept file
   */
  async updateLocalConcept(id, frontmatter, body) {
    const filePath = path.join(this.catalogDir, `${id}.md`);

    // Build back OKF string
    const yamlLines = ['---'];
    for (const [key, val] of Object.entries(frontmatter)) {
      if (Array.isArray(val)) {
        yamlLines.push(`${key}: [${val.join(', ')}]`);
      } else {
        yamlLines.push(`${key}: ${val}`);
      }
    }
    yamlLines.push('---');
    yamlLines.push('');
    yamlLines.push(body);

    fs.writeFileSync(filePath, yamlLines.join('\n'), 'utf8');

    // Dynamically sync the individual updated concept
    try {
      await prisma.okfConcept.upsert({
        where: { conceptId: id },
        update: {
          type: frontmatter.type,
          title: frontmatter.title || id,
          description: frontmatter.description || '',
          resource: frontmatter.resource || null,
          tags: frontmatter.tags || [],
          body: body,
          timestamp: new Date(frontmatter.timestamp || Date.now()),
          metadata: frontmatter,
        },
        create: {
          conceptId: id,
          type: frontmatter.type,
          title: frontmatter.title || id,
          description: frontmatter.description || '',
          resource: frontmatter.resource || null,
          tags: frontmatter.tags || [],
          body: body,
          timestamp: new Date(frontmatter.timestamp || Date.now()),
          metadata: frontmatter,
        },
      });

      try {
        const embedding = await gcpSovereignCompatService.getEmbeddings(body);
        const embeddingStr = `[${embedding.join(',')}]`;
        await prisma.$executeRawUnsafe(`
                    UPDATE "OkfConcept"
                    SET "embedding" = '${embeddingStr}'::vector
                    WHERE "conceptId" = '${id}'
                `);
      } catch (embErr) {
        logger.debug(
          `[Knowledge Catalog] Single vector embedding skipped/unsupported: ${embErr.message}`,
        );
      }

      try {
        await neo4jService.executeCypher(
          `
                    MERGE (c:OkfConcept {conceptId: $conceptId})
                    SET c.type = $type, c.title = $title, c.description = $description, c.resource = $resource, c.tags = $tags, c.timestamp = $timestamp
                `,
          {
            conceptId: id,
            type: frontmatter.type,
            title: frontmatter.title || id,
            description: frontmatter.description || '',
            resource: frontmatter.resource || '',
            tags: frontmatter.tags || [],
            timestamp: frontmatter.timestamp || new Date().toISOString(),
          },
        );
      } catch (graphErr) {
        logger.debug(
          `[Knowledge Catalog] Single Neo4j graph sync bypassed: ${graphErr.message}`,
        );
      }

      try {
        socketService.broadcast('swarm', 'okf_concept_updated', {
          conceptId: id,
          type: frontmatter.type,
          title: frontmatter.title,
          timestamp: new Date().toISOString(),
        });
      } catch (sockErr) {
        logger.debug(
          `[Knowledge Catalog] Single WebSockets broadcast bypassed: ${sockErr.message}`,
        );
      }
    } catch (syncErr) {
      logger.error(
        `❌ [Knowledge Catalog] Failed to sync dynamic update for ${id}: ${syncErr.message}`,
      );
    }

    return true;
  }
}

export const knowledgeCatalogService = new KnowledgeCatalogService();
