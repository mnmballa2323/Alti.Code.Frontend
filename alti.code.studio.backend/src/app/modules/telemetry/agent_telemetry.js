/**
 * Copyright (c) 2026 Alti.Code.Studio
 * 
 * Agent Telemetry & Observability Engine
 * 
 * High-performance, enterprise-grade tracing library.
 * Tracks agent run cycles, maps tool execution histories, monitors LLM token
 * latency/costs, and automatically writes SIEM-compliant JSONL log files.
 * 
 * Standard compliant, pure MIT/Apache-2.0 licensed, fast, and secure.
 */

import { appendFileSync, mkdirSync } from 'fs';
import { join } from 'path';

export class AgentTelemetry {
    /**
     * Initializes a new stateful telemetry trace session for an agent task.
     * @param {string} agentName - Name of the active agent
     * @param {string} taskId - Unique task trace ID
     * @param {string} logDirectory - Target folder to save audit logs
     */
    constructor(agentName, taskId, logDirectory = './logs/telemetry') {
        this.agentName = agentName;
        this.taskId = taskId;
        this.logDirectory = logDirectory;
        this.startTime = Date.now();
        this.traceHistory = [];
        this.tokenMetrics = { promptTokens: 0, completionTokens: 0, totalCost: 0 };

        try {
            mkdirSync(this.logDirectory, { recursive: true });
        } catch (e) {
            // Directory already exists
        }
    }

    /**
     * Records the initialization of the agent.
     * @param {object} inputPayload - The input request prompt and metadata
     */
    recordStart(inputPayload) {
        const event = {
            eventId: `evt_${Math.random().toString(36).substring(2, 9)}`,
            timestamp: new Date().toISOString(),
            type: 'AGENT_START',
            agentName: this.agentName,
            taskId: this.taskId,
            payload: inputPayload
        };
        this._writeEvent(event);
    }

    /**
     * Traces the invocation of an agentic tool.
     * @param {string} toolName - Name of the tool called
     * @param {object} args - Parameters passed to the tool
     * @param {object} result - Return payload or error signature
     * @param {boolean} isError - Whether the tool crashed
     */
    recordToolCall(toolName, args, result, isError = false) {
        const event = {
            eventId: `evt_${Math.random().toString(36).substring(2, 9)}`,
            timestamp: new Date().toISOString(),
            type: 'TOOL_CALL',
            agentName: this.agentName,
            taskId: this.taskId,
            tool: toolName,
            parameters: args,
            success: !isError,
            resultSummary: typeof result === 'string' ? result.substring(0, 100) : (result ? 'OBJECT_PAYLOAD' : 'EMPTY')
        };
        this.traceHistory.push(event);
        this._writeEvent(event);
    }

    /**
     * Accumulates token counts and calculates real-time costs.
     * @param {number} prompt - Input tokens
     * @param {number} completion - Output tokens
     * @param {number} costPerMillionPrompt - Cost scale (e.g. $0.075 / 1M)
     * @param {number} costPerMillionCompletion - Cost scale (e.g. $0.30 / 1M)
     */
    recordTokens(prompt, completion, costPerMillionPrompt = 0.075, costPerMillionCompletion = 0.30) {
        this.tokenMetrics.promptTokens += prompt;
        this.tokenMetrics.completionTokens += completion;
        
        const promptCost = (prompt / 1000000) * costPerMillionPrompt;
        const completionCost = (completion / 1000000) * costPerMillionCompletion;
        this.tokenMetrics.totalCost += (promptCost + completionCost);

        const event = {
            eventId: `evt_${Math.random().toString(36).substring(2, 9)}`,
            timestamp: new Date().toISOString(),
            type: 'TOKEN_METRICS',
            agentName: this.agentName,
            taskId: this.taskId,
            incrementalPrompt: prompt,
            incrementalCompletion: completion,
            runningTotal: this.tokenMetrics
        };
        this._writeEvent(event);
    }

    /**
     * Records the final completion and outputs execution summaries.
     * @param {string} finalResponse - The response string returned to user
     * @returns {object} Observability trace summary object
     */
    recordEnd(finalResponse) {
        const durationMs = Date.now() - this.startTime;
        const event = {
            eventId: `evt_${Math.random().toString(36).substring(2, 9)}`,
            timestamp: new Date().toISOString(),
            type: 'AGENT_END',
            agentName: this.agentName,
            taskId: this.taskId,
            durationMs,
            tokenSummary: this.tokenMetrics,
            responseSummary: typeof finalResponse === 'string' ? finalResponse.substring(0, 100) : 'OBJECT_RESPONSE'
        };
        this._writeEvent(event);

        return {
            agentName: this.agentName,
            taskId: this.taskId,
            durationMs,
            totalToolsExecuted: this.traceHistory.length,
            tokens: this.tokenMetrics
        };
    }

    /**
     * Internal: Appends structural event log line to JSONL file.
     */
    _writeEvent(event) {
        try {
            const filePath = join(this.logDirectory, `trace_${this.taskId}.jsonl`);
            appendFileSync(filePath, JSON.stringify(event) + '\n', 'utf8');
        } catch (e) {
            console.error('Failed to append telemetry event:', e.message);
        }
    }
}
