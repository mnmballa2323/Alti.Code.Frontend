import { describe, it, expect } from 'vitest';
import { deadCodeScannerService } from './dead_code_scanner.service.js';

describe('DeadCodeScannerService Tests', () => {
  it('should find unused imports and variables in a code block', () => {
    const code = `
            import { lodash, unusedImport } from 'lodash';
            import defaultUnused from 'express';

            export const usedVar = 10;
            const unusedVar = 20;

            console.log(lodash.clone(usedVar));
        `;

    const deadList = deadCodeScannerService.scanDeadCode(code);

    const deadNames = deadList.map(item => item.name);

    expect(deadNames).toContain('unusedImport');
    expect(deadNames).toContain('defaultUnused');
    expect(deadNames).toContain('unusedVar');

    expect(deadNames).not.toContain('lodash');
    expect(deadNames).not.toContain('usedVar');
  });

  it('should return empty array for clean code', () => {
    const code = `
            import { clone } from 'lodash';
            const x = 5;
            console.log(clone(x));
        `;

    const deadList = deadCodeScannerService.scanDeadCode(code);
    expect(deadList.length).toBe(0);
  });
});
