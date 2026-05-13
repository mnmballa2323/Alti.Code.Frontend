/**
 * Copyright (c) 2024 Alti.Code.Studio — TIER 4: OPERATIONS
 * 
 * Incident Agent — "The First Responder"
 * Incident response, root cause analysis, postmortem generation.
 */
import { aiProvider } from '../ai/ai.provider.js';
import { logger } from '../../../shared/logger.js';

export const incidentWorkerProcessor = async (job) => {
    const { alert, logs, metrics, severity } = job.data;
    logger.info(`🚨 Incident [${job.id}]: Responding to ${severity || 'P2'} incident...`);

    const response = await aiProvider.reason(`
You are a senior SRE responding to a production incident.

Alert: ${alert}
Severity: ${severity || 'P2'}
Logs: ${logs || 'Not provided'}
Metrics: ${JSON.stringify(metrics || {})}

Provide:
1. **Triage** — Severity assessment and blast radius
2. **Root Cause Hypothesis** — Most likely causes ranked
3. **Mitigation** — Immediate actions to reduce impact
4. **Resolution** — Steps to fully resolve
5. **Postmortem** — What happened, timeline, preventive measures

Respond in JSON: { "severity": string, "blastRadius": string, "rootCauses": [], "mitigation": [], "resolution": [], "postmortem": string }
    `);

    return { incident: JSON.parse(response.match(/\{[\s\S]*\}/)?.[0] || '{}') };
};
