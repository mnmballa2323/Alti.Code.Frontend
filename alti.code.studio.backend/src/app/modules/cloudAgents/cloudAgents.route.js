import express from 'express';
import { cloudProviderRegistry } from './CloudProviderRegistry.js';

const router = express.Router();

// Authenticate with ANY of the 90+ cloud providers dynamically
router.post('/authenticate', async (req, res) => {
  try {
    const { providerName, credentials } = req.body;
    if (!providerName) {
      return res.status(400).json({ error: 'providerName is required' });
    }
    
    const result = await cloudProviderRegistry.authenticate(providerName, credentials);
    res.json(result);
  } catch (error) {
    console.error(`[CloudRoutes] Authentication error:`, error);
    res.status(500).json({ error: 'Failed to authenticate cloud provider.' });
  }
});

// Fetch telemetry for the authenticated provider
router.get('/telemetry/:providerName', async (req, res) => {
  try {
    const { providerName } = req.params;
    const telemetry = await cloudProviderRegistry.fetchGlobalTelemetry(providerName);
    res.json(telemetry);
  } catch (error) {
    console.error(`[CloudRoutes] Telemetry error for ${req.params.providerName}:`, error);
    res.status(500).json({ error: error.message || 'Failed to fetch telemetry.' });
  }
});

export const cloudAgentsRoutes = router;
