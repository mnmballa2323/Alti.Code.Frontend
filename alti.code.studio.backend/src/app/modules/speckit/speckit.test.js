import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { specKitService } from './speckit.service.js';
import { specKitController } from './speckit.controller.js';
import { GeminiAiService } from '../gemini/gemini.service.js';
import fs from 'fs/promises';

vi.mock('../gemini/gemini.service.js', () => {
  return {
    GeminiAiService: {
      generateContent: vi.fn(),
    },
  };
});

describe('SpecKit Regional Compliance Matrix Tests', () => {
  const specId = 'test-spec-123';

  beforeEach(async () => {
    vi.clearAllMocks();
    // Mock fs calls to avoid writing physical files during testing
    vi.spyOn(fs, 'mkdir').mockResolvedValue(undefined);
    vi.spyOn(fs, 'writeFile').mockResolvedValue(undefined);
    vi.spyOn(fs, 'readFile').mockImplementation(async filePath => {
      if (filePath.endsWith('constitution.md')) {
        return 'Mock Constitution';
      }
      if (filePath.endsWith('meta.json')) {
        return JSON.stringify({
          specId,
          title: 'Test Spec',
          regions: ['EU', 'US'],
          phases: { requirements: 'done' },
        });
      }
      if (filePath.endsWith('requirements.md')) {
        return '# Requirements';
      }
      return '';
    });
    vi.spyOn(fs, 'access').mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Service Compliance Layer', () => {
    it('should generate requirements without regional injection if regions list is empty', async () => {
      GeminiAiService.generateContent.mockResolvedValue(
        'Mock requirements output',
      );

      const result = await specKitService.createSpec('Create a payment form');

      expect(result.requirements).toBe('Mock requirements output');
      expect(GeminiAiService.generateContent).toHaveBeenCalledWith(
        expect.not.stringContaining('REGIONAL COMPLIANCE RULES'),
      );
    });

    it('should inject regional requirements when EU and US regions are supplied', async () => {
      GeminiAiService.generateContent.mockResolvedValue(
        'Mock regional requirements',
      );

      const result = await specKitService.createSpec(
        'Create a user signup form',
        ['EU', 'US'],
      );

      expect(result.requirements).toBe('Mock regional requirements');
      expect(GeminiAiService.generateContent).toHaveBeenCalledWith(
        expect.stringContaining('REGIONAL COMPLIANCE RULES'),
      );
      expect(GeminiAiService.generateContent).toHaveBeenCalledWith(
        expect.stringContaining('EU GDPR'),
      );
      expect(GeminiAiService.generateContent).toHaveBeenCalledWith(
        expect.stringContaining('US HIPAA'),
      );
    });

    it('should inject regional design guidelines when creating a design from saved metadata', async () => {
      GeminiAiService.generateContent.mockResolvedValue('Mock regional design');

      const result = await specKitService.createDesign(specId);

      expect(result.design).toBe('Mock regional design');
      expect(GeminiAiService.generateContent).toHaveBeenCalledWith(
        expect.stringContaining('REGIONAL COMPLIANCE ARCHITECTURE'),
      );
      expect(GeminiAiService.generateContent).toHaveBeenCalledWith(
        expect.stringContaining('Specify data residency topology'),
      );
      expect(GeminiAiService.generateContent).toHaveBeenCalledWith(
        expect.stringContaining('KMS CMEK key configurations'),
      );
    });
  });

  describe('Controller / Endpoint Integration', () => {
    it('should extract regions from body and pass to createSpec service call', async () => {
      const req = {
        body: {
          request: 'Build medical upload portal',
          regions: ['US'],
        },
      };
      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      };

      const serviceSpy = vi
        .spyOn(specKitService, 'createSpec')
        .mockResolvedValue({
          specId: 'spec-med-999',
          requirements: 'Requirements doc content',
        });

      await specKitController.createSpec(req, res);

      expect(serviceSpy).toHaveBeenCalledWith('Build medical upload portal', [
        'US',
      ]);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          specId: 'spec-med-999',
        }),
      );
    });

    it('should pass explicit regions from body to createDesign service call', async () => {
      const req = {
        params: { id: specId },
        body: { regions: ['EU'] },
      };
      const res = {
        json: vi.fn(),
      };

      const serviceSpy = vi
        .spyOn(specKitService, 'createDesign')
        .mockResolvedValue({
          specId,
          design: 'Design doc content',
        });

      await specKitController.createDesign(req, res);

      expect(serviceSpy).toHaveBeenCalledWith(specId, ['EU']);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          specId,
        }),
      );
    });
  });
});
