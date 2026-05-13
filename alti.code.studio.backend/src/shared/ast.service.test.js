import { describe, it, expect } from 'vitest';
import { astService } from './ast.service.js';

describe('Universal AST Syntactic Awareness (Phase 15)', () => {

    it('should mathematically extract a nested class method regardless of regex fragility', () => {
        const sourceCode = `
import { logger } from 'shared';

class ComplexHandler {
    constructor() {
        this.cache = {};
    }

    async processData(input) {
        if (!input) {
            return {
                status: 'error',
                data: null
            };
        }
        
        const mapped = input.map(i => {
            // Nested brackets that destroy naive regex parsers
            if (i.id === 1) { return { ...i, flag: true }; }
            return i;
        });

        return mapped;
    }

    anotherMethod() {
        return false;
    }
}
        `;

        const extracted = astService.extractFunction(sourceCode, 'processData');

        expect(extracted).not.toBeNull();
        expect(extracted).toContain('async processData(input)');
        expect(extracted).toContain('return mapped;');
        expect(extracted).not.toContain('anotherMethod');
        expect(extracted).not.toContain('constructor');
    });

    it('should calculate structural cyclomatic complexity', () => {
        const highComplexityCode = `
function calculate(a, b) {
    if (a > b) {
        return true;
    } else if (a < b && b > 0 || a === -1) {
        for (let i = 0; i < 10; i++) {
            while(b > 0) {
                b--;
            }
        }
    }
    return a > 0 ? a : b;
}
        `;

        const complexity = astService.calculateComplexity(highComplexityCode);

        // Base(1) + if(1) + else-if(1) + &&(1) + ||(1) + for(1) + while(1) + ternary(1) = 8
        expect(complexity).toBe(8);
    });

    it('should calculate base complexity as 1 for a flat function', () => {
        const flatCode = `
function simple() {
    console.log("Hello");
    return 1 + 1;
}
        `;
        const complexity = astService.calculateComplexity(flatCode);
        expect(complexity).toBe(1);
    });
});
