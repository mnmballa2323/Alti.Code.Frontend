import { describe, it, expect, vi, beforeEach } from 'vitest';
import { telepathService } from './telepath.service.js';
import { GeminiAiService } from '../app/modules/gemini/gemini.service.js';
import fs from 'fs/promises';
import path from 'path';

vi.mock('../app/modules/gemini/gemini.service.js');
vi.mock('fs/promises');

describe('Zero-Latency Telemetry & Cursor Sync (Phase 24 - The Telepath)', () => {

    beforeEach(async () => {
        vi.clearAllMocks();
        await telepathService.clearBuffer();
    });

    it('should intercept a typing stream, predict the required companion architecture, and stage a ghost file', async () => {

        // Mock Gemini analyzing the telemetry stream and predicting a Stripe Webhook
        GeminiAiService.generateContent.mockResolvedValueOnce(`
{
    "predicted_file_path": "src/routes/stripe.webhook.js",
    "predicted_code": "const express = require('express');\\nconst router = express.Router();\\n\\nrouter.post('/webhook', (req, res) => {\\n  // Predicted Stripe Handler\\n  res.send('ok');\\n});\\n\\nmodule.exports = router;"
}
        `);

        // The human is typing out a Checkout component
        const typingStream = [
            "import React, { useState } from 'react';",
            "import { loadStripe } from '@stripe/stripe-js';",
            "const stripePromise = loadStripe('pk_test_123');",
            "export const Checkout = () => {"
        ];

        // We simulate the WebSocket telemetry stream firing rapidly as the user types
        for (const line of typingStream) {
            await telepathService.ingestTelemetry('/src/frontend/Checkout.tsx', line);
        }

        // Allow async background prediction to resolve
        await new Promise(process.nextTick);

        // ASSERTIONS

        // 1. The agent should have accumulated the typing stream into its buffer
        expect(telepathService.telemetryBuffer).toHaveLength(4);
        expect(telepathService.telemetryBuffer[3].content).toEqual("export const Checkout = () => {");

        // 2. The agent should have silently invoked Gemini to predict what's next
        expect(GeminiAiService.generateContent).toHaveBeenCalled();

        // 3. The agent should have intercepted the prediction and staged a ghost file
        const expectedGhostDir = path.dirname(path.join(telepathService.ghostCachePath, 'src/routes/stripe.webhook.js'));
        const expectedGhostFile = path.join(telepathService.ghostCachePath, 'src/routes/stripe.webhook.js');

        expect(fs.mkdir).toHaveBeenCalledWith(expectedGhostDir, { recursive: true });
        expect(fs.writeFile).toHaveBeenCalledWith(
            expectedGhostFile,
            expect.stringContaining('Predicted Stripe Handler'),
            'utf8'
        );
    });

});
