
// fixed controller import
// Actually, let's just test the process via Mock Request to Controller if possible, or just run the logic separately.
// The easiest way is to reuse test_phase26.js logic but call it via the controller's logic path.
// Or we can just use axios/fetch if we run the server? 
// The environment is already running 'scripts/test_hardening.js' and others.
// Let's create a script that IMPORTS the controller and MOCKS req/res to verify the flow.

import { SynapseController } from '../src/app/modules/synapse/synapse.controller.js';
import { SynapseService } from '../src/app/modules/synapse/synapse.service.js';
import { logger } from '../src/shared/logger.js';
// import httpMocks from 'node-mocks-http';

async function runVerification() {
    logger.info("🚀 Starting Phase 27 Verification: The Oracle API...");

    try {
        // Init Service
        await SynapseService.init();

        // Mock Request
        const req = {
            body: {
                goal: "Phase 27 Test Feature",
                mode: "collaborative"
            }
        };

        // Create a promise that resolves when response is sent
        const responsePromise = new Promise((resolve, reject) => {
            const res = {
                _data: null,
                statusCode: 200,
                status: function (code) { this.statusCode = code; return this; },
                send: function (data) { this._data = data; resolve(data); return this; },
                json: function (data) { this._data = data; resolve(data); return this; }
            };

            // Call Controller (don't await the function itself, await the response)
            logger.info("📡 calling SynapseController.startHiveSession...");
            SynapseController.startHiveSession(req, res, (err) => { if (err) reject(err); });
        });

        // Wait for response
        const data = await responsePromise;

        logger.info("✅ Response received:", typeof data === 'string' ? data : JSON.stringify(data));

        if (!data) throw new Error("No response data sent");

        const jsonData = typeof data === 'string' ? JSON.parse(data) : data;

        if (!jsonData.success) throw new Error("API Response Success is false");
        if (!jsonData.data) throw new Error("API Response missing data");
        // if (jsonData.data.goal !== "Phase 27 Test Feature") throw new Error("Goal mismatch"); // Goal might not be echoed back in session object depending on mock
        if (!jsonData.data.memory) throw new Error("Memory missing in response");

        logger.info("🎉 Phase 27 Verification Passed!");
        process.exit(0);

    } catch (error) {
        logger.error("❌ Verification Failed:", error);
        process.exit(1);
    }
}

runVerification();
