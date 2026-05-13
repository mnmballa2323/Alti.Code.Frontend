import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mirageAgent } from './mirage.agent.js';
import { GeminiAiService } from '../app/modules/gemini/gemini.service.js';

vi.mock('../app/modules/gemini/gemini.service.js');

describe('Adaptive Meta-UI Hallucination (Phase 33 - The Mirage)', () => {

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should hallucinate a 3D Spherical Node topology when the developer switches to database debugging', async () => {

        // Mock Gemini generating the WebGL JSON UI payload for a database
        const mockDbHallucination = {
            "ui_paradigm": "3D Node Sphere",
            "camera_perspective": "3D",
            "focal_element": { "type": "Database Table Relational Ring", "coordinates": [0, 0, 10] }
        };

        GeminiAiService.generateContent.mockResolvedValueOnce(JSON.stringify(mockDbHallucination));

        // Developer starts tracing a tough database deadlock
        const context = "Tracing a recursive foreign key constraint deadlock across 5 Postgres tables.";
        const synthesizedUI = await mirageAgent.hallucinateSpatialUI(context);

        // ASSERTIONS
        expect(GeminiAiService.generateContent).toHaveBeenCalledTimes(1);

        // Ensure the AI structurally broke out of the 2D window and hallucinated a 3D geometry map
        expect(synthesizedUI.ui_paradigm).toBe("3D Node Sphere");
        expect(synthesizedUI.camera_perspective).toBe("3D");
        expect(synthesizedUI.focal_element.coordinates).toEqual([0, 0, 10]);
    });
});
