/**
 * Copyright (c) 2024 Inso Code
 * 
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { BaseSpecialistAgent } from './base_specialist.agent.js';
import { logger } from '../../../shared/logger.js';
import { GeminiAiService } from '../gemini/gemini.service.js';

/**
 * Phase 28: The Physical Bridge (Embedded IoT & Robotics)
 * Agent responsible for generating C/C++ firmware payloads and
 * simulating Over-The-Air (OTA) deployment to physical edge devices.
 */
class HardwareAgent extends BaseSpecialistAgent {
    constructor() {
        super({
            id: 'agent_hardware_001',
            name: 'HardwareAgent',
            description: 'Compiles C/C++ firmware (FreeRTOS, PlatformIO) and executes simulated Over-The-Air (OTA) hardware deployments.',
            tier: 28,
            version: '6.8.0',
            capabilities: [
                'Generate ESP32, STM32, and Raspberry Pi Pico firmware payloads',
                'Simulate cross-compilation toolchains using Gemini',
                'Model MQTT/HTTPS OTA delivery protocols to physical swarms',
                'Integrate IoT telemetry loop back to Inso Code cloud'
            ]
        });
    }

    /**
     * Interface handler for the capability router
     */
    async _invoke(query, options = {}) {
        return this.execute('compile_and_flash', { query, ...options });
    }

    async execute(action, context) {
        if (!context) throw new Error("Context is required for HardwareAgent operations");

        logger.info(`🏭 HardwareAgent execution started for action: ${action}`);

        if (action === 'compile_and_flash') {
            const prompt = `You are the Inso Code Embedded Systems Engineer (HardwareAgent).
            Generate a C/C++ FreeRTOS firmware payload based on the following request.
            Assume the target architecture is ESP32 using the Arduino Core or ESP-IDF.
            
            Directive: "${context.query}"
            
            Include:
            1. WiFi setup
            2. An MQTT connection to publish telemetry to 'alticode/telemetry'
            3. The core business logic requested.
            
            Return ONLY the raw C++ code block. No markdown fences.`;

            let firmwareCode = '';
            try {
                const aiResponse = await GeminiAiService.generateContent(prompt);
                firmwareCode = aiResponse.replace(/^```[a-z]*\n?/m, '').replace(/\n?```$/m, '').trim();
            } catch (e) {
                logger.error(`HardwareAgent firmware generation failed: ${e.message}`);
                return { status: 'failed', error: 'Failed to generate firmware payload.' };
            }

            // Simulate the Cross-Compilation and OTA Push
            logger.info(`🏭 HardwareAgent: Cross-compiling ESP-IDF toolchain payload...`);
            await new Promise(resolve => setTimeout(resolve, 800)); // Simulated compile time
            logger.info(`🏭 HardwareAgent: Compilation SUCCESS. BIN size: 1.2MB`);

            // Generate a fake OTA hash
            const firmwareHash = '0x' + Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join('');

            logger.info(`🏭 HardwareAgent: Initializing secure OTA pipeline over MQTT...`);
            await new Promise(resolve => setTimeout(resolve, 500)); // Simulated transport
            logger.info(`🏭 HardwareAgent: Edge Swarm acknowledged image ${firmwareHash}. Rebooting to new firmware.`);

            this._recordSuccess(1300);

            return {
                status: 'success',
                targetArchitecture: 'ESP32 (xtensa-esp32-elf)',
                payloadHash: firmwareHash,
                firmwareSource: firmwareCode,
                otaResult: 'Flash successful. Device swarm returning to active loop.'
            };
        }

        throw new Error(`Unsupported action: ${action}`);
    }
}

export const hardwareAgent = new HardwareAgent();
