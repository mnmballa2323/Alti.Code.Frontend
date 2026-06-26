/**
 * Copyright (c) 2024 Inso Code
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { logger } from './logger.js';
import { GeminiAiService } from '../app/modules/gemini/gemini.service.js';

export class MirageAgent {
  constructor() {
    this.name = 'TheMirage';
    logger.info(
      '🔮 MirageAgent: Adaptive Meta-UI Hallucination Engine initialized.',
    );
  }

  /**
   * Intercepts the developer's current active file/context and hallucinates a dynamic 3D
   * WebGL user interface layout tailored precisely for that cognitive load.
   * @param {string} developerContext The current active work (e.g. "Debugging a complex PostgreSQL deadlock")
   */
  async hallucinateSpatialUI(developerContext) {
    logger.info(
      `🔮 MirageAgent: Developer context shifted to [${developerContext}].`,
    );
    logger.info(
      `🔮 MirageAgent: Bypassing static React DOM. Hallucinating geometric UI boundaries...`,
    );

    try {
      const webGLGeometryPayload =
        await this._generateDynamicUiCoordinates(developerContext);
      logger.info(
        `✅ MirageAgent: Hallucination complete. Streaming raw WebGL coordinates to client renderer.`,
      );
      return webGLGeometryPayload;
    } catch (error) {
      logger.error(
        `🔮 MirageAgent: UI Hallucination Matrix failed: ${error.message}`,
      );
      return null;
    }
  }

  async _generateDynamicUiCoordinates(context) {
    const prompt = `You are The Mirage: an AI responsible for rendering a Developer IDE.
        You do not use HTML or React. You output raw JSON geometries for a WebGL renderer.
        
        The developer is currently focused on: "${context}"
        
        Generate a JSON block representing the optimal spatial UI. 
        For example:
        If CSS -> output a 2D "Figma Canvas" topology layout.
        If Database -> output a "3D Node Sphere" layout for viewing relations.
        If Native Bug -> output a "Hex Memory Map" layout.
        
        Return exactly this JSON format:
        {
          "ui_paradigm": "[Name of the UI]",
          "camera_perspective": "2D/3D",
          "focal_element": { "type": "...", "coordinates": [x,y,z] }
        }`;

    let result = await GeminiAiService.generateContent(prompt);
    result = result
      .replace(/^```[a-z]*\n/i, '')
      .replace(/\n```$/i, '')
      .trim();
    return JSON.parse(result);
  }
}

export const mirageAgent = new MirageAgent();
