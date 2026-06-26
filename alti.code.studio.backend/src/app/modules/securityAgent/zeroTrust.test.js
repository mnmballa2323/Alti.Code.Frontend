import { describe, it, expect, vi } from 'vitest';
import { SecurityAgentController } from './securityAgent.controller.js';
import { SecurityAgentService } from './securityAgent.service.js';
import httpStatus from 'http-status';

vi.mock('./securityAgent.service.js');

describe('BeyondCorp Zero-Trust & Mandiant Security Pipeline', () => {
  it('should FORBID access if the BeyondCorp Device Posture header is missing', async () => {
    const mockReq = {
      user: { id: 'test-user-123' },
      body: { repoPath: './src' },
      headers: {}, // Missing 'x-device-posture-valid'
    };
    const mockRes = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };

    const mockNext = vi.fn();
    await SecurityAgentController.startAudit(mockReq, mockRes, mockNext);

    expect(SecurityAgentService.auditCodebase).not.toHaveBeenCalled();
    expect(mockRes.status).toHaveBeenCalledWith(httpStatus.FORBIDDEN);

    const jsonResponse = mockRes.json.mock.calls[0][0];
    expect(jsonResponse.success).toBe(false);
    expect(jsonResponse.message).toContain('BeyondCorp Zero-Trust');
  });

  it('should ALLOW access and execute the Mandiant audit if Identity-Aware validation succeeds', async () => {
    const mockReq = {
      user: { id: 'test-user-123' },
      body: { repoPath: './src', sessionId: 'test-session' },
      headers: { 'x-device-posture-valid': 'true' },
    };

    const mockRes = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };

    // Mock the Mandiant Security Report response
    const mockReport = {
      vulnerabilities: [],
      score: 0,
      timestamp: new Date(),
      dependencyAudit: {},
      codeAnalysis: {
        securityRating: 'CRITICAL',
        mandiantIntelligence:
          'Known zero-day exploit detected in heavily outdated generic package tied to APT29.',
        topActions: ['Isolate Container', 'Rotate Secrets'],
      },
    };

    SecurityAgentService.auditCodebase.mockResolvedValue(mockReport);

    const mockNext = vi.fn();
    await SecurityAgentController.startAudit(mockReq, mockRes, mockNext);

    expect(SecurityAgentService.auditCodebase).toHaveBeenCalledWith(
      './src',
      'test-user-123',
      'test-session',
    );
    expect(mockRes.status).toHaveBeenCalledWith(httpStatus.OK);

    const jsonResponse = mockRes.json.mock.calls[0][0];
    expect(jsonResponse.success).toBe(true);
    expect(jsonResponse.data.codeAnalysis.mandiantIntelligence).toContain(
      'APT29',
    );
  });
});
