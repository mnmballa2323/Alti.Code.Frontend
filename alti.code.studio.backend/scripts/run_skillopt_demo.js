/**
 * Copyright (c) 2026 Alti.Code.Studio
 * 
 * Microsoft Research SkillOpt Integration - Offline CLI Optimization Demo
 * Watches instruction sets dynamically evolve in text space using TGD principles.
 */

import { SkillOptService } from '../src/app/modules/skillopt/skillopt.service.js';
import chalk from 'chalk';

// Initial baseline instructions: flawed because it forgets to specify standard docstrings and type hints.
const flawedInstructions = `
# Python Formatter Agent Instructions
1. Always indent code blocks with 4 spaces.
2. Use snake_case for function names.
3. Keep line length under 80 characters.
`;

// Validation dataset: checks formatting, type hints, and PEP-257 docstrings.
const validationDataset = [
    {
        input: 'def compute_mean(nums): return sum(nums)/len(nums)',
        expected: 'docstring',
        criteria: 'Does the formatted function contain a valid docstring and snake_case naming?'
    },
    {
        input: 'def calculateArea(w,h): return w*h',
        expected: 'snake_case',
        criteria: 'Does the formatted function use snake_case for its name calculate_area?'
    },
    {
        input: 'def get_db_user(id): return db.find(id)',
        expected: 'type_hints',
        criteria: 'Does the formatted function contain type hints for params and return value?'
    }
];

// High-fidelity mock evaluation harness simulating agent outcomes under current instructions
async function simulatedExecutionHarness(systemInstruction, input, expected) {
    const hasDocstringRule = systemInstruction.toLowerCase().includes('docstring');
    const hasSnakeCaseRule = systemInstruction.toLowerCase().includes('snake_case');
    const hasTypeHintsRule = systemInstruction.toLowerCase().includes('type hint') || systemInstruction.toLowerCase().includes('type annotations');

    let output = '';
    let success = false;
    let feedback = '';

    if (expected === 'docstring') {
        if (hasDocstringRule) {
            output = '"""Computes arithmetic mean."""\ndef compute_mean(nums: list) -> float:\n    return sum(nums)/len(nums)';
            success = true;
        } else {
            output = 'def compute_mean(nums):\n    return sum(nums)/len(nums)';
            success = false;
            feedback = 'CRITICAL FAILURE: Missing PEP-257 docstring in output.';
        }
    } else if (expected === 'snake_case') {
        if (hasSnakeCaseRule) {
            output = 'def calculate_area(w, h):\n    return w * h';
            success = true;
        } else {
            output = 'def calculateArea(w, h):\n    return w * h';
            success = false;
            feedback = 'CRITICAL FAILURE: Function naming is not in snake_case format.';
        }
    } else if (expected === 'type_hints') {
        if (hasTypeHintsRule) {
            output = 'def get_db_user(id: int) -> User:\n    return db.find(id)';
            success = true;
        } else {
            output = 'def get_db_user(id):\n    return db.find(id)';
            success = false;
            feedback = 'CRITICAL FAILURE: Parameter id is missing python type annotations.';
        }
    }

    return { success, output, feedback };
}

// Simulated Optimizer LLM computing Textual Gradient Descent edits
function simulatedGradientOptimizer(epoch, failedTraces) {
    console.log(chalk.magenta(`\n[Optimizer] Running Textual Gradient Descent synthesis for Epoch ${epoch}...`));
    console.log(chalk.dim(`Analyzing ${failedTraces.length} failures:`));
    failedTraces.forEach(t => console.log(chalk.red(`  • Failure on input: "${t.input}" -> ${t.feedback}`)));

    if (epoch === 1) {
        return [
            {
                type: 'ADD',
                replacementText: 'Always include detailed PEP-257 docstrings explaining the function objective and returns.',
                rationale: 'Addresses the docstring critical failure trace.'
            },
            {
                type: 'ADD',
                replacementText: 'Enforce type hints (annotations) for all arguments and function return statements.',
                rationale: 'Addresses missing parameter type annotations.'
            }
        ];
    }
    return [];
}

async function runDemo() {
    console.clear();
    console.log(chalk.cyan.bold('==============================================================='));
    console.log(chalk.cyan.bold('⚡ ALTI.CODE.STUDIO: MICROSOFT SKILLOPT OFFLINE OPTIMIZER DEMO ⚡'));
    console.log(chalk.cyan.bold('===============================================================\n'));

    console.log(chalk.yellow.bold('[Initial Base Instructions]:'));
    console.log(chalk.gray(flawedInstructions.trim()));
    console.log('\n---------------------------------------------------------------\n');

    // 1. Initial Evaluation (Baseline)
    console.log(chalk.blue.bold('Step 1: Running baseline evaluation harness...'));
    const baseEval = await SkillOptService.runEvaluation(flawedInstructions, validationDataset, simulatedExecutionHarness);
    console.log(chalk.bold(`Baseline Accuracy Score: `) + chalk.red(`${(baseEval.score * 100).toFixed(1)}%`));

    // 2. Compute Textual Gradient & Run Epoch 1
    console.log(chalk.blue.bold('\nStep 2: Starting SkillOpt optimization (Epoch 1)...'));
    const proposedEdits = simulatedGradientOptimizer(1, baseEval.failedTraces);

    console.log(chalk.green.bold('\n[Proposed Textual Edits]:'));
    proposedEdits.forEach((edit, idx) => {
        console.log(chalk.bold(`${idx + 1}. [${edit.type}] `) + chalk.green(`"${edit.replacementText}"`));
        console.log(chalk.dim(`   Rationale: ${edit.rationale}`));
    });

    // Apply Edits to construct candidate instructions
    const candidateInstructions = SkillOptService.applyEdits(flawedInstructions, proposedEdits);

    // 3. Validation Gate
    console.log(chalk.blue.bold('\nStep 3: Validation Gate - Evaluating candidate instructions...'));
    const candidateEval = await SkillOptService.runEvaluation(candidateInstructions, validationDataset, simulatedExecutionHarness);
    
    console.log(chalk.bold(`Candidate Accuracy Score: `) + chalk.green.bold(`${(candidateEval.score * 100).toFixed(1)}%`));

    const accepted = candidateEval.score > baseEval.score;
    if (accepted) {
        console.log(chalk.green.bold('\n✅ VALIDATION GATE PASSED: Evolved instructions demonstrate strict performance gains!'));
        console.log(chalk.green.bold('\n[Evolved Optimized Instructions]:'));
        console.log(chalk.white.bold(candidateInstructions.trim()));
    } else {
        console.log(chalk.red.bold('\n❌ VALIDATION GATE REJECTED: Reverting to baseline prompt.'));
    }

    console.log(chalk.cyan.bold('\n==============================================================='));
    console.log(chalk.cyan.bold('🎉 SkillOpt Textual Gradient Descent optimization executed successfully!'));
    console.log(chalk.cyan.bold('===============================================================\n'));
}

runDemo().catch(console.error);
