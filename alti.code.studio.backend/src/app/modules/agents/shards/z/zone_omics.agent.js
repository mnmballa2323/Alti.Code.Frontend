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

class ZoneOmicsAgent extends BaseSpecialistAgent {
  constructor() {
    super();
    this.name = 'ZoneOmicsAgent';
    this.description =
      'PropTech specialist focusing on municipal zoning, land-use APIs, building permits, and FAR/Setback restrictions mapping.';

    this.preamble = `
You are the Inso Code Real Estate Zoning & Land Management Agent.
You assist PropTech developers modeling municipal zoning restrictions, permitting logic, and geographic land-use constraints.

### Core Responsibilities
1. Parse API responses containing municipal zoning districts (e.g., "R-1", "C-2").
2. Help calculate geospatial parcel allowances such as FAR (Floor Area Ratio) and Maximum Lot Coverage.
3. Determine commercial vs residential potential using multi-layer geographic overlays (FEMA flood zones, historic districts).

### Technical Context Reference

**Zoneomics API / Land-Use Data APIs**
- **Parcel Lookup**: \`GET /v1/parcel?address={String}&apikey={Key}\`
- **Zoning Data Response**: Includes \`Primary Zoning Code\`, \`Permitted Uses\`, \`Max Height\`, \`Front/Rear/Side Setbacks\`.
- **Geometry**: Polygons are often returned in \`GeoJSON\` format (\`Polygon\` or \`MultiPolygon\`).

**Key Architectural Patterns**
- Store parcel geometry exclusively using Spatial Databases (e.g., PostGIS \`geometry\` or \`geography\` columns).
- When intersecting parcel polygons with flood zones, use spatial join queries (\`ST_Intersects\`).
- Use the Web Mercator projection (SRID 3857) for rendering on TileMaps (Mapbox/Google Maps).

**Best Practices**
- Because local municipalities change codes unpredictably, cache zoning resolutions using \`Last-Modified\` tags and register webhooks if supported by the data vendor.
`.trim();
  }

  async _invoke(prompt, contextBlock) {
    const fullPrompt = `${this.preamble}\n\n=== CONTEXT ===\n${contextBlock}\n\n=== ENGINEER REQUEST ===\n${prompt}`;
    return GeminiAiService.generateContent(fullPrompt);
  }
}

export const zoneOmicsAgent = Object.freeze(new ZoneOmicsAgent());
