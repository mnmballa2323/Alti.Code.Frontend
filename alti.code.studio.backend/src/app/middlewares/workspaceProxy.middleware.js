/**
 * Workspace Proxy Middleware
 * Dynamically routes HTTP requests to the correct isolated Docker/GKE container.
 */

import { createProxyMiddleware } from 'http-proxy-middleware';
import { pgLiteService } from '../services/pglite.service.js';
import { authMiddleware } from './auth.middleware.js';
import { logger } from '../../shared/logger.js';

const proxyLogic = async (req, res, next) => {
  // Example URL format: /workspace-proxy/123e4567-e89b-12d3-a456-426614174000/api/...
  // Or via header: x-workspace-id: 123...

  
  const workspaceId = req.headers['x-workspace-id'] || req.query.workspaceId;

  if (!workspaceId) {
    return next();
  }

  try {
    // Lookup the active container routing info from the DB
    const record = await pgLiteService.query(
      'SELECT external_port, status, owner_id FROM workspace_containers WHERE workspace_id = $1',
      [workspaceId]
    );

    if (!record.rows || record.rows.length === 0) {
      return res.status(404).json({ error: 'Workspace not found or not initialized' });
    }

    // Zero-Trust Security: Enforce that the requester is the owner of the workspace
    const requesterId = req.user?.userId || req.user?.subject;
    if (record.rows[0].owner_id !== 'system' && record.rows[0].owner_id !== requesterId && req.user?.role !== 'super_admin') {
      logger.warn(`🛑 Proxy Access Denied: User ${requesterId} attempted to access workspace ${workspaceId} owned by ${record.rows[0].owner_id}`);
      return res.status(403).json({ error: 'Forbidden: You do not have permission to access this workspace' });
    }

    if (record.rows[0].status !== 'running') {
      return res.status(503).json({ error: 'Workspace is suspended. Please wake it up first.' });
    }

    const port = record.rows[0].external_port;
    const target = `http://localhost:${port}`;
    
    logger.info(`🔀 Proxying request for workspace ${workspaceId} to ${target}`);

    // Create and execute proxy dynamically
    const proxy = createProxyMiddleware({
      target,
      changeOrigin: true,
      ws: true, // Support proxying WebSockets (e.g. Next.js HMR inside the workspace)
      pathRewrite: {
        '^/workspace-proxy': '', // Strip the base path
      },
      onError: (err, req, res) => {
        logger.error(`Workspace proxy error for ${workspaceId}:`, err);
        res.status(502).json({ error: 'Bad Gateway - Workspace container is unreachable' });
      }
    });

    return proxy(req, res, next);
  } catch (error) {
    logger.error(`Proxy routing failed for workspace ${workspaceId}:`, error);
    res.status(500).json({ error: 'Internal routing error' });
  }
};

// Wrap the proxy logic in the authentication middleware
export const workspaceProxyMiddleware = (req, res, next) => {
  // We pass empty roles to authMiddleware to allow any authenticated user through,
  // then we verify their specific ownership inside proxyLogic.
  authMiddleware()(req, res, (err) => {
    if (err) return next(err);
    return proxyLogic(req, res, next);
  });
};
