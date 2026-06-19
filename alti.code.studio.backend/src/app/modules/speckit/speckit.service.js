/**
 * Copyright (c) 2024 Inso Code
 *
 * SpecKit — Spec-Driven Development Engine
 * Implements Kiro-style 3-phase workflow:
 *   Phase 1: requirements.md  (EARS notation user stories + acceptance criteria)
 *   Phase 2: design.md        (architecture, sequence diagrams, tech stack)
 *   Phase 3: tasks.md         (dependency-ordered discrete implementation tasks)
 * Also supports bugfix specs (bugfix.md with root-cause analysis)
 */

import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import { GeminiAiService } from '../gemini/gemini.service.js';
import { logger } from '../../../shared/logger.js';
import { hooksService } from '../hooks/hooks.service.js';

class SpecKitService {
    constructor() {
        this.rootDir = path.join(process.cwd(), '.speckit');
        this.specsDir = path.join(this.rootDir, 'specs');
        this.plansDir = path.join(this.rootDir, 'plans');
        this.bugfixDir = path.join(this.rootDir, 'bugfixes');
        this.constitutionPath = path.join(this.rootDir, 'constitution.md');
    }

    async init() {
        await fs.mkdir(this.specsDir, { recursive: true });
        await fs.mkdir(this.plansDir, { recursive: true });
        await fs.mkdir(this.bugfixDir, { recursive: true });

        try {
            await fs.access(this.constitutionPath);
        } catch {
            logger.info('📜 SpecKit: Creating default constitution...');
            const defaultConstitution = `# Project Constitution

## Core Principles
1. **Simplicity**: Code should be easy to understand and maintain.
2. **Robustness**: Error handling must be explicit.
3. **Performance**: Optimize for low latency where possible.
4. **Security**: Validate all inputs; sanitize outputs.

## Technology Stack
- Backend: Node.js, Express, Postgres, Redis
- Frontend: Next.js, TypeScript, Tailwind CSS
- AI: Gemini AI (primary), Claude (secondary)

## Coding Standards
- Use ESM modules (import/export)
- Async/await for all async operations
- Prefix log messages with agent name in brackets: [AgentName]
`.trim();
            await fs.writeFile(this.constitutionPath, defaultConstitution);
        }
    }

    // ─── HELPERS ─────────────────────────────────────────────────────────────

    async _readConstitution() {
        try {
            return await fs.readFile(this.constitutionPath, 'utf-8');
        } catch {
            return '# No constitution defined';
        }
    }

    _specDir(specId) {
        return path.join(this.specsDir, specId);
    }

    async _readPhaseFile(specId, filename) {
        try {
            return await fs.readFile(path.join(this._specDir(specId), filename), 'utf-8');
        } catch {
            return null;
        }
    }

    async _writePhaseFile(specId, filename, content) {
        const dir = this._specDir(specId);
        await fs.mkdir(dir, { recursive: true });
        await fs.writeFile(path.join(dir, filename), content);
    }

    async _readMeta(specId) {
        try {
            const raw = await fs.readFile(path.join(this._specDir(specId), 'meta.json'), 'utf-8');
            return JSON.parse(raw);
        } catch {
            return null;
        }
    }

    async _writeMeta(specId, meta) {
        await this._writePhaseFile(specId, 'meta.json', JSON.stringify(meta, null, 2));
    }

    _generateId(slug = '') {
        const safe = slug.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 40);
        return `${safe}-${crypto.randomUUID().slice(0, 8)}`;
    }

    _stripCodeFence(str) {
        return str
            .replace(/^```[a-z]*\n?/m, '')
            .replace(/\n?```$/m, '')
            .trim();
    }

    // ─── PHASE 1: REQUIREMENTS ────────────────────────────────────────────────

    /**
     * Create a new spec and generate requirements.md (EARS notation).
     * @param {string} request - Natural language description of the feature
     * @returns {Promise<{ specId, requirements }>}
     */
    async createSpec(request, regions = []) {
        if (!request?.trim()) throw new Error('request must be a non-empty string.');
        await this.init();

        const specId = this._generateId(request.split(' ').slice(0, 4).join('-'));
        const constitution = await this._readConstitution();

        const compliancePromptSection = (Array.isArray(regions) && regions.length > 0) ? `
REGIONAL COMPLIANCE RULES:
You MUST design this feature to comply with the regulations of the specified regions: ${regions.join(', ')}.
- **EU**: Enforce EU GDPR (Data residency in EU, explicit user consent, Right to Erasure, right to download data).
- **US**: Enforce US HIPAA (PHI protection, no plaintext medical logging, encryption-at-rest, secure audit vaults) and SOC2.
- **UK**: Enforce UK GDPR.
- **APAC**: Enforce APEC CBPR data protection principles.
` : '';

        const prompt = `
You are SpecKit — a Spec-Driven Development engine for a senior engineering team.

PROJECT CONSTITUTION:
${constitution}

USER REQUEST:
"${request}"
${compliancePromptSection}

TASK:
Generate a requirements.md file using EARS (Easy Approach to Requirements Syntax) notation.

Structure:
# Feature: <Title>

## Overview
<2-3 sentence summary of what this feature does and why>

## User Stories
Use the format:
- **US-01**: As a [role], I want to [action] so that [benefit].
  - **Acceptance Criteria**:
    - [ ] AC-01: When [condition], the system shall [behavior].
    - [ ] AC-02: ...

Include at least 3 user stories with 2-3 acceptance criteria each.

## Non-Functional Requirements
- Performance: ...
- Security: ...
- Accessibility: ...
${(Array.isArray(regions) && regions.length > 0) ? '- Regional Compliance: Explicitly list how the feature complies with: ' + regions.join(', ') : ''}

## Out of Scope
- List 2-3 explicit exclusions to prevent scope creep.

Return ONLY the markdown content, no JSON or code fences.
        `.trim();

        const requirements = this._stripCodeFence(await GeminiAiService.generateContent(prompt));

        await this._writePhaseFile(specId, 'requirements.md', requirements);
        const meta = {
            specId,
            title: request.slice(0, 80),
            type: 'feature',
            regions: regions || [],
            phases: { requirements: 'done', design: 'pending', tasks: 'pending' },
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
        await this._writeMeta(specId, meta);

        logger.info(`📝 SpecKit [Phase 1]: requirements.md created for spec ${specId}`);
        return { specId, requirements };
    }

    // ─── PHASE 2: DESIGN ─────────────────────────────────────────────────────

    /**
     * Generate design.md from requirements.md.
     * @param {string} specId
     * @returns {Promise<{ specId, design }>}
     */
    async createDesign(specId, regions = []) {
        await this.init();
        const requirements = await this._readPhaseFile(specId, 'requirements.md');
        if (!requirements) throw new Error(`Spec "${specId}" has no requirements.md. Run Phase 1 first.`);

        const constitution = await this._readConstitution();
        const meta = await this._readMeta(specId) || {};
        const specRegions = (Array.isArray(regions) && regions.length > 0) ? regions : (meta.regions || []);

        const complianceDesignSection = specRegions.length > 0 ? `
REGIONAL COMPLIANCE ARCHITECTURE:
The technical architecture MUST explicitly address compliance for: ${specRegions.join(', ')}.
- **EU**: Specify data residency topology (e.g. European database regions), encryption-in-transit, and data purge cascades.
- **US**: Specify KMS CMEK key configurations, encryption-at-rest, and immutable log routing structures for HIPAA.
- **UK**: Specify data sovereignty boundaries.
- **APAC**: Specify cross-border privacy boundaries.
` : '';

        const prompt = `
You are SpecKit — a senior software architect.

PROJECT CONSTITUTION:
${constitution}

REQUIREMENTS:
${requirements}
${complianceDesignSection}

TASK:
Generate a design.md file with the full technical architecture.
The Component Design, Data Model, API Design, and Security Considerations sections MUST explicitly outline the architectural blocks satisfying these regional compliance rules.

Structure:
# Design: <Feature Title>

## Architecture Overview
<High-level description of how this feature fits into the system>

## Component Design
List each new/modified component with its responsibility.

## Data Model
Define any new database tables, fields, or schemas (use markdown tables).

## API Design
Document all new/modified API endpoints:
| Method | Path | Auth | Body | Response |
|--------|------|------|------|----------|

## Sequence Diagrams
Use Mermaid syntax:
\`\`\`mermaid
sequenceDiagram
  ...
\`\`\`

Include at least 2 sequence diagrams (happy path + error path).

## Error Handling Strategy
Describe how errors are surfaced and handled.

## Security Considerations
Authentication, authorization, input validation, etc.

## Testing Strategy
- Unit tests: what to mock, what to assert
- Integration tests: which flows to test end-to-end

Return ONLY the markdown content, no JSON or outer code fences.
        `.trim();

        const design = this._stripCodeFence(await GeminiAiService.generateContent(prompt));

        await this._writePhaseFile(specId, 'design.md', design);

        const updatedMeta = await this._readMeta(specId) || {};
        updatedMeta.phases = { ...updatedMeta.phases, design: 'done' };
        updatedMeta.updatedAt = new Date().toISOString();
        await this._writeMeta(specId, updatedMeta);

        logger.info(`🏗️ SpecKit [Phase 2]: design.md created for spec ${specId}`);
        return { specId, design };
    }

    // ─── PHASE 3: TASKS ───────────────────────────────────────────────────────

    /**
     * Generate tasks.md from requirements.md + design.md.
     * @param {string} specId
     * @returns {Promise<{ specId, tasks }>}
     */
    async createTasks(specId) {
        await this.init();
        const requirements = await this._readPhaseFile(specId, 'requirements.md');
        const design = await this._readPhaseFile(specId, 'design.md');
        if (!requirements) throw new Error(`Spec "${specId}" has no requirements.md. Run Phase 1 first.`);
        if (!design) throw new Error(`Spec "${specId}" has no design.md. Run Phase 2 first.`);

        const prompt = `
You are SpecKit — a technical project manager.

REQUIREMENTS:
${requirements}

DESIGN:
${design}

TASK:
Generate a tasks.md file with a dependency-ordered implementation plan.

Rules:
- Use numbered tasks: ## Task 1: <Title>
- Each task must have: Description, Files to modify/create, Acceptance test, Status, Complexity (S/M/L)
- Order by dependencies (what must be done first comes first)
- Maximum 12 tasks

Format for each task:
## Task N: <Title>
**Status**: [ ] pending
**Complexity**: S | M | L
**Description**: ...
**Files**:
- path/to/file.js — what to do
**Test**: How to verify this task is complete.

Return ONLY the markdown content.
        `.trim();

        const tasks = this._stripCodeFence(await GeminiAiService.generateContent(prompt));

        await this._writePhaseFile(specId, 'tasks.md', tasks);

        const meta = await this._readMeta(specId) || {};
        meta.phases = { ...meta.phases, tasks: 'done' };
        meta.updatedAt = new Date().toISOString();
        await this._writeMeta(specId, meta);

        logger.info(`📋 SpecKit [Phase 3]: tasks.md created for spec ${specId}`);
        return { specId, tasks };
    }

    // ─── TASK EXECUTION ───────────────────────────────────────────────────────

    /**
     * Execute a single task from tasks.md via the orchestrator.
     * @param {string} specId
     * @param {number} taskIndex - 0-based task index
     * @returns {Promise<{ specId, taskIndex, status, result }>}
     */
    async executeTask(specId, taskIndex) {
        await this.init();
        const tasksContent = await this._readPhaseFile(specId, 'tasks.md');
        if (!tasksContent) throw new Error(`Spec "${specId}" has no tasks.md.`);

        // Parse tasks (## Task N: sections)
        const taskBlocks = tasksContent.split(/^## Task \d+:/m).filter(Boolean);
        if (taskIndex >= taskBlocks.length) {
            throw new Error(`Task index ${taskIndex} out of range (${taskBlocks.length} tasks total).`);
        }

        const taskText = taskBlocks[taskIndex];

        // Update status to in-progress in tasks.md
        const updatedTasks = this._setTaskStatus(tasksContent, taskIndex, 'in-progress');
        await this._writePhaseFile(specId, 'tasks.md', updatedTasks);

        const goal = `[SpecKit Task Execution] Spec: ${specId}, Task ${taskIndex + 1}:\n${taskText.slice(0, 2000)}`;

        // Fire before-spec-task hook
        hooksService.triggerEvent('before-spec-task', { specId, taskIndex: String(taskIndex + 1) }).catch(() => { });

        try {
            const { graphOrchestrator } = await import('../agents/graph.orchestrator.js');
            const result = await graphOrchestrator.run(goal);

            const completedTasks = this._setTaskStatus(updatedTasks, taskIndex, 'done');
            await this._writePhaseFile(specId, 'tasks.md', completedTasks);

            // Fire after-spec-task hook
            hooksService.triggerEvent('after-spec-task', { specId, taskIndex: String(taskIndex + 1), status: 'done' }).catch(() => { });

            logger.info(`✅ SpecKit: Task ${taskIndex + 1} of spec ${specId} executed.`);
            return { specId, taskIndex, status: 'done', result };
        } catch (err) {
            const failedTasks = this._setTaskStatus(updatedTasks, taskIndex, 'failed');
            await this._writePhaseFile(specId, 'tasks.md', failedTasks);
            hooksService.triggerEvent('after-spec-task', { specId, taskIndex: String(taskIndex + 1), status: 'failed' }).catch(() => { });
            throw err;
        }
    }

    _setTaskStatus(tasksContent, taskIndex, status) {
        const statusEmoji = { 'in-progress': '🔄', done: '✅', failed: '❌', pending: '⬜' };

        // Safer block splitting logic — splits on "## Task 1:", "## Task 2:", etc.
        const taskRegex = /^(?=## Task \d+:)/m;
        const taskBlocks = tasksContent.split(taskRegex);

        let count = -1;

        return taskBlocks.map(block => {
            if (/^## Task \d+:/.test(block)) {
                count++;
            }
            if (count === taskIndex) {
                // More precise regex targeting ONLY the **Status** line and nothing else
                return block.replace(
                    /^(\s*\*\*Status\*\*:\s*).*$/m,
                    `$1${statusEmoji[status] || ''} ${status}`
                );
            }
            return block;
        }).join('');
    }

    // ─── BUGFIX SPECS ────────────────────────────────────────────────────────

    /**
     * Create a bugfix spec with root-cause analysis.
     * @param {string} bugDescription - Natural language description of the bug
     * @param {object} options - { currentBehavior, expectedBehavior, stepsToReproduce }
     * @returns {Promise<{ specId, bugfix }>}
     */
    async createBugfixSpec(bugDescription, options = {}) {
        if (!bugDescription?.trim()) throw new Error('bugDescription must be a non-empty string.');
        await this.init();

        const specId = 'bugfix-' + this._generateId(bugDescription.split(' ').slice(0, 3).join('-'));
        const constitution = await this._readConstitution();

        const prompt = `
You are SpecKit — a senior debugging specialist.

PROJECT CONSTITUTION:
${constitution}

BUG DESCRIPTION:
"${bugDescription}"

CURRENT BEHAVIOR: ${options.currentBehavior || 'Not specified'}
EXPECTED BEHAVIOR: ${options.expectedBehavior || 'Not specified'}
STEPS TO REPRODUCE: ${options.stepsToReproduce || 'Not specified'}

TASK:
Generate a bugfix.md with systematic root-cause analysis.

Structure:
# Bug: <Title>

## Bug Summary
<One paragraph describing the bug>

## Current Behavior
<What happens now>

## Expected Behavior
<What should happen>

## Root Cause Hypothesis
List 2-3 likely root causes ranked by probability:
1. **[HIGH]** ...
2. **[MEDIUM]** ...
3. **[LOW]** ...

## Investigation Steps
Checklist of diagnostic steps to confirm root cause:
- [ ] Check ...
- [ ] Verify ...

## Proposed Fix
High-level description of the fix.

## Files Likely Involved
List files that probably need to be changed.

## Regression Prevention
What tests to add to prevent this from happening again.

## Acceptance Criteria
- [ ] Bug no longer reproducible via steps above
- [ ] New tests pass
- [ ] No regressions in related functionality

Return ONLY the markdown content.
        `.trim();

        const bugfix = this._stripCodeFence(await GeminiAiService.generateContent(prompt));

        const bugfixPath = path.join(this.bugfixDir, `${specId}.md`);
        await fs.writeFile(bugfixPath, bugfix);

        const meta = {
            specId,
            title: bugDescription.slice(0, 80),
            type: 'bugfix',
            phases: { bugfix: 'done', design: 'pending', tasks: 'pending' },
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
        await fs.mkdir(this._specDir(specId), { recursive: true });
        await this._writeMeta(specId, meta);
        await this._writePhaseFile(specId, 'bugfix.md', bugfix);

        logger.info(`🐛 SpecKit [Bugfix]: bugfix.md created for spec ${specId}`);
        return { specId, bugfix };
    }

    // ─── READ & LIST ─────────────────────────────────────────────────────────

    /**
     * Get a spec's full state (all phases + metadata).
     * @param {string} specId
     */
    async getSpec(specId) {
        await this.init();
        const meta = await this._readMeta(specId);
        if (!meta) throw new Error(`Spec "${specId}" not found.`);

        const [requirements, design, tasks, bugfix] = await Promise.all([
            this._readPhaseFile(specId, 'requirements.md'),
            this._readPhaseFile(specId, 'design.md'),
            this._readPhaseFile(specId, 'tasks.md'),
            this._readPhaseFile(specId, 'bugfix.md'),
        ]);

        return { ...meta, requirements, design, tasks, bugfix };
    }

    /**
     * List all specs (feature + bugfix) with metadata.
     */
    async listSpecs() {
        await this.init();
        try {
            const entries = await fs.readdir(this.specsDir, { withFileTypes: true });
            const metas = await Promise.all(
                entries
                    .filter(e => e.isDirectory())
                    .map(async e => {
                        const meta = await this._readMeta(e.name);
                        return meta || { specId: e.name, title: e.name, type: 'unknown', phases: {} };
                    })
            );
            return metas.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
        } catch {
            return [];
        }
    }

    /**
     * Delete a spec and all its files.
     * @param {string} specId
     */
    async deleteSpec(specId) {
        await this.init();
        const dir = this._specDir(specId);
        await fs.rm(dir, { recursive: true, force: true });
        logger.info(`🗑️ SpecKit: Spec ${specId} deleted.`);
    }

    // ─── LEGACY COMPAT ───────────────────────────────────────────────────────

    /** @deprecated Use createSpec() + createDesign() + createTasks() instead */
    async createPlan(specFilename) {
        const specPath = path.join(this.specsDir, specFilename);
        const specContent = await fs.readFile(specPath, 'utf-8');
        const constitution = await this._readConstitution();

        const prompt = `
You are SpecKit Plan Generator.
PROJECT CONSTITUTION:
${constitution}
TECHNICAL SPECIFICATION:
${specContent}
Generate a detailed, ordered implementation plan as a Markdown document.
        `.trim();

        const planContent = await GeminiAiService.generateContent(prompt);
        const planFilename = specFilename.replace(/\.md$/, '') + '-plan.md';
        const planPath = path.join(this.plansDir, planFilename);
        await fs.writeFile(planPath, this._stripCodeFence(planContent));
        return { path: planPath, content: planContent };
    }

    /** @deprecated Use listSpecs() instead */
    async listPlans() {
        await this.init();
        return this._listFlatDir(this.plansDir);
    }

    async _listFlatDir(dir) {
        try {
            const entries = await fs.readdir(dir, { withFileTypes: true });
            const files = await Promise.all(
                entries.filter(e => e.isFile() && e.name.endsWith('.md')).map(async e => {
                    const stat = await fs.stat(path.join(dir, e.name));
                    return { filename: e.name, createdAt: stat.birthtime, sizeBytes: stat.size };
                })
            );
            return files.sort((a, b) => b.createdAt - a.createdAt);
        } catch {
            return [];
        }
    }
}

export const specKitService = new SpecKitService();
