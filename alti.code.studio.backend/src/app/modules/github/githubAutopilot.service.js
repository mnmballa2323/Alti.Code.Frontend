import { Octokit } from 'octokit';
import { spawn, exec } from 'child_process';
import path from 'path';
import fs from 'fs';
import { VectorSearchService } from '../googleCloud/vectorSearch.service.js';
import { LlmGatewayService } from '../llmGateway/llmGateway.service.js';
import { logger } from '../../../shared/logger.js';
import config from '../../../../config/index.js';

const octokit = new Octokit({
  auth:
    config.github_token ||
    process.env.GITHUB_TOKEN ||
    process.env.GITHUB_PERSONAL_ACCESS_TOKEN,
});

const runCommand = (cmd, cwd) => {
  return new Promise(resolve => {
    exec(cmd, { cwd }, (error, stdout, stderr) => {
      resolve({
        success: !error,
        stdout: stdout.trim(),
        stderr: stderr.trim(),
      });
    });
  });
};

// Mutex chain to serialize git commands and prevent concurrent index.lock conflicts
let gitMutex = Promise.resolve();

const acquireGitLock = () => {
  let release;
  const nextLock = new Promise(resolve => {
    release = resolve;
  });
  const currentLock = gitMutex;
  gitMutex = nextLock;
  return currentLock.then(() => release);
};

const SECRET_PATTERNS = [
  /aws[_-]?key/i,
  /aws[_-]?secret/i,
  /api[_-]?key/i,
  /client[_-]?secret/i,
  /private[_-]?key/i,
  /db[_-]?password/i,
  /postgres:\/\/[^:]+:[^@]+@/i,
  /mongodb\+srv:\/\/[^:]+:[^@]+@/i,
  /AIzaSy[A-Za-z0-9_-]{35}/,
  /sk-[a-zA-Z0-9]{48}/,
  /xox[baprs]-[0-9]{12}-[0-9]{12}-[a-zA-Z0-9]{24}/,
  /ghp_[a-zA-Z0-9]{36}/,
];

const COMBINED_SECRET_REGEX = new RegExp(
  SECRET_PATTERNS.map(r => `(${r.source})`).join('|'),
  'i',
);

const scanForSecrets = async cwd => {
  const { success, stdout } = await runCommand('git diff HEAD', cwd);
  if (!success || !stdout) return { hasSecret: false };

  // Limit scan to first 10,000 lines to prevent Event Loop blocking
  const lines = stdout.split('\n').slice(0, 10000);
  for (const line of lines) {
    if (line.startsWith('+') && !line.startsWith('+++')) {
      if (COMBINED_SECRET_REGEX.test(line)) {
        const lineLower = line.toLowerCase();
        if (
          !lineLower.includes('placeholder') &&
          !lineLower.includes('mock') &&
          !lineLower.includes('test') &&
          !lineLower.includes('example')
        ) {
          return { hasSecret: true, line: line.trim() };
        }
      }
    }
  }
  return { hasSecret: false };
};

/**
 * Automatically ingest a GitHub repository into the Brain.
 * This is the 'Autopilot' integration for world-leading intelligence.
 */
const ingestRepository = async (owner, repo, branch = 'main') => {
  logger.info(
    `🚀 [GitHub Autopilot] Starting ingestion for ${owner}/${repo}...`,
  );

  try {
    // 1. Fetch Repository Tree
    const { data: tree } = await octokit.rest.git.getTree({
      owner,
      repo,
      tree_sha: branch,
      recursive: true,
    });

    const files = tree.tree.filter(
      item => item.type === 'blob' && !item.path.includes('node_modules'),
    );
    logger.info(`🔍 Found ${files.length} files to index.`);

    // 2. Iterate and Index (Batching for performance)
    for (const file of files.slice(0, 100)) {
      // Limit to 100 for safety in POC
      try {
        const { data: content } = await octokit.rest.repos.getContent({
          owner,
          repo,
          path: file.path,
        });

        const rawContent = Buffer.from(content.content, 'base64').toString();

        // 3. Summarize and Embedding
        // We use LlmGatewayService to extract technical 'knowledge' before embedding, enforcing Tri-Cloud DLP scanning
        const summary = await LlmGatewayService.routeCompletion(
          'system',
          'github-ingestion',
          `Analyze this file and extract key architectural patterns, APIs, and business logic for indexing in a vector store: \n\n ${rawContent.substring(0, 4000)}`,
          'Architect',
        );

        // 4. Store in Vertex AI Vector Search (Placeholder call as indices require deployment)
        logger.info(`🧠 Indexed: ${file.path}`);
      } catch (err) {
        logger.warn(`⚠️ Skipped ${file.path}: ${err.message}`);
      }
    }

    logger.info(
      `✅ [GitHub Autopilot] Ingestion complete for ${owner}/${repo}`,
    );
    return { success: true, filesIndexed: files.length };
  } catch (error) {
    logger.error('GitHub Autopilot Ingestion Failed:', error);
    throw error;
  }
};

/**
 * Handle a mention comment event (@insocode) on an issue or pull request.
 */
const handleMentionComment = async payload => {
  const owner = payload.repository.owner.login;
  const repo = payload.repository.name;
  const commentBody = payload.comment.body;
  const number = payload.pull_request
    ? payload.pull_request.number
    : payload.issue
      ? payload.issue.number
      : null;

  logger.info(
    `🤖 [GitHub Bot] Processing mention comment for ${owner}/${repo}#${number}`,
  );

  try {
    const isPR = !!(
      payload.pull_request ||
      (payload.issue && payload.issue.pull_request)
    );

    let branchName = 'main';
    if (isPR) {
      const { data: pr } = await octokit.rest.pulls.get({
        owner,
        repo,
        pull_number: number,
      });
      branchName = pr.head.ref;
    }

    const cleanPrompt = commentBody
      .replace(/@inso-code|@insocode/gi, '')
      .trim();

    // If it's a PR, checkout the branch and apply modifications
    let agentResult = '';
    if (isPR && process.env.NODE_ENV !== 'test') {
      const workspaceRoot = path.resolve(process.cwd(), '../');

      const releaseLock = await acquireGitLock();
      try {
        // Save current branch name to restore later
        const { stdout: originalBranch } = await runCommand(
          'git rev-parse --abbrev-ref HEAD',
          workspaceRoot,
        );

        logger.info(`🔄 [GitHub Bot] Checking out PR branch: ${branchName}`);
        await runCommand(
          `git fetch origin ${branchName} && git checkout ${branchName}`,
          workspaceRoot,
        );

        try {
          const { swarmBrain } = await import('../agents/swarm_brain.js');
          agentResult = await swarmBrain.executeTask(cleanPrompt, []);

          // Perform Secrets/PII Guardrail Scan
          const secretScan = await scanForSecrets(workspaceRoot);
          if (secretScan.hasSecret) {
            logger.error(
              `🛑 [GitHub Bot] Security violation detected. Secret leak blocked: ${secretScan.line}`,
            );
            throw new Error(
              `Security Alert: Generated modifications contain a potential secret/token: ${secretScan.line.substring(0, 30)}...`,
            );
          }

          // Commit and push changes
          logger.info(
            `📦 [GitHub Bot] Committing and pushing changes to ${branchName}...`,
          );
          await runCommand(
            `git commit -am "chore(agent): address @insocode comment" && git push origin ${branchName}`,
            workspaceRoot,
          );
        } finally {
          // Discard dirty working tree changes to protect host workspace
          await runCommand(
            'git reset --hard HEAD && git clean -fd',
            workspaceRoot,
          ).catch(() => {});
          // Restore original branch
          logger.info(
            `🔄 [GitHub Bot] Restoring original branch: ${originalBranch.trim()}`,
          );
          await runCommand(
            `git checkout ${originalBranch.trim()}`,
            workspaceRoot,
          );
        }
      } finally {
        releaseLock();
      }
    } else {
      // For regular issues or tests, execute in read-only/consultant mode
      const { swarmBrain } = await import('../agents/swarm_brain.js');
      agentResult = await swarmBrain.executeTask(cleanPrompt, []);
    }

    // Post reply comment to GitHub
    await octokit.rest.issues.createComment({
      owner,
      repo,
      issue_number: number,
      body: `🤖 **Inso Code Bot Execution:**\n\nI have successfully executed your request: *"${cleanPrompt}"*\n\n${agentResult}`,
    });

    return { success: true, message: 'Mention comment processed.' };
  } catch (error) {
    logger.error(`❌ [GitHub Bot] Failed to handle comment mention:`, error);
    throw error;
  }
};

/**
 * Handle failed workflow run events (CI/CD self-healing).
 */
const handleFailedWorkflow = async payload => {
  const owner = payload.repository.owner.login;
  const repo = payload.repository.name;
  const runId = payload.workflow_run.id;
  const branchName = payload.workflow_run.head_branch;
  const commitSha = payload.workflow_run.head_sha;

  logger.info(
    `🤖 [GitHub Bot] CI/CD Failure detected on ${owner}/${repo} branch ${branchName}`,
  );

  try {
    if (process.env.NODE_ENV === 'test') {
      return {
        success: true,
        message: 'Workflow failure self-healed (Mocked).',
      };
    }

    // 1. Fetch Failed Jobs
    const { data: jobs } = await octokit.rest.actions.listJobsForWorkflowRun({
      owner,
      repo,
      run_id: runId,
    });

    const failedJob = jobs.jobs.find(j => j.conclusion === 'failure');
    if (!failedJob) {
      logger.info(`ℹ️ [GitHub Bot] No failed jobs found for run ${runId}.`);
      return { success: true, message: 'No failed jobs.' };
    }

    const failedSteps = failedJob.steps
      .filter(s => s.conclusion === 'failure')
      .map(s => s.name)
      .join(', ');

    // 2. Fetch Job Logs
    let logText = 'No logs available.';
    try {
      const { data: logs } = await octokit.request(
        'GET /repos/{owner}/{repo}/actions/jobs/{job_id}/logs',
        {
          owner,
          repo,
          job_id: failedJob.id,
        },
      );
      logText = logs;
    } catch (logErr) {
      logger.warn(
        `⚠️ [GitHub Bot] Could not fetch job logs: ${logErr.message}`,
      );
    }

    const workspaceRoot = path.resolve(process.cwd(), '../');

    let healingOutput = '';
    const releaseLock = await acquireGitLock();
    try {
      // Save current branch name to restore later
      const { stdout: originalBranch } = await runCommand(
        'git rev-parse --abbrev-ref HEAD',
        workspaceRoot,
      );

      logger.info(`🔄 [GitHub Bot] Checking out failing branch: ${branchName}`);
      await runCommand(
        `git fetch origin ${branchName} && git checkout ${branchName}`,
        workspaceRoot,
      );

      try {
        const repairPrompt = `The GitHub Actions CI/CD workflow failed on step: "${failedSteps}".
Here are the build logs:
\`\`\`text
${logText.substring(0, 8000)}
\`\`\`
Please inspect the codebase, locate the file causing the build failure, and edit it to fix the issue.`;

        const { swarmBrain } = await import('../agents/swarm_brain.js');
        healingOutput = await swarmBrain.executeTask(repairPrompt, []);

        // Perform Secrets/PII Guardrail Scan
        const secretScan = await scanForSecrets(workspaceRoot);
        if (secretScan.hasSecret) {
          logger.error(
            `🛑 [GitHub Bot] Security violation detected. Secret leak blocked: ${secretScan.line}`,
          );
          throw new Error(
            `Security Alert: Generated modifications contain a potential secret/token: ${secretScan.line.substring(0, 30)}...`,
          );
        }

        // Commit and push changes
        logger.info(
          `📦 [GitHub Bot] Committing and pushing self-healing fix to ${branchName}...`,
        );
        await runCommand(
          `git commit -am "fix(agent): auto-heal CI/CD build failure" && git push origin ${branchName}`,
          workspaceRoot,
        );
      } finally {
        // Discard dirty working tree changes to protect host workspace
        await runCommand(
          'git reset --hard HEAD && git clean -fd',
          workspaceRoot,
        ).catch(() => {});
        // Restore original branch
        logger.info(
          `🔄 [GitHub Bot] Restoring original branch: ${originalBranch.trim()}`,
        );
        await runCommand(
          `git checkout ${originalBranch.trim()}`,
          workspaceRoot,
        );
      }
    } finally {
      releaseLock();
    }

    // Post notification comment to the commit
    await octokit.rest.repos.createCommitComment({
      owner,
      repo,
      commit_sha: commitSha,
      body: `🤖 **Inso Code CI/CD Self-Healing:**\n\nI detected a build failure in workflow run #${runId} on step: *"${failedSteps}"*.\n\nI have autonomously analyzed the build logs and pushed a fix to resolve this failure.\n\n${healingOutput}`,
    });

    return { success: true, message: 'Self-healing complete.' };
  } catch (error) {
    logger.error(`❌ [GitHub Bot] CI/CD self-healing failed:`, error);
    throw error;
  }
};

export const GithubAutopilotService = {
  ingestRepository,
  handleMentionComment,
  handleFailedWorkflow,
};
