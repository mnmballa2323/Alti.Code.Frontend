/**
 * Copyright (c) 2024 Inso Code — TIER 3: COMPLIANCE & QUALITY
 * 
 * Compliance Agent — "The Regulator"
 * GDPR, SOC2, HIPAA, FedRAMP compliance checking.
 */
import { aiProvider } from '../ai/ai.provider.js';
import { logger } from '../../../shared/logger.js';

export const complianceWorkerProcessor = async (job) => {
    const { code, framework, dataTypes } = job.data;
    logger.info(`⚖️ Compliance [${job.id}]: Checking ${framework || 'all frameworks'}...`);

    const result = await aiProvider.reason(`
You are a regulatory compliance expert (GDPR, SOC2, HIPAA, FedRAMP, PCI-DSS).

Framework: ${framework || 'All applicable'}
Data Types Present: ${JSON.stringify(dataTypes || [])}
Code:
\`\`\`
${code || 'Not provided'}
\`\`\`

Audit for:
1. **PII Exposure** — Unprotected personal data
2. **Encryption** — Data at rest/in transit
3. **Access Controls** — Authentication/authorization gaps
4. **Data Retention** — Compliance with deletion policies
5. **Logging** — Adequate audit trails
6. **Violations** — Specific regulation breaches

Respond in JSON: { "framework": string, "score": number, "violations": [], "recommendations": [], "compliant": boolean }
    `);

    return { compliance: JSON.parse(result.match(/\{[\s\S]*\}/)?.[0] || '{}') };
};
