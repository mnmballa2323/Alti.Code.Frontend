import { describe, it, expect, vi, beforeEach } from 'vitest';
import { githubDocsService } from '../../src/app/modules/githubDocs/githubDocs.service.js';
import { ragService } from '../../src/app/modules/memory/rag.service.js';
import { azureGenAiService as AzureGenAiService } from '../../src/app/modules/ai/azureGenAi.service.js';
import { AzureSearchService } from '../../src/app/modules/gcpCloud/gcpSearch.service.js';
import { spannerGraphService } from '../../src/app/modules/gcpCloud/gcpSpannerGraph.service.js';
import { visionService } from '../../src/app/modules/senses/vision.service.js';
import { agentRegistry } from '../../src/app/modules/agents/agent.registry.js';
import { GeminiAiService } from '../../src/app/modules/gemini/gemini.service.js';

describe('GitHub Swarm Phase 7: Cognitive Intelligence Integration Tests', () => {
    beforeEach(() => {
        vi.restoreAllMocks();
    });

    describe('1. Swarm DAG Planner & Topological Execution Engine', () => {
        it('should successfully decompose complex request into a task DAG and execute tasks in topological order', async () => {
            const query = 'Create a repository and then configure build workflow and oauth app secrets';
            
            // Mock Gemini DAG Generation
            const mockModel = {
                generateContent: vi.fn().mockResolvedValue({
                    response: {
                        candidates: [{
                            content: {
                                parts: [{
                                    text: JSON.stringify({
                                        tasks: [
                                            { id: 't1', agentId: 'githubRepoCreator', task: 'Create the repository', dependencies: [] },
                                            { id: 't2', agentId: 'githubActionsWorkflowCompiler', task: 'Configure build workflow', dependencies: ['t1'] },
                                            { id: 't3', agentId: 'githubAppWebhookVerifier', task: 'Configure oauth secrets', dependencies: ['t1'] }
                                        ]
                                    })
                                }]
                            }
                        }]
                    }
                })
            };

            const getModelSpy = vi.spyOn(AzureGenAiService, 'getGenerativeModel').mockReturnValue(mockModel);

            // Mock Swarm Dispatch consultations
            const dispatchSpy = vi.spyOn(githubDocsService, 'dispatchQueryToSwarm').mockImplementation(async (taskQuery, agentId) => {
                return {
                    agent: agentId,
                    response: `Consultation result for task: ${taskQuery} by ${agentId}`
                };
            });

            const result = await githubDocsService.orchestrateSwarmWorkflow(query);

            expect(result.success).toBe(true);
            expect(result.query).toBe(query);
            expect(result.tasks.length).toBe(3);
            expect(result.executionFlow.length).toBe(3);

            // Verify topological order: t1 must start and complete first, feeding its outputs into t2 and t3
            const t1Exec = result.executionFlow.find(r => r.id === 't1');
            const t2Exec = result.executionFlow.find(r => r.id === 't2');
            const t3Exec = result.executionFlow.find(r => r.id === 't3');

            expect(t1Exec.dependencies.length).toBe(0);
            expect(t2Exec.dependencies).toContain('t1');
            expect(t3Exec.dependencies).toContain('t1');

            expect(dispatchSpy).toHaveBeenCalledTimes(3);
            expect(getModelSpy).toHaveBeenCalled();
        });
    });

    describe('2. Active Self-Healing Webhook Loop', () => {
        it('should triage Actions runner failures to githubActionsWorkflowCompiler and return self-healing diff patch', async () => {
            const payload = {
                action: 'completed',
                workflow_run: { conclusion: 'failure' },
                failureLogSnippet: 'npm ERR! Missing script: "build"'
            };

            const dispatchSpy = vi.spyOn(githubDocsService, 'dispatchQueryToSwarm').mockResolvedValue({
                agent: 'githubActionsWorkflowCompiler',
                response: 'The error is due to Missing script: "build". Remediation: add "build" script or build --if-present. ```diff\n- run: npm run build\n+ run: npm run build --if-present\n```'
            });

            const result = await githubDocsService.processSelfHealingWebhook(payload);

            expect(result.success).toBe(true);
            expect(result.triagedAgent).toBe('githubActionsWorkflowCompiler');
            expect(result.remediationPlan).toContain('Missing script: "build"');
            expect(result.patchDiff).toContain('- run: npm run build');
            expect(result.patchDiff).toContain('+ run: npm run build --if-present');
            expect(dispatchSpy).toHaveBeenCalledWith(expect.stringContaining('Missing script: "build"'), 'githubActionsWorkflowCompiler');
        });

        it('should triage Dependabot security vulnerabilities to githubSecurityDependabotAlertsPatcher and return dependencies diff patch', async () => {
            const payload = {
                action: 'created',
                alert: {
                    affected_package_name: 'lodash',
                    security_advisory: { summary: 'Prototype pollution in lodash' }
                }
            };

            const dispatchSpy = vi.spyOn(githubDocsService, 'dispatchQueryToSwarm').mockResolvedValue({
                agent: 'githubSecurityDependabotAlertsPatcher',
                response: 'Vulnerability: Prototype pollution in lodash. Remediation: upgrade to 4.17.21. ```diff\n- "lodash": "^4.17.15",\n+ "lodash": "^4.17.21",\n```'
            });

            const result = await githubDocsService.processSelfHealingWebhook(payload);

            expect(result.success).toBe(true);
            expect(result.triagedAgent).toBe('githubSecurityDependabotAlertsPatcher');
            expect(result.remediationPlan).toContain('Prototype pollution in lodash');
            expect(result.patchDiff).toContain('- "lodash": "^4.17.15"');
            expect(result.patchDiff).toContain('+ "lodash": "^4.17.21"');
            expect(dispatchSpy).toHaveBeenCalledWith(expect.stringContaining('Prototype pollution in lodash'), 'githubSecurityDependabotAlertsPatcher');
        });
    });

    describe('3. Live Web Grounding fallback', () => {
        it('should fall back to Google Search Grounding when local RAG confidence is low/empty', async () => {
            // Mock local RAG query returning a low confidence or empty string
            const ragSpy = vi.spyOn(ragService, 'query').mockResolvedValue('No relevant context found in Enterprise Memory to answer the query.');
            
            // Mock AzureSearchService
            const searchSpy = vi.spyOn(AzureSearchService, 'getSearchContext').mockResolvedValue('Latest real-time details from GitHub Actions 2026 documentation index.');

            const query = 'How do I use keyless OIDC federation in actions in May 2026?';
            const result = await githubDocsService.searchDocs(query);

            expect(result).toContain('[Live Web Grounding Fallback]');
            expect(result).toContain('Latest real-time details from GitHub Actions 2026');
            expect(ragSpy).toHaveBeenCalledWith(query, 5);
            expect(searchSpy).toHaveBeenCalledWith(query);
        });
    });

    describe('4. Code-Graph Blast-Radius Calculator', () => {
        it('should query Spanner Graph native GQL and auto-assign Codeowners reviewers based on AST import blast-radius', async () => {
            const filesChanged = ['src/app/modules/agents/github_swarm_factory.js'];

            // Mock Spanner Graph execution traversal
            const spannerSpy = vi.spyOn(spannerGraphService, 'executeAstGraphTraversal').mockResolvedValue([
                {
                    dependency_file_path: 'src/app/modules/githubDocs/githubDocs.service.js',
                    dependency_name: 'githubDocsService'
                }
            ]);

            const result = await githubDocsService.analyzePullRequestBlastRadius(filesChanged);

            expect(result.success).toBe(true);
            expect(result.filesChanged).toEqual(filesChanged);
            expect(result.impactedFiles).toContain('src/app/modules/agents/github_swarm_factory.js');
            expect(result.impactedFiles).toContain('src/app/modules/githubDocs/githubDocs.service.js');
            
            // Should contain mapped owners: @agents-specialist for agents folder, and @docs-team for githubDocs folder
            expect(result.suggestedReviewers).toContain('@agents-specialist');
            expect(result.suggestedReviewers).toContain('@docs-team');
            expect(spannerSpy).toHaveBeenCalledWith('src/app/modules/agents/github_swarm_factory.js', 3);
        });
    });

    describe('5. Multi-Modal Visual PR Auditing', () => {
        it('should audit design token layout and CSS alignment compliance from base64 image data using visionService', async () => {
            const base64Image = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
            const layoutParams = { primaryColor: '#4f46e5', gap: '16px' };

            // Mock visionService analysis
            const visionSpy = vi.spyOn(visionService, 'analyze').mockResolvedValue('All layout properties conform with standard design tokens. Margins and alignments check out perfectly. Spacing and primaryColor check completed.');

            const result = await githubDocsService.auditPrVisualLayout(base64Image, layoutParams);

            expect(result.success).toBe(true);
            expect(result.complianceScore).toBe(100);
            expect(result.status).toBe('PASSED');
            expect(result.details).toContain('standard design tokens');
            expect(visionSpy).toHaveBeenCalledWith(
                expect.any(String),
                expect.stringContaining('primaryColor'),
                'image/png'
            );
        });
    });
});
