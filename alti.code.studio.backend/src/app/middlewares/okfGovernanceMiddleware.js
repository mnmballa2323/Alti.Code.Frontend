import httpStatus from 'http-status';
import { logger } from '../../shared/logger.js';
import { knowledgeCatalogService } from '../modules/knowledgeCatalog/knowledgeCatalog.service.js';
import { AuditService } from '../modules/audit/audit.service.js';

/**
 * OKF Governance & Zero-Trust Security Middleware
 *
 * Intercepts incoming Express requests, matches them against OKF specifications
 * in the active Knowledge Catalog, and enforces IAP and FedRAMP compliance gates.
 */
export const okfGovernanceMiddleware = async (req, res, next) => {
  try {
    // Resolve route name (e.g., /api/v1/auth -> auth)
    const pathParts = req.path.split('/');
    const routeName =
      pathParts.find(p => p && p !== 'api' && p !== 'v1') || 'root';
    const conceptId = `apis/${routeName}`;

    console.log('=== MIDDLEWARE CONCEPT ID ===', conceptId);
    // Retrieve OKF concept from catalog
    const concept = knowledgeCatalogService.getLocalConcept(conceptId);
    console.log('=== MIDDLEWARE RETRIEVED CONCEPT ===', concept);

    if (!concept) {
      console.log('=== MIDDLEWARE CONCEPT NOT FOUND - BYPASSING ===');
      // No registered catalog entry, proceed with normal execution
      return next();
    }

    logger.info(
      `🛡️ [OKF Governance] Request to API route [${routeName}] intercepted. Enforcing catalog guidelines.`,
    );

    const specificationText = concept.body || '';

    // 1. Zero-Trust Identity-Aware Proxy (IAP) check
    const requiresIap = /Authentication.*Zero-Trust IAP/i.test(
      specificationText,
    );
    console.log('=== MIDDLEWARE REQUIRES IAP ===', requiresIap);
    if (requiresIap) {
      const hasIapHeader =
        req.headers['x-goog-iap-jwt-assertion'] || req.headers['authorization'];
      if (!hasIapHeader) {
        logger.warn(
          `❌ [OKF Governance] Security Violation on [${routeName}]: Missing Zero-Trust Identity assertion.`,
        );

        await AuditService.log({
          tenantId: req.user?.tenantId || null,
          productId:
            req.headers?.['x-product-id'] || req.user?.productId || null,
          actor: req.user?.id || 'anonymous_attacker',
          action: 'API_GOVERNANCE_VIOLATION_IAP',
          metadata: { path: req.path, method: req.method, ip: req.ip },
          status: 'DENIED',
        });

        return res.status(httpStatus.UNAUTHORIZED).json({
          success: false,
          error:
            'Access Denied: Missing Zero-Trust Identity assertion (IAP token required).',
        });
      }
    }

    // 2. FedRAMP Boundary Check
    const isFedrampEnforced = /Compliance.*FedRAMP/i.test(specificationText);
    if (isFedrampEnforced) {
      // Verify client IP address or regional headers
      const clientIp = req.ip || req.headers['x-forwarded-for'] || '';
      const isLocalOrPrivate =
        clientIp.includes('127.0.0.1') ||
        clientIp.includes('::1') ||
        clientIp.includes('10.') ||
        clientIp.includes('192.168.');

      if (process.env.NODE_ENV === 'production' && !isLocalOrPrivate) {
        logger.warn(
          `❌ [OKF Governance] Compliance Violation on [${routeName}]: Request from outside FedRAMP boundary.`,
        );

        await AuditService.log({
          tenantId: req.user?.tenantId || null,
          productId:
            req.headers?.['x-product-id'] || req.user?.productId || null,
          actor: req.user?.id || 'anonymous_user',
          action: 'API_GOVERNANCE_VIOLATION_FEDRAMP',
          metadata: { path: req.path, method: req.method, ip: clientIp },
          status: 'DENIED',
        });

        return res.status(httpStatus.FORBIDDEN).json({
          success: false,
          error:
            'Access Denied: Request originates outside the compliant FedRAMP boundary.',
        });
      }
    }

    // Log successful compliance validation
    await AuditService.log({
      tenantId: req.user?.tenantId || null,
      productId: req.headers?.['x-product-id'] || req.user?.productId || null,
      actor: req.user?.id || 'system_gateway',
      action: 'API_GOVERNANCE_PASSED',
      metadata: { path: req.path, route: routeName },
      status: 'SUCCESS',
    });

    next();
  } catch (err) {
    logger.error(
      `❌ [OKF Governance] Middleware encountered error: ${err.message}`,
    );
    next(err);
  }
};

export default okfGovernanceMiddleware;
