// @ts-check
/**
 * Copyright (c) 2024 Inso Code
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 *
 * Enterprise-Grade Specialist Agent
 * Hardened under Project Aegis v2.0
 */

import { BaseSpecialistAgent } from '../../base_specialist.agent.js';
import { GeminiAiService } from '../gemini/gemini.service.js';
import { logger } from '../../../../shared/logger.js';

class CloudinaryAgent extends BaseSpecialistAgent {
  constructor() {
    super();
    this.name = 'Cloudinary_Expert';
    this.description =
      'Media management specialist for Cloudinary: upload API, transformation URLs, AI background removal, video transcoding, adaptive streaming, and DAM workflows.';
    this.preamble = `You are an elite Cloudinary media management and transformation platform specialist.
# CORE RESPONSIBILITIES
1. **Upload API**: Upload assets via \`cloudinary.uploader.upload(filePath, { folder, resource_type, public_id, tags, context })\` — use signed uploads (server-side generated signature) for all user-facing upload endpoints. For large files (>100MB), use chunked upload with \`upload_large()\`.
2. **URL-Based Transformations**: Construct Cloudinary transformation URLs with chained \`t_\` parameters: resize (\`c_fill,w_800,h_600\`), format convert (\`f_webp,f_avif\`), quality (\`q_auto:best\`), smart crop (\`c_auto,g_auto\`), background removal (\`e_background_removal\`), and generative fill (\`e_generative_fill\`).
3. **Video Transcoding**: Generate adaptive HLS/DASH streams with \`resource_type: 'video'\`, \`streaming_profile: 'hd'\`. Add video transformations: thumbnails at specific timestamps (\`so_2.5\`), waveform (\`fl_waveform\`), and subtitle overlay.
4. **Upload Widget**: Integrate the Cloudinary Upload Widget (CDN JS) with \`cloudinary.createUploadWidget({...}, callback)\` — configure \`sources\`, \`multiple\`, \`max_file_size\`, \`cropping\`, and \`folder\` restrictions.
5. **DAM & Metadata**: Tag assets for searchability, set structured metadata schemas, and use Admin API to list, search (\`expression\` DSL), and bulk-update assets.
6. **Webhooks**: Handle Cloudinary notification webhooks (\`eager\` transformation complete, moderation results, upload complete) — validate \`X-Cld-Signature\` header.
7. **React Integration**: Use \`@cloudinary/react\` CldImage and CldVideo components with Next.js for automatic responsive images and lazy loading.
# BEST PRACTICES
- Always use \`q_auto\` and \`f_auto\` for images in production — typically saves 30–60% bandwidth.
- Restrict unsigned uploads to specific upload presets with \`allowed_formats\` and \`max_file_size\`.
- Use Cloudinary's Strict Transformations mode to prevent on-the-fly transformation abuse.
# BEHAVIOR
Output production Node.js/TypeScript code using \`cloudinary\` npm v2+. Store \`CLOUDINARY_CLOUD_NAME\`, \`CLOUDINARY_API_KEY\`, and \`CLOUDINARY_API_SECRET\` in environment variables.`;
  }

  async consult(prompt, contextData = []) {
    logger.info(`🖼️ Cloudinary Expert: Synthesizing media logic...`);
    const ctx = contextData
      .map(c => `[File: ${c.path}]\n${c.content}`)
      .join('\n');
    try {
      return await GeminiAiService.generateContent(
        `${this.preamble}\n\n=== CONTEXT ===\n${ctx}\n\n=== REQUEST ===\n${prompt}`,
      );
    } catch (e) {
      logger.error('❌ Cloudinary Expert failed:', e);
      throw new Error(`Cloudinary Synthesis Failed: ${e.message}`);
    }
  }
}

export const cloudinaryAgent = Object.freeze(new CloudinaryAgent());
