import express from 'express';
import { industryComplianceService } from './industry_compliance.service.js';
import { industryIntegrationService } from './industry_integration.service.js';
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

/**
 * POST /api/governance/integration/fintech/ledger
 * Validates double-entry accounting ledger entries.
 */
router.post('/integration/fintech/ledger', async (req, res) => {
    try {
        const { transaction } = req.body;
        const userId = req.user?.id || 'system_dev_user';
        const tenantId = req.user?.tenantId || null;

        if (!transaction) {
            return res.status(400).json({ success: false, error: 'Transaction object is required.' });
        }

        const result = await industryIntegrationService.validateDoubleEntryLedger(userId, tenantId, transaction);
        res.status(200).json({ success: true, ...result });
    } catch (error) {
        logger.error('[GovernanceRoute] FinTech Ledger Error:', error);
        res.status(400).json({ success: false, error: error.message });
    }
});

/**
 * POST /api/governance/integration/healthcare/fhir
 * Transforms HL7 messages into FHIR R4 resources.
 */
router.post('/integration/healthcare/fhir', async (req, res) => {
    try {
        const { hl7Message } = req.body;
        const userId = req.user?.id || 'system_dev_user';
        const tenantId = req.user?.tenantId || null;

        if (!hl7Message) {
            return res.status(400).json({ success: false, error: 'hl7Message string is required.' });
        }

        const result = await industryIntegrationService.transformHl7ToFhir(userId, tenantId, hl7Message);
        res.status(200).json({ success: true, ...result });
    } catch (error) {
        logger.error('[GovernanceRoute] Healthcare HL7-to-FHIR Error:', error);
        res.status(400).json({ success: false, error: error.message });
    }
});

/**
 * POST /api/governance/integration/pharma/archive
 * Packages and archives FDA batch records with operator signature and KMS CMEK signing.
 */
router.post('/integration/pharma/archive', async (req, res) => {
    try {
        const { batchData } = req.body;
        const userId = req.user?.id || 'system_dev_user';
        const tenantId = req.user?.tenantId || null;

        if (!batchData) {
            return res.status(400).json({ success: false, error: 'batchData object is required.' });
        }

        const result = await industryIntegrationService.archivePharmaBatch(userId, tenantId, batchData);
        res.status(200).json({ success: true, ...result });
    } catch (error) {
        logger.error('[GovernanceRoute] Pharma Batch Archive Error:', error);
        res.status(400).json({ success: false, error: error.message });
    }
});

/**
 * POST /api/governance/integration/hedgefund/risk
 * Evaluates trade risk constraints and concentration drift (BlackRock Aladdin simulation).
 */
router.post('/integration/hedgefund/risk', async (req, res) => {
    try {
        const { portfolio, proposedTrade } = req.body;
        const userId = req.user?.id || 'system_dev_user';
        const tenantId = req.user?.tenantId || null;

        if (!portfolio || !proposedTrade) {
            return res.status(400).json({ success: false, error: 'portfolio and proposedTrade are required.' });
        }

        const result = await industryIntegrationService.checkHedgeFundRisk(userId, tenantId, portfolio, proposedTrade);
        res.status(200).json({ success: true, ...result });
    } catch (error) {
        logger.error('[GovernanceRoute] Hedge Fund Risk Error:', error);
        res.status(400).json({ success: false, error: error.message });
    }
});

/**
 * POST /api/governance/integration/insurance/claim
 * Translates Guidewire XML claims and routes to specific adjustment queues.
 */
router.post('/integration/insurance/claim', async (req, res) => {
    try {
        const { xmlPayload } = req.body;
        const userId = req.user?.id || 'system_dev_user';
        const tenantId = req.user?.tenantId || null;

        if (!xmlPayload) {
            return res.status(400).json({ success: false, error: 'xmlPayload is required.' });
        }

        const result = await industryIntegrationService.routeGuidewireClaim(userId, tenantId, xmlPayload);
        res.status(200).json({ success: true, ...result });
    } catch (error) {
        logger.error('[GovernanceRoute] Insurance Claim Routing Error:', error);
        res.status(400).json({ success: false, error: error.message });
    }
});

/**
 * POST /api/governance/integration/automotive/telemetry
 * Decodes automotive CAN-bus payload frames.
 */
router.post('/integration/automotive/telemetry', async (req, res) => {
    try {
        const { telemetryFrame } = req.body;
        const userId = req.user?.id || 'system_dev_user';
        const tenantId = req.user?.tenantId || null;

        if (!telemetryFrame) {
            return res.status(400).json({ success: false, error: 'telemetryFrame is required.' });
        }

        const result = await industryIntegrationService.decodeAutomotiveTelemetry(userId, tenantId, telemetryFrame);
        res.status(200).json({ success: true, ...result });
    } catch (error) {
        logger.error('[GovernanceRoute] Automotive Telemetry Decoding Error:', error);
        res.status(400).json({ success: false, error: error.message });
    }
});

export const complianceRoutes = router;
export default router;
