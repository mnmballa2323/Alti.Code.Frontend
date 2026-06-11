import { describe, it, expect } from 'vitest';
import { sarifService } from './sarif.service.js';

describe('SarifService', () => {
  it('should exist and expose generateReport method', () => {
    expect(sarifService).toBeDefined();
    expect(typeof sarifService.generateReport).toBe('function');
  });

  it('should generate a valid SARIF JSON document matching rules and findings', () => {
    const rules = [
      {
        id: 'ALTI-001',
        name: 'NoHardcodedSecrets',
        description: 'Do not hardcode secrets, tokens, or private keys.'
      }
    ];

    const findings = [
      {
        ruleId: 'ALTI-001',
        message: 'Hardcoded credentials found.',
        filePath: 'src/config/db.js',
        line: 12,
        column: 5
      }
    ];

    const doc = sarifService.generateReport({
      toolName: 'Alti-Security-Reviewer',
      toolVersion: '1.2.0',
      rules,
      findings
    });

    expect(doc).toBeDefined();
    expect(doc.version).toBe('2.1.0');
    expect(doc.runs).toBeDefined();
    expect(doc.runs.length).toBe(1);

    const run = doc.runs[0];
    expect(run.tool.driver.name).toBe('Alti-Security-Reviewer');
    expect(run.tool.driver.rules.length).toBe(1);
    expect(run.tool.driver.rules[0].id).toBe('ALTI-001');

    expect(run.results.length).toBe(1);
    expect(run.results[0].ruleId).toBe('ALTI-001');
    expect(run.results[0].message.text).toBe('Hardcoded credentials found.');
    expect(run.results[0].locations[0].physicalLocation.artifactLocation.uri).toBe('src/config/db.js');
    expect(run.results[0].locations[0].physicalLocation.region.startLine).toBe(12);
  });
});
