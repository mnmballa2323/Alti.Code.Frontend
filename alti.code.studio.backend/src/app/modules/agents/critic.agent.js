import { logger } from '../../../shared/logger.js';

class CriticAgent {
  constructor() {
    this.agentName = 'Critic';
    this.role = 'Adversarial Reviewer';
    this.capabilities = ['review', 'security-audit', 'quality-control'];
  }

  async execute(action, args) {
    logger.info(`[Critic] Executing ${action}`);
    if (action === 'review') {
      return this.reviewPlan(args.plan);
    }
    throw new Error(`Unknown action: ${action}`);
  }

  async reviewPlan(plan) {
    // Simulates an adversarial review of a proposed plan OR design
    const isDesign = !!plan.files;
    const targetType = isDesign ? 'Design' : 'Plan';
    const subject = plan.goal || plan.feature || 'Unknown';

    logger.info(`[Critic] Reviewing ${targetType} for: "${subject}"...`);
    await new Promise(r => setTimeout(r, 800)); // Thinking time

    const feedback = [];
    let approved = true;

    if (isDesign) {
      // Design Review Logic
      if (!plan.files || plan.files.length === 0) {
        feedback.push({ severity: 'high', message: 'Design has no files.' });
        approved = false;
      }
      // Mock check for security in design
      // e.g. if file path contains 'auth' or 'login', ensure it has security comments?
      // For now, let's just approve mock designs
    } else {
      // Plan Review Logic (Strategist)
      const riskyKeywords = ['delete', 'drop', 'force', 'legacy'];
      if (riskyKeywords.some(w => subject.toLowerCase().includes(w))) {
        feedback.push({
          severity: 'high',
          message:
            'Plan involves destructive actions. Require manual approval.',
        });
        approved = false;
      }

      if (plan.steps && plan.steps.length < 2) {
        feedback.push({
          severity: 'medium',
          message: 'Plan seems too simple. Are you missing verification steps?',
        });
      }

      // Check if Security/QA is involved
      const hasSecurity =
        plan.steps &&
        plan.steps.some(s => s.agent === 'Sentinel' || s.agent === 'Security');
      if (plan.steps && !hasSecurity) {
        feedback.push({
          severity: 'low',
          message: 'Suggestion: Add a security scan step.',
        });
      }
    }

    return {
      status: approved ? 'approved' : 'rejected',
      feedback,
      timestamp: new Date(),
    };
  }
}

export const criticAgent = new CriticAgent();
