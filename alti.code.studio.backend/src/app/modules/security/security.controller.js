import { DeepsecService } from './deepsec.service.js';

export const SecurityController = {
  async runDeepsecScan(req, res) {
    try {
      // Typically you'd pull the target path from req.body or config.
      // For this integration, we'll scan the workspace root or current backend dir.
      const targetPath = req.body.targetPath || '.';

      const scanResults = await DeepsecService.scanCodebase(targetPath);

      res.status(200).json({
        success: true,
        results: scanResults,
      });
    } catch (error) {
      console.error('[SecurityController] runDeepsecScan error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to run Deepsec scan',
        error: error.message,
      });
    }
  },

  async verifyLedger(req, res) {
    try {
      const tenantId = req.query.tenantId || req.body.tenantId || null;
      const { ledgerVerifierService } =
        await import('./ledgerVerifier.service.js');
      const report = await ledgerVerifierService.verifyChain(tenantId);

      res.status(200).json({
        success: true,
        ...report,
      });
    } catch (error) {
      console.error('[SecurityController] verifyLedger error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to verify ledger',
        error: error.message,
      });
    }
  },
};
