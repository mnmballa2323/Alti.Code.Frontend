/**
 * Copyright (c) 2024 Inso Code
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import httpStatus from 'http-status';
import { logger } from '../../../shared/logger.js';
import { GeminiAiService } from '../gemini/gemini.service.js';
import { VectorMemory } from '../../shared/memory.js';

/** Severity levels ordered by priority (highest last for easy comparison). */
const SEVERITY_ORDER = { LOW: 0, MEDIUM: 1, HIGH: 2, CRITICAL: 3 };

/**
 * Emits a structured critical alert. Today it logs with a distinct prefix;
 * the slot is webhook-ready for PagerDuty/Slack integration.
 *
 * @param {object} analysis — { rootCause, bugSeverity, patchedCode }
 * @param {string} errorLog — original error string
 */
function _emitCriticalAlert(analysis, errorLog) {
    logger.error([
        '⚠️  CRITICAL BUG DETECTED ⚠️',
        `Error     : ${errorLog.substring(0, 120)}`,
        `Root Cause: ${analysis.rootCause}`,
        `Severity  : ${analysis.bugSeverity}`,
        '── Patch ready in analysis.patchedCode ──',
    ].join('\n'));

    // TODO: POST to webhook endpoint (PagerDuty / Slack) once configured
    // await fetch(process.env.CRITICAL_ALERT_WEBHOOK, { method: 'POST', body: JSON.stringify(analysis) });
}

const analyzeError = async (errorLog, stackTrace, userId = 'system', sessionId = 'debug-session') => {
    if (!errorLog || typeof errorLog !== 'string' || errorLog.trim().length === 0) {
        throw new Error('DebugAgentService: errorLog must be a non-empty string.');
    }

    logger.info(`🐞 DebugAgent: Starting analysis — ${errorLog.substring(0, 80)}...`);

    // ── 1. RAG RECALL: search vector memory for similar known errors ──────────
    let knownSolutionsContext = '';
    try {
        const memories = await VectorMemory.search(errorLog, 3);
        if (memories && memories.length > 0) {
            knownSolutionsContext = '\n\nKnown Solutions from past incidents:\n' +
                memories.map((m, i) => `${i + 1}. ${m.content}`).join('\n');
            logger.info(`🐞 DebugAgent: Recalled ${memories.length} relevant memory entries.`);
        } else {
            logger.info('🐞 DebugAgent: No relevant memories found — fresh analysis.');
        }
    } catch (memErr) {
        logger.warn(`🐞 DebugAgent: Memory recall failed (non-fatal): ${memErr.message}`);
    }

    // ── 2. LLM ANALYSIS ───────────────────────────────────────────────────────
    const prompt = `
    You are an elite Senior Backend Engineer resolving a critical P1 bug.
    Analyze the following Stack Trace and trace it back to the underlying Source Code.
    
    Error: "${errorLog}"
    
    Stack Trace:
    \`\`\`
    ${stackTrace}
    \`\`\`
    ${knownSolutionsContext}
    
    Determine the root cause of the crash (e.g., missing null-check, off-by-one error).
    Provide a direct rewrite of the flawed logic.
    
    Return your findings as a strict JSON report:
    {
        "rootCause": "A 1-sentence explanation of what threw the exception.",
        "bugSeverity": "LOW | MEDIUM | HIGH | CRITICAL",
        "patchedCode": "The fully corrected Javascript source code block, ready to be deployed.",
        "confidenceScore": 0.0
    }
    Do not wrap the JSON output in markdown formatting.
    `;

    try {
        const aiResponse = await GeminiAiService.generateContent(prompt);

        let result;
        try {
            const cleanJson = aiResponse
                .replace(/^```json\n?/m, '')
                .replace(/^```\n?/m, '')
                .replace(/\n?```$/m, '')
                .trim();
            result = JSON.parse(cleanJson);
        } catch (e) {
            logger.warn('DebugAgent: Failed to parse AI response as JSON, using raw text', e);
            result = {
                rootCause: aiResponse,
                bugSeverity: 'HIGH',
                patchedCode: 'See analysis',
                confidenceScore: 0.5
            };
        }

        const analysis = {
            error: errorLog,
            rootCause: result.rootCause,
            bugSeverity: result.bugSeverity,
            patchedCode: result.patchedCode,
            confidenceScore: result.confidenceScore ?? null,
            recalledMemories: memories?.length ?? 0,
        };

        // ── 3. SEVERITY ROUTING ───────────────────────────────────────────────
        if ((SEVERITY_ORDER[result.bugSeverity] ?? 0) >= SEVERITY_ORDER.CRITICAL) {
            _emitCriticalAlert(analysis, errorLog);
        }

        // ── 4. MEMORIZE: store this successful analysis for future recall ─────
        try {
            const memoryContent = [
                `Error: ${errorLog}`,
                `Root Cause: ${result.rootCause}`,
                `Severity: ${result.bugSeverity}`,
                `Fix: ${result.patchedCode?.substring(0, 300)}`,
            ].join('\n');
            await VectorMemory.add(memoryContent, {
                type: 'debug_analysis',
                bugSeverity: result.bugSeverity,
                userId,
                sessionId,
                timestamp: new Date().toISOString(),
            });
            logger.info('🐞 DebugAgent: Analysis stored in vector memory for future recall.');
        } catch (memErr) {
            logger.warn(`🐞 DebugAgent: Memory store failed (non-fatal): ${memErr.message}`);
        }

        return analysis;

    } catch (error) {
        logger.error('DebugAgent: Analysis failed', error);
        throw error;
    }
};

export const DebugAgentService = {
    analyzeError,
};
