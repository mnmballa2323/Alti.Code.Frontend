import { ExecutionsClient } from '@google-cloud/workflows';
import { logger } from '../../../shared/logger.js';
import config from '../../../../config/index.js';
import { PrismaClient } from '@prisma/client';
import { GoogleGenAiService } from '../googleGenAi/googleGenAi.service.js';

const prisma = new PrismaClient();

/**
 * Google Cloud Workflows Service.
 * Elevates local in-memory agent orchestration (LangGraph) into a highly durable, 
 * serverless GCP state machine execution.
 */
class GoogleWorkflowService {
    constructor() {
        try {
            this.client = new ExecutionsClient();
            this.parent = `projects/${config.gcp.project_id}/locations/${config.gcp.location}/workflows/alti-swarm-orchestrator`;
            logger.info('🔄 [Workflows] Google Cloud Workflows Client initialized.');
        } catch (error) {
            logger.warn('⚠️ [Workflows] Could not initialize ExecutionsClient.');
        }
    }

    /**
     * Triggers a serverless Swarm orchestration workflow.
     * @param {object} swarmState - The initial state graph parameters
     */
    async executeSwarm(swarmState) {
        logger.info(`🚀 [Workflows] Triggering Serverless Swarm Execution...`);
        
        try {
            const [execution] = await this.client.createExecution({
                parent: this.parent,
                execution: {
                    argument: JSON.stringify(swarmState),
                },
            });

            logger.info(`✅ [Workflows] Execution launched! Name: ${execution.name}`);
            return execution.name;
        } catch (error) {
            logger.error(`❌ [Workflows] Execution failed to start:`, error.message);
            // Fallback to local LangGraph run
            return null;
        }
    }

    /**
     * Autonomously creates a new Workflow via Google Cloud Vertex AI / Gemini.
     * Generates a custom master orchestration prompt based purely on the name.
     */
    async createWorkflow(userId, name) {
        logger.info(`🧠 [Workflows] Gemini is architecting a new workflow: ${name}...`);
        
        try {
            const model = GoogleGenAiService.getGenerativeModel(GoogleGenAiService.PRIMARY_MODEL, 0.7);
            
            const prompt = `
                You are the Master Architect AI of Alti Code Studio, powered by Google Vertex AI.
                The user has requested to create a new autonomous workflow named: "${name}".
                
                Your job is to generate the PERFECT master system prompt for this workflow.
                You must also suggest an array of tools that this workflow will likely need.
                
                Respond ONLY in strict JSON format with exactly two fields:
                - "prompt": A highly detailed, world-class system prompt (string).
                - "tools": An array of tool strings (e.g., ["github", "slack", "database"]).
            `;
            
            const result = await model.generateContent(prompt);
            const responseText = result.response.candidates[0].content.parts[0].text;
            
            // Clean markdown JSON if present
            const cleanJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
            const aiData = JSON.parse(cleanJson);
            
            // Persist the workflow in PostgreSQL
            const newWorkflow = await prisma.workflow.create({
                data: {
                    userId,
                    name,
                    triggerType: "schedule",
                    prompt: aiData.prompt || "You are an autonomous AI agent.",
                    tools: aiData.tools || [],
                }
            });
            
            logger.info(`✅ [Workflows] Successfully provisioned Workflow: ${newWorkflow.id}`);
            return newWorkflow;
            
        } catch (error) {
            logger.error(`❌ [Workflows] Failed to create workflow via Vertex AI:`, error);
            throw new Error('Failed to create workflow via Google Cloud backend.');
        }
    }
}

export const workflowService = new GoogleWorkflowService();
