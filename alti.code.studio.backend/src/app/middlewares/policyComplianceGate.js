import fs from 'node:fs';
import path from 'node:path';
import { logger } from '../../shared/logger.js';
import { AuditService } from '../modules/audit/audit.service.js';

export class PolicyComplianceGate {
  /**
   * Scans code content to enforce security, licensing, and design constraints.
   * @param {string} filePath - Target file path
   * @param {string} content - Raw content of the file
   * @returns {object} Results of compliance scan { isValid, errors }
   */
  static verify(filePath, content) {
    const errors = [];
    const basename = path.basename(filePath);

    // 1. Secrets & Credentials Scan (High Entropy API Keys)
    const secretRegexes = [
      /AIzaSy[A-Za-z0-9_\-]{33}/i, // Google API Keys
      /sk_live_[0-9a-zA-Z]{24}/i, // Stripe Live Secret Keys
      /amzn\.mws\.[0-9a-f]{8}-[0-9a-f]{4}/i, // Amazon MWS Keys
      /AWS_SECRET_ACCESS_KEY\s*=\s*['"][A-Za-z0-9/+=]{40}['"]/i, // AWS Secrets
      /bearer\s+[a-zA-Z0-9_\-\.]{50,}/i, // General Bearer tokens
    ];

    for (const regex of secretRegexes) {
      if (regex.test(content)) {
        errors.push(
          `[Security Gate] Plaintext credentials or API keys detected in ${basename}.`,
        );
      }
    }

    // 2. Copyleft Licensing Contamination check
    const copyleftTerms = [
      /GPLv3/i,
      /GNU General Public License/i,
      /AGPL/i,
      /Affero General Public License/i,
    ];

    for (const term of copyleftTerms) {
      if (
        term.test(content) &&
        !content.includes('Apache-2.0') &&
        !content.includes('MIT')
      ) {
        errors.push(
          `[Legal Gate] Potential Copyleft License contamination (GPL/AGPL) detected in ${basename}. Only MIT or Apache-2.0 is allowed.`,
        );
      }
    }

    // 3. Express CSRF Policy Gate (Verify routing patterns)
    if (
      filePath.endsWith('.route.js') ||
      filePath.endsWith('routes/index.js')
    ) {
      const hasPostOrPut = /router\.(post|put|delete)/i.test(content);
      const hasCsrf =
        /csrfProtection/i.test(content) || /doubleCsrf/i.test(content);

      if (hasPostOrPut && !hasCsrf) {
        errors.push(
          `[Architectural Gate] Active state modification routes (POST/PUT/DELETE) detected in ${basename} without active CSRF protection middleware.`,
        );
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Express middleware to block unauthorized patch submissions
   */
  static get middleware() {
    return async (req, res, next) => {
      const filePath = req.body?.path || req.query?.path || '';
      const content = req.body?.content || '';

      if (filePath && content) {
        const check = PolicyComplianceGate.verify(filePath, content);
        if (!check.isValid) {
          logger.warn(
            `❌ [Policy Compliance Gate] Vetoed file write on [${filePath}]: ${check.errors.join('; ')}`,
          );

          await AuditService.log({
            tenantId: req.user?.tenantId || null,
            productId:
              req.headers?.['x-product-id'] || req.user?.productId || null,
            actor: req.user?.id || 'agentic_installer',
            action: 'COMPLIANCE_GATE_VETO',
            metadata: { path: filePath, errors: check.errors },
            status: 'DENIED',
          });

          return res.status(403).json({
            success: false,
            error: `Compliance Gate Veto: ${check.errors.join(' | ')}`,
          });
        }
      }

      next();
    };
  }
}

export default PolicyComplianceGate;
