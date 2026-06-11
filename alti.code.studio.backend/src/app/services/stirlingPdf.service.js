/**
 * Copyright (c) 2026 Alti.Code.Studio
 * 
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import axios from 'axios';
import FormData from 'form-data';
import config from '../../../config/index.js';
import { logger } from '../../shared/logger.js';

class StirlingPdfService {
  constructor() {
    // Internal URL resolves to container name if running in docker-compose, otherwise fallback to host URL
    this.apiUrl = config.private_cloud_mode ? 'http://stirling_pdf:8080' : config.stirlingPdfUrl;
  }

  /**
   * Merges multiple PDF file buffers into a single PDF document.
   * @param {Array<Buffer>} fileBuffers Array of PDF file buffers
   * @returns {Promise<Buffer>} The merged PDF buffer
   */
  async mergePDFs(fileBuffers) {
    if (!fileBuffers || !Array.isArray(fileBuffers) || fileBuffers.length === 0) {
      throw new Error('[StirlingPdfService] fileBuffers array is required and must not be empty.');
    }

    logger.info(`📄 [StirlingPdfService] Sending request to merge ${fileBuffers.length} PDFs...`);

    const form = new FormData();
    fileBuffers.forEach((buffer, idx) => {
      form.append('fileInput', buffer, { filename: `doc_${idx}.pdf`, contentType: 'application/pdf' });
    });

    try {
      const response = await axios.post(`${this.apiUrl}/api/v1/general/merge-pdfs`, form, {
        headers: {
          ...form.getHeaders()
        },
        responseType: 'arraybuffer'
      });

      logger.info('✅ [StirlingPdfService] PDFs merged successfully.');
      return Buffer.from(response.data);
    } catch (error) {
      logger.error('❌ [StirlingPdfService] Failed to merge PDFs:', error.message);
      throw error;
    }
  }

  /**
   * Compresses a PDF file buffer to reduce its storage size.
   * @param {Buffer} fileBuffer The input PDF buffer
   * @param {string} [compressionType="RECOMMENDED"] Compression level ("RECOMMENDED", "LOW", "HIGH")
   * @returns {Promise<Buffer>} The compressed PDF buffer
   */
  async compressPDF(fileBuffer, compressionType = 'RECOMMENDED') {
    if (!fileBuffer) {
      throw new Error('[StirlingPdfService] fileBuffer is required.');
    }

    logger.info(`📄 [StirlingPdfService] Compressing PDF (type: ${compressionType})...`);

    const form = new FormData();
    form.append('fileInput', fileBuffer, { filename: 'input.pdf', contentType: 'application/pdf' });
    form.append('compressionType', compressionType);

    try {
      const response = await axios.post(`${this.apiUrl}/api/v1/general/compress-pdf`, form, {
        headers: {
          ...form.getHeaders()
        },
        responseType: 'arraybuffer'
      });

      logger.info('✅ [StirlingPdfService] PDF compressed successfully.');
      return Buffer.from(response.data);
    } catch (error) {
      logger.error('❌ [StirlingPdfService] PDF compression failed:', error.message);
      throw error;
    }
  }

  /**
   * Performs optical character recognition (OCR) on a scanned PDF to make it searchable.
   * @param {Buffer} fileBuffer The scanned PDF buffer
   * @param {string} [language="eng"] The target language (e.g. "eng", "deu", "fra")
   * @returns {Promise<Buffer>} The OCR-processed PDF buffer
   */
  async ocrPDF(fileBuffer, language = 'eng') {
    if (!fileBuffer) {
      throw new Error('[StirlingPdfService] fileBuffer is required.');
    }

    logger.info(`📄 [StirlingPdfService] Executing OCR on PDF (lang: ${language})...`);

    const form = new FormData();
    form.append('fileInput', fileBuffer, { filename: 'scan.pdf', contentType: 'application/pdf' });
    form.append('languages', language);
    form.append('ocrType', 'skip-text');

    try {
      const response = await axios.post(`${this.apiUrl}/api/v1/general/ocr-pdf`, form, {
        headers: {
          ...form.getHeaders()
        },
        responseType: 'arraybuffer'
      });

      logger.info('✅ [StirlingPdfService] PDF OCR complete.');
      return Buffer.from(response.data);
    } catch (error) {
      logger.error('❌ [StirlingPdfService] PDF OCR failed:', error.message);
      throw error;
    }
  }
}

export const stirlingPdfService = new StirlingPdfService();
export default stirlingPdfService;
