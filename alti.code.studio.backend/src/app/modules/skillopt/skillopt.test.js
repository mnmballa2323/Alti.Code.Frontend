import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SkillOptService } from './skillopt.service.js';
import { Skill, SkillOptRun } from './skillopt.model.js';

vi.mock('./skillopt.model.js', () => {
    const mockSkill = {
        name: 'math-expert',
        systemInstruction: 'Original instructions prompt',
        failures: [],
        save: vi.fn().mockImplementation(() => Promise.resolve())
    };
    return {
        Skill: {
            findOneAndUpdate: vi.fn().mockImplementation(() => Promise.resolve({})),
            findOne: vi.fn().mockImplementation(() => Promise.resolve(mockSkill)),
            create: vi.fn().mockImplementation((data) => Promise.resolve({ ...data, failures: [], save: vi.fn() }))
        },
        SkillOptRun: {
            create: vi.fn().mockImplementation((data) => Promise.resolve({
                _id: 'mock-run-id',
                ...data,
                epochs: [],
                save: vi.fn().mockImplementation(() => Promise.resolve())
            })),
            findById: vi.fn()
        }
    };
});

// Mock AzureGenAiService to prevent real API calls in testing
vi.mock('../googleGenAi/azureGenAi.service.js', () => {
    return {
        AzureGenAiService: {
            getGenerativeModel: vi.fn().mockReturnValue({
                generateContent: vi.fn().mockResolvedValue({
                    response: {
                        text: () => JSON.stringify({ success: true, feedback: 'Scored perfect' })
                    }
                })
            })
        }
    };
});

describe('SkillOptService Core Operations', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('applyEdits()', () => {
        it('should correctly apply ADD edits by appending them at the end', () => {
            const baseText = 'Always start by introducing yourself.';
            const edits = [
                { type: 'ADD', replacementText: 'Be concise.' }
            ];
            
            const result = SkillOptService.applyEdits(baseText, edits);
            expect(result).toContain('Always start by introducing yourself.');
            expect(result).toContain('- Be concise.');
        });

        it('should correctly apply REPLACE edits on matching substrings', () => {
            const baseText = 'Use Python to write code. Never use Javascript.';
            const edits = [
                { type: 'REPLACE', targetText: 'Never use Javascript.', replacementText: 'Use Javascript for dynamic pages.' }
            ];
            
            const result = SkillOptService.applyEdits(baseText, edits);
            expect(result).toBe('Use Python to write code. Use Javascript for dynamic pages.');
        });

        it('should correctly apply DELETE edits by removing target substrings', () => {
            const baseText = 'Always log results. Ignore errors.';
            const edits = [
                { type: 'DELETE', targetText: ' Ignore errors.' }
            ];
            
            const result = SkillOptService.applyEdits(baseText, edits);
            expect(result).toBe('Always log results.');
        });
    });

    describe('runEvaluation()', () => {
        it('should evaluate dataset using a custom harness and report correct accuracy score', async () => {
            const systemInstruction = 'Instructions text';
            const dataset = [
                { input: '2+2', expected: '4' },
                { input: '3+3', expected: '6' }
            ];

            const mockHarness = vi.fn()
                .mockResolvedValueOnce({ success: true, output: '4' })
                .mockResolvedValueOnce({ success: false, output: '5', feedback: 'Math mistake' });

            const result = await SkillOptService.runEvaluation(systemInstruction, dataset, mockHarness);
            
            expect(result.score).toBe(0.5);
            expect(result.failedTraces.length).toBe(1);
            expect(result.failedTraces[0].input).toBe('3+3');
            expect(result.failedTraces[0].feedback).toBe('Math mistake');
            expect(mockHarness).toHaveBeenCalledTimes(2);
        });
    });

    describe('optimizeSkill() Training Loop', () => {
        it('should run multi-epoch optimization loop, apply validation gate and update model', async () => {
            const dataset = [
                { input: '2+2', expected: '4' }
            ];

            // Stub internal helper functions to prevent real model executions
            const runEvaluationSpy = vi.spyOn(SkillOptService, 'runEvaluation')
                // Baseline: fails
                .mockResolvedValueOnce({ score: 0.0, failedTraces: [{ input: '2+2', expected: '4', feedback: 'Failed' }] })
                // Epoch 1 evaluation: fails
                .mockResolvedValueOnce({ score: 0.0, failedTraces: [{ input: '2+2', expected: '4', feedback: 'Failed again' }] })
                // Epoch 1 candidate validation gate: succeeds!
                .mockResolvedValueOnce({ score: 1.0, failedTraces: [] });

            const computeTextualGradientSpy = vi.spyOn(SkillOptService, 'computeTextualGradient')
                .mockResolvedValueOnce([
                    { type: 'ADD', replacementText: 'Optimized mathematical helper guideline.', rationale: 'Fix addition logic' }
                ]);

            const applyEditsSpy = vi.spyOn(SkillOptService, 'applyEdits')
                .mockReturnValue('Evolved instructions prompt');

            const { run, optimizedInstructions } = await SkillOptService.optimizeSkill(
                'math-expert',
                'Original instructions prompt',
                dataset,
                { maxEpochs: 1 }
            );

            expect(optimizedInstructions).toBe('Evolved instructions prompt');
            expect(run.status).toBe('success');
            expect(run.epochs.length).toBe(2); // Baseline + Epoch 1
            expect(run.epochs[1].accepted).toBe(true); // Candidate was accepted

            expect(runEvaluationSpy).toHaveBeenCalledTimes(3);
            expect(computeTextualGradientSpy).toHaveBeenCalledTimes(1);
            expect(applyEditsSpy).toHaveBeenCalledTimes(1);

            expect(SkillOptRun.create).toHaveBeenCalledTimes(1);
            expect(Skill.findOneAndUpdate).toHaveBeenCalledTimes(1);
        });
    });

    describe('registerFailure() Dynamic Calibration', () => {
        it('should correctly register a failure and trigger optimizeSkill when threshold reached', async () => {
            const optimizeSkillSpy = vi.spyOn(SkillOptService, 'optimizeSkill')
                .mockResolvedValue({ optimizedInstructions: 'Perfect system prompt instructions' });

            await SkillOptService.registerFailure('math-expert', '2+2', '4', 'Criteria', 'Failed execution');
            expect(Skill.findOne).toHaveBeenCalledWith({ name: 'math-expert' });
            expect(optimizeSkillSpy).not.toHaveBeenCalled();

            const mockSkillWithFailures = {
                name: 'math-expert',
                systemInstruction: 'Original instructions prompt',
                failures: [
                    { input: '2+2', expected: '4', criteria: 'Criteria', feedback: 'Failed' },
                    { input: '3+3', expected: '6', criteria: 'Criteria', feedback: 'Failed again' }
                ],
                save: vi.fn().mockImplementation(() => Promise.resolve())
            };
            vi.mocked(Skill.findOne).mockResolvedValueOnce(mockSkillWithFailures);

            await SkillOptService.registerFailure('math-expert', '3+3', '6', 'Criteria', 'Failed again');
            
            expect(optimizeSkillSpy).toHaveBeenCalledWith(
                'math-expert',
                'Original instructions prompt',
                expect.any(Array),
                expect.objectContaining({ maxEpochs: 2 })
            );
        });
    });

    describe('registerSuccess() Experience Reinforcement', () => {
        it('should correctly register a success trace and enforce a strict cap boundary of 3 successes', async () => {
            const mockSkill = {
                name: 'math-expert',
                systemInstruction: 'Original instructions prompt',
                successes: [],
                save: vi.fn().mockImplementation(() => Promise.resolve())
            };
            vi.mocked(Skill.findOne).mockResolvedValueOnce(mockSkill);

            await SkillOptService.registerSuccess('math-expert', '2+2', '4');
            expect(Skill.findOne).toHaveBeenCalledWith({ name: 'math-expert' });
            expect(mockSkill.successes.length).toBe(1);
            expect(mockSkill.successes[0].input).toBe('2+2');
            expect(mockSkill.successes[0].output).toBe('4');

            mockSkill.successes = [
                { input: '1', output: '1' },
                { input: '2', output: '2' },
                { input: '3', output: '3' }
            ];
            vi.mocked(Skill.findOne).mockResolvedValueOnce(mockSkill);

            await SkillOptService.registerSuccess('math-expert', '4', '4');
            expect(mockSkill.successes.length).toBe(3);
            expect(mockSkill.successes[2].input).toBe('4');
            expect(mockSkill.successes[0].input).toBe('2');
        });
    });
});
