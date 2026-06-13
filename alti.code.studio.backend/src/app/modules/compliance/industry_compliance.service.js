import crypto from 'crypto';
import { logger } from '../../../shared/logger.js';
import { encryptionService } from '../security/encryption.service.js';
import { auditLogService } from '../security/auditLog.service.js';
import { kmsService } from '../googleCloud/kms.service.js';

class IndustryComplianceService {
    constructor() {
        logger.info('⚖️ [Compliance] Industry Compliance Service initialized.');
    }

    /**
     * Helper to run Luhn algorithm check on a string of digits
     */
    _isValidLuhn(cardNumberString) {
        const sanitized = cardNumberString.replace(/\D/g, '');
        if (sanitized.length < 13 || sanitized.length > 19) return false;
        
        let sum = 0;
        let shouldDouble = false;
        
        for (let i = sanitized.length - 1; i >= 0; i--) {
            let digit = parseInt(sanitized.charAt(i), 10);
            if (shouldDouble) {
                digit *= 2;
                if (digit > 9) digit -= 9;
            }
            sum += digit;
            shouldDouble = !shouldDouble;
        }
        
        return (sum % 10) === 0;
    }

    /**
     * 💰 PCI-DSS / FinTech Compliance Check
     * Scans payload for Credit Cards (PAN), redacts or encrypts them using KMS and AES-256-GCM.
     */
    async auditFintechTransaction(userId, tenantId, payload) {
        logger.info(`💳 [PCI-DSS] Auditing FinTech transaction for user: ${userId}`);
        const payloadString = typeof payload === 'string' ? payload : JSON.stringify(payload);
        
        // Find potential credit card numbers (13-19 digits, possibly separated by spaces/dashes)
        const ccRegex = /\b(?:\d[ -]*?){13,19}\b/g;
        let match;
        const cardNumbers = [];
        
        while ((match = ccRegex.exec(payloadString)) !== null) {
            const candidate = match[0].replace(/\s|-/g, '');
            if (this._isValidLuhn(candidate)) {
                cardNumbers.push(match[0]);
            }
        }

        let processedPayload = payloadString;
        const encryptedCards = [];

        // Encrypt any detected PANs and redact them from the raw logs/payloads
        for (const rawCard of cardNumbers) {
            const cleanCard = rawCard.replace(/\s|-/g, '');
            const masked = `XXXX-XXXX-XXXX-${cleanCard.slice(-4)}`;
            
            // Encrypt using our AES-256-GCM service
            const encrypted = await encryptionService.encrypt(cleanCard);
            encryptedCards.push({ masked, encrypted });
            
            // Redact in-place
            processedPayload = processedPayload.replace(rawCard, masked);
        }

        // Check for potential CVV/CVC (3 or 4 digits near card keywords)
        const cvvRegex = /['"]?(cvv|cvc|card[-_]?verification)['"]?\s*:\s*['"]?(\d{3,4})['"]?/gi;
        processedPayload = processedPayload.replace(cvvRegex, (m, label) => `"${label}":"[CVV-REDACTED]"`);

        const status = cardNumbers.length > 0 ? 'WARNING' : 'SUCCESS';
        await auditLogService.logAction({
            tenantId,
            userId,
            action: 'PCI_DSS_AUDIT',
            resource: 'FinTech Transaction Pipeline',
            status,
            metadata: {
                cardsDetected: cardNumbers.length,
                encryptedMappings: encryptedCards.map(c => c.masked)
            }
        });

        return {
            compliant: true,
            scrubbedPayload: JSON.parse(processedPayload),
            encryptedCards,
            violationsRemoved: cardNumbers.length
        };
    }

    /**
     * 🏥 HIPAA / Healthcare Compliance Check
     * Scans for Protected Health Information (PHI) such as SSN, MRN, Birth Dates and redacts them.
     */
    async auditHealthcareAccess(userId, tenantId, patientId, accessType, payload) {
        logger.info(`⚕️ [HIPAA] Auditing Healthcare PHI access for patient: ${patientId}`);
        const payloadString = typeof payload === 'string' ? payload : JSON.stringify(payload);

        let processedPayload = payloadString;
        let phiDetectedCount = 0;

        // 1. Scan and redact SSN: \b\d{3}-\d{2}-\d{4}\b
        const ssnRegex = /\b\d{3}-\d{2}-\d{4}\b/g;
        if (ssnRegex.test(processedPayload)) {
            processedPayload = processedPayload.replace(ssnRegex, '[SSN-REDACTED]');
            phiDetectedCount++;
        }

        // 2. Scan and redact Medical Record Number (MRN)
        const mrnRegex = /['"]?(mrn|medical[-_]?record[-_]?number)['"]?\s*:\s*['"]?([a-z0-9-]{6,15})['"]?/gi;
        processedPayload = processedPayload.replace(mrnRegex, (m, label) => {
            phiDetectedCount++;
            return `"${label}":"[MRN-REDACTED]"`;
        });

        // 3. Scan and redact standard dates of birth / patient names
        const dobRegex = /['"]?(dob|birthdate|date[-_]?of[-_]?birth)['"]?\s*:\s*['"]?(\d{4}-\d{2}-\d{2})['"]?/gi;
        processedPayload = processedPayload.replace(dobRegex, (m, label) => {
            phiDetectedCount++;
            return `"${label}":"[DOB-REDACTED]"`;
        });

        const status = phiDetectedCount > 0 ? 'WARNING' : 'SUCCESS';
        await auditLogService.logAction({
            tenantId,
            userId,
            action: 'HIPAA_PHI_ACCESS',
            resource: `Patient/${patientId}`,
            status,
            metadata: {
                accessType,
                patientId,
                phiFieldsRedacted: phiDetectedCount
            }
        });

        return {
            compliant: true,
            scrubbedPayload: JSON.parse(processedPayload),
            phiDetectedCount
        };
    }

    /**
     * 🧪 FDA 21 CFR Part 11 Electronic Signature Verification (Pharma)
     * Enforces electronic signatures and change reason validation for production operations.
     */
    async verifyPharmaElectronicSignature(userId, tenantId, changeReason, actionPayload, userSignature) {
        logger.info(`🧪 [Part 11] Verifying electronic signature for user: ${userId}`);

        if (!changeReason || changeReason.trim().length < 10) {
            throw new Error('FDA 21 CFR Part 11 violation: A valid change reason of at least 10 characters is required.');
        }

        if (!userSignature) {
            throw new Error('FDA 21 CFR Part 11 violation: Cryptographic electronic signature is required.');
        }

        // Verify cryptographic signature integrity (using KMS)
        const payloadString = JSON.stringify(actionPayload);
        const isValid = await kmsService.verifySignature(payloadString, userSignature);

        if (!isValid) {
            await auditLogService.logAction({
                tenantId,
                userId,
                action: 'FDA_PART11_SIGNATURE_FAILED',
                resource: 'Pharma Production Pipeline',
                status: 'FAILED',
                metadata: { changeReason, payloadHash: crypto.createHash('sha256').update(payloadString).digest('hex') }
            });
            throw new Error('FDA 21 CFR Part 11 violation: Invalid cryptographic signature.');
        }

        // Generate high-integrity audit log
        const auditLogEntry = await auditLogService.logAction({
            tenantId,
            userId,
            action: 'FDA_PART11_SIGNATURE_VERIFIED',
            resource: 'Pharma Production Pipeline',
            status: 'SUCCESS',
            metadata: {
                changeReason,
                electronicSignature: userSignature,
                payloadHash: crypto.createHash('sha256').update(payloadString).digest('hex')
            }
        });

        return {
            verified: true,
            timestamp: auditLogEntry.timestamp,
            auditLogId: auditLogEntry.id
        };
    }

    /**
     * 🏢 SEC Rule 17a-4 / SOC 2 Immutable Ledger Receipt (Hedge Funds)
     * Creates tamper-proof receipts for audit logging compliance.
     */
    async auditHedgeFundOperation(userId, tenantId, operationType, operationPayload) {
        logger.info(`🏢 [SEC 17a-4] Logging hedge fund operation: ${operationType}`);
        const payloadString = JSON.stringify(operationPayload);

        // Chain with standard WORM logs
        const auditLog = await auditLogService.logAction({
            tenantId,
            userId,
            action: `SEC_WORM_${operationType.toUpperCase()}`,
            resource: 'Hedge Fund Operations Ledger',
            status: 'SUCCESS',
            metadata: {
                payloadHash: crypto.createHash('sha256').update(payloadString).digest('hex')
            }
        });

        // Sign the transaction block hash via KMS to prevent tampering
        const signature = await kmsService.signPayload(auditLog.hash);

        return {
            receiptId: `REC-${crypto.randomBytes(6).toString('hex').toUpperCase()}`,
            timestamp: auditLog.timestamp,
            blockHash: auditLog.hash,
            previousHash: auditLog.previousHash,
            kmsSignature: signature,
            retentionRequiredYears: 7 // SEC 17a-4 retention period
        };
    }

    /**
     * 🚗 ISO 26262 / AUTOSAR Automotive Code Safety Validator
     * Scans scripts/code files for dynamic memory allocation, unbounded loops, or unsafe operations.
     */
    async verifyAutomotiveSoftwareSafety(codePayload) {
        logger.info('🚗 [ISO 26262] Auditing automotive software safety profile...');
        const findings = [];
        let score = 100;

        // 1. Check for dynamic memory allocation (highly prohibited in safety-critical code)
        const dynamicAllocRegex = /\b(malloc|free|realloc|new|delete)\b/g;
        let match;
        while ((match = dynamicAllocRegex.exec(codePayload)) !== null) {
            findings.push({
                severity: 'CRITICAL',
                rule: 'ISO-26262-MALLOC-PROHIBITED',
                description: `Dynamic memory allocation function [${match[0]}] detected. Safety-critical systems require static allocation.`,
                line: codePayload.substring(0, match.index).split('\n').length
            });
            score -= 20;
        }

        // 2. Check for potential unbounded loops: while(true) or while(1) without break, etc.
        const unboundedLoopRegex = /while\s*\(\s*(true|1)\s*\)/g;
        while ((match = unboundedLoopRegex.exec(codePayload)) !== null) {
            findings.push({
                severity: 'HIGH',
                rule: 'ISO-26262-UNBOUNDED-LOOP',
                description: 'Unbounded loop [while(true)] detected. Use deterministic loop bounds.',
                line: codePayload.substring(0, match.index).split('\n').length
            });
            score -= 15;
        }

        // 3. Check for recursion (prohibited due to stack overflow hazard)
        const functionDeclarations = [...codePayload.matchAll(/\bfunction\s+([A-Za-z0-9_]+)/g)].map(m => m[1]);
        for (const funcName of functionDeclarations) {
            const funcBodyRegex = new RegExp(`function\\s+${funcName}[^{]*\\{([^{}]*|\\{[^{}]*\\})*\\}`, 'g');
            const bodies = codePayload.match(funcBodyRegex) || [];
            for (const body of bodies) {
                // If function calls itself
                const selfCallRegex = new RegExp(`\\b${funcName}\\s*\\(`, 'g');
                const callCount = (body.match(selfCallRegex) || []).length;
                if (callCount > 1) { // 1 for declaration/match wrapper, >1 means self-recursion call inside
                    findings.push({
                        severity: 'HIGH',
                        rule: 'ISO-26262-RECURSION-PROHIBITED',
                        description: `Recursive function call detected in [${funcName}]. Recursion is prohibited.`,
                        line: codePayload.indexOf(funcName) !== -1 ? codePayload.substring(0, codePayload.indexOf(funcName)).split('\n').length : 1
                    });
                    score -= 15;
                }
            }
        }

        const passed = score >= 80;
        
        await auditLogService.logAction({
            action: 'AUTOMOTIVE_SAFETY_VALIDATION',
            resource: 'ISO 26262 Safety Rules Checker',
            status: passed ? 'SUCCESS' : 'WARNING',
            metadata: {
                score,
                findingsCount: findings.length,
                passed
            }
        });

        return {
            compliant: passed,
            safetyScore: Math.max(0, score),
            findings
        };
    }
}

export const industryComplianceService = new IndustryComplianceService();
