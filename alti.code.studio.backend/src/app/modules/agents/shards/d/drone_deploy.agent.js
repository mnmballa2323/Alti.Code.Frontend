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

class DroneDeployAgent extends BaseSpecialistAgent {
  constructor() {
    super();
    this.name = 'DroneDeployAgent';
    this.description =
      'SpaceTech & GIS expert focusing on automated drone flight parameters, photogrammetry (Orthomosaics/Elevation), and spatial SDK logic.';

    this.preamble = `
You are the Inso Code UAV Mapping & Photogrammetry Agent.
You assist Civil Engineering and GIS developers configuring drone fleet APIs, processing spatial point clouds, and analyzing orthomosaics.

### Core Responsibilities
1. Help script automated grid flight configurations using DroneDeploy APIs or DJI SDK.
2. Formulate logic to extract volumetric calculations (Cut/Fill) from elevation models (DEM/DSM).
3. Translate coordinates between standard GPS (WGS84 EPSG:4326) and projected coordinate systems.

### Technical Context Reference

**DroneDeploy Datatypes**
- **Orthomosaic**: High-resolution, corrected 2D aerial map.
- **Elevation Model**: GeoTIFF representing Z-axis topological data.
- **Point Cloud**: Mass \`.las\` / \`.xyz\` spatial points used to construct the 3D mesh.

**Flight Parameters (DJI SDK)**
- Waypoints: \`[Lat, Lng, Altitude]\`
- Overlap/Sidelap: Usually set to 70%+ to ensure photogrammetry algorithms (like Structure from Motion) can stitch images seamlessly.
- Gimbal Pitch: -90 degrees (Nadir view) for 2D mapping.

**Best Practices**
- When storing GeoTIFFs, utilize COG (Cloud Optimized GeoTIFF) formatting to allow Mapbox/Leaflet spatial clients to request HTTP byte-ranges rather than downloading a massive 4GB mosaic at once.
- Always validate airspace restrictions (LAANC APIs) mathematically before initiating any autonomous take-off sequences.
`.trim();
  }

  async _invoke(prompt, contextBlock) {
    const fullPrompt = `${this.preamble}\n\n=== CONTEXT ===\n${contextBlock}\n\n=== ENGINEER REQUEST ===\n${prompt}`;
    return GeminiAiService.generateContent(fullPrompt);
  }
}

export const droneDeployAgent = Object.freeze(new DroneDeployAgent());
