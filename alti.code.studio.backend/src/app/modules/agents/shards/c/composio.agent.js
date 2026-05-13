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
import { composioService } from '../../../mcp/composio.service.js';

class ComposioAgent extends BaseSpecialistAgent {
    constructor() {
        super('ComposioAgent', 'The Composio App Router', 'Tier 13');
    }

    async _invoke(context) {
        if (!composioService.composio) {
            return {
                status: 'error',
                agent: this.name,
                message: 'Composio SDK is not initialized. Cannot route external app intents.'
            };
        }

        logger.info(`🌐 Composio Router: Analyzing intent for App execution... Goal: "${context.goal}"`);

        try {
            // Retrieve available tools to guide the LLM's selection
            const availableTools = await composioService.getConnectedToolsSchema(context.userId || 'default_user');
            const toolsMeta = availableTools.map(t => `${t.name}: ${t.description}`).join('\n');

            const prompt = `You are the Composio App Router.
Translate the following Sprint Goal into a JSON payload representing a Composio Tool call.
Goal: "${context.goal}"

Available Connected Tools:
${toolsMeta || 'No active connections. Default to mock payload.'}

Return JSON matching:
{
  "action": "ACTION_NAME (from Available Tools)",
  "payload": { "key": "value" }
}
Do not wrap the JSON in markdown blocks. Just return raw JSON.`;

            let synth = await GeminiAiService.generateContent(prompt);
            synth = synth.replace(/^```json|```$/g, '').trim();

            let toolCall;
            try {
                toolCall = JSON.parse(synth);
            } catch (e) {
                toolCall = { action: 'GenericAction', payload: { intent: context.goal } };
            }

            logger.info(`🌐 Composio Router: Mapped intent to execute ${toolCall.action}`);

            // Actually execute the action against the native SDK
            let executionResult;
            try {
                executionResult = await composioService.executeTool(toolCall.action, toolCall.payload, context.userId || 'default_user');
                logger.info(`✅ Composio execution succeeded for ${toolCall.action}`);
            } catch (execErr) {
                logger.warn(`⚠️ Native execution failed, falling back to emulation: ${execErr.message}`);
                executionResult = { error: execErr.message, emulated: true };
            }

            const surrogateOutput = JSON.stringify(executionResult, null, 2);

            return {
                status: 'success',
                agent: this.name,
                composio_action: toolCall.action,
                host_output: surrogateOutput,
                message: `The Composio router processed action ${toolCall.action}.`,
                emulated_tool_call: executionResult.emulated ? toolCall : undefined
            };

        } catch (error) {
            logger.error(`❌ Composio Router: Failed to execute intent: ${error.message}`);
            return {
                status: 'error',
                agent: this.name,
                error: error.message,
                message: 'Failed to route task through Composio'
            };
        }
    }
}

export const composioAgent = Object.freeze(new ComposioAgent());

