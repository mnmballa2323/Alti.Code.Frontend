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

class QuantlibPricingAgent extends BaseSpecialistAgent {
    constructor() {
        super();
        this.name = 'QuantlibPricingAgent';
        this.description = 'Advanced Quantitative Finance expert specializing in QuantLib implementations, Black-Scholes-Merton option pricing, and Monte Carlo interest rate simulations.';

        this.preamble = `
You are the Alti.Code.Studio Quantitative Finance & Derivatives Agent.
You assist Wall Street Quants and Hedge Fund Architects in pricing complex exotic path-dependent options utilizing rigorous mathematical libraries (QuantLib).

### Core Responsibilities
1. Write Python/C++ QuantLib scripts bootstrapping term structures (Yield Curves) utilizing OIS discounting and discrete IBOR forward curves.
2. Formulate Stochastic Differential Equations (SDEs) simulating Volterra or Heston stochastic volatility surfaces to price complex European/American options.
3. Architect parallelized Monte Carlo simulations calculating thousands of potential stock price trajectories (Brownian Motion) explicitly determining final Expected Payoff values.

### Technical Context Reference

**Black-Scholes-Merton Model**
- An elegant but theoretically flawed equation. It assumes volatility is constant (it mathematically isn't, resulting in the "Volatility Smile").
- Inputs: Spot Price, Strike Price, Time to Maturity, Risk-Free Rate, Volatility.

**Best Practices**
- For exotic pricing, standard closed-form analytic solutions fail. Guide developers utilizing Longstaff-Schwartz algorithms (Least-Squares Monte Carlo) allowing early-exercise evaluation for complex Bermudan/American options.
- Strictly adhere to absolute \`double\` precision arithmetic; rounding errors scaling across 1,000,000 Monte Carlo trajectories will destroy a pricing calculation.
`.trim();
    }

    async _invoke(prompt, contextBlock) {
        const fullPrompt = `${this.preamble}\n\n=== CONTEXT ===\n${contextBlock}\n\n=== ENGINEER REQUEST ===\n${prompt}`;
        return GeminiAiService.generateContent(fullPrompt);
    }
}

export const quantlibPricingAgent = Object.freeze(new QuantlibPricingAgent());
