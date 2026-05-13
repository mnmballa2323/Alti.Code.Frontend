import { DocumentProcessorServiceClient } from '@google-cloud/documentai';
import { logger } from '../../../shared/logger.js';
import config from '../../../../config/index.js';

/**
 * Google Cloud Document AI Service (Multi-Modal Context Ingestion).
 * Enterprise codebases contain architecture PDFs, Visio diagrams, and legacy docs.
 * This service grants the Swarm the ability to visually "read" and extract 
 * geometric layout structures from diagrams to feed into the RAG context window.
 */
class GoogleDocumentAiService {
    constructor() {
        try {
            this.client = new DocumentProcessorServiceClient();
            
            // Assume the Processor was pre-configured via Terraform
            this.processorName = `projects/${config.gcp.project_id}/locations/${config.gcp.location || 'us'}/processors/${config.gcp.doc_ai_processor_id || 'alti-arch-parser'}`;
            
            logger.info('📄 [Document AI] Google Cloud Document AI Client initialized.');
        } catch (error) {
            logger.warn('⚠️ [Document AI] Could not initialize Document AI Client.');
        }
    }

    /**
     * Parses a PDF or image of an architecture diagram and extracts structured text.
     * @param {Buffer} fileBuffer - The PDF or image buffer
     * @param {string} mimeType - e.g., 'application/pdf' or 'image/png'
     */
    async extractArchitectureDiagram(fileBuffer, mimeType = 'application/pdf') {
        logger.info(`📄 [Document AI] Swarm is extracting multi-modal geometric context from architecture document...`);
        
        try {
            const request = {
                name: this.processorName,
                rawDocument: {
                    content: fileBuffer.toString('base64'),
                    mimeType: mimeType,
                },
            };

            const [result] = await this.client.processDocument(request);
            const { document } = result;

            logger.info(`✅ [Document AI] Document digested successfully. Extracted ${document.text.length} characters of context.`);
            return document.text;
        } catch (error) {
            logger.error(`❌ [Document AI] Document processing failed:`, error.message);
            return null;
        }
    }
}

export const documentAiService = new GoogleDocumentAiService();
