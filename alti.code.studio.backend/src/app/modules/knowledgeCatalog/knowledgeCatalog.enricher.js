import fs from 'node:fs';
import path from 'node:path';
import { aiProvider } from '../ai/ai.provider.js';
import { logger } from '../../../shared/logger.js';
import { knowledgeCatalogService } from './knowledgeCatalog.service.js';

class KnowledgeCatalogEnricher {
  /**
   * Runs the autonomous enrichment agent over the entire local OKF bundle
   * @returns {Promise<object>} Results of the enrichment loop
   */
  async enrichBundle() {
    logger.info(
      '🤖 [Knowledge Catalog] Initiating Autonomous Enrichment Agent Loop...',
    );
    const conceptIds = knowledgeCatalogService.listLocalBundle();
    let enrichedCount = 0;

    for (const conceptId of conceptIds) {
      try {
        logger.info(
          `🤖 [Knowledge Catalog] Enriching concept: ${conceptId}...`,
        );
        const concept = knowledgeCatalogService.getLocalConcept(conceptId);
        if (!concept) continue;

        const enrichmentPrompt = `
You are a senior data steward and software documentation expert. Your task is to review the following OKF (Open Knowledge Format) concept and enrich its documentation.

Concept Path: ${conceptId}
Concept Type: ${concept.frontmatter.type}
Concept Title: ${concept.frontmatter.title}
Concept Description: ${concept.frontmatter.description}
Concept Resource: ${concept.frontmatter.resource || 'None'}
Concept Tags: ${JSON.stringify(concept.frontmatter.tags || [])}

Current Document Content:
${concept.body}

Please produce a comprehensive, clean, and highly professional markdown documentation block to update this asset. Follow these rules:
1. Provide a top-level summary of 2-3 paragraphs describing the asset, its business value, and technical significance.
2. Structure information with standard Markdown headings:
   - \`# Schema\` (if it describes a table or database schema)
   - \`# Details\` (if it is an API or configuration)
   - \`# Usage Details\` (provide concrete usage examples, e.g. SQL queries for tables or curl commands/JSON request payloads for APIs)
   - \`# Citations\` (maintain existing citations and add any new ones used)
3. GROUND your response in the facts. Do not make up endpoints, tables, or fields that are not in the existing content or context.
4. Respond ONLY with the markdown body block (do not include the YAML frontmatter delimiters, as we will merge frontmatter automatically).
`;

        const enrichedBody = await aiProvider.generate(enrichmentPrompt);

        // Keep the existing frontmatter but update the timestamp
        const updatedFrontmatter = {
          ...concept.frontmatter,
          timestamp: new Date().toISOString(),
        };

        await knowledgeCatalogService.updateLocalConcept(
          conceptId,
          updatedFrontmatter,
          enrichedBody.trim(),
        );
        logger.info(
          `✅ [Knowledge Catalog] Concept ${conceptId} enriched successfully.`,
        );
        enrichedCount++;
      } catch (err) {
        logger.error(
          `❌ [Knowledge Catalog] Failed to enrich concept ${conceptId}:`,
          err.message,
        );
      }
    }

    // Run drift validation after enrichment
    const driftReport = await this.auditAndRepairDrift();

    return { success: true, enrichedCount, driftReport };
  }

  /**
   * Compares actual codebase structures with catalog specifications,
   * generating automated repair patches (.patch diff files) when drift is detected.
   */
  async auditAndRepairDrift() {
    logger.info(
      '🔍 [Knowledge Catalog] Executing Active Schema & Code Drift Audit...',
    );
    const conceptIds = knowledgeCatalogService.listLocalBundle();

    const patchesDir = path.join(knowledgeCatalogService.catalogDir, 'patches');
    if (!fs.existsSync(patchesDir)) {
      fs.mkdirSync(patchesDir, { recursive: true });
    }

    const report = {
      detectedDrifts: [],
      patchesGenerated: [],
    };

    const schemaPath = path.join(process.cwd(), 'prisma/schema.prisma');
    const schemaExists = fs.existsSync(schemaPath);
    const schemaContent = schemaExists
      ? fs.readFileSync(schemaPath, 'utf8')
      : '';

    for (const conceptId of conceptIds) {
      try {
        const concept = knowledgeCatalogService.getLocalConcept(conceptId);
        if (!concept) continue;

        const conceptType = concept.frontmatter.type;

        // Case 1: PostgreSQL Table Drift Validation
        if (conceptType === 'PostgreSQL Table' && schemaExists) {
          const tableName = concept.frontmatter.title;
          const regex = new RegExp(
            `model\\s+${tableName}\\s+\\{([\\s\\S]*?)\\}`,
            'i',
          );
          const match = regex.exec(schemaContent);

          if (!match) {
            logger.warn(
              `⚠️ [Drift Detected] Table [${tableName}] specified in catalog is missing in schema.prisma.`,
            );
            report.detectedDrifts.push({
              conceptId,
              type: 'missing_table',
              target: 'prisma/schema.prisma',
            });

            // Generate repair patch to recreate table in Prisma
            const patchContent = await this._generatePrismaPatch(
              tableName,
              concept.body,
            );
            const patchFile = path.join(
              patchesDir,
              `${tableName.toLowerCase()}_add_table.patch`,
            );
            fs.writeFileSync(patchFile, patchContent, 'utf8');
            report.patchesGenerated.push(patchFile);
          } else {
            // Check if fields match
            const schemaFieldsBlock = match[1];
            const driftDetected = this._checkFieldDrift(
              schemaFieldsBlock,
              concept.body,
            );
            if (driftDetected) {
              logger.warn(
                `⚠️ [Drift Detected] Table [${tableName}] fields mismatch with schema.prisma.`,
              );
              report.detectedDrifts.push({
                conceptId,
                type: 'fields_mismatch',
                target: 'prisma/schema.prisma',
              });

              // Generate repair patch to update table fields
              const patchContent = await this._generatePrismaPatch(
                tableName,
                concept.body,
                schemaFieldsBlock,
              );
              const patchFile = path.join(
                patchesDir,
                `${tableName.toLowerCase()}_update_fields.patch`,
              );
              fs.writeFileSync(patchFile, patchContent, 'utf8');
              report.patchesGenerated.push(patchFile);
            }
          }
        }
      } catch (err) {
        logger.error(
          `❌ [Knowledge Catalog] Drift validation error for ${conceptId}:`,
          err.message,
        );
      }
    }

    logger.info(
      `✅ [Drift Audit] Completed. Detected ${report.detectedDrifts.length} drifts. Generated ${report.patchesGenerated.length} repair patches.`,
    );
    return report;
  }

  /**
   * Checks if fields list in catalog body is missing in schema fields block
   */
  _checkFieldDrift(schemaFieldsBlock, catalogBody) {
    // Parse columns from markdown table in catalog
    const lines = catalogBody.split('\n');
    for (const line of lines) {
      if (
        line.trim().startsWith('|') &&
        !line.includes('Column') &&
        !line.includes('---')
      ) {
        const parts = line.split('|');
        if (parts.length >= 3) {
          const columnName = parts[1].replace(/`/g, '').trim();
          if (columnName && !schemaFieldsBlock.includes(columnName)) {
            return true; // columnName is missing in schema.prisma!
          }
        }
      }
    }
    return false;
  }

  /**
   * Invokes AI provider to generate a git diff patch file to resolve schema drift
   */
  async _generatePrismaPatch(
    tableName,
    catalogSpecification,
    currentFieldsBlock = '',
  ) {
    const prompt = `
You are a principal systems database engineer. Generate a git diff patch file to align the schema.prisma with the approved OKF catalog specification.

Target File: prisma/schema.prisma
Database Table: ${tableName}

Approved Catalog Spec:
${catalogSpecification}

Current Schema Fields Block (if any):
${currentFieldsBlock}

Please output ONLY a valid git diff patch. Do not output code blocks like \`\`\`diff or conversational explanation text.
`;
    return aiProvider.generate(prompt, { temperature: 0.1 });
  }
}

export const knowledgeCatalogEnricher = new KnowledgeCatalogEnricher();
