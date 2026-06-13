import { describe, it, expect, vi, beforeEach } from 'vitest';
import crypto from 'crypto';
import { industryComplianceService } from './industry_compliance.service.js';
import { encryptionService } from '../security/encryption.service.js';
import { auditLogService } from '../security/auditLog.service.js';
import { kmsService } from '../googleCloud/kms.service.js';

describe('Industry Compliance Service Tests', () => {
    beforeEach(() => {
        vi.restoreAllMocks();
    });

    describe('PCI-DSS Compliance Check', () => {
        it('should scan, redact, and encrypt credit card PANs and CVV', async () => {
            const cc = '4111 1111 1111 1111'; // Valid Visa PAN via Luhn
            const payload = {
                username: 'alice',
                paymentDetails: {
                    cardNumber: cc,
                    cvv: '123'
                }
            };

            const mockEncrypt = vi.spyOn(encryptionService, 'encrypt').mockResolvedValue('encrypted-pan-blob');
            const mockLog = vi.spyOn(auditLogService, 'logAction').mockResolvedValue({ id: 'log-id' });

            const result = await industryComplianceService.auditFintechTransaction('user-1', 'tenant-1', payload);

            expect(result.compliant).toBe(true);
            expect(result.violationsRemoved).toBe(1);
            expect(result.scrubbedPayload.paymentDetails.cardNumber).toBe('XXXX-XXXX-XXXX-1111');
            expect(result.scrubbedPayload.paymentDetails.cvv).toBe('[CVV-REDACTED]');
            expect(result.encryptedCards.length).toBe(1);
            expect(result.encryptedCards[0].masked).toBe('XXXX-XXXX-XXXX-1111');
            expect(result.encryptedCards[0].encrypted).toBe('encrypted-pan-blob');
            expect(mockEncrypt).toHaveBeenCalledWith('4111111111111111');
            expect(mockLog).toHaveBeenCalled();
        });

        it('should bypass non-card numbers that fail Luhn algorithm check', async () => {
            const invalidCC = '4111 1111 1111 1112'; // Invalid Luhn
            const payload = { cardNumber: invalidCC };

            const result = await industryComplianceService.auditFintechTransaction('user-1', 'tenant-1', payload);

            expect(result.violationsRemoved).toBe(0);
            expect(result.scrubbedPayload.cardNumber).toBe(invalidCC);
        });
    });

    describe('HIPAA Compliance Check', () => {
        it('should scan and redact patient SSN and DOB and MRN', async () => {
            const payload = {
                patientName: 'Bob Smith',
                ssn: '000-12-3456',
                dob: '1985-05-12',
                mrn: 'MRN-12345678'
            };

            const mockLog = vi.spyOn(auditLogService, 'logAction').mockResolvedValue({ id: 'log-id' });

            const result = await industryComplianceService.auditHealthcareAccess(
                'user-1', 'tenant-1', 'patient-bob', 'READ', payload
            );

            expect(result.compliant).toBe(true);
            expect(result.phiDetectedCount).toBe(3);
            expect(result.scrubbedPayload.ssn).toBe('[SSN-REDACTED]');
            expect(result.scrubbedPayload.dob).toBe('[DOB-REDACTED]');
            expect(result.scrubbedPayload.mrn).toBe('[MRN-REDACTED]');
            expect(mockLog).toHaveBeenCalledWith(expect.objectContaining({
                action: 'HIPAA_PHI_ACCESS',
                resource: 'Patient/patient-bob'
            }));
        });
    });

    describe('FDA 21 CFR Part 11 Electronic Signature', () => {
        it('should verify part 11 signature successfully when valid', async () => {
            const payload = { formula: 'Compound-X-200mg' };
            const changeReason = 'Updating compound formula ratio for batch 42';
            const signature = 'valid-sig-base64';

            const mockVerify = vi.spyOn(kmsService, 'verifySignature').mockResolvedValue(true);
            const mockLog = vi.spyOn(auditLogService, 'logAction').mockResolvedValue({
                id: 'log-123',
                timestamp: '2026-06-13T22:00:00Z'
            });

            const result = await industryComplianceService.verifyPharmaElectronicSignature(
                'user-1', 'tenant-1', changeReason, payload, signature
            );

            expect(result.verified).toBe(true);
            expect(result.auditLogId).toBe('log-123');
            expect(mockVerify).toHaveBeenCalledWith(JSON.stringify(payload), signature);
            expect(mockLog).toHaveBeenCalled();
        });

        it('should throw error if change reason is missing or too short', async () => {
            const payload = { formula: 'Compound-X' };
            await expect(
                industryComplianceService.verifyPharmaElectronicSignature('user-1', 'tenant-1', 'Short', payload, 'sig')
            ).rejects.toThrow('A valid change reason of at least 10 characters is required.');
        });

        it('should throw error if signature verification fails', async () => {
            const payload = { formula: 'Compound-X' };
            vi.spyOn(kmsService, 'verifySignature').mockResolvedValue(false);
            vi.spyOn(auditLogService, 'logAction').mockResolvedValue({ id: 'log-123' });

            await expect(
                industryComplianceService.verifyPharmaElectronicSignature('user-1', 'tenant-1', 'Valid Reason Length', payload, 'bad-sig')
            ).rejects.toThrow('Invalid cryptographic signature.');
        });
    });

    describe('SEC Rule 17a-4 Tamper-Evident Logs', () => {
        it('should generate chained block hash and KMS signature receipt', async () => {
            const payload = { tradeType: 'BUY', symbol: 'AAPL', amount: 50000 };
            
            vi.spyOn(auditLogService, 'logAction').mockResolvedValue({
                id: 'log-abc',
                timestamp: '2026-06-13T22:00:00Z',
                hash: 'current-block-hash-sha256',
                previousHash: 'previous-block-hash-sha256'
            });
            const mockSign = vi.spyOn(kmsService, 'signPayload').mockResolvedValue('signed-hash-kms-signature');

            const result = await industryComplianceService.auditHedgeFundOperation(
                'trader-1', 'fund-alpha', 'STOCK_TRADE', payload
            );

            expect(result.receiptId).toBeDefined();
            expect(result.blockHash).toBe('current-block-hash-sha256');
            expect(result.previousHash).toBe('previous-block-hash-sha256');
            expect(result.kmsSignature).toBe('signed-hash-kms-signature');
            expect(result.retentionRequiredYears).toBe(7);
            expect(mockSign).toHaveBeenCalledWith('current-block-hash-sha256');
        });
    });

    describe('ISO 26262 / AUTOSAR Automotive Code Safety Validator', () => {
        it('should pass safe code with 100 safety score', async () => {
            const safeCode = `
                function calculateBrakePressure(sensorValue) {
                    const threshold = 100;
                    let pressure = 0;
                    if (sensorValue > threshold) {
                        pressure = 50;
                    }
                    return pressure;
                }
            `;
            vi.spyOn(auditLogService, 'logAction').mockResolvedValue({ id: 'log-id' });

            const result = await industryComplianceService.verifyAutomotiveSoftwareSafety(safeCode);

            expect(result.compliant).toBe(true);
            expect(result.safetyScore).toBe(100);
            expect(result.findings.length).toBe(0);
        });

        it('should flag critical dynamic allocations, unbounded loops, and recursions', async () => {
            const unsafeCode = `
                function unsafeBrakeSystem() {
                    // Violation 1: Dynamic Allocation
                    let buffer = malloc(1024);
                    
                    // Violation 2: Unbounded loop
                    while(1) {
                        if (checkBuffer()) break;
                    }
                    
                    // Violation 3: Recursion
                    return unsafeBrakeSystem();
                }
            `;
            vi.spyOn(auditLogService, 'logAction').mockResolvedValue({ id: 'log-id' });

            const result = await industryComplianceService.verifyAutomotiveSoftwareSafety(unsafeCode);

            expect(result.compliant).toBe(false);
            expect(result.safetyScore).toBeLessThan(80);
            expect(result.findings.some(f => f.rule === 'ISO-26262-MALLOC-PROHIBITED')).toBe(true);
            expect(result.findings.some(f => f.rule === 'ISO-26262-UNBOUNDED-LOOP')).toBe(true);
            expect(result.findings.some(f => f.rule === 'ISO-26262-RECURSION-PROHIBITED')).toBe(true);
        });
    });
});
