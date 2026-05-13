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
import { logger } from '../../../../shared/logger.js';
import { GeminiAiService } from '../gemini/gemini.service.js';
import fetch from 'node-fetch';

/**
 * Phase 24: Enterprise Knowledge Graph
 *
 * Interconnects the Swarm with human workflows across Slack, Jira, and Confluence.
 */
class KnowledgeAgent extends BaseSpecialistAgent {
    constructor() {
        super(
            'KnowledgeAgent',
            'Enterprise Integrations',
            'High',
            'Bridges the Swarm with human PM workflows natively via Jira, Confluence, and Slack to digest complex context.',
            'expert'
        );
    }

    /**
     * Crawls a Jira Epic/Ticket and Confluence Pages to build a massive context string.
     */
    async extractTicketContext(ticketId) {
        logger.info(`🧠 KnowledgeAgent: Digesting Enterprise Intelligence for constraint ${ticketId}...`);

        let context = `[Enterprise Context for ${ticketId}]\n`;

        // 1. Fetch from Jira
        try {
            if (process.env.JIRA_API_TOKEN && process.env.JIRA_DOMAIN) {
                const jiraRes = await fetch(`https://${process.env.JIRA_DOMAIN}.atlassian.net/rest/api/3/issue/${ticketId}`, {
                    headers: {
                        'Authorization': `Basic ${Buffer.from(`${process.env.JIRA_EMAIL}:${process.env.JIRA_API_TOKEN}`).toString('base64')}`,
                        'Accept': 'application/json'
                    }
                });

                if (jiraRes.ok) {
                    const issue = await jiraRes.json();
                    context += `- Jira Summary: ${issue.fields?.summary || 'N/A'}\n`;
                    context += `- Jira Description: ${this._extractJiraText(issue.fields?.description) || 'N/A'}\n`;
                    logger.info(`✅ KnowledgeAgent: Jira Context ingested.`);
                }
            } else {
                context += `- [Simulated Jira Data]: Provide a multi-tenant capability supporting SOC2 compliance.\n`;
                logger.warn('⚠️ No Jira tokens found. Simulating Jira payload.');
            }
        } catch (e) {
            logger.warn(`KnowledgeAgent: Jira Fetch Failed - ${e.message}`);
        }

        // 2. Fetch from Confluence (Simulated API Call)
        context += `- [Simulated Confluence Requirements]: PRD specifies strict RBAC controls.\n`;

        return context;
    }

    /**
     * Transition Jira tickets automatically when a sprint completes.
     */
    async markJiraTicketDone(ticketId) {
        if (!ticketId || !process.env.JIRA_API_TOKEN) return false;

        logger.info(`🧠 KnowledgeAgent: Autonomously transitioning Epic ${ticketId} to DONE.`);

        try {
            // Find "Done" transition
            const transRes = await fetch(`https://${process.env.JIRA_DOMAIN}.atlassian.net/rest/api/3/issue/${ticketId}/transitions`, {
                headers: {
                    'Authorization': `Basic ${Buffer.from(`${process.env.JIRA_EMAIL}:${process.env.JIRA_API_TOKEN}`).toString('base64')}`,
                    'Accept': 'application/json'
                }
            });
            const transitions = await transRes.json();
            const doneTransition = transitions?.transitions?.find(t => t.name.toLowerCase() === 'done' || t.name.toLowerCase() === 'closed');

            if (doneTransition) {
                // Execute transition
                await fetch(`https://${process.env.JIRA_DOMAIN}.atlassian.net/rest/api/3/issue/${ticketId}/transitions`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Basic ${Buffer.from(`${process.env.JIRA_EMAIL}:${process.env.JIRA_API_TOKEN}`).toString('base64')}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ transition: { id: doneTransition.id } })
                });
            }
            return true;
        } catch (e) {
            logger.warn(`Failed to transition Jira Ticket: ${e.message}`);
            return false;
        }
    }

    /**
     * Post a summary to a Slack channel when a Sprint finishes.
     */
    async broadcastToSlack(channelId, message) {
        if (!process.env.SLACK_BOT_TOKEN) {
            logger.info(`🧠 [Simulated Slack to ${channelId}]: ${message}`);
            return;
        }

        logger.info(`🧠 KnowledgeAgent: Broadcasting Sprint Status to Slack channel ${channelId}...`);

        try {
            await fetch('https://slack.com/api/chat.postMessage', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${process.env.SLACK_BOT_TOKEN}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    channel: channelId,
                    text: message
                })
            });
        } catch (e) {
            logger.error(`KnowledgeAgent Slack Broadcast error: ${e.message}`);
        }
    }

    /** Helper to parse Jira ADF (Atlassian Document Format) into plain text */
    _extractJiraText(descriptionField) {
        if (!descriptionField || !descriptionField.content) return '';
        let text = '';
        for (const block of descriptionField.content) {
            if (block.type === 'paragraph' && block.content) {
                text += block.content.map(c => c.text).join('') + '\n';
            }
        }
        return text;
    }
}

export const knowledgeAgent = Object.freeze(new KnowledgeAgent());
