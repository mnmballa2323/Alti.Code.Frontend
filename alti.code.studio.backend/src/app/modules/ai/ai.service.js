import { Workflow, WorkflowRun } from './ai.model.js';
import { gcpSovereignCompatService } from './gcpSovereignCompat.service.js';
import { logger } from '../../../shared/logger.js';

class AiService {
  /**
   * Translates a natural language schedule into a cron expression using Vertex AI
   * @param {string} frequencyStr
   * @returns {Promise<string>}
   */
  async translateToCron(frequencyStr) {
    try {
      const prompt = `Convert the following natural language schedule into a standard 5-part cron expression. 
            ONLY output the cron expression, nothing else. 
            If it's invalid or unclear, default to '0 * * * *'.
            Input: "${frequencyStr}"`;

      const rawResponse =
        await gcpSovereignCompatService.generateContent(prompt);
      const cronRegex =
        /(@(?:annually|yearly|monthly|weekly|daily|hourly|reboot))|(@every (\d+(ns|us|µs|ms|s|m|h))+)|((((\d+,)+\d+|(\d+(\/|-)\d+)|\d+|\*) ?){5,7})/;
      const match = rawResponse.match(cronRegex);

      if (match && match[0]) {
        return match[0].trim();
      }
      return '0 * * * *';
    } catch (error) {
      logger.error('AiService: Failed to translate cron', error);
      return '0 * * * *'; // default fallback
    }
  }

  /**
   * Create a new Workflow
   */
  async createWorkflow(userId, payload) {
    let { name, triggerType, frequency, webhookEvent, prompt, tools } = payload;

    let rawCron = null;
    if (triggerType === 'schedule' && frequency) {
      rawCron = await this.translateToCron(frequency);
    }

    const workflow = new Workflow({
      userId,
      name,
      triggerType,
      frequency: rawCron,
      webhookEvent,
      prompt,
      tools: tools || [],
    });

    // MOCK: Google Cloud Scheduler
    if (triggerType === 'schedule') {
      logger.info(
        `[MOCK GCP SCHEDULER] Creating job for workflow ${workflow._id} with cron: ${rawCron}`,
      );
      workflow.schedulerJobName = `mock-job-${workflow._id}`;
    }

    await workflow.save();
    return workflow;
  }

  /**
   * Execute a workflow loop
   */
  async executeWorkflow(workflowId) {
    const workflow = await Workflow.findById(workflowId);
    if (!workflow) throw new Error('Workflow not found');

    const run = new WorkflowRun({ workflowId, status: 'running' });
    await run.save();

    logger.info(`Starting execution loop for Workflow: ${workflow.name}`);

    try {
      // MOCK: Run an execution loop via Vertex AI
      // In a real scenario, you'd define MCP tools as Vertex Function Declarations.
      const systemPrompt = `You are an autonomous agent executing a workflow.
            Your objective: ${workflow.prompt}
            Available Tools: ${workflow.tools.join(', ')}.
            Generate a JSON array of 3 steps you took to achieve this goal, with "action", "tool", and "payload" fields for each step.
            ONLY output valid JSON.`;

      const response =
        await gcpSovereignCompatService.generateContent(systemPrompt);

      // Try to parse the JSON steps
      let steps = [];
      try {
        let jsonStr = response
          .replace(/```json/g, '')
          .replace(/```/g, '')
          .trim();
        // strip out anything before the first [ and after the last ]
        const firstBracket = jsonStr.indexOf('[');
        const lastBracket = jsonStr.lastIndexOf(']');
        if (firstBracket !== -1 && lastBracket !== -1) {
          jsonStr = jsonStr.substring(firstBracket, lastBracket + 1);
        }
        steps = JSON.parse(jsonStr);
        if (!Array.isArray(steps)) steps = [steps];
      } catch (e) {
        logger.warn('AiService: Failed to parse workflow execution JSON', e);
        // Fallback steps if JSON parsing fails
        steps = [
          {
            action: 'Analyzed objective',
            tool: 'reasoning',
            payload: { intent: workflow.prompt },
          },
          {
            action: 'Executed tools',
            tool: 'system',
            payload: { result: 'success', raw: response.substring(0, 100) },
          },
        ];
      }

      // Append logs
      for (const step of steps) {
        run.logs.push({
          action: step.action || 'Unknown Action',
          tool: step.tool || 'system',
          payload: step.payload || {},
          timestamp: new Date(),
        });
      }

      run.status = 'success';
      await run.save();
      return run;
    } catch (error) {
      logger.error(
        `AiService: executeWorkflow failed for ${workflowId}`,
        error,
      );
      run.status = 'failed';
      run.error = error.message;
      run.logs.push({
        action: 'System Error',
        tool: 'engine',
        payload: { error: error.message },
      });
      await run.save();
      throw error;
    }
  }

  async getWorkflowRuns(workflowId) {
    return await WorkflowRun.find({ workflowId })
      .sort({ createdAt: -1 })
      .limit(50);
  }
}

export const aiService = new AiService();
