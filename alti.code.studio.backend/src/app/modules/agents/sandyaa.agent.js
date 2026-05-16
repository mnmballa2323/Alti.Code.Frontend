import { BaseSpecialistAgent } from './base_specialist.agent.js';
import { logger } from '../../../shared/logger.js';
import util from 'util';
import { execFile } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const execFilePromise = util.promisify(execFile);

/**
 * Sandyaa Autonomous Auditor
 * 
 * Invokes the Sandyaa compiled CLI for autonomous vulnerability analysis.
 */
class SandyaaAgent extends BaseSpecialistAgent {
    constructor() {
        super(
            'Sandyaa',
            'Security & Code Auditing',
            'Supreme',
            'Executes the Sandyaa autonomous security auditing tool directly against the local workspace to identify vulnerabilities.',
            'expert'
        );
    }

    async consult(prompt, context = []) {
        logger.info(`🛡️ SandyaaAgent: Initiating native Sandyaa CLI audit...`);
        
        try {
            const sandyaaDir = path.resolve(__dirname, "../../../../submodules/sandyaa");
            const sandyaaScript = path.join(sandyaaDir, "dist/index.js");
            const targetPath = path.resolve(__dirname, "../../../../../"); // Target alti.code.studio root or dynamic path
            
            // Execute the CLI natively from within the agent's consultation phase
            const { stdout, stderr } = await execFilePromise(process.execPath, [sandyaaScript, targetPath], { 
                cwd: sandyaaDir,
                timeout: 600000 
            });

            const auditReport = `[SANDYAA NATIVE AUDIT RESULT]\nSTDOUT:\n${stdout}\nSTDERR:\n${stderr}`;

            // Inject the raw audit result into a Gemini reasoning layer for formatting
            const systemPrompt = `
# ROLE: Sandyaa Security Auditor
You are Sandyaa, an autonomous code auditing intelligence.
You have just completed a deep AST traversal and dependency analysis of the workspace.

# RAW AUDIT OUTPUT:
${auditReport}

# INSTRUCTION:
Summarize the findings from the raw audit output. If vulnerabilities were found, list them clearly with severity. 
If the output contains errors, explain them.
Use professional terminology native to your expertise.
Format your response nicely in markdown.
`.trim();

            return await super.processMessage(prompt, { ...context, systemOverride: systemPrompt });
        } catch (error) {
            logger.error(`❌ SandyaaAgent: CLI Execution failed - ${error.message}`);
            return `[SANDYAA AUDIT FAILURE] The Sandyaa autonomous audit could not be completed. Error: ${error.message}\nStderr: ${error.stderr}`;
        }
    }

    async processMessage(message, context = {}) {
        return this.consult(message, context.previousContext || []);
    }
}

export const sandyaaAgent = new SandyaaAgent();
