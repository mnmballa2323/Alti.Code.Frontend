/**
 * Copyright (c) 2026 Alti.Code.Studio
 * 
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { logger } from '../../shared/logger.js';

class SarifService {
  /**
   * Generates a standardized SARIF report from custom static analysis findings.
   * @param {Object} params
   * @param {string} params.toolName Name of the static analysis tool (e.g., "Alti-Security-Reviewer")
   * @param {string} params.toolVersion Version of the tool
   * @param {Array<Object>} params.rules Array of rule objects defining the audited checks
   * @param {Array<Object>} params.findings Array of detected violations or insights
   * @returns {Object} A valid SARIF JSON document matching the v2.1.0 schema
   */
  generateReport({ toolName, toolVersion = '1.0.0', rules = [], findings = [] }) {
    logger.info(`📊 [SarifService] Formatting ${findings.length} findings from [${toolName}] into SARIF v2.1.0 schema...`);

    const sarifRules = rules.map(rule => ({
      id: rule.id,
      name: rule.name || rule.id,
      shortDescription: {
        text: rule.shortDescription || rule.description
      },
      fullDescription: {
        text: rule.description
      },
      defaultConfiguration: {
        level: rule.level || 'warning' // warning, error, note
      },
      helpUri: rule.helpUri || `https://docs.alti.code.studio/rules/${rule.id}`
    }));

    const results = findings.map(finding => {
      const location = {
        physicalLocation: {
          artifactLocation: {
            uri: finding.filePath,
            uriBaseId: 'SRCROOT'
          }
        }
      };

      if (finding.line !== undefined) {
        location.physicalLocation.region = {
          startLine: finding.line,
          startColumn: finding.column || 1,
          endLine: finding.endLine || finding.line,
          endColumn: finding.endColumn || (finding.column ? finding.column + 1 : 2)
        };
      }

      return {
        ruleId: finding.ruleId,
        message: {
          text: finding.message
        },
        level: finding.level || 'warning',
        locations: [location],
        properties: finding.properties || {}
      };
    });

    const sarifDocument = {
      $schema: 'https://schemastore.azurewebsites.net/schemas/json/sarif-2.1.0-rtm.5.json',
      version: '2.1.0',
      runs: [
        {
          tool: {
            driver: {
              name: toolName,
              version: toolVersion,
              informationUri: 'https://github.com/microsoft/sarif-sdk',
              rules: sarifRules
            }
          },
          results: results
        }
      ]
    };

    logger.info(`✅ [SarifService] SARIF log generated successfully for [${toolName}].`);
    return sarifDocument;
  }
}

export const sarifService = new SarifService();
export default sarifService;
