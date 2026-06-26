/**
 * Copyright (c) 2024 Inso Code
 *
 * "The Simulator" - Chaos Engineering & Sandboxing Agent
 * Responsible for stress testing, injecting chaos, and safe code execution.
 */
import vm from 'vm'; // Built-in Node module
import { logger } from '../../../shared/logger.js';
import { aiProvider } from '../ai/ai.provider.js';

class SimulatorAgent {
  constructor() {
    this.activeChaos = new Map();
  }

  /**
   * Confine and execute untrusted code (Upgraded from sandbox.service.js)
   * @param {string} code
   * @param {object} context
   */
  async confine(code, context = {}) {
    logger.info('🎲 Simulator: Confining code execution (VM)...');
    try {
      // Check via AI if code looks malicious before running
      const safetyCheck = await this.checkSafety(code);
      if (!safetyCheck.safe) {
        throw new Error(`Code rejected by safety check: ${safetyCheck.reason}`);
      }

      // Create a context for the VM
      const sandbox = { ...context, console };
      vm.createContext(sandbox);

      // Execute code
      const script = new vm.Script(code);
      // Result is the last expression
      const result = script.runInContext(sandbox, { timeout: 1000 });

      logger.info('✅ Simulator: Execution successful');
      return { result, status: 'success' };
    } catch (error) {
      logger.error('❌ Simulator: Execution failed', error);
      return { error: error.message, status: 'failed' };
    }
  }

  async checkSafety(code) {
    const prompt = `
        You are "The Simulator", a Safety Sandbox.
        Analyze this code for malicious intent (infinite loops, network scanning, fs access).
        
        CODE: ${code.substring(0, 1000)}

        OUTPUT JSON: { "safe": boolean, "reason": "string" }
        `;
    try {
      const response = await aiProvider.reason(prompt);
      const match = response.match(/\{[\s\S]*\}/);
      return JSON.parse(match ? match[0] : response);
    } catch (e) {
      // Fail safe
      return { safe: false, reason: 'AI Analysis Failed' };
    }
  }

  /**
   * Inject Chaos (Simulated)
   * @param {string} targetService
   * @param {string} chaosType 'latency', 'error', 'kill'
   */
  async injectChaos(targetService, chaosType) {
    logger.warn(
      `🎲 Simulator: Injecting ${chaosType} chaos into ${targetService}...`,
    );

    // In a real microservices env, we'd interact with the service mesh or container runtime.
    // Here we simulated the effect.
    this.activeChaos.set(targetService, chaosType);

    setTimeout(() => {
      this.activeChaos.delete(targetService);
      logger.info(`🎲 Simulator: Chaos subsided for ${targetService}`);
    }, 10000); // 10s duration

    return { status: 'chaos_active', target: targetService, duration: '10s' };
  }

  /**
   * Simulated Load Test
   * @param {string} endpoint
   * @param {number} rps Requests per second
   */
  async loadTest(endpoint, rps = 100) {
    logger.info(
      `🎲 Simulator: Starting load test on ${endpoint} at ${rps} RPS...`,
    );

    // Simulation logic
    const results = {
      endpoint,
      totalRequests: rps * 5, // 5 seconds
      errors: Math.floor(Math.random() * 5),
      avgLatency: Math.floor(Math.random() * 200) + 'ms',
    };

    return results;
  }
}

export const simulatorAgent = new SimulatorAgent();
