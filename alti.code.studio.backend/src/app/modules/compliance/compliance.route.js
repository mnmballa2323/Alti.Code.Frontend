import express from 'express';
import { industryComplianceService } from './industry_compliance.service.js';
import { logger } from '../../../shared/logger.js';

const router = express.Router();

/**
 * POST /api/governance/fintech/audit
 * PCI-DSS compliance audit for Fintech transaction payloads.
 */
router.post('/fintech/audit', async (req, res) => {
    try {
        const { payload } = req.body;
        const userId = req.user?.id || 'system_dev_user';
        const tenantId = req.user?.tenantId || null;

        if (!payload) {
            return res.status(400).json({ success: false, error: 'Payload is required.' });
        }

        const result = await industryComplianceService.auditFintechTransaction(userId, tenantId, payload);
        res.status(200).json({ success: true, ...result });
    } catch (error) {
        logger.error('[GovernanceRoute] FinTech Audit Error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * POST /api/governance/healthcare/audit
 * HIPAA compliance audit for patient PHI access.
 */
router.post('/healthcare/audit', async (req, res) => {
    try {
        const { patientId, accessType, payload } = req.body;
        const userId = req.user?.id || 'system_dev_user';
        const tenantId = req.user?.tenantId || null;

        if (!patientId || !accessType || !payload) {
            return res.status(400).json({ success: false, error: 'patientId, accessType, and payload are required.' });
        }

        const result = await industryComplianceService.auditHealthcareAccess(userId, tenantId, patientId, accessType, payload);
        res.status(200).json({ success: true, ...result });
    } catch (error) {
        logger.error('[GovernanceRoute] Healthcare Audit Error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * POST /api/governance/pharma/signature
 * FDA 21 CFR Part 11 Electronic Signature verification.
 */
router.post('/pharma/signature', async (req, res) => {
    try {
        const { changeReason, actionPayload, userSignature } = req.body;
        const userId = req.user?.id || 'system_dev_user';
        const tenantId = req.user?.tenantId || null;

        if (!changeReason || !actionPayload || !userSignature) {
            return res.status(400).json({ success: false, error: 'changeReason, actionPayload, and userSignature are required.' });
        }

        const result = await industryComplianceService.verifyPharmaElectronicSignature(
            userId, tenantId, changeReason, actionPayload, userSignature
        );
        res.status(200).json({ success: true, ...result });
    } catch (error) {
        logger.error('[GovernanceRoute] Pharma Part 11 Error:', error);
        res.status(400).json({ success: false, error: error.message });
    }
});

/**
 * POST /api/governance/hedgefund/audit
 * SEC Rule 17a-4 compliance tamper-proof ledger audit.
 */
router.post('/hedgefund/audit', async (req, res) => {
    try {
        const { operationType, operationPayload } = req.body;
        const userId = req.user?.id || 'system_dev_user';
        const tenantId = req.user?.tenantId || null;

        if (!operationType || !operationPayload) {
            return res.status(400).json({ success: false, error: 'operationType and operationPayload are required.' });
        }

        const result = await industryComplianceService.auditHedgeFundOperation(userId, tenantId, operationType, operationPayload);
        res.status(200).json({ success: true, ...result });
    } catch (error) {
        logger.error('[GovernanceRoute] Hedge Fund SEC Audit Error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * POST /api/governance/automotive/verify
 * ISO 26262/AUTOSAR Safety Rule static verification.
 */
router.post('/automotive/verify', async (req, res) => {
    try {
        const { code } = req.body;

        if (!code) {
            return res.status(400).json({ success: false, error: 'Code block payload is required.' });
        }

        const result = await industryComplianceService.verifyAutomotiveSoftwareSafety(code);
        res.status(200).json({ success: true, ...result });
    } catch (error) {
        logger.error('[GovernanceRoute] Automotive Safety Verification Error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

export const complianceRoutes = router;
export default router;
