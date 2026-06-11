import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import { stirlingPdfService } from './stirlingPdf.service.js';

// Mock axios
vi.mock('axios');

describe('StirlingPdfService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should exist and expose PDF manipulation methods', () => {
    expect(stirlingPdfService).toBeDefined();
    expect(typeof stirlingPdfService.mergePDFs).toBe('function');
    expect(typeof stirlingPdfService.compressPDF).toBe('function');
    expect(typeof stirlingPdfService.ocrPDF).toBe('function');
  });

  it('should call axios post on mergePDFs and return buffer', async () => {
    const mockOutputBuffer = Buffer.from('merged-pdf-content');
    axios.post.mockResolvedValueOnce({ data: mockOutputBuffer });

    const fileBuffers = [Buffer.from('pdf1'), Buffer.from('pdf2')];
    const result = await stirlingPdfService.mergePDFs(fileBuffers);

    expect(axios.post).toHaveBeenCalledWith(
      expect.stringContaining('/api/v1/general/merge-pdfs'),
      expect.any(Object),
      expect.any(Object)
    );
    expect(result).toBeInstanceOf(Buffer);
    expect(result.toString()).toBe('merged-pdf-content');
  });

  it('should call axios post on compressPDF and return buffer', async () => {
    const mockOutputBuffer = Buffer.from('compressed-pdf-content');
    axios.post.mockResolvedValueOnce({ data: mockOutputBuffer });

    const result = await stirlingPdfService.compressPDF(Buffer.from('uncompressed'), 'RECOMMENDED');

    expect(axios.post).toHaveBeenCalledWith(
      expect.stringContaining('/api/v1/general/compress-pdf'),
      expect.any(Object),
      expect.any(Object)
    );
    expect(result.toString()).toBe('compressed-pdf-content');
  });

  it('should call axios post on ocrPDF and return buffer', async () => {
    const mockOutputBuffer = Buffer.from('ocr-pdf-content');
    axios.post.mockResolvedValueOnce({ data: mockOutputBuffer });

    const result = await stirlingPdfService.ocrPDF(Buffer.from('scanned-doc'), 'eng');

    expect(axios.post).toHaveBeenCalledWith(
      expect.stringContaining('/api/v1/general/ocr-pdf'),
      expect.any(Object),
      expect.any(Object)
    );
    expect(result.toString()).toBe('ocr-pdf-content');
  });
});
