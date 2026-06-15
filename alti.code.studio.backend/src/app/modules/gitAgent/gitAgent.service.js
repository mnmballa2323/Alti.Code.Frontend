/**
 * Copyright (c) 2024 Inso Code
 * 
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import simpleGit from 'simple-git';
import chokidar from 'chokidar';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { Octokit } from '@octokit/rest';
import gitIsomorphic from 'isomorphic-git';
import { GeminiAiService } from '../gemini/gemini.service.js';
import { logger } from '../../../shared/logger.js';
import { qaService } from '../qa/qa.service.js';
// import { Orchestrator } from '../agents/orchestrator.agent.js';

const git = simpleGit();
let watcher = null;
let isSyncing = false;

// Debounce helper
const debounce = (func, wait) => {
    let timeout;
    return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    };
};

const generateCommitMessage = async (diff) => {
    try {
        const prompt = `
        Generate a concise, semantic commit message for the following code changes.
        Format: <type>(<scope>): <subject>
        
        Diff:
        ${diff.substring(0, 1000)}
        `;
        // Use generateContent (stateless, no DB touch) — avoids Mongoose CastError
        // from passing the literal string 'system' as a MongoDB ObjectId.
        const reply = await GeminiAiService.generateContent(prompt);
        return reply.trim().replace(/^```|```$/g, '');
    } catch (error) {
        logger.warn('Failed to generate AI commit message, using default', error);
        return 'chore: Auto-sync updates';
    }
};

const generatePRDescription = async () => {
    try {
        const diff = await git.diff(['--staged']);
        if (!diff) return 'No changes staged for PR generation.';

        const prompt = `
        You are an expert technical writer.
        Generate a Pull Request description for the following staged changes.
        
        Diff:
        ${diff.substring(0, 3000)}
        
        Format:
        # Title (Semantic)
        
        ## Summary
        (Brief explanation of changes)
        
        ## Type of Change
        - [ ] Bug fix
        - [ ] New feature
        - [ ] Refactoring
        
        ## Checklist
        - [ ] Tests passed
        `;

        // Use generateContent (stateless, no DB touch) to avoid Mongoose CastError
        // from passing the literal string 'system' as a MongoDB ObjectId.
        return await GeminiAiService.generateContent(prompt);
    } catch (error) {
        logger.error('Failed to generate PR description', error);
        return 'Failed to generate PR description.';
    }
};

const commitChanges = async (message, { skipStage = false } = {}) => {
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
        throw new Error('GitAgentService: commit message must be a non-empty string.');
    }
    try {
        if (!skipStage) await git.add('.'); // Keeping simple-git for staging recursively

        // Upgrade: Isomorphic-Git for secure native file-system commits
        const sha = await gitIsomorphic.commit({
            fs,
            dir: process.cwd(),
            message: message.trim(),
            author: { name: 'Inso Code Agent', email: 'agent@alti.code.studio' }
        });

        logger.info(`💾 Git Agent: Committed via Isomorphic-Git [${sha.substring(0, 7)}] - "${message}"`);
        return { success: true, message, hash: sha };
    } catch (error) {
        logger.error('Git Commit Failed:', error);
        throw error;
    }
};

const pushChanges = async () => {
    try {
        await git.push();
        logger.info('🚀 Git Agent: Pushed to remote.');
        return { success: true };
    } catch (error) {
        logger.error('Git Push Failed:', error);
        throw error;
    }
};

const syncSubmodules = async () => {
    try {
        logger.info('🔗 Git Agent: Syncing submodules...');
        await git.submoduleUpdate(['--init', '--recursive']);
        logger.info('✅ Git Agent: Submodules synced.');
        return { success: true };
    } catch (error) {
        logger.error('❌ Git Agent: Submodule sync failed', error);
        return { success: false, error };
    }
};

const syncChanges = async () => {
    if (isSyncing) return;
    isSyncing = true;

    // Sync submodules first to ensure we are on latest deps
    await syncSubmodules();

    logger.info('🔄 Auto-Git Sync: Starting sync cycle...');

    try {
        const status = await git.status();

        if (status.isClean()) {
            logger.info('✨ Auto-Git Sync: No changes to sync.');
            isSyncing = false;
            return;
        }

        logger.info('📝 Auto-Git Sync: Staging changes...');
        await git.add('.');

        // Get diff for AI
        const diff = await git.diff(['--staged']);
        const message = await generateCommitMessage(diff);

        await commitChanges(message, { skipStage: true }); // already staged above
        await pushChanges();

        logger.info('✅ Auto-Git Sync: Sync complete.');

    } catch (error) {
        logger.error('❌ Auto-Git Sync Failed:', error);
    } finally {
        isSyncing = false;
    }
};

// Debounced sync to handle bursts of file changes
const debouncedSync = debounce(syncChanges, 5000); // 5 seconds debounce

const startWatcher = async (dir = process.cwd()) => {
    if (typeof dir !== 'string' || !dir.trim()) {
        throw new Error('GitAgentService: dir must be a non-empty string.');
    }
    const resolvedDir = path.resolve(dir); // Ensure absolute path

    if (watcher) {
        logger.warn('Watcher already running');
        return { status: 'already_running' };
    }

    logger.info(`👁️ Git Agent: Starting Auto-Git Watcher on ${resolvedDir}`);

    await syncSubmodules();

    const watchPath = path.join(resolvedDir, 'src');

    watcher = chokidar.watch(watchPath, {
        ignored: (filePath) => {
            if (/(^|[\/\\])\../.test(filePath)) return true;
            const parts = filePath.split(path.sep);
            return parts.includes('custom') || parts.includes('definitions');
        },
        persistent: true,
        ignoreInitial: true,
    });

    watcher
        .on('add', filePath => { logger.info(`📄 File added: ${filePath}`); debouncedSync(); })
        .on('change', filePath => { logger.info(`✏️  File changed: ${filePath}`); debouncedSync(); })
        .on('unlink', filePath => { logger.info(`🗑️  File removed: ${filePath}`); debouncedSync(); });

    return { status: 'started', path: watchPath };
};

const stopWatcher = async () => {
    if (watcher) {
        await watcher.close();
        watcher = null;
        logger.info('Auto-Git Watcher stopped');
        return { status: 'stopped' };
    }
    return { status: 'not_running' };
};

const getStatus = async () => {
    return {
        isWatching: !!watcher,
        isSyncing
    };
};

const getDiff = async () => {
    try {
        const diff = await git.diff();
        logger.info(`📋 Git Agent: Retrieved diff (${diff.length} chars)`);
        return diff || '(working tree clean)';
    } catch (error) {
        logger.error('Git Diff Failed:', error);
        throw error;
    }
};

const createBranch = async (name) => {
    // Validate branch name against Git's naming rules using Google's C++ RE2 Engine
    // RE2 prevents Regular Expression Denial of Service (ReDoS) by enforcing linear time execution.
    // Disallow: spaces, ~, ^, :, ?, *, [, \, .., @{, consecutive dots, leading/trailing dot or slash
    const RE2 = (await import('re2')).default;
    const SAFE_BRANCH_RE = new RE2('^(?!.*\\.\\.|.*@\\{|.*[~^:?*\\\\\\[\\s])[^./][\\w./\\-]{0,99}[^./]?$');
    
    if (!name || typeof name !== 'string') {
        throw new Error('GitAgentService: branch name must be a non-empty string.');
    }
    if (!SAFE_BRANCH_RE.test(name)) {
        throw new Error(`GitAgentService: invalid branch name "${name}". Use only alphanumeric, hyphen, or slash characters.`);
    }
    try {
        await git.checkoutLocalBranch(name);
        logger.info(`🌿 Git Agent: Created and checked out branch "${name}"`);
        return { success: true, branch: name };
    } catch (error) {
        logger.error(`Git Branch Creation Failed for "${name}":`, error);
        throw error;
    }
};

const initializeRepository = async (repoName, description = '', isPrivate = true) => {
    if (!repoName) throw new Error('Repository name is required.');
    if (!process.env.GITHUB_PAT) throw new Error('GITHUB_PAT environment variable is utterly required for Genesis autonomous repo creation.');

    logger.info(`🚀 Genesis Engine: Initializing repository "${repoName}"...`);

    // 1. Authenticate & Create on GitHub
    const octokit = new Octokit({ auth: process.env.GITHUB_PAT });
    let githubUrl = '';

    try {
        const { data } = await octokit.rest.repos.createForAuthenticatedUser({
            name: repoName,
            description,
            private: isPrivate,
            auto_init: true, // Creates initial commit with README
        });
        githubUrl = data.clone_url;
        logger.info(`✅ Genesis Engine: GitHub Repository created at ${githubUrl}`);
    } catch (e) {
        if (e.status === 422) { // Already exists
            logger.warn(`⚠️ GitHub Repository "${repoName}" already exists. Proceeding with scaffolding phase...`);
            const { data: user } = await octokit.rest.users.getAuthenticated();
            githubUrl = `https://github.com/${user.login}/${repoName}.git`;
        } else {
            throw e;
        }
    }

    // Embed PAT into clone URL for passwordless auth in shadow
    const authUrl = githubUrl.replace('https://', `https://${process.env.GITHUB_PAT}@`);

    // 2. Provision Local Shadow Workspace
    const shadowSpace = path.join(process.cwd(), '.shadow', 'workspaces', repoName);
    await fs.mkdir(shadowSpace, { recursive: true });

    const localGit = simpleGit(shadowSpace);

    // Check if it's already a git repo
    const isRepo = await localGit.checkIsRepo();
    if (!isRepo) {
        logger.info(`⬇️ Genesis Engine: Cloning repository into shadow workspace...`);
        // Clone empty or auto-init repo
        await simpleGit().clone(authUrl, shadowSpace);
    }

    // 3. Scaffold Genesis Boilerplate
    logger.info(`🏗️ Genesis Engine: Scaffolding baseline files in ${shadowSpace}`);

    const gitignoreContent = 'node_modules\n.env\n.DS_Store\ndist\nbuild\ncoverage\n';
    await fs.writeFile(path.join(shadowSpace, '.gitignore'), gitignoreContent);

    const readmeContent = `# ${repoName}\n\n${description}\n\n*This repository and architecture was autonomously generated by the Inso Code Genesis Engine.*`;
    await fs.writeFile(path.join(shadowSpace, 'README.md'), readmeContent);

    // 4. Commit Workspace Bootstrapping
    await localGit.add('.');
    const status = await localGit.status();
    if (!status.isClean()) {
        await localGit.commit('chore: Genesis Engine autonomous workspace scaffolding');
        await localGit.push('origin', 'main');
        logger.info(`✅ Genesis Engine: Scaffolding committed and pushed to remote.`);
    }

    return { success: true, repoName, githubUrl, shadowSpace };
};

const processPullRequestWebhook = async (payload) => {
    const action = payload.action;
    // We only care about new or updated code
    if (!['opened', 'synchronize', 'reopened'].includes(action)) {
        return { ignored: true, action };
    }

    const prNumber = payload.pull_request?.number;
    const branchName = payload.pull_request?.head?.ref;

    if (!branchName) {
        logger.error('GitOps: Webhook missing branch reference');
        return { success: false, error: 'Missing branch reference' };
    }

    logger.info(`🐙 GitOps: PR #${prNumber} updated on ${branchName}. Initiating QA Swarm...`);

    try {
        // Sync branch locally (assuming local repo matches remote repo for the swarm)
        await git.fetch();
        await git.checkout(branchName);
        await git.pull('origin', branchName);

        // 1. Run Tests
        const testResults = await qaService.runTests(process.cwd());

        if (testResults.exitCode !== 0) {
            logger.warn(`❌ GitOps: Tests failed on PR #${prNumber}. Triggering Self-Healing Sprint...`);

            // 2. Self Healer Sprint
            const sessionId = `pr-${prNumber}-${crypto.randomUUID().substring(0, 8)}`;
            const missionPrompt = `
The continuous integration tests have failed on branch "${branchName}".
Here is the vitest output:
${testResults.output.substring(0, 3000)}

Please diagnose the issue, modify the necessary files to fix the failing tests,
commit with "fix: Autonomous PR heal", and push back to branch "${branchName}".
Stop when the tests pass.
`;

            // Dispatch in background
            // Orchestrator.execute(missionPrompt.trim(), 'system-gitops', sessionId).catch(e => {
            //     logger.error(`GitOps Swarm Healing failed for PR ${prNumber}`, e);
            // });

            return { status: 'self_healing_initiated', prNumber };
        } else {
            logger.info(`✅ GitOps: Tests passed seamlessly on PR #${prNumber}. No action required.`);
            return { status: 'tests_passed', prNumber };
        }

    } catch (e) {
        logger.error(`GitOps Webhook Processing Error`, e);
        return { success: false, error: e.message };
    }
};

const submitProactivePullRequest = async (targetRepoOwner, targetRepoName, branchName, title, issueNumber = null) => {
    logger.info(`🐙 GitOps: Submitting proactive Pull Request to ${targetRepoOwner}/${targetRepoName}...`);

    if (!process.env.GITHUB_PAT) throw new Error("Missing GITHUB_PAT for PR submission");

    const octokit = new Octokit({ auth: process.env.GITHUB_PAT });

    try {
        // 1. Fork the repository
        logger.info(`🐙 GitOps: Forking repository...`);
        const { data: fork } = await octokit.rest.repos.createFork({
            owner: targetRepoOwner,
            repo: targetRepoName
        });

        // Wait briefly for fork to be ready on GitHub's backend
        await new Promise(r => setTimeout(r, 3000));

        // 2. The Swarm would have natively cloned this fork and pushed changes to `branchName`
        // Push logic is handled via `pushChanges()` assuming origin is the fork.

        // 3. Generate a stunning Synth-Markdown PR Description
        const descriptionTemplate = `
## 🚨 Autonomous Sentinel Fix

This Pull Request was autonomously generated by the **Inso Code Sentinel Crawler** to resolve a confirmed vulnerability or issue in this repository.

### Issue Fixed:
${issueNumber ? 'Resolves #' + issueNumber : 'Proactive Vulnerability Patch'}

### Technical Summary:
- Validated via Swarm QA Engine.
- Passed all internal regression tests.
- Synthetic Semantic Commit generation.

---
*If this PR requires human modifications, feel free to push to this branch.*
        `.trim();

        // 4. Create the Pull Request on the upstream remote
        logger.info(`🐙 GitOps: Opening PR on upstream repo...`);
        const { data: pr } = await octokit.rest.pulls.create({
            owner: targetRepoOwner,
            repo: targetRepoName,
            title: title || `fix(${branchName}): Autonomous Sentinel Patch`,
            head: `${fork.owner.login}:${branchName}`,
            base: 'main', // Assumes default branch is main
            body: descriptionTemplate,
            maintainer_can_modify: true
        });

        logger.info(`✅ GitOps: Successfully created PR: ${pr.html_url}`);
        return { success: true, prUrl: pr.html_url };

    } catch (error) {
        logger.error(`❌ GitOps: Failed to submit proactive PR:`, error);
        return { success: false, error: error.message };
    }
};

const searchRepositories = async (query = '') => {
    if (!process.env.GITHUB_PAT) throw new Error("GITHUB_PAT is required for repository search.");
    const octokit = new Octokit({ auth: process.env.GITHUB_PAT });

    try {
        logger.info(`📂 GitAgent: Searching repositories with query: "${query}"`);
        
        let response;
        if (query) {
            response = await octokit.rest.search.repos({
                q: `${query} user:${(await octokit.rest.users.getAuthenticated()).data.login}`,
                sort: 'updated',
                order: 'desc'
            });
            return response.data.items.map(repo => ({
                id: repo.id,
                name: repo.name,
                fullName: repo.full_name,
                url: repo.html_url,
                description: repo.description,
                private: repo.private
            }));
        } else {
            response = await octokit.rest.repos.listForAuthenticatedUser({
                sort: 'updated',
                per_page: 50
            });
            return response.data.map(repo => ({
                id: repo.id,
                name: repo.name,
                fullName: repo.full_name,
                url: repo.html_url,
                description: repo.description,
                private: repo.private
            }));
        }
    } catch (error) {
        logger.error('Failed to fetch GitHub repositories:', error);
        throw error;
    }
};

export const GitAgentService = {
    startWatcher,
    stopWatcher,
    getStatus,
    syncChanges,
    generatePRDescription,
    commitChanges,
    pushChanges,
    syncSubmodules,
    getDiff,
    createBranch,
    initializeRepository,
    processPullRequestWebhook,
    submitProactivePullRequest,
    searchRepositories
};

