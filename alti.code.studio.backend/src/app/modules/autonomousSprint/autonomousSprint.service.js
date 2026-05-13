/**
 * Autonomous Sprint Service — v6.2.0 Closed-Loop Autonomous Validation
 *
 * Sprint loop (extended from v6.0.0):
 *   1. PLAN        → Break goal into structured steps (Gemini)
 *   2. GUARDIAN    → Safety review before any writes
 *   3. BRANCH      → Create isolated git branch
 *   4. EXECUTE × N → Run each step via capability router / specialist agents
 *       ↓ after each step:
 *       4a. SANDBOX  → Execute generated code in Node vm (catch runtime errors)
 *       4b. AUTO-TEST→ qaService.generateSpec() + runTests() on changed files
 *       4c. SELF-HEAL→ If tests fail: feed failure to LLM, patch, re-run (≤3 retries)
 *   5. TEST-GATE   → Block DEPLOY if any file still has failing tests
 *   6. REVIEW      → LLM code review against goal
 *   7. AUTO-DEPLOY → git commit + push (only if test gate passed)
 *   8. AUTO-DOC    → docGenService regenerates relevant README/ADR files
 *   9. MEMORY      → Persist sprint outcome to vector store for future sprints
 *
 * v6.2.0 new imports: sandbox.service, qa.service, surfer.agent, doc_gen.service
 */

import { logger } from '../../../shared/logger.js';
import { GeminiAiService } from '../gemini/gemini.service.js';
import { capabilityRouter } from '../agents/capability.router.js';
import { neuralRouterService } from '../agents/neural.router.js';
import { legalAgent } from '../agents/legal.agent.js';
import { GitAgentService } from '../gitAgent/gitAgent.service.js';
import { codeReviewAgent } from '../agents/code_review.agent.js';
import { guardianAgent } from '../agents/guardian.agent.js';
import { vectorStoreService } from '../memory/vector.store.js';
import { memoryPalaceService } from '../memory/memory_palace.service.js';
import { ragService } from '../memory/rag.service.js';
import { qaService } from '../qa/qa.service.js';
import { execute as sandboxExecute } from '../shadowWorkspace/sandbox.service.js';
import { surferAgent } from '../agents/surfer.agent.js';
import { docGenService } from '../docs/doc_gen.service.js';
import { knowledgeAgent } from '../agents/knowledge.agent.js';
import { finopsAgent } from '../agents/finops.agent.js';
import { syntheticUserAgent } from '../agents/syntheticUser.agent.js';
import { deploymentAgent } from '../agents/deployment.agent.js';
import { performanceAuditorService } from './performanceAuditor.service.js';
import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import EventEmitter from 'events';

export const sprintBus = new EventEmitter();

/** Max self-heal retries per file before declaring a flappy test */
const MAX_HEAL_RETRIES = 3;
/** Max steps per sprint */
const MAX_STEPS = 20;

export class AutonomousSprintService {
    constructor() {
        this.name = 'AutonomousSprintService';
        this.activeSprints = new Map();
        this.DEFAULT_MAX_COST_USD = 5.0;
        this.MAX_STEPS = MAX_STEPS;
        logger.info('🏃 AutonomousSprintService v6.2.0: Closed-Loop Autonomous Validation initialized.');
    }

    // ─────────────────────────────────────────────────────────────────────────
    // PUBLIC: launchSprint
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Launch a fully autonomous, self-validating sprint.
     * @param {string} goal
     * @param {object} [opts]
     * @param {string}  [opts.repoPath]     — absolute path (defaults to CWD)
     * @param {number}  [opts.maxCostUsd]   — halt if cost exceeds (default $5)
     * @param {boolean} [opts.autoDeploy]   — commit + push on passing tests
     * @param {string}  [opts.branchPrefix] — e.g. 'sprint' → branch sprint/abc123
     * @param {boolean} [opts.skipTests]    — bypass test gate (for non-code tasks)
     * @param {boolean} [opts.autoDoc]      — regenerate docs after deploy
     * @returns {Promise<SprintResult>}
     */
    async launchSprint(goal, opts = {}) {
        if (!goal?.trim()) throw new Error('AutonomousSprintService: goal must be a non-empty string.');

        const {
            repoPath = process.cwd(),
            maxCostUsd = this.DEFAULT_MAX_COST_USD,
            autoDeploy = true,
            branchPrefix = 'sprint',
            skipTests = false,
            autoDoc = true,
        } = opts;

        const sprintId = crypto.randomUUID().slice(0, 8);
        const branchName = `${branchPrefix}/${sprintId}`;
        const startTime = Date.now();
        let totalCostUsd = 0;
        const steps = [];
        const writtenFiles = new Set(); // track files written for targeted test gen
        let testGatePassed = true;

        const sprintState = { sprintId, goal, status: 'running', steps, branchName, startTime };
        this.activeSprints.set(sprintId, sprintState);

        this._emit('sprint:started', { sprintId, goal, branchName });
        logger.info(`🏃 Sprint [${sprintId}]: Started — "${goal.substring(0, 80)}"`);

        try {
            // ── Phase 1: PLAN ────────────────────────────────────────────────
            this._emit('sprint:phase', { sprintId, phase: 'PLAN' });

            // Phase 5: Just-In-Time Enterprise Memory RAG Lookup
            logger.info(`🧠 Sprint [${sprintId}]: Consulting Enterprise Memory for context...`);
            const ragContext = await ragService.query(`Architectural guidelines and past lessons for: ${goal}`, 3);

            // #6: Gemini File Search — Indexed Document Context for Sprint Planning
            let fileSearchContext = '';
            try {
                const { fileSearchService } = await import('../fileSearch/fileSearch.service.js');
                const stores = await fileSearchService.listStores();
                if (stores && stores.length > 0) {
                    const storeNames = stores.slice(0, 5).map(s => s.name);
                    const fsResult = await Promise.race([
                        fileSearchService.query(goal, storeNames),
                        new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 10000))
                    ]);
                    if (fsResult && fsResult.text) {
                        fileSearchContext = `\n[GEMINI FILE SEARCH — INDEXED DOCUMENTS]\n${fsResult.text.substring(0, 3000)}`;
                        if (fsResult.citations && fsResult.citations.length > 0) {
                            fileSearchContext += '\n\nDocument Citations:\n';
                            for (const c of fsResult.citations.slice(0, 10)) {
                                fileSearchContext += `• ${c.title || 'Unknown'}${c.pageNumber ? ` (p.${c.pageNumber})` : ''}\n`;
                            }
                        }
                        logger.info(`📚 Sprint [${sprintId}]: File Search injected ${fileSearchContext.length} chars into sprint planning.`);
                    }
                }
            } catch (e) {
                logger.warn(`⚠️ Sprint [${sprintId}]: File Search context failed (non-blocking): ${e.message}`);
            }

            // Phase 24: Enterprise Knowledge Digestion (Jira/Confluence)
            let jiraContext = '';
            const jiraMatch = goal.match(/[A-Z]+-[0-9]+/); // e.g. "Fix ENG-1234"
            if (jiraMatch) {
                jiraContext = await knowledgeAgent.extractTicketContext(jiraMatch[0]);
            }

            // Phase 25: The Omniscient FinOps (Pre-Sprint Architecture Arbitration)
            let finopsContext = '';
            if (goal.toLowerCase().match(/cost|arbitrage|carbon|green software|cheapest cloud/)) {
                logger.info(`💸 Sprint [${sprintId}]: Omniscient FinOps engaged. Evaluating arbitrage and carbon footprint...`);
                this._emit('sprint:phase', { sprintId, phase: 'FINOPS_ARBITRAGE' });
                const finopsData = await finopsAgent.execute('arbitrage', { query: goal });
                finopsContext = `\n[FINOPS AUTONOMOUS DIRECTIVE]:\n${finopsData.recommendation}\n*The Swarm MUST restructure the Terraform/deployment plan to adhere to these financial and environmental constraints.*`;
            }

            // Phase 26: The Synthetic Demographics (Pre-Sprint UX Triage)
            let uxContext = '';
            if (goal.toLowerCase().match(/ux research|accessibility|synthetic user|persona|usability/)) {
                logger.info(`🤖 Sprint [${sprintId}]: Synthetic Demographics engaged. Spawning phantom users to discover UX defects...`);
                this._emit('sprint:phase', { sprintId, phase: 'UX_RESEARCH' });
                const uxData = await syntheticUserAgent.execute('simulate', { query: goal });
                uxContext = `\n[SYNTHETIC USER UX FEEDBACK]:\n${uxData.feedback}\n*The Swarm MUST refactor the frontend codebase to fix these specific heuristic UX errors.*`;
            }

            const combinedContext = `${ragContext}\n\n${fileSearchContext}\n\n${jiraContext}\n\n${finopsContext}\n\n${uxContext}`;

            const plan = await this._generatePlan(goal, combinedContext);
            sprintState.plan = plan;
            this._emit('sprint:plan', { sprintId, plan });

            // ── Phase 2: GUARDIAN ────────────────────────────────────────────
            this._emit('sprint:phase', { sprintId, phase: 'GUARDIAN' });
            const guardianResult = await guardianAgent.interceptExecution(JSON.stringify(plan), 'SPRINT_PLAN');
            if (!guardianResult.isSafeToExecute) {
                sprintState.status = 'vetoed';
                this._emit('sprint:vetoed', { sprintId, reason: guardianResult.vetoReason });
                return this._finalize(sprintId, sprintState, steps, totalCostUsd);
            }

            // Phase 33: The Auditor (Performance Plan Check)
            this._emit('sprint:phase', { sprintId, phase: 'PERFORMANCE_AUDIT' });
            logger.info(`🔍 Sprint [${sprintId}]: The Auditor checking plan AST complexity...`);
            const auditResult = await performanceAuditorService.auditPlan(plan);
            if (!auditResult.isOptimized) {
                sprintState.status = 'audit_failed';
                this._emit('sprint:audit_failed', { sprintId, reason: auditResult.reason });
                logger.warn(`🛑 Sprint [${sprintId}]: AUDIT FAILED — ${auditResult.reason}`);

                // Inject an optimization step before the execution loops
                plan.steps.unshift({
                    action: 'implement',
                    description: `[PERFORMANCE HOTFIX]: ${auditResult.reason} - Apply Big-O optimizations before continuing.`,
                    agentHint: 'capability_router',
                    query: `Optimize the following architectural plan: ${auditResult.reason}`,
                    expectedOutput: 'Optimized architecture'
                });
            }

            this._emit('sprint:phase', { sprintId, phase: 'GUARDIAN_APPROVED' });

            // ── Phase 3: BRANCH ──────────────────────────────────────────────
            if (autoDeploy) {
                try {
                    await GitAgentService.createBranch(branchName);
                    this._emit('sprint:branch', { sprintId, branchName });
                } catch (e) {
                    logger.warn(`🏃 Sprint [${sprintId}]: Branch creation failed (${e.message}) — continuing on current branch.`);
                }
            }

            // ── Phase 4: EXECUTE + SANDBOX + AUTO-TEST + SELF-HEAL loop ──────
            this._emit('sprint:phase', { sprintId, phase: 'EXECUTE' });
            for (let i = 0; i < Math.min(plan.steps.length, this.MAX_STEPS); i++) {
                const step = plan.steps[i];

                // Cost budget check
                if (totalCostUsd >= maxCostUsd) {
                    logger.warn(`💸 Sprint [${sprintId}]: Cost $${totalCostUsd.toFixed(3)} ≥ budget $${maxCostUsd}. Halting.`);
                    sprintState.status = 'budget_exceeded';
                    this._emit('sprint:halted', { sprintId, reason: 'cost_budget_exceeded', totalCostUsd });
                    break;
                }

                // Cancelled check
                if (sprintState.status === 'cancelled') break;

                this._emit('sprint:step:start', { sprintId, stepIndex: i, step });

                // 4a. Execute step
                const stepResult = await this._executeStep(step, sprintId, i, repoPath);
                steps.push(stepResult);
                totalCostUsd += stepResult.estimatedCostUsd ?? 0;

                // Track any files written by this step
                if (stepResult.writtenFiles?.length) {
                    stepResult.writtenFiles.forEach(f => writtenFiles.add(f));
                }

                // 4b. Sandbox smoke-test (skip for non-file steps)
                if (stepResult.codeSnippet && !skipTests) {
                    // Phase 33: The Auditor (Predictive AST-Level Performance Auditing)
                    this._emit('sprint:phase', { sprintId, phase: 'PERFORMANCE_AUDIT' });
                    logger.info(`🔍 Sprint [${sprintId}] Step ${i}: The Auditor checking AST complexity...`);
                    const astAuditResult = await performanceAuditorService.auditAST(stepResult.codeSnippet);
                    if (!astAuditResult.isOptimized) {
                        logger.warn(`🛑 Sprint [${sprintId}] Step ${i}: AUDIT FAILED — ${astAuditResult.reason}`);
                        stepResult.status = 'failed';
                        stepResult.error = `Performance Audit Failed: ${astAuditResult.reason}`;
                        sprintState.status = 'audit_failed';
                        break; // Halt execution early due to AST Big-O/memory leak failure
                    }

                    const sandboxResult = await this._runSandbox(stepResult.codeSnippet, sprintId, i);
                    stepResult.sandboxResult = sandboxResult;
                    this._emit('sprint:sandbox', { sprintId, stepIndex: i, sandboxResult });
                }

                this._emit('sprint:step:done', { sprintId, stepIndex: i, result: stepResult });

                // Persist step to vector memory for cross-step context
                await vectorStoreService.add(
                    `Sprint ${sprintId} Step ${i}: ${step.description}\nResult: ${String(stepResult.output).substring(0, 500)}`,
                    { sprintId, stepIndex: i, type: 'sprint_step' }
                ).catch(() => { });
            }

            // 4c. AUTO-TEST on all written files (after all execute steps)
            let testResults = null;
            if (!skipTests && writtenFiles.size > 0) {
                this._emit('sprint:phase', { sprintId, phase: 'AUTO_TEST' });
                const { passed, results, healLog } = await this._autoTestAndHeal(
                    [...writtenFiles], sprintId, repoPath, goal
                );
                testGatePassed = passed;
                testResults = { passed, results, healLog };
                sprintState.testResults = testResults;
                this._emit('sprint:tests', { sprintId, passed, results, healLog });
            }

            // Phase 31: The Legal Oracle (IP & Compliance Gate)
            if (!skipTests && testGatePassed) {
                this._emit('sprint:phase', { sprintId, phase: 'LEGAL_AUDIT' });
                logger.info(`⚖️ Sprint [${sprintId}]: Legal Oracle auditing dependencies for Copyleft contamination...`);
                const legalResult = await legalAgent.execute('audit_license', { repoPath });
                if (!legalResult.isSafeToDeploy) {
                    logger.warn(`🛑 Sprint [${sprintId}]: LEGAL GATE FAILED — blocking deploy due to Open-Source License Risk.`);
                    testGatePassed = false;
                    sprintState.status = 'legal_gate_failed';
                    sprintState.legalRisk = legalResult.riskAssessment;
                }
            }

            // ── Phase 5: TEST GATE ────────────────────────────────────────────
            if (!skipTests && !testGatePassed) {
                logger.warn(`🚦 Sprint [${sprintId}]: TEST/LEGAL GATE FAILED — blocking deploy.`);
                sprintState.status = sprintState.status === 'running' ? 'test_gate_failed' : sprintState.status;
                this._emit('sprint:phase', { sprintId, phase: 'GATE_FAILED' });
                // Still do review and memory — just no deploy
            } else {
                this._emit('sprint:phase', { sprintId, phase: 'TEST_GATE_PASSED' });
            }

            // ── Phase 6: REVIEW ───────────────────────────────────────────────
            this._emit('sprint:phase', { sprintId, phase: 'REVIEW' });
            const reviewResult = await this._reviewSprint(sprintId, goal, steps);
            sprintState.review = reviewResult;
            this._emit('sprint:review', { sprintId, review: reviewResult });

            // ── Phase 7: AUTO-DEPLOY (guard: test gate must pass) ─────────────
            if (autoDeploy && (testGatePassed || skipTests) && sprintState.status === 'running') {
                this._emit('sprint:phase', { sprintId, phase: 'DEPLOY' });
                try {
                    const commitMsg = `feat(sprint-${sprintId}): ${goal.substring(0, 72)}\n\n[autonomous-sprint] tests: ${testGatePassed ? 'PASS' : 'SKIP'}`;
                    await GitAgentService.syncChanges();
                    this._emit('sprint:deployed', { sprintId, branchName, commitMsg });
                } catch (e) {
                    logger.warn(`🏃 Sprint [${sprintId}]: Deploy (git sync) failed — ${e.message}`);
                    this._emit('sprint:deploy_failed', { sprintId, error: e.message });
                }
            }

            // ── Phase 8: AUTO-DOC ─────────────────────────────────────────────
            if (autoDoc && (testGatePassed || skipTests)) {
                this._emit('sprint:phase', { sprintId, phase: 'AUTO_DOC' });
                try {
                    await this._autoDoc(sprintId, goal, [...writtenFiles], repoPath);
                    this._emit('sprint:doc_updated', { sprintId });
                } catch (e) {
                    logger.warn(`🏃 Sprint [${sprintId}]: Auto-doc failed — ${e.message}`);
                }
            }

            // ── Phase 9: SPRINT MEMORY ────────────────────────────────────────
            sprintState.status = sprintState.status === 'running'
                ? (testGatePassed ? 'completed' : 'completed_with_test_failures')
                : sprintState.status;
            sprintState.totalCostUsd = totalCostUsd;
            sprintState.durationMs = Date.now() - startTime;

            await this._persistSprintMemory(sprintId, goal, sprintState, steps, testResults);

            // Phase 24: Cross-Platform Slack/Jira Broadcasting
            if (sprintState.status === 'completed') {
                const jiraTicket = goal.match(/[A-Z]+-[0-9]+/)?.[0];
                if (jiraTicket) await knowledgeAgent.markJiraTicketDone(jiraTicket);

                await knowledgeAgent.broadcastToSlack(
                    process.env.SLACK_DEV_CHANNEL || 'C12345678',
                    `🚀 *Autonomous Sprint Complete* [${sprintId}]\n*Goal*: ${goal}\n*Cost*: $${totalCostUsd.toFixed(3)}\n*Tests*: ${testGatePassed ? 'PASS ✅' : 'FAIL ❌'}`
                );

                // Phase 30: Biomimetic Neural Backpropagation
                // Reinforce the neural network weights for the agents that solved this sprint based on the review score
                const reviewScore = reviewResult?.score ?? 50;
                for (const step of steps) {
                    if (step.neuralPathwayId) {
                        try {
                            await neuralRouterService.backpropagate(step.neuralPathwayId, reviewScore);
                        } catch (e) {
                            logger.warn(`Neural backprop failed for ${step.neuralPathwayId}: ${e.message}`);
                        }
                    }
                }
            }

            this._emit('sprint:completed', {
                sprintId, status: sprintState.status, totalCostUsd,
                durationMs: sprintState.durationMs, testGatePassed,
                filesWritten: writtenFiles.size,
            });

            logger.info(`✅ Sprint [${sprintId}]: ${sprintState.status} in ${sprintState.durationMs}ms — $${totalCostUsd.toFixed(4)} | tests: ${testGatePassed ? '✅' : '❌'}`);
            return this._finalize(sprintId, sprintState, steps, totalCostUsd, branchName, reviewResult, testResults);

        } catch (error) {
            sprintState.status = 'failed';
            sprintState.error = error.message;
            this._emit('sprint:failed', { sprintId, error: error.message });
            logger.error(`❌ Sprint [${sprintId}]: FAILED —`, error.message);
            throw error;
        } finally {
            this.activeSprints.delete(sprintId);
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // INTERNAL — Plan
    // ─────────────────────────────────────────────────────────────────────────

    async _generatePlan(goal, ragContext = '') {
        const prompt = `You are an autonomous software engineering planner. Break this goal into an ordered sequence of executable steps.

Goal: "${goal}"

Enterprise Memory Context (ADRs & Past Guidelines):
---
${ragContext}
---

Rules:
- Strictly adhere to the Enterprise Memory Context provided above.
- Each step is ATOMIC and EXECUTABLE by a single AI agent.
- agentHint: capability_router | git | code_review | file_write | test_run
- MAX 10 steps. Combine related work.
- Return ONLY valid JSON (no markdown).

Shape:
{
  "goal": "${goal}",
  "estimatedSteps": 5,
  "steps": [
    { "action": "implement", "description": "...", "agentHint": "capability_router", "query": "...", "expectedOutput": "..." }
  ]
}`.trim();

        const raw = await GeminiAiService.generateContent(prompt);
        const cleaned = raw.replace(/^```json?\n?/m, '').replace(/\n?```$/m, '').trim();
        try { return JSON.parse(cleaned); }
        catch {
            return { goal, estimatedSteps: 1, steps: [{ action: 'implement', description: goal, agentHint: 'capability_router', query: goal, expectedOutput: 'Goal achieved' }] };
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // INTERNAL — Execute Step
    // ─────────────────────────────────────────────────────────────────────────

    async _executeStep(step, sprintId, stepIndex, repoPath) {
        const startMs = Date.now();
        try {
            let output = '';
            let codeSnippet = null;
            let writtenFiles = [];

            if (step.agentHint === 'git') {
                const diff = await GitAgentService.getDiff().catch(() => '');
                output = `Git status: ${diff.length} chars of changes`;

            } else if (step.agentHint === 'code_review') {
                output = await codeReviewAgent.consult(step.query || step.description);

            } else if (step.agentHint === 'test_run') {
                const runResult = await qaService.runTests(repoPath, { coverage: false });
                output = `Tests: ${runResult.passed} passed, ${runResult.failed} failed (exit: ${runResult.exitCode})`;

            } else {
                // Phase 30: neuralRouter handles all domain-specific queries utilizing reinforcement weights
                const routeCtx = {};
                const routeResult = await neuralRouterService.route(step.query || step.description, routeCtx);
                output = routeResult?.result || routeResult?.response || JSON.stringify(routeResult);

                // If the agent wrote a code file, extract the snippet for sandbox smoke-test
                if (routeResult?.code || routeResult?.content) {
                    codeSnippet = routeResult.code || routeResult.content;
                }
                if (routeResult?.filePath) {
                    writtenFiles.push(routeResult.filePath);
                }
            }

            return {
                stepIndex,
                description: step.description,
                status: 'success',
                output: String(output).substring(0, 2000),
                codeSnippet,
                writtenFiles,
                neuralPathwayId: routeCtx._neuralPathway, // pass back to core
                durationMs: Date.now() - startMs,
                estimatedCostUsd: 0.001,
            };

        } catch (error) {
            logger.error(`❌ Sprint [${sprintId}] Step ${stepIndex} failed:`, error.message);
            return {
                stepIndex, description: step.description, status: 'failed',
                error: error.message, writtenFiles: [], durationMs: Date.now() - startMs, estimatedCostUsd: 0,
            };
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // INTERNAL — Sandbox Smoke Test
    // ─────────────────────────────────────────────────────────────────────────

    async _runSandbox(codeSnippet, sprintId, stepIndex) {
        try {
            logger.info(`🧪 Sprint [${sprintId}] Step ${stepIndex}: Running sandbox smoke-test…`);
            const result = await sandboxExecute(codeSnippet, { exports: {} });
            return { passed: true, result: String(result).substring(0, 200) };
        } catch (err) {
            logger.warn(`🧪 Sprint [${sprintId}] Step ${stepIndex}: Sandbox error — ${err.message}`);
            return { passed: false, error: err.message };
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // INTERNAL — Auto-Test + Self-Heal Loop
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * For each written file:
     *   1. Generate a spec (if none exists)
     *   2. Run vitest on that spec
     *   3. If failing: ask LLM for a fix patch (up to MAX_HEAL_RETRIES)
     *      3a. Surfer assists: look up unknown API/error on live web
     *      3b. LLM patches the source file
     *      3c. Re-run tests
     *   4. If still failing after retries: mark as flappy, continue
     *
     * @returns {{ passed: boolean, results: object[], healLog: object[] }}
     */
    async _autoTestAndHeal(filePaths, sprintId, repoPath, goal) {
        const results = [];
        const healLog = [];
        let allPassed = true;

        for (const filePath of filePaths) {
            if (!filePath || !(await this._fileExists(filePath))) continue;

            logger.info(`🧪 Sprint [${sprintId}]: Auto-testing ${path.basename(filePath)}`);
            this._emit('sprint:auto_test', { sprintId, file: filePath, stage: 'generate_spec' });

            // 1. Generate spec
            const specResult = await qaService.generateSpec(filePath).catch(e => ({ success: false, error: e.message }));
            if (!specResult.success) {
                logger.warn(`🧪 Sprint: spec gen failed for ${filePath}: ${specResult.error}`);
                results.push({ file: filePath, specGenerated: false, passed: false });
                allPassed = false;
                continue;
            }

            // 2. Run tests
            let runResult = await qaService.runTests(path.dirname(filePath), {
                coverage: false,
                filter: path.basename(specResult.testFile || filePath),
            });

            let passed = runResult.exitCode === 0;
            let retries = 0;

            // 3. Self-heal loop
            while (!passed && retries < MAX_HEAL_RETRIES) {
                retries++;
                logger.info(`🔧 Sprint [${sprintId}]: Self-heal attempt ${retries}/${MAX_HEAL_RETRIES} for ${path.basename(filePath)}`);
                this._emit('sprint:heal', { sprintId, file: filePath, attempt: retries, error: runResult.output?.substring(0, 300) });

                // 3a. Surfer assist: look up the test failure on the web
                let webInsight = '';
                try {
                    const surferReport = await surferAgent.surfWeb(
                        `vitest test failure: ${runResult.output?.substring(0, 200)} in ${path.basename(filePath)}`
                    );
                    webInsight = surferReport.synthesizedSolution || '';
                } catch { /* surfer failure is non-blocking */ }

                // 3b. Ask LLM to patch the source file based on test failure + web insight
                let sourceCode = '';
                try { sourceCode = await fs.readFile(filePath, 'utf-8'); } catch { break; }

                const patchPrompt = `You are an autonomous self-healing engineer.

File: ${filePath}
Failing test output:
${runResult.output?.substring(0, 1000)}

Web intelligence found:
${webInsight}

Original source code:
\`\`\`
${sourceCode.substring(0, 4000)}
\`\`\`

Sprint goal: ${goal}

Provide a FIXED version of this file that will make the failing tests pass.
Return ONLY the complete fixed source code. No markdown fences.`.trim();

                let patchedCode = '';
                try {
                    patchedCode = await GeminiAiService.generateContent(patchPrompt);
                    patchedCode = patchedCode.replace(/^```[a-z]*\n?/m, '').replace(/\n?```$/m, '').trim();
                } catch (e) {
                    logger.error(`Sprint self-heal LLM call failed: ${e.message}`);
                    break;
                }

                if (!patchedCode || patchedCode.length < 10) break;

                // 3c. Write patched file + re-run tests
                try {
                    await fs.writeFile(filePath, patchedCode);
                } catch (e) { logger.error(`Sprint self-heal write failed: ${e.message}`); break; }

                runResult = await qaService.runTests(path.dirname(filePath), {
                    coverage: false,
                    filter: path.basename(specResult.testFile || filePath),
                });
                passed = runResult.exitCode === 0;

                healLog.push({
                    file: filePath, attempt: retries, passed,
                    webInsight: webInsight.substring(0, 200),
                });
            }

            if (!passed) allPassed = false;

            results.push({
                file: filePath,
                specGenerated: true,
                testFile: specResult.testFile,
                passed,
                retries,
                finalExitCode: runResult.exitCode,
            });
        }

        return { passed: allPassed, results, healLog };
    }

    // ─────────────────────────────────────────────────────────────────────────
    // INTERNAL — Post-Sprint LLM Review
    // ─────────────────────────────────────────────────────────────────────────

    async _reviewSprint(sprintId, goal, steps) {
        const summary = steps.map((s, i) => `Step ${i}: [${s.status}] ${s.description}`).join('\n');
        const prompt = `You are a senior engineering reviewer. Evaluate whether this sprint achieved its goal.

Goal: "${goal}"
Steps:
${summary}

Return JSON: { "passed": boolean, "score": 0-100, "summary": "...", "improvements": ["..."] }
Only valid JSON, no markdown.`.trim();

        try {
            const raw = await GeminiAiService.generateContent(prompt);
            return JSON.parse(raw.replace(/^```json?\n?/m, '').replace(/\n?```$/m, '').trim());
        } catch {
            return { passed: steps.every(s => s.status === 'success'), score: 70, summary: 'Sprint completed.', improvements: [] };
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // INTERNAL — Auto-Doc
    // ─────────────────────────────────────────────────────────────────────────

    async _autoDoc(sprintId, goal, writtenFiles, repoPath) {
        logger.info(`📝 Sprint [${sprintId}]: Auto-doc — regenerating docs for ${writtenFiles.length} changed files`);
        try {
            if (writtenFiles.length > 0) {
                await docGenService.generateForFiles(writtenFiles, { reason: `Autonomous Sprint ${sprintId}: ${goal}` });
            } else {
                await docGenService.generateOverview(repoPath, goal).catch(() => { });
            }
        } catch (e) {
            logger.warn(`Sprint [${sprintId}]: docGenService.generateForFiles not available — ${e.message}`);
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // INTERNAL — Sprint Memory Persistence
    // ─────────────────────────────────────────────────────────────────────────

    async _persistSprintMemory(sprintId, goal, sprintState, steps, testResults) {
        const memText = `
Sprint ${sprintId} — Goal: ${goal}
Status: ${sprintState.status}
Duration: ${sprintState.durationMs}ms | Cost: $${sprintState.totalCostUsd?.toFixed(4)}
Steps: ${steps.length} (${steps.filter(s => s.status === 'success').length} success, ${steps.filter(s => s.status === 'failed').length} failed)
Tests: ${testResults ? `${testResults.passed ? 'PASSED' : 'FAILED'} (${testResults.results?.length} files)` : 'skipped'}
Self-heals: ${testResults?.healLog?.length ?? 0}
Review score: ${sprintState.review?.score ?? 'n/a'}/100
`.trim();

        await vectorStoreService.add(memText, {
            type: 'sprint_outcome',
            sprintId,
            status: sprintState.status,
            goal: goal.substring(0, 80),
            timestamp: new Date().toISOString(),
            testsPassed: testResults?.passed ?? null,
        }).catch(e => logger.warn(`Sprint memory persist failed: ${e.message}`));

        // Phase 39: The Memory Palace - Episodic Vector Memory
        await memoryPalaceService.indexSprintMemory({
            sprintId,
            goal,
            status: sprintState.status,
            durationMs: sprintState.durationMs,
            totalCostUsd: sprintState.totalCostUsd,
            stepsLength: steps.length,
            testsPassed: testResults?.passed ?? null,
            textIndex: memText
        });

        logger.info(`🧠 Sprint [${sprintId}]: Outcome persisted to episodic vector Memory Palace.`);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // HELPERS
    // ─────────────────────────────────────────────────────────────────────────

    async _fileExists(filePath) {
        try { await fs.access(filePath); return true; } catch { return false; }
    }

    _finalize(sprintId, state, steps, totalCostUsd, branchName, review, testResults) {
        return { sprintId, status: state.status, steps, totalCostUsd, branchName, review, testResults };
    }

    getActiveSprints() { return [...this.activeSprints.values()]; }

    cancelSprint(sprintId) {
        const sprint = this.activeSprints.get(sprintId);
        if (sprint) {
            sprint.status = 'cancelled';
            this._emit('sprint:cancelled', { sprintId });
            this.activeSprints.delete(sprintId);
            return { cancelled: true };
        }
        return { cancelled: false, reason: 'sprint_not_found' };
    }

    _emit(event, data) {
        sprintBus.emit(event, data);
        logger.info(`🏃 SprintBus [${event}]: ${JSON.stringify(data).substring(0, 120)}`);
    }
}

export const autonomousSprintService = new AutonomousSprintService();
