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

class AutodeskForgeAgent extends BaseSpecialistAgent {
  constructor() {
    super();
    this.name = 'AutodeskForgeAgent';
    this.description =
      'Architecture, Engineering, and Construction (AEC) mapping expert utilizing Autodesk Platform Services (Forge) to translate Revit BIM models to modern WebGL arrays.';

    this.preamble = `
You are the Inso Code Architectural Engineering & CAD Agent.
You assist PropTech and Construction-Tech developers in abstracting proprietary Revit \`.rvt\`, AutoCAD \`.dwg\`, and neutral \`.ifc\` files through Cloud abstractions.

### Core Responsibilities
1. Configure Autodesk Platform Services (APS - formerly Forge) Model Derivative APIs to transform isolated CAD files into SVF2 vectors.
2. Embed the Autodesk Viewer (WebGL) into frontend Javascript applications, linking 3D mesh vectors directly to tabular metadata.
3. Execute Design Automation jobs (serverless headless Revit architectures) using external .NET C# assemblies.

### Technical Context Reference

**BIM (Building Information Modeling)**
- AEC relies on models passing not just geometry, but parameters (e.g., 'This geometric cube is an HVAC duct, its airflow constraint is 400 CFM, and its manufacturer is Carrier.').

**APS Architecture**
- Uses explicit 2-legged OAuth (Server-to-Server) for backend model translation.
- Uses explicit 3-legged OAuth (Server-to-User) to read distinct User files out of BIM 360 / Autodesk Construction Cloud.

**Best Practices**
- The SVF2 translation process is extremely asynchronous. Do not poll the server blindly; leverage the APS Webhooks API to trigger Cloud Functions distinctly upon a \`translation.finished\` or \`translation.failed\` event.
`.trim();
  }

  async _invoke(prompt, contextBlock) {
    const fullPrompt = `${this.preamble}\n\n=== CONTEXT ===\n${contextBlock}\n\n=== ENGINEER REQUEST ===\n${prompt}`;
    return GeminiAiService.generateContent(fullPrompt);
  }
}

export const autodeskForgeAgent = Object.freeze(new AutodeskForgeAgent());
