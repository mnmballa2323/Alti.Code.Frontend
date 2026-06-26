import { jobQueueService } from '../../shared/jobQueue.service.js';
import { logger } from '../../shared/logger.js';
import { workflowService } from './workflow.service.js';

export const dispatchWorkflow = async (req, res) => {
  try {
    const { nodes, edges } = req.body;

    if (!nodes || !edges) {
      return res
        .status(400)
        .json({ success: false, message: 'Invalid workflow payload.' });
    }

    logger.info(
      `[Workflow Controller] Dispatching workflow with ${nodes.length} nodes and ${edges.length} edges.`,
    );

    // Map each node type to a specific swarm queue
    const queueMap = {
      service_ai: 'refactor-queue',
      output_auth: 'security-queue',
      trigger_http: 'devops-queue',
    };

    // Dispatch jobs to BullMQ
    const dispatchedJobs = [];
    for (const node of nodes) {
      const targetQueue = queueMap[node.type] || 'devops-queue'; // Fallback to devops

      const job = await jobQueueService.addJob(
        targetQueue,
        `workflow-step-${node.id}`,
        {
          stepId: node.id,
          type: node.type,
          title: node.title,
          instructions: node.instructions,
          guardrails: node.guardrails,
        },
      );

      dispatchedJobs.push({
        nodeId: node.id,
        jobId: job.id,
        queue: targetQueue,
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Workflow dispatched successfully.',
      data: {
        dispatchedJobs,
      },
    });
  } catch (error) {
    logger.error('[Workflow Controller] Failed to dispatch workflow:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const deployWorkflow = async (req, res) => {
  try {
    const payload = req.body;

    if (!payload.name || !payload.prompt) {
      return res.status(400).json({
        success: false,
        message: 'Workflow name and prompt are required.',
      });
    }

    const workflow = await workflowService.deployWorkflow(payload);

    return res.status(200).json({
      success: true,
      message: 'Workflow deployed successfully.',
      data: workflow,
    });
  } catch (error) {
    logger.error('[Workflow Controller] Failed to deploy workflow:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};
