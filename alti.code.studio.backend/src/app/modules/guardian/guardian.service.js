/**
 * Copyright (c) 2024 Inso Code
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { GeminiAiService } from '../gemini/gemini.service.js';
import { logger } from '../../../shared/logger.js';
import { EventBus } from '../../shared/eventBus.js';
import { dlpService } from '../dlp/dlp.service.js';

const SERVICE_NAME = 'Guardian Angel';

/**
 * Static security scan rules grouped by severity.
 * Stored as { source, flags, severity, message } so each call creates a fresh
 * RegExp instance — avoids lastIndex state pollution on global regexes.
 */
const SCAN_RULES = [
    // --- CRITICAL ---
    { source: 'AWS_SECRET_KEY|AKIA[0-9A-Z]{16}', flags: 'i', severity: 'CRITICAL', message: 'Hardcoded AWS credential detected' },
    { source: '-----BEGIN (RSA |EC |DSA |OPENSSH )?PRIVATE KEY-----', flags: '', severity: 'CRITICAL', message: 'Private key material embedded in code' },
    { source: 'password\\s*=\\s*["\'][^"\']{4,}', flags: 'i', severity: 'CRITICAL', message: 'Potential hardcoded password' },
    { source: 'secret\\s*=\\s*["\'][^"\']{4,}', flags: 'i', severity: 'CRITICAL', message: 'Potential hardcoded secret' },

    // --- HIGH ---
    { source: '\\beval\\s*\\(', flags: '', severity: 'HIGH', message: 'Dangerous use of eval() detected' },
    { source: 'new Function\\s*\\(', flags: '', severity: 'HIGH', message: 'Dynamic code execution via new Function()' },
    { source: 'child_process\\.exec\\s*\\(\\s*`.*\\$\\{', flags: 's', severity: 'HIGH', message: 'Potential command injection via template literal in exec()' },
    { source: 'dangerouslySetInnerHTML', flags: '', severity: 'HIGH', message: 'React dangerouslySetInnerHTML — potential XSS vector' },
    { source: 'innerHTML\\s*=', flags: '', severity: 'HIGH', message: 'Direct innerHTML assignment — potential XSS vector' },
    { source: 'document\\.write\\s*\\(', flags: '', severity: 'HIGH', message: 'document.write() usage — potential XSS' },

    // --- MEDIUM ---
    { source: 'process\\.env\\b.*console\\.log', flags: 's', severity: 'MEDIUM', message: 'Environment variable may be logged to console' },
    { source: 'Math\\.random\\(\\)', flags: '', severity: 'MEDIUM', message: 'Math.random() is not cryptographically secure' },
    { source: 'http://', flags: '', severity: 'MEDIUM', message: 'Non-HTTPS URL in source code' },
    { source: 'TODO|FIXME|HACK', flags: 'i', severity: 'MEDIUM', message: 'Technical debt marker detected (TODO/FIXME/HACK)' },
    { source: 'require\\s*\\(\\s*["\'](\\.\\./){4,}', flags: '', severity: 'MEDIUM', message: 'Deep relative path traversal detected' },
];

/** Run all scan rules against the provided code. Returns an array of findings. */
const runSemgrepScan = (code) => {
    logger.info(`[${SERVICE_NAME}] Running Static Analysis...`);

    const findings = [];

    for (const rule of SCAN_RULES) {
        // Create a fresh regex per call — prevents lastIndex state bug on global/sticky regexes
        const re = new RegExp(rule.source, rule.flags);
        if (re.test(code)) {
            findings.push({ severity: rule.severity, message: rule.message });
        }
    }

    const criticals = findings.filter(f => f.severity === 'CRITICAL').length;
    const highs = findings.filter(f => f.severity === 'HIGH').length;
    const mediums = findings.filter(f => f.severity === 'MEDIUM').length;

    if (findings.length > 0) {
        logger.warn(`[${SERVICE_NAME}] Static scan: ${criticals} CRITICAL, ${highs} HIGH, ${mediums} MEDIUM`);
    }

    return findings;
};

/**
 * Derive a base security score from static findings alone.
 * Used as the fallback when AI analysis is unavailable.
 * CRITICAL = −40 pts, HIGH = −20 pts, MEDIUM = −5 pts (floor 0).
 */
const scoreFromStaticFindings = (findings) => {
    const deductions = findings.reduce((acc, f) => {
        if (f.severity === 'CRITICAL') return acc - 40;
        if (f.severity === 'HIGH') return acc - 20;
        if (f.severity === 'MEDIUM') return acc - 5;
        return acc;
    }, 100);
    return Math.max(0, deductions);
};

/**
 * Full code audit: static analysis → optional AI contextual review.
 * @param {string} code     - Source code to audit
 * @param {string} context  - Human-readable context label (e.g. 'refactor patch')
 * @returns {Promise<object>}
 */
const auditCode = async (code, context = 'general') => {
    if (!code || typeof code !== 'string' || code.trim().length === 0) {
        throw new Error('GuardianService: code must be a non-empty string.');
    }

    // Prevent massively bloated payloads from hanging the AI or regex engines
    if (code.length > 500000) {
        logger.warn(`[${SERVICE_NAME}] Code payload exceeds 500KB safe bound limit. Rejecting.`);
        return {
            safe: false,
            score: 0,
            reasoning: 'Payload size exceeds 500KB limit. Potential denial of service vector.',
            vulnerabilities: ['[CRITICAL] Payload size limit exceeded'],
            staticFindings: [],
            suggestions: ['Reduce payload size or break into smaller chunks']
        };
    }

    // 0. Inline DLP Redaction and CUI Checks (Nation-State Security Pillar)
    dlpService.checkComplianceTags(code, process.env.AIR_GAPPED_MODE === 'true');
    const redactedCode = dlpService.redact(code);

    logger.info(`[${SERVICE_NAME}] Auditing code for context: ${context}`);

    // 1. Static Analysis — blocks on CRITICAL or HIGH

    const staticFindings = runSemgrepScan(redactedCode);
    const blockingFindings = staticFindings.filter(f => f.severity === 'CRITICAL' || f.severity === 'HIGH');

    if (blockingFindings.length > 0) {
        const messages = blockingFindings.map(f => `[${f.severity}] ${f.message}`);
        logger.warn(`[${SERVICE_NAME}] Static Analysis Blocked: ${messages.join(', ')}`);
        const score = scoreFromStaticFindings(staticFindings); // Was always 0 — now accurate
        const result = {
            safe: false,
            score,
            reasoning: `Static Analysis found blocking issues: ${messages.join('; ')}`,
            vulnerabilities: messages,
            staticFindings,
            suggestions: ['Remove hardcoded secrets', 'Avoid dangerous functions like eval()', 'Use HTTPS URLs only'],
        };
        await EventBus.publish('guardian.audit.rejected', { context, reasoning: result.reasoning });
        return result;
    }

    // 2. AI Contextual Analysis
    try {
        const warningSummary = staticFindings.length > 0
            ? `\nAdditionally, the static scanner found these non-blocking warnings:\n${staticFindings.map(f => `- [${f.severity}] ${f.message}`).join('\n')}`
            : '';

        const prompt = `
        You are the Guardian Angel, a divine AI overseer responsible for the safety, ethics, and quality of code.
        
        Your Mission:
        1. Scan for logical vulnerabilities not caught by static analysis.
        2. Evaluate code quality and maintainability.
        3. Enforce "Do No Harm".
        ${warningSummary}

        Code to Audit:
        \`\`\`
        ${redactedCode.substring(0, 8000)}
        \`\`\`

        Context: ${context}

        Respond ONLY with a valid JSON object (no markdown fences):
        {
            "safe": boolean,
            "score": number (0-100),
            "reasoning": "string explanation",
            "vulnerabilities": ["list"],
            "suggestions": ["list"]
        }
        `;

        const jsonText = await GeminiAiService.generateContent(prompt);

        // Robust multidimensional Markdown code block cleaner
        // Handles: ```json, ```, and stray leading/trailing whitespace
        const cleaned = jsonText
            .replace(/^[\s\S]*?```(?:json)?/i, '') // Strip everything before the first JSON fence
            .replace(/```[\s\S]*$/, '')          // Strip everything after the last fence
            .trim();

        let auditResult;
        try {
            auditResult = JSON.parse(cleaned);
        } catch (parseError) {
            logger.warn(`[${SERVICE_NAME}] AI returned unparseable JSON — using static-only result`, cleaned.slice(0, 200));
            auditResult = {
                safe: staticFindings.length === 0,
                score: scoreFromStaticFindings(staticFindings),
                reasoning: 'AI response could not be parsed. Score derived from static analysis only.',
                vulnerabilities: staticFindings.map(f => `[${f.severity}] ${f.message}`),
                suggestions: ['Review AI response format'],
            };
        }

        auditResult.staticFindings = staticFindings;

        if (!auditResult.safe) {
            logger.warn(`[${SERVICE_NAME}] Code rejected by AI: ${auditResult.reasoning}`);
            await EventBus.publish('guardian.audit.rejected', { context, reasoning: auditResult.reasoning });
        } else {
            logger.info(`[${SERVICE_NAME}] Code approved (Score: ${auditResult.score})`);
            await EventBus.publish('guardian.audit.approved', { context, score: auditResult.score });
        }

        return auditResult;

    } catch (error) {
        // AI call itself failed — fall back to static-only result instead of blocking everything
        logger.error(`[${SERVICE_NAME}] AI Audit failed`, error);
        const score = scoreFromStaticFindings(staticFindings);
        return {
            safe: staticFindings.length === 0,
            score,
            reasoning: `Guardian AI Audit failed: ${error.message}. Score derived from static analysis only.`,
            vulnerabilities: staticFindings.map(f => `[${f.severity}] ${f.message}`),
            staticFindings,
            suggestions: ['Check Guardian AI service logs'],
        };
    }
};

export const GuardianService = {
    auditCode,
    runSemgrepScan,
    scoreFromStaticFindings,
};
