import express from 'express';
import { workspaceTelemetryService } from '../services/workspace.telemetry.service.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { pgLiteService } from '../services/pglite.service.js';

const router = express.Router();

/**
 * GET /api/v1/workspaces/:workspaceId/metrics
 * Returns real-time CPU and RAM usage for the requested workspace.
 * Protected by Auth Middleware and ownership check.
 */
router.get('/:workspaceId/metrics', authMiddleware(), async (req, res, next) => {
  try {
    const { workspaceId } = req.params;
    
    // 1. Verify Ownership
    const record = await pgLiteService.query(
      'SELECT owner_id FROM workspace_containers WHERE workspace_id = $1',
      [workspaceId]
    );

    if (!record.rows || record.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Workspace not found' });
    }

    const requesterId = req.user?.userId || req.user?.subject;
    if (record.rows[0].owner_id !== 'system' && record.rows[0].owner_id !== requesterId && req.user?.role !== 'super_admin') {
      return res.status(403).json({ success: false, message: 'Forbidden: You do not own this workspace' });
    }

    // 2. Fetch Metrics
    const metrics = await workspaceTelemetryService.getMetrics(workspaceId);
    
    return res.status(200).json({
      success: true,
      data: metrics
    });
  } catch (error) {
    next(error);
  }
});

export const WorkspaceRoutes = router;
