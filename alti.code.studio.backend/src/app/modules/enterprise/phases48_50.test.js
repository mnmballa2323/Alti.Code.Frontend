/**
 * Copyright (c) 2024 Inso Code
 *
 * ENTERPRISE PHASES 48-50 TEST SUITE
 * Workflow Engine + Data Pipeline + Enterprise Search
 */

import { describe, it, expect, vi } from 'vitest';

vi.mock('../../../shared/logger.js', () => ({
  logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn(), debug: vi.fn() },
}));

vi.mock('../agents/agent.registry.js', () => ({
  agentRegistry: {
    agents: [],
    register: vi.fn(),
    get: vi.fn(),
    list: vi.fn(() => []),
    findByCapability: vi.fn(() => []),
    get count() {
      return 0;
    },
  },
}));

vi.mock('../legion/legion.factory.js', () => ({
  legionFactory: {
    getProcessor: vi.fn(() => async () => ({ result: 'test' })),
  },
}));

// ═══════════════════════════════════════════════
// Phase 48: Workflow Engine
// ═══════════════════════════════════════════════

describe('Phase 48: Workflow Engine', () => {
  it('should define a workflow with steps', async () => {
    const { workflowEngine } = await import('./workflow.engine.js');

    const result = workflowEngine.defineWorkflow({
      name: 'Code Review Pipeline',
      tenantId: 'jpmorgan',
      steps: [
        {
          id: 'scan',
          name: 'Security Scan',
          type: 'agent',
          config: { agentName: 'scanner' },
        },
        {
          id: 'review',
          name: 'Code Review',
          type: 'agent',
          config: { agentName: 'reviewer' },
          dependsOn: ['scan'],
        },
        {
          id: 'notify',
          name: 'Notify',
          type: 'notify',
          config: { channels: ['email'] },
          dependsOn: ['review'],
        },
      ],
    });

    expect(result.workflowId).toMatch(/^wf_/);
    expect(result.steps).toBe(3);
    expect(result.version).toBe(1);
  });

  it('should execute a workflow successfully', async () => {
    const { workflowEngine } = await import('./workflow.engine.js');

    const def = workflowEngine.defineWorkflow({
      name: 'Simple Flow',
      steps: [
        { id: 'step1', type: 'agent', config: { agentName: 'test' } },
        {
          id: 'step2',
          type: 'notify',
          config: { channels: ['in_app'] },
          dependsOn: ['step1'],
        },
      ],
    });

    const exec = await workflowEngine.executeWorkflow(def.workflowId, {
      data: 'test',
    });
    expect(exec.status).toBe('COMPLETED');
    expect(Object.keys(exec.stepResults)).toHaveLength(2);
    expect(exec.duration).toBeGreaterThanOrEqual(0);
  });

  it('should support 8 step types', async () => {
    const { STEP_TYPES } = await import('./workflow.engine.js');
    expect(Object.keys(STEP_TYPES).length).toBe(8);
    expect(STEP_TYPES.agent).toBeDefined();
    expect(STEP_TYPES.condition).toBeDefined();
    expect(STEP_TYPES.parallel).toBeDefined();
    expect(STEP_TYPES.approval).toBeDefined();
  });

  it('should resolve DAG dependencies in correct order', async () => {
    const { workflowEngine } = await import('./workflow.engine.js');

    const def = workflowEngine.defineWorkflow({
      name: 'DAG Order Test',
      steps: [
        { id: 'c', type: 'agent', dependsOn: ['b'] },
        { id: 'a', type: 'agent', dependsOn: [] },
        { id: 'b', type: 'agent', dependsOn: ['a'] },
      ],
    });

    const exec = await workflowEngine.executeWorkflow(def.workflowId);
    const stepOrder = Object.keys(exec.stepResults);
    expect(stepOrder.indexOf('a')).toBeLessThan(stepOrder.indexOf('b'));
    expect(stepOrder.indexOf('b')).toBeLessThan(stepOrder.indexOf('c'));
  });

  it('should have 3 default templates', async () => {
    const { workflowEngine } = await import('./workflow.engine.js');
    const templates = workflowEngine.listTemplates();
    expect(Object.keys(templates).length).toBe(3);
    expect(templates['code-review-pipeline']).toBeDefined();
    expect(templates['data-processing']).toBeDefined();
    expect(templates['approval-flow']).toBeDefined();
  });

  it('should create workflow from template', async () => {
    const { workflowEngine } = await import('./workflow.engine.js');

    const result = workflowEngine.createFromTemplate('code-review-pipeline', {
      tenantId: 'test',
    });
    expect(result.workflowId).toMatch(/^wf_/);
    expect(result.steps).toBe(3);
  });

  it('should handle conditional steps', async () => {
    const { workflowEngine } = await import('./workflow.engine.js');

    const def = workflowEngine.defineWorkflow({
      name: 'Conditional Flow',
      steps: [
        { id: 'check', type: 'condition', config: { default: 'true' } },
        {
          id: 'action',
          type: 'agent',
          config: { agentName: 'exec' },
          dependsOn: ['check'],
        },
      ],
    });

    const exec = await workflowEngine.executeWorkflow(def.workflowId);
    expect(exec.status).toBe('COMPLETED');
    expect(exec.stepResults.check.output.branch).toBe('true');
  });

  it('should list workflows and executions', async () => {
    const { workflowEngine } = await import('./workflow.engine.js');

    const workflows = workflowEngine.listWorkflows();
    expect(workflows.length).toBeGreaterThanOrEqual(1);

    const execs = workflowEngine.listExecutions();
    expect(execs.length).toBeGreaterThanOrEqual(1);
  });

  it('should report stats', async () => {
    const { workflowEngine } = await import('./workflow.engine.js');
    const stats = workflowEngine.getStats();

    expect(stats.totalDefined).toBeGreaterThanOrEqual(1);
    expect(stats.totalExecutions).toBeGreaterThanOrEqual(1);
    expect(stats.stepTypes.length).toBe(8);
    expect(stats.templates).toBe(3);
  });
});

// ═══════════════════════════════════════════════
// Phase 49: Data Pipeline / ETL
// ═══════════════════════════════════════════════

describe('Phase 49: Data Pipeline / ETL', () => {
  it('should define a multi-stage pipeline', async () => {
    const { dataPipeline } = await import('./data.pipeline.js');

    const result = dataPipeline.definePipeline({
      name: 'User Data Cleanup',
      stages: [
        {
          id: 'filter',
          type: 'filter',
          config: { field: 'active', operator: 'eq', value: true },
        },
        {
          id: 'rename',
          type: 'rename',
          config: { mapping: { firstName: 'first_name' } },
        },
        { id: 'dedupe', type: 'dedupe', config: { field: 'email' } },
      ],
    });

    expect(result.pipelineId).toMatch(/^pipe_/);
    expect(result.stages).toBe(3);
  });

  it('should execute filter transformer', async () => {
    const { dataPipeline } = await import('./data.pipeline.js');

    const pipe = dataPipeline.definePipeline({
      name: 'Filter Test',
      stages: [
        {
          type: 'filter',
          config: { field: 'score', operator: 'gte', value: 80 },
        },
      ],
    });

    const data = [
      { name: 'A', score: 95 },
      { name: 'B', score: 60 },
      { name: 'C', score: 85 },
    ];
    const result = dataPipeline.executePipeline(pipe.pipelineId, data);

    expect(result.status).toBe('COMPLETED');
    expect(result.outputRecords).toBe(2);
    expect(result.outputData.every(r => r.score >= 80)).toBe(true);
  });

  it('should execute map transformer', async () => {
    const { dataPipeline } = await import('./data.pipeline.js');

    const pipe = dataPipeline.definePipeline({
      name: 'Map Test',
      stages: [
        {
          type: 'map',
          config: { addFields: { role: 'engineer' }, removeFields: ['temp'] },
        },
      ],
    });

    const data = [
      { name: 'Alice', temp: 'x' },
      { name: 'Bob', temp: 'y' },
    ];
    const result = dataPipeline.executePipeline(pipe.pipelineId, data);

    expect(result.outputData[0].role).toBe('engineer');
    expect(result.outputData[0].temp).toBeUndefined();
  });

  it('should execute aggregate transformer', async () => {
    const { dataPipeline } = await import('./data.pipeline.js');

    const pipe = dataPipeline.definePipeline({
      name: 'Aggregate Test',
      stages: [
        {
          type: 'aggregate',
          config: { groupBy: 'dept', sumField: 'salary' },
        },
      ],
    });

    const data = [
      { dept: 'eng', salary: 100 },
      { dept: 'eng', salary: 120 },
      { dept: 'sales', salary: 80 },
    ];
    const result = dataPipeline.executePipeline(pipe.pipelineId, data);

    expect(result.outputRecords).toBe(2);
    const eng = result.outputData.find(r => r.dept === 'eng');
    expect(eng.sum).toBe(220);
    expect(eng.count).toBe(2);
  });

  it('should execute dedupe transformer', async () => {
    const { dataPipeline } = await import('./data.pipeline.js');

    const pipe = dataPipeline.definePipeline({
      name: 'Dedupe Test',
      stages: [{ type: 'dedupe', config: { field: 'email' } }],
    });

    const data = [
      { email: 'a@test.com', name: 'A' },
      { email: 'b@test.com', name: 'B' },
      { email: 'a@test.com', name: 'A dup' },
    ];
    const result = dataPipeline.executePipeline(pipe.pipelineId, data);
    expect(result.outputRecords).toBe(2);
  });

  it('should execute sort transformer', async () => {
    const { dataPipeline } = await import('./data.pipeline.js');

    const pipe = dataPipeline.definePipeline({
      name: 'Sort Test',
      stages: [{ type: 'sort', config: { field: 'age', order: 'desc' } }],
    });

    const data = [
      { name: 'A', age: 30 },
      { name: 'B', age: 25 },
      { name: 'C', age: 35 },
    ];
    const result = dataPipeline.executePipeline(pipe.pipelineId, data);

    expect(result.outputData[0].age).toBe(35);
    expect(result.outputData[2].age).toBe(25);
  });

  it('should execute enrich transformer', async () => {
    const { dataPipeline } = await import('./data.pipeline.js');

    const pipe = dataPipeline.definePipeline({
      name: 'Enrich Test',
      stages: [
        {
          type: 'enrich',
          config: {
            computations: {
              fullName: {
                type: 'concat',
                fields: ['first', 'last'],
                separator: ' ',
              },
            },
          },
        },
      ],
    });

    const data = [{ first: 'John', last: 'Doe' }];
    const result = dataPipeline.executePipeline(pipe.pipelineId, data);
    expect(result.outputData[0].fullName).toBe('John Doe');
  });

  it('should compute data quality score', async () => {
    const { dataPipeline } = await import('./data.pipeline.js');

    const pipe = dataPipeline.definePipeline({
      name: 'Quality Test',
      stages: [{ type: 'validate', config: { required: ['name', 'email'] } }],
    });

    const data = [
      { name: 'A', email: 'a@t.com' },
      { name: 'B', email: 'b@t.com' },
    ];
    const result = dataPipeline.executePipeline(pipe.pipelineId, data);

    expect(result.dataQuality.grade).toMatch(/[A-F]/);
    expect(result.dataQuality.score).toBeGreaterThanOrEqual(0);
  });

  it('should support 10 transformer types', async () => {
    const { TRANSFORMERS } = await import('./data.pipeline.js');
    expect(Object.keys(TRANSFORMERS).length).toBe(10);
  });

  it('should register schemas', async () => {
    const { dataPipeline } = await import('./data.pipeline.js');

    const schema = dataPipeline.registerSchema('UserProfile', {
      fields: [
        { name: 'email', type: 'string', required: true },
        { name: 'age', type: 'number' },
      ],
    });

    expect(schema.schemaId).toMatch(/^schema_/);
    expect(dataPipeline.listSchemas().length).toBeGreaterThanOrEqual(1);
  });

  it('should report stats', async () => {
    const { dataPipeline } = await import('./data.pipeline.js');
    const stats = dataPipeline.getStats();

    expect(stats.totalPipelines).toBeGreaterThanOrEqual(1);
    expect(stats.totalExecutions).toBeGreaterThanOrEqual(1);
    expect(stats.transformers.length).toBe(10);
  });
});

// ═══════════════════════════════════════════════
// Phase 50: Enterprise Search
// ═══════════════════════════════════════════════

describe('Phase 50: Enterprise Search', () => {
  it('should index documents', async () => {
    const { enterpriseSearch } = await import('./enterprise.search.js');

    const result = enterpriseSearch.index({
      type: 'agent',
      tenantId: 'jpmorgan',
      title: 'Code Review Agent',
      body: 'Automated code review powered by GPT-4o',
      fields: { capabilities: 'security, performance, maintainability' },
    });

    expect(result.docId).toMatch(/^doc_/);
    expect(result.indexed).toBe(true);
  });

  it('should search and return ranked results', async () => {
    const { enterpriseSearch } = await import('./enterprise.search.js');

    // Index a few documents
    enterpriseSearch.index({
      type: 'agent',
      title: 'Security Scanner',
      body: 'Scans code for vulnerabilities',
      tenantId: 'test',
    });
    enterpriseSearch.index({
      type: 'dispatch',
      title: 'Deploy Task',
      body: 'Deploy to production server',
      tenantId: 'test',
    });
    enterpriseSearch.index({
      type: 'log',
      title: 'Security Alert',
      body: 'Unauthorized access detected',
      tenantId: 'test',
    });

    const results = enterpriseSearch.search('security');
    expect(results.total).toBeGreaterThanOrEqual(2);
    expect(results.results[0].score).toBeGreaterThan(0);
  });

  it('should filter by entity type', async () => {
    const { enterpriseSearch } = await import('./enterprise.search.js');

    const results = enterpriseSearch.search('security', { type: 'agent' });
    expect(results.results.every(r => r.type === 'agent')).toBe(true);
  });

  it('should filter by tenant', async () => {
    const { enterpriseSearch } = await import('./enterprise.search.js');

    enterpriseSearch.index({
      type: 'agent',
      title: 'Private Agent',
      body: 'Tenant-specific agent',
      tenantId: 'goldman',
    });
    const results = enterpriseSearch.search('agent', { tenantId: 'goldman' });
    expect(results.results.every(r => r.tenantId === 'goldman')).toBe(true);
  });

  it('should provide autocomplete suggestions', async () => {
    const { enterpriseSearch } = await import('./enterprise.search.js');

    const suggestions = enterpriseSearch.suggest('sec');
    expect(suggestions.length).toBeGreaterThanOrEqual(1);
    expect(suggestions.every(s => s.startsWith('sec'))).toBe(true);
  });

  it('should support fuzzy matching', async () => {
    const { enterpriseSearch } = await import('./enterprise.search.js');

    enterpriseSearch.index({
      type: 'agent',
      title: 'Performance Monitor',
      body: 'Monitors system performance metrics',
      tenantId: 'test',
    });

    // Typo: "perfomance" (missing 'r')
    const results = enterpriseSearch.search('perfomance', { fuzzy: true });
    expect(results.total).toBeGreaterThanOrEqual(1);
  });

  it('should compute facets', async () => {
    const { enterpriseSearch } = await import('./enterprise.search.js');

    const results = enterpriseSearch.search('agent');
    expect(results.facets).toBeDefined();
    expect(results.facets.types).toBeDefined();
    expect(results.facets.tenants).toBeDefined();
  });

  it('should support 7 entity types', async () => {
    const { ENTITY_TYPES } = await import('./enterprise.search.js');
    expect(Object.keys(ENTITY_TYPES).length).toBe(7);
    expect(ENTITY_TYPES.agent).toBeDefined();
    expect(ENTITY_TYPES.workflow).toBeDefined();
  });

  it('should track search analytics', async () => {
    const { enterpriseSearch } = await import('./enterprise.search.js');
    const analytics = enterpriseSearch.getAnalytics();

    expect(analytics.totalSearches).toBeGreaterThan(0);
    expect(analytics.popularTerms.length).toBeGreaterThanOrEqual(1);
  });

  it('should report stats', async () => {
    const { enterpriseSearch } = await import('./enterprise.search.js');
    const stats = enterpriseSearch.getStats();

    expect(stats.totalIndexed).toBeGreaterThanOrEqual(1);
    expect(stats.totalDocuments).toBeGreaterThanOrEqual(1);
    expect(stats.indexTerms).toBeGreaterThanOrEqual(1);
    expect(stats.entityTypes.length).toBe(7);
  });
});

// ═══════════════════════════════════════════════
// Cross Integration
// ═══════════════════════════════════════════════

describe('Phases 48-50 Cross Integration', () => {
  it('should export all modules from barrel index', async () => {
    const enterprise = await import('./index.js');

    // Phase 48
    expect(enterprise.workflowEngine).toBeDefined();
    expect(enterprise.STEP_TYPES).toBeDefined();
    expect(enterprise.WORKFLOW_STATUSES).toBeDefined();

    // Phase 49
    expect(enterprise.dataPipeline).toBeDefined();
    expect(enterprise.TRANSFORMERS).toBeDefined();

    // Phase 50
    expect(enterprise.enterpriseSearch).toBeDefined();
    expect(enterprise.ENTITY_TYPES).toBeDefined();
  });

  it('should index workflow into search', async () => {
    const { workflowEngine, enterpriseSearch } = await import('./index.js');

    const wf = workflowEngine.defineWorkflow({
      name: 'Searchable Workflow',
      steps: [{ id: 's1', type: 'agent', config: { agentName: 'test' } }],
    });

    enterpriseSearch.index({
      type: 'workflow',
      title: 'Searchable Workflow',
      body: 'A workflow that should appear in search',
      fields: { workflowId: wf.workflowId },
    });

    const results = enterpriseSearch.search('Searchable Workflow');
    expect(results.total).toBeGreaterThanOrEqual(1);
  });

  it('should execute workflow then process output through pipeline', async () => {
    const { workflowEngine, dataPipeline } = await import('./index.js');

    const wfDef = workflowEngine.defineWorkflow({
      name: 'Pipeline Source',
      steps: [
        { id: 'data', type: 'agent', config: { agentName: 'dataSource' } },
      ],
    });

    const exec = await workflowEngine.executeWorkflow(wfDef.workflowId);
    expect(exec.status).toBe('COMPLETED');

    // Feed output into pipeline
    const pipe = dataPipeline.definePipeline({
      name: 'Post-Workflow Transform',
      stages: [{ type: 'map', config: { addFields: { processed: true } } }],
    });

    const pipeResult = dataPipeline.executePipeline(pipe.pipelineId, [
      exec.output,
    ]);
    expect(pipeResult.status).toBe('COMPLETED');
    expect(pipeResult.outputData[0].processed).toBe(true);
  });
});
