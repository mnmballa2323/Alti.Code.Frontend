import { GoogleGenAiService } from '../googleGenAi/googleGenAi.service.js';
import { Skill, SkillOptRun } from './skillopt.model.js';
import { logger } from '../../../shared/logger.js';

/**
 * SkillOptService
 * Port of Microsoft's offline instruction optimization framework.
 * Leverages Vertex Gemini to optimize agent instructions in text-space via Textual Gradient Descent.
 */
export class SkillOptService {
    /**
     * Executes the validation evaluation harness on a validation dataset.
     * Runs each task instance under the given instructions and scores success.
     * 
     * @param {string} systemInstruction - The candidate instructions to evaluate
     * @param {Array<object>} dataset - Array of validation task instances
     * @param {Function} [harness] - Optional custom async execution harness function
     * @returns {Promise<object>} Score metrics and failure traces
     */
    static async runEvaluation(systemInstruction, dataset, harness = null) {
        let correctCount = 0;
        const failedTraces = [];

        logger.info(`🔬 Evaluating instruction set against ${dataset.length} validation instances...`);

        for (const instance of dataset) {
            const { input, expected, criteria } = instance;
            let agentOutput = '';
            let success = false;
            let feedback = '';

            try {
                if (harness) {
                    const res = await harness(systemInstruction, input, expected);
                    success = res.success;
                    agentOutput = res.output;
                    feedback = res.feedback || '';
                } else {
                    // Default evaluation harness: Run model with custom instruction and evaluate response
                    const model = GoogleGenAiService.getGenerativeModel('gemini-3.1-pro', 0.2);
                    
                    const prompt = `
                        SYSTEM INSTRUCTION:
                        ${systemInstruction}
                        
                        TASK INPUT:
                        ${input}
                    `;
                    
                    const result = await model.generateContent(prompt);
                    agentOutput = result.response.text().trim();

                    // Validation scorer
                    const scorerModel = GoogleGenAiService.getGenerativeModel('gemini-3.1-pro', 0.0);
                    const validationPrompt = `
                        TASK: Determine if the AGENT OUTPUT matches the EXPECTED output according to the given CRITERIA.
                        
                        AGENT INPUT:
                        "${input}"
                        
                        EXPECTED OUTPUT:
                        "${expected}"
                        
                        CRITERIA:
                        "${criteria || 'Does it closely match or address the expected target output?'}"
                        
                        AGENT OUTPUT:
                        "${agentOutput}"
                        
                        Return a valid JSON object ONLY:
                        {
                            "success": true/false,
                            "feedback": "Concise explanation of why it failed or succeeded"
                        }
                    `;

                    const scoringResult = await scorerModel.generateContent(validationPrompt);
                    const cleanJson = scoringResult.response.text()
                        .replace(/```json/g, '')
                        .replace(/```/g, '')
                        .trim();
                    
                    const scored = JSON.parse(cleanJson);
                    success = scored.success;
                    feedback = scored.feedback;
                }

                if (success) {
                    correctCount++;
                } else {
                    failedTraces.push({
                        input,
                        expected,
                        agentOutput,
                        feedback
                    });
                }
            } catch (err) {
                logger.error('Error evaluating instance', err);
                failedTraces.push({
                    input,
                    expected,
                    agentOutput: 'ERROR: ' + err.message,
                    feedback: 'Execution error occurred'
                });
            }
        }

        const score = correctCount / dataset.length;
        logger.info(`🔬 Accuracy: ${(score * 100).toFixed(1)}% (${correctCount}/${dataset.length})`);

        return {
            score,
            failedTraces
        };
    }

    /**
     * Optimizer LLM (Textual Gradient Descent):
     * Analyzes failures and proposes bounded instruction modifications (ADD, DELETE, REPLACE) to improve the skill.
     * 
     * @param {string} currentInstruction - The current instruction text
     * @param {Array<object>} failedTraces - Traces from failed instances in the validation run
     * @returns {Promise<Array<object>>} Proposes array of edits
     */
    static async computeTextualGradient(currentInstruction, failedTraces) {
        logger.info(`🧠 Computing Textual Gradient (TGD) across ${failedTraces.length} failures...`);

        const prompt = `
            ACT AS THE SENIOR COMPILER OPTIMIZER & INSTRUCTION TUNER.
            We are applying Textual Gradient Descent (SkillOpt) to optimize an agent's system prompt instructions.
            
            CURRENT INSTRUCTIONS:
            ---
            ${currentInstruction}
            ---
            
            FAILED INSTANCE TRACES:
            ---
            ${JSON.stringify(failedTraces, null, 2)}
            ---
            
            TASK:
            1. Analyze the failed traces. Identify the exact guidelines in the instructions that caused the agent to fail, or key guidelines that are missing.
            2. Propose bounded text edits to correct the failures.
            
            Supported Edit Types:
            - ADD: Append or insert a brand new instruction.
            - DELETE: Remove a specific redundant or misleading instruction.
            - REPLACE: Replace an existing instruction text with a revised version.
            
            Return a strictly formatted JSON array containing the proposed edits, with NO other text:
            [
                {
                    "type": "REPLACE",
                    "targetText": "Exact substring in the current instructions to replace",
                    "replacementText": "Revised instruction content to drop-in replace it",
                    "rationale": "Detailed explanation of why this specific edit corrects the failures"
                },
                {
                    "type": "ADD",
                    "replacementText": "New guideline to append to the instructions",
                    "rationale": "Why this new instruction is necessary"
                }
            ]
        `;

        const model = GoogleGenAiService.getGenerativeModel('gemini-3.1-pro', 0.3);
        const result = await model.generateContent(prompt);
        const cleanJson = result.response.text()
            .replace(/```json/g, '')
            .replace(/```/g, '')
            .trim();

        try {
            return JSON.parse(cleanJson);
        } catch (err) {
            logger.warn(`Failed to parse optimizer JSON: ${cleanJson}. Defaulting to empty edits.`);
            return [];
        }
    }

    /**
     * Applies proposed edits to the base instructions text.
     * 
     * @param {string} baseText - The original instruction prompt
     * @param {Array<object>} edits - The edits to apply
     * @returns {string} Modified candidate instruction prompt
     */
    static applyEdits(baseText, edits) {
        let text = baseText;

        for (const edit of edits) {
            const { type, targetText, replacementText } = edit;

            if (type === 'REPLACE') {
                if (text.includes(targetText)) {
                    text = text.replace(targetText, replacementText);
                } else {
                    logger.warn(`Replace failed: Substring not found in instruction text: "${targetText}"`);
                }
            } else if (type === 'DELETE') {
                if (text.includes(targetText)) {
                    text = text.replace(targetText, '');
                } else {
                    logger.warn(`Delete failed: Substring not found in instruction text: "${targetText}"`);
                }
            } else if (type === 'ADD') {
                // By default append at the end with proper newline padding
                text = text.trim() + '\n- ' + replacementText.trim() + '\n';
            }
        }

        return text;
    }

    /**
     * Main offline training loop.
     * Optimizes instructions for a specific skill name based on a validation set.
     */
    static async optimizeSkill(skillName, initialInstructions, dataset, options = {}) {
        const { maxEpochs = 3, harness = null } = options;

        logger.info(`🚀 Starting SkillOpt optimization for: "${skillName}"...`);

        // Record the optimization run in the database
        const run = await SkillOptRun.create({
            skillName,
            initialSystemInstruction: initialInstructions,
            parameters: { maxEpochs }
        });

        let currentInstruction = initialInstructions;
        let bestScore = 0;

        try {
            // Initial evaluation
            const initEval = await this.runEvaluation(currentInstruction, dataset, harness);
            bestScore = initEval.score;

            run.epochs.push({
                epoch: 0,
                baseScore: bestScore,
                feedback: 'Initial validation baseline',
                accepted: true
            });
            await run.save();

            if (bestScore === 1.0) {
                logger.info(`✨ Perfect baseline score! No optimization required.`);
                run.status = 'success';
                run.optimizedSystemInstruction = currentInstruction;
                await run.save();

                // Save/update the skill record
                await Skill.findOneAndUpdate(
                    { name: skillName },
                    { systemInstruction: currentInstruction, version: 1 },
                    { upsert: true, new: true }
                );

                return { run, optimizedInstructions: currentInstruction };
            }

            for (let epoch = 1; epoch <= maxEpochs; epoch++) {
                logger.info(`\n📅 --- EPOCH ${epoch} / ${maxEpochs} ---`);

                // 1. Run evaluation under the current instructions
                const currentEval = await this.runEvaluation(currentInstruction, dataset, harness);
                
                // If accuracy is perfect or we have no failed traces, we can terminate early
                if (currentEval.failedTraces.length === 0) {
                    logger.info(`✨ Zero failure traces remaining! Terminating optimization loop.`);
                    break;
                }

                // 2. Compute Textual Gradient using Gemini optimizer
                const proposedEdits = await this.computeTextualGradient(currentInstruction, currentEval.failedTraces);
                if (proposedEdits.length === 0) {
                    logger.warn(`⚠️ No edits proposed by optimizer LLM. Terminating epoch.`);
                    break;
                }

                // 3. Apply proposed edits to construct Candidate Skill instructions
                const candidateInstruction = this.applyEdits(currentInstruction, proposedEdits);

                // 4. Validation Gate: Evaluate candidate instructions
                logger.info(`🔬 Validation Gate: Evaluating proposed candidate instructions...`);
                const candidateEval = await this.runEvaluation(candidateInstruction, dataset, harness);

                const accepted = candidateEval.score > bestScore;

                logger.info(`⚖️ Validation Result: Candidate score: ${(candidateEval.score * 100).toFixed(1)}% | Best score: ${(bestScore * 100).toFixed(1)}%`);

                run.epochs.push({
                    epoch,
                    baseScore: bestScore,
                    candidateScore: candidateEval.score,
                    appliedEdits: proposedEdits,
                    feedback: accepted 
                        ? `Edits accepted! Score improved by +${((candidateEval.score - bestScore) * 100).toFixed(1)}%`
                        : `Edits rejected. Candidate score did not improve.`,
                    accepted
                });
                await run.save();

                if (accepted) {
                    logger.info(`✅ VALIDATION GATE PASSED: Adopting new instructions!`);
                    currentInstruction = candidateInstruction;
                    bestScore = candidateEval.score;

                    if (bestScore === 1.0) {
                        logger.info(`✨ Perfect target score achieved!`);
                        break;
                    }
                } else {
                    logger.info(`❌ VALIDATION GATE REJECTED: Reverting to previous best instructions.`);
                }
            }

            // Mark optimization run as successful
            run.status = 'success';
            run.optimizedSystemInstruction = currentInstruction;
            await run.save();

            // Save the optimized skill into active catalogue
            await Skill.findOneAndUpdate(
                { name: skillName },
                { systemInstruction: currentInstruction },
                { upsert: true }
            );

            logger.info(`\n🎉 SkillOpt optimization finished successfully! Evolved accuracy: ${(bestScore * 100).toFixed(1)}%`);
            return { run, optimizedInstructions: currentInstruction };

        } catch (err) {
            logger.error(`❌ SkillOpt optimization failed`, err);
            run.status = 'failed';
            run.error = err.message;
            await run.save();
            throw err;
        }
    }

    /**
     * Registers an agent failure trace dynamically.
     * If failures accumulate (>= 2), triggers an asynchronous background prompt calibration loop.
     */
    static async registerFailure(skillName, input, expected, criteria, feedback) {
        logger.warn(`🚨 [SkillOpt] Registering execution failure trace for agent [${skillName}]`);
        try {
            let skill = await Skill.findOne({ name: skillName });
            if (!skill) {
                const { agentRegistry } = await import('../agents/agent.registry.js');
                const def = agentRegistry.get(skillName);
                skill = await Skill.create({
                    name: skillName,
                    description: def ? def.description : 'Dynamic Specialist Agent Prompt',
                    systemInstruction: def ? def.description : 'Solve the tasks efficiently.'
                });
            }

            // Record the failure
            skill.failures.push({
                input,
                expected: expected || 'Flawless execution matching validation criteria',
                criteria: criteria || 'Did the execution fail with errors or lints?',
                feedback
            });
            await skill.save();

            const threshold = 2;
            if (skill.failures.length >= threshold) {
                logger.warn(`⚙️ [SkillOpt] Accumulated ${skill.failures.length} failures for [${skillName}]. Triggering Autonomous Prompt Calibration...`);
                
                const dataset = skill.failures.map(f => ({
                    input: f.input,
                    expected: f.expected,
                    criteria: f.criteria
                }));

                this.optimizeSkill(skillName, skill.systemInstruction, dataset, { maxEpochs: 2 })
                    .then(async () => {
                        logger.info(`✨ [SkillOpt] Autonomous Prompt Calibration for [${skillName}] complete. Clearing failures array.`);
                        await Skill.findOneAndUpdate({ name: skillName }, { $set: { failures: [] } });
                    })
                    .catch((err) => {
                        logger.error(`❌ [SkillOpt] Autonomous Calibration failed for [${skillName}]: ${err.message}`);
                    });
            }
        } catch (err) {
            logger.error(`❌ [SkillOpt] Failed to register failure trace for ${skillName}`, err);
        }
    }

    /**
     * Registers a successful execution trace to reinforce positive coding patterns.
     * Caps the successes bank to keep the few-shot context window light.
     */
    static async registerSuccess(skillName, input, output) {
        logger.info(`✨ [SkillOpt] Registering successful execution trace for agent [${skillName}]`);
        try {
            let skill = await Skill.findOne({ name: skillName });
            if (!skill) {
                const { agentRegistry } = await import('../agents/agent.registry.js');
                const def = agentRegistry.get(skillName);
                skill = await Skill.create({
                    name: skillName,
                    description: def ? def.description : 'Dynamic Specialist Agent Prompt',
                    systemInstruction: def ? def.description : 'Solve the tasks efficiently.'
                });
            }

            // Push and slice to keep the most recent 3 successes
            skill.successes.push({ input, output });
            if (skill.successes.length > 3) {
                skill.successes = skill.successes.slice(-3);
            }
            await skill.save();
            logger.info(`✅ [SkillOpt] Successfully recorded positive reinforcement example for [${skillName}].`);
        } catch (err) {
            logger.error(`❌ [SkillOpt] Failed to record success trace for ${skillName}`, err);
        }
    }
}
