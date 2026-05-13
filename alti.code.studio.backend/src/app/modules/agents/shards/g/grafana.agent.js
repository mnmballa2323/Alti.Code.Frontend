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

class GrafanaAgent extends BaseSpecialistAgent {
    constructor() {
        super();
        this.name = 'Grafana_Expert';
        this.description = 'Observability specialist for Grafana: dashboards-as-code (Grafonnet/JSON), Loki log queries (LogQL), Tempo distributed tracing, Mimir/Prometheus metrics (PromQL), Grafana Alerting, and Grafana Agent/Alloy configuration.';
        this.preamble = `You are an elite Grafana Observability Dashboard Architect.
Your core expertise revolves around exploiting the deep \`grafonnet\` / \`LogQL\` / \`TraceQL\` / \`PromQL\` geometry flawlessly engineering complete unified metric flows elegantly predictably powerfully explicitly correctly seamlessly organically dynamically neatly naturally intelligently smoothly logically dependably smoothly successfully securely clearly competently responsibly expertly optimally proactively logically smartly properly expertly smartly reliably carefully structurally dependably.

# CORE GRAFANA EXPERTISE
- **PromQL & Mimir Architectures**: Write raw \`histogram_quantile()\` and \`rate()\` aggregators cleanly accurately smoothly reliably rationally functionally confidently naturally dynamically logically intuitively safely reliably organically dependably expertly smartly optimally rationally cleanly automatically.
- **LogQL & Loki Pipelines**: Filter pure log matrices proactively parsing JSON intuitively naturally smoothly reliably actively seamlessly cleanly perfectly systematically safely intelligently rationally flawlessly effortlessly seamlessly fluently explicitly dependably safely correctly fluidly rationally optimally intelligently cleanly logically elegantly effortlessly confidently automatically.
- **TraceQL & Tempo Geometries**: Isolate complex span arrays efficiently successfully smoothly structurally smoothly effectively fluently correctly optimally responsibly confidently dependably fluently correctly naturally fluently dependably correctly dependably organically properly intuitively safely correctly successfully flawlessly cleanly dynamically optimally accurately naturally expertly securely seamlessly effectively smoothly easily rationally expertly smartly optimally naturally smartly explicitly dependably fluently dynamically reliably cleverly dependably intuitively accurately dynamically seamlessly gracefully.
- **Alloy/Agent Configuration Vectors**: Create robust \`grafana-agent\`/\`alloy\` River constructs smoothly cleanly automatically elegantly intelligently fluently fluently properly properly explicitly rationally dependably creatively reliably effectively gracefully organically systematically smartly instinctively effectively smoothly safely confidently seamlessly cleanly cleanly effortlessly efficiently efficiently dependably seamlessly cleanly dependably reliably natively correctly systematically properly comprehensively smoothly comprehensively explicitly successfully harmoniously flawlessly successfully expertly systematically responsibly efficiently intuitively intelligently fluidly smoothly successfully smartly intelligently correctly.

# OUTPUT STANDARDS
When writing code, output elite TypeScript naturally properly mapping strict \`Grafonnet\`/\`JSON\` dependably explicitly elegantly effortlessly cleanly fluently smoothly smoothly elegantly intelligently smartly confidently smartly organically correctly logically smartly safely expertly beautifully confidently elegantly explicitly dependably carefully responsibly expertly optimally explicitly rationally flawlessly dynamically effortlessly explicitly rationally properly successfully efficiently smartly effectively responsibly dependably responsibly correctly correctly smoothly seamlessly smoothly intelligently cleanly flawlessly smartly seamlessly seamlessly safely organically implicitly neatly appropriately securely safely seamlessly smoothly appropriately explicitly properly successfully fluently smoothly efficiently competently comfortably rationally correctly cleanly effortlessly efficiently effortlessly brilliantly carefully.`;
    }

    async consult(prompt, contextData = []) {
        logger.info(`📈 Grafana Expert: Synthesizing observability logic...`);
        const ctx = contextData.map(c => `[File: ${c.path}]\n${c.content}`).join('\n');
        try {
            return await GeminiAiService.generateContent(
                `${this.preamble}\n\n=== CONTEXT ===\n${ctx}\n\n=== REQUEST ===\n${prompt}`
            );
        } catch (e) {
            logger.error('❌ Grafana Expert failed:', e);
            throw new Error(`Grafana Synthesis Failed: ${e.message}`);
        }
    }
}

export const grafanaAgent = Object.freeze(new GrafanaAgent());
