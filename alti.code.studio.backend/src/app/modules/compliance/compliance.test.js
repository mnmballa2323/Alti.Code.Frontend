import { describe, it, expect, vi, beforeEach } from 'vitest';
import crypto from 'crypto';
import { industryComplianceService } from './industry_compliance.service.js';
import { encryptionService } from '../security/encryption.service.js';
import { auditLogService } from '../security/auditLog.service.js';
import { kmsService } from '../gcpCloud/gcpServices.service.js';
import { ciceroLawEnforcementService } from './cicero_law_enforcement.service.js';
import { gcpLegalNoticeService } from './gcp_legal_notice.service.js';
import { ciceroLawEnforcementAgent } from '../agents/cicero_law_enforcement.agent.js';
import { complianceRoutes } from './compliance.route.js';
import axios from 'axios';

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
          cvv: '123',
        },
      };

      const mockEncrypt = vi
        .spyOn(encryptionService, 'encrypt')
        .mockResolvedValue('encrypted-pan-blob');
      const mockLog = vi
        .spyOn(auditLogService, 'logAction')
        .mockResolvedValue({ id: 'log-id' });

      const result = await industryComplianceService.auditFintechTransaction(
        'user-1',
        'tenant-1',
        payload,
      );

      expect(result.compliant).toBe(true);
      expect(result.violationsRemoved).toBe(1);
      expect(result.scrubbedPayload.paymentDetails.cardNumber).toBe(
        'XXXX-XXXX-XXXX-1111',
      );
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

      const result = await industryComplianceService.auditFintechTransaction(
        'user-1',
        'tenant-1',
        payload,
      );

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
        mrn: 'MRN-12345678',
      };

      const mockLog = vi
        .spyOn(auditLogService, 'logAction')
        .mockResolvedValue({ id: 'log-id' });

      const result = await industryComplianceService.auditHealthcareAccess(
        'user-1',
        'tenant-1',
        'patient-bob',
        'READ',
        payload,
      );

      expect(result.compliant).toBe(true);
      expect(result.phiDetectedCount).toBe(3);
      expect(result.scrubbedPayload.ssn).toBe('[SSN-REDACTED]');
      expect(result.scrubbedPayload.dob).toBe('[DOB-REDACTED]');
      expect(result.scrubbedPayload.mrn).toBe('[MRN-REDACTED]');
      expect(mockLog).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'HIPAA_PHI_ACCESS',
          resource: 'Patient/patient-bob',
        }),
      );
    });
  });

  describe('FDA 21 CFR Part 11 Electronic Signature', () => {
    it('should verify part 11 signature successfully when valid', async () => {
      const payload = { formula: 'Compound-X-200mg' };
      const changeReason = 'Updating compound formula ratio for batch 42';
      const signature = 'valid-sig-base64';

      const mockVerify = vi
        .spyOn(kmsService, 'verifySignature')
        .mockResolvedValue(true);
      const mockLog = vi.spyOn(auditLogService, 'logAction').mockResolvedValue({
        id: 'log-123',
        timestamp: '2026-06-13T22:00:00Z',
      });

      const result =
        await industryComplianceService.verifyPharmaElectronicSignature(
          'user-1',
          'tenant-1',
          changeReason,
          payload,
          signature,
        );

      expect(result.verified).toBe(true);
      expect(result.auditLogId).toBe('log-123');
      expect(mockVerify).toHaveBeenCalledWith(
        JSON.stringify(payload),
        signature,
      );
      expect(mockLog).toHaveBeenCalled();
    });

    it('should throw error if change reason is missing or too short', async () => {
      const payload = { formula: 'Compound-X' };
      await expect(
        industryComplianceService.verifyPharmaElectronicSignature(
          'user-1',
          'tenant-1',
          'Short',
          payload,
          'sig',
        ),
      ).rejects.toThrow(
        'A valid change reason of at least 10 characters is required.',
      );
    });

    it('should throw error if signature verification fails', async () => {
      const payload = { formula: 'Compound-X' };
      vi.spyOn(kmsService, 'verifySignature').mockResolvedValue(false);
      vi.spyOn(auditLogService, 'logAction').mockResolvedValue({
        id: 'log-123',
      });

      await expect(
        industryComplianceService.verifyPharmaElectronicSignature(
          'user-1',
          'tenant-1',
          'Valid Reason Length',
          payload,
          'bad-sig',
        ),
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
        previousHash: 'previous-block-hash-sha256',
      });
      const mockSign = vi
        .spyOn(kmsService, 'signPayload')
        .mockResolvedValue('signed-hash-kms-signature');

      const result = await industryComplianceService.auditHedgeFundOperation(
        'trader-1',
        'fund-alpha',
        'STOCK_TRADE',
        payload,
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
      vi.spyOn(auditLogService, 'logAction').mockResolvedValue({
        id: 'log-id',
      });

      const result =
        await industryComplianceService.verifyAutomotiveSoftwareSafety(
          safeCode,
        );

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
      vi.spyOn(auditLogService, 'logAction').mockResolvedValue({
        id: 'log-id',
      });

      const result =
        await industryComplianceService.verifyAutomotiveSoftwareSafety(
          unsafeCode,
        );

      expect(result.compliant).toBe(false);
      expect(result.safetyScore).toBeLessThan(80);
      expect(
        result.findings.some(f => f.rule === 'ISO-26262-MALLOC-PROHIBITED'),
      ).toBe(true);
      expect(
        result.findings.some(f => f.rule === 'ISO-26262-UNBOUNDED-LOOP'),
      ).toBe(true);
      expect(
        result.findings.some(f => f.rule === 'ISO-26262-RECURSION-PROHIBITED'),
      ).toBe(true);
    });
  });

  describe('Cicero Law Enforcement Matrix & GCP SLA Enforcement', () => {
    beforeEach(() => {
      delete process.env.GCP_LEGAL_NOTICE_URL;
    });

    it('should report fully compliant if no SLA breach is detected', async () => {
      const payload = {
        contractId: 'sovereign-contract-001',
        slaConditions: {
          minUptime: 0.99,
          maxLatencyMs: 100,
        },
        telemetry: {
          uptime: 0.995,
          avgLatencyMs: 85,
        },
      };

      const result = await ciceroLawEnforcementService.processSlaEnforcementJob(
        { userId: 'user-123', tenantId: 'tenant-123', payload },
      );

      expect(result.breach_detected).toBe(false);
      expect(result.severity).toBe('LOW');
      expect(result.legal_notice_draft).toBeNull();
      expect(result.gcp_routing_metadata.status).toBe('SKIPPED');
    });

    it('should trigger notice drafting and mock dispatch on SLA breach (uptime)', async () => {
      const payload = {
        contractId: 'sovereign-contract-002',
        slaConditions: {
          minUptime: 0.99,
          maxLatencyMs: 100,
        },
        telemetry: {
          uptime: 0.95, // breach!
          avgLatencyMs: 85,
        },
      };

      // Mock Cicero Agent response
      const mockNoticeText =
        'FORMAL DEMAND: SLA UPTIME BREACH NOTICE. Violation of minimum 99% uptime.';
      const mockAgentResponse = JSON.stringify({
        breach_detected: true,
        severity: 'HIGH',
        legal_notice_draft: mockNoticeText,
      });

      const agentSpy = vi
        .spyOn(ciceroLawEnforcementAgent, 'consult')
        .mockResolvedValue(mockAgentResponse);
      const dispatchSpy = vi.spyOn(gcpLegalNoticeService, 'dispatchNotice');

      const result = await ciceroLawEnforcementService.processSlaEnforcementJob(
        { userId: 'user-123', tenantId: 'tenant-123', payload },
      );

      expect(result.breach_detected).toBe(true);
      expect(result.severity).toBe('HIGH');
      expect(result.legal_notice_draft).toBe(mockNoticeText);
      expect(result.gcp_routing_metadata.status).toBe('QUEUED');
      expect(result.gcp_routing_metadata.messageId).toBeDefined();

      expect(agentSpy).toHaveBeenCalled();
      expect(dispatchSpy).toHaveBeenCalledWith(
        mockNoticeText,
        expect.objectContaining({
          contractId: 'sovereign-contract-002',
          severity: 'HIGH',
        }),
      );
    });

    it('should invoke GCP service endpoint when GCP_LEGAL_NOTICE_URL is set', async () => {
      process.env.GCP_LEGAL_NOTICE_URL =
        'https://api.gcp.com/legal/dispatch';

      const payload = {
        contractId: 'sovereign-contract-003',
        slaConditions: {
          minUptime: 0.99,
          maxLatencyMs: 100,
        },
        telemetry: {
          uptime: 0.995,
          avgLatencyMs: 150, // breach!
        },
      };

      // Mock agent response
      const mockAgentResponse = JSON.stringify({
        breach_detected: true,
        severity: 'MEDIUM',
        legal_notice_draft: 'Latency SLA Breach Notice',
      });

      vi.spyOn(ciceroLawEnforcementAgent, 'consult').mockResolvedValue(
        mockAgentResponse,
      );
      const axiosSpy = vi.spyOn(axios, 'post').mockResolvedValue({
        data: { success: true, messageId: 'gcp-live-msg-id-888' },
      });

      const result = await ciceroLawEnforcementService.processSlaEnforcementJob(
        { userId: 'user-123', tenantId: 'tenant-123', payload },
      );

      expect(result.breach_detected).toBe(true);
      expect(result.severity).toBe('MEDIUM');
      expect(result.gcp_routing_metadata.status).toBe('DISPATCHED');
      expect(result.gcp_routing_metadata.messageId).toBe(
        'gcp-live-msg-id-888',
      );
      expect(axiosSpy).toHaveBeenCalledWith(
        'https://api.gcp.com/legal/dispatch',
        expect.any(Object),
      );
    });

    it('should asynchronously queue the SLA compliance check job', async () => {
      const { queueService } = await import('../queue/queue.service.js');
      const mockAddJob = vi
        .spyOn(queueService, 'addJob')
        .mockResolvedValue({ id: 'mock-job-id' });

      const payload = {
        contractId: 'sovereign-contract-queue',
        slaConditions: { minUptime: 0.99, maxLatencyMs: 100 },
        telemetry: { uptime: 0.95 },
      };

      const result = await ciceroLawEnforcementService.enforceSlaCompliance(
        'user-123',
        'tenant-123',
        payload,
      );

      expect(result.success).toBe(true);
      expect(result.status).toBe('QUEUED');
      expect(result.jobId).toBe('mock-job-id');
      expect(result.message).toContain('queued asynchronously');

      mockAddJob.mockRestore();
    });

    it('should route via compliance routes POST /legal/enforce successfully', async () => {
      const payload = {
        contractId: 'sovereign-contract-004',
        slaConditions: { minUptime: 0.99, maxLatencyMs: 100 },
        telemetry: { uptime: 0.95 },
      };

      // Mock service response
      const mockServiceResponse = {
        success: true,
        status: 'QUEUED',
        jobId: 'job-999',
        message: 'Task has been queued asynchronously.',
      };

      const serviceSpy = vi
        .spyOn(ciceroLawEnforcementService, 'enforceSlaCompliance')
        .mockResolvedValue(mockServiceResponse);

      const mockReq = {
        body: payload,
        user: { id: 'dev-user-007', tenantId: 'tenant-999' },
      };

      const mockRes = {
        status: vi.fn().mockReturnThis(),
        setHeader: vi.fn().mockReturnThis(),
        send: vi.fn(),
      };

      // Locate route handler
      const route = complianceRoutes.stack.find(
        s => s.route && s.route.path === '/legal/enforce',
      );
      expect(route).toBeDefined();

      const handler = route.route.stack[0].handle;
      await handler(mockReq, mockRes);

      expect(serviceSpy).toHaveBeenCalledWith(
        'dev-user-007',
        'tenant-999',
        payload,
      );
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.setHeader).toHaveBeenCalledWith(
        'Content-Type',
        'application/json',
      );
      expect(mockRes.send).toHaveBeenCalled();
    });
  });
});
