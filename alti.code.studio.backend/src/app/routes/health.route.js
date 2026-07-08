import { Router } from 'express';
import { gcpHealthCheckService } from '../modules/gcpCloud/gcpHealthCheck.service.js';

const router = Router();

// Kubernetes liveness probe
router.get('/healthz', async (req, res) => {
  try {
    const result = await gcpHealthCheckService.liveness();
    res.status(200).json(result);
  } catch (e) {
    res.status(503).json({ status: 'error', error: e.message });
  }
});

// Kubernetes readiness probe
router.get('/readyz', async (req, res) => {
  try {
    const result = await gcpHealthCheckService.readiness();
    const code = result.status === 'ready' ? 200 : 503;
    res.status(code).json(result);
  } catch (e) {
    res.status(503).json({ status: 'error', error: e.message });
  }
});

// Deep health check (admin only)
router.get('/health/deep', async (req, res) => {
  try {
    const result = await gcpHealthCheckService.deepHealth();
    res.status(200).json(result);
  } catch (e) {
    res.status(503).json({ status: 'error', error: e.message });
  }
});

// GCP platform status
router.get('/health/gcp', async (req, res) => {
  try {
    const { getGcpServiceHealth } = await import(
      '../modules/gcpCloud/gcpBootstrap.service.js'
    );
    const health = await getGcpServiceHealth();
    res.status(200).json({ status: 'ok', gcp: health });
  } catch (e) {
    res.status(503).json({ status: 'error', error: e.message });
  }
});

export default router;
