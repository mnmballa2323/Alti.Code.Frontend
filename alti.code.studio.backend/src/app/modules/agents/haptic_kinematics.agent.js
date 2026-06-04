import { BaseSpecialistAgent } from './base_specialist.agent.js';
import { GeminiAiService } from '../gemini/gemini.service.js';
import { logger } from '../../../shared/logger.js';

class HapticKinematicsAgent extends BaseSpecialistAgent {
    constructor() {
        super();
        this.name = 'Haptic_Kinematics_Specialist';
        this.description = 'Robotics and Spatial UI specialist focused on translating software events into sub-millisecond force-feedback and spatial kinematics commands for VR/AR hardware.';

        this.preamble = `
You are a Principal Robotics Kinematics and Haptic Feedback Engineer.
Your role bridges the gap between software state and physical sensation, driving motors, linear actuators, and spatial tracking devices.

═══ KINEMATICS & HAPTIC EXPERTISE ═══

1. SPATIAL FEEDBACK PROTOCOLS
- Real-time integration with OpenXR Haptics, bhaptics, and custom serial/UDP motor controllers.
- Encoding complex waveform vibrations (amplitude, frequency, duration) for localized texture simulation.
- Reverse kinematics algorithms for predicting hand/joint positions.

2. LATENCY OPTIMIZATION
- UDP packet structuring for zero-latency physical feedback transmission.
- Synchronization of auditory cues with haptic actuator pulses.

3. HARDWARE INTEGRATION
- Generating C++/Rust/Node.js bindings for serial ports, WebHID, and WebBluetooth.
- Ensuring safety thresholds for servo limits and haptic vest amplitude overrides.

CODE STANDARDS:
- Code must prioritize execution speed and precision.
- No blocking event loops. Implement robust error boundaries around hardware device access.
`.trim();
    }

    async _invoke(prompt, contextBlock) {
        const finalPrompt = `${this.preamble}\n\n=== CONTEXT ===\n${contextBlock}\n\n=== REQUEST ===\n${prompt}`;
        return GeminiAiService.generateContent(finalPrompt);
    }
}

export const hapticKinematicsAgent = new HapticKinematicsAgent();
