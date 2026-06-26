import { logger } from '../../../../shared/logger.js';
import { GeminiAiService } from '../../gemini/gemini.service.js';
import { exec } from 'child_process';
import util from 'util';
import EventEmitter from 'events';

const execAsync = util.promisify(exec);
export const redTeamBus = new EventEmitter();

/** Shared JSON cleaner */
const parseAgentJson = raw => {
  const cleaned = raw
    .replace(/^```json\n?/m, '')
    .replace(/^```\n?/m, '')
    .replace(/\n?```$/m, '')
    .trim();
  return JSON.parse(cleaned);
};

export class RedTeamAgent {
  constructor() {
    this.name = 'redTeam';
    this.description = 'Continuous Chaos Engineering and Red Teaming';
    this.capabilities = [
      'Simulate Kubernetes cluster breakouts via kubectl exec',
      'Perform JWT manipulation to bypass authentication',
      'Map attack surfaces and stress test rate limiters',
    ];
  }

  /**
   * Executes an autonomous penetration test iteration
   * @param {string} action Default is 'simulate_attack'
   * @param {object} params Attack parameters
   */
  async execute(action = 'simulate_attack', params = {}) {
    logger.info(
      `🔴 The Sentinel (Red Team): Initiating automated penetration testing sequence...`,
    );

    try {
      // Simulated probe gathering cluster info
      let kubeInfo = 'Simulated Context: No live cluster attached.';
      if (process.env.KUBECONFIG) {
        try {
          const { stdout } = await execAsync(
            'kubectl get pods -A --field-selector=status.phase=Running | head -n 5',
          );
          kubeInfo = stdout;
        } catch {
          /* Ignore */
        }
      }

      const prompt = `
You are "The Sentinel" (Red Team Agent). Perform a simulated chaos engineering / penetration test report.
Current environment info:
${kubeInfo}
Target action: ${action}

Analyze the environment for misconfigurations (Gatekeeper bypasses, ASM mTLS gaps, JWT algorithm confusion).
Generate a simulated attack report.

Return strict JSON:
{
    "vector": "Description of the attack vector (e.g. JWT Alg bypass)",
    "severity": "CRITICAL|HIGH|MEDIUM|LOW",
    "findings": "What was discovered?",
    "recommendation": "How to fix the vulnerability"
}
Only JSON, no markdown.`.trim();

      const rawResponse = await GeminiAiService.generateContent(prompt);
      let report;
      try {
        report = parseAgentJson(rawResponse);
      } catch (e) {
        report = {
          vector: 'Unknown',
          severity: 'MEDIUM',
          findings: rawResponse.substring(0, 500),
          recommendation: 'Manual review required',
        };
      }

      logger.info(
        `🔴 The Sentinel discovered a ${report.severity} vulnerability vector.`,
      );

      // Emit to mission-control bus!
      redTeamBus.emit('incident:chaos_detected', {
        timestamp: new Date().toISOString(),
        ...report,
      });

      return report;
    } catch (err) {
      logger.error(`❌ Red Team Agent Execution Failed: ${err.message}`);
      return { error: err.message };
    }
  }
}

export const redTeamAgent = new RedTeamAgent();

// Start a background interval to constantly probe in staging (every 5 minutes)
// Disabled by default unless RED_TEAM_ENABLED=true
if (process.env.RED_TEAM_ENABLED === 'true') {
  setInterval(
    () => {
      redTeamAgent
        .execute()
        .catch(e => logger.error(`Red Team interval failed: ${e.message}`));
    },
    5 * 60 * 1000,
  ); // 5 minutes
}
