import { describe, it, expect } from 'vitest';
import { contextPrunerService } from './context_pruner.service.js';

describe('ContextPrunerService Tests', () => {
    it('should strip single line and block comments from code', () => {
        const rawCode = `
            /**
             * Block comment explaining class
             */
            class Calculator {
                // Constructor comment
                constructor() {
                    this.value = 0; // inline comment
                }

                /* Block method comment */
                add(x) {
                    const url = 'http://localhost/api'; // keep this protocol URL intact
                    return this.value + x;
                }
            }
        `;

        const result = contextPrunerService.pruneCode(rawCode);

        expect(result.prunedCode).not.toContain('Block comment explaining class');
        expect(result.prunedCode).not.toContain('Constructor comment');
        expect(result.prunedCode).not.toContain('inline comment');
        expect(result.prunedCode).not.toContain('Block method comment');
        expect(result.prunedCode).toContain('class Calculator');
        expect(result.prunedCode).toContain('http://localhost/api');
        expect(result.originalSize).toBeGreaterThan(result.prunedSize);
        expect(result.savingsPercent).toBeGreaterThan(0);
    });

    it('should collapse multiple blank lines to a single empty line', () => {
        const rawCode = `
            const a = 1;


            const b = 2;



            const c = 3;
        `;

        const result = contextPrunerService.pruneCode(rawCode);

        // Verify we collapsed multiple empty lines
        expect(result.prunedCode.match(/\n\s*\n/g).length).toBeLessThan(5);
        expect(result.prunedCode).toContain('const a = 1;');
        expect(result.prunedCode).toContain('const b = 2;');
        expect(result.prunedCode).toContain('const c = 3;');
    });

    it('should handle empty or null inputs gracefully', () => {
        const resultEmpty = contextPrunerService.pruneCode('');
        expect(resultEmpty.prunedCode).toBe('');
        expect(resultEmpty.savingsPercent).toBe(0);

        const resultNull = contextPrunerService.pruneCode(null);
        expect(resultNull.prunedCode).toBe('');
        expect(resultNull.savingsPercent).toBe(0);
    });
});
