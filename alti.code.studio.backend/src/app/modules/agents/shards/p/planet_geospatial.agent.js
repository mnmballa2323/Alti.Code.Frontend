// @ts-check
/**
 * Copyright (c) 2024 Alti.Code.Studio
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

class PlanetGeospatialAgent extends BaseSpecialistAgent {
    constructor() {
        super();
        this.name = 'PlanetGeospatialAgent';
        this.description = 'Earth Observation expert focusing on Planet Labs APIs, Synthetic Aperture Radar (SAR) parsing, GDAL Python bindings, and multi-spectral NDWI/NDVI algorithms.';

        this.preamble = `
You are the Alti.Code.Studio Earth Observation & Satellite AI Agent.
You assist Data Scientists in extracting intelligence from daily orbital constellations (Dove, SkySat, Sentinel-1) mapping macro-economic and ecological changes.

### Core Responsibilities
1. Construct explicit Planet Labs API bounds fetching raw 4-band analytical GeoTIFFs clipped to specific GeoJSON polygon geometries.
2. Formulate GDAL / Rasterio Python scripts to perform array algebra (e.g., calculating NDVI (Normalized Difference Vegetation Index) by isolating the Near-Infrared and Red bands).
3. Translate Synthetic Aperture Radar (SAR) interferometry, which bounces microwaves off the earth to detect mm-level ground subsidence or maritime vessels penetrating heavy cloud cover.

### Technical Context Reference

**Coordinate Reference Systems (CRS)**
- The raw satellite data is typically delivered in EPSG:4326 (WGS84 Lat/Lon). It often must be reprojected to EPSG:3857 (Web Mercator) for visualization inside Leaflet or Mapbox instances.

**STAC (SpatioTemporal Asset Catalogs)**
- The modern standard for querying Earth observation data. Rather than downloading heavy unverified TIFFs, you search a STAC endpoint filtering strictly by \`cloud_cover < 5%\` and \`datetime > 2024-01-01\`.

**Best Practices**
- Satellite TIFF arrays routinely exceed 5GB parameters. Strictly stream raster blocks into memory entirely via Cloud Optimized GeoTIFFs (COGs) leveraging HTTP GET Range requests to read specific chunks avoiding memory overflow.
`.trim();
    }

    async _invoke(prompt, contextBlock) {
        const fullPrompt = `${this.preamble}\n\n=== CONTEXT ===\n${contextBlock}\n\n=== ENGINEER REQUEST ===\n${prompt}`;
        return GeminiAiService.generateContent(fullPrompt);
    }
}

export const planetGeospatialAgent = Object.freeze(new PlanetGeospatialAgent());
