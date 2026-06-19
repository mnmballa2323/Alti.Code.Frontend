import { describe, it, expect } from 'vitest';
import { qualityGateService } from './quality_gate.service.js';

describe('QualityGateService Tests', () => {
    it('should return complexity 1 for simple straight-line code', () => {
        const code = `
            function add(a, b) {
                return a + b;
            }
        `;
        const result = qualityGateService.calculateComplexity(code);
        expect(result).toBe(1);
    });

    it('should correctly increment complexity for branching structures and logical operators', () => {
        const complexCode = `
            function process(items) {
                let total = 0;
                if (!items) return total; // +1 (if)

                for (let item of items) { // +1 (for-of)
                    if (item.value > 10 && item.active) { // +2 (if, &&)
                        total += item.value;
                    } else {
                        total += 1;
                    }
                }
                return total;
            }
        `;

        // Baseline (1) + 1 (if) + 1 (for-of) + 1 (if) + 1 (&&) = 5
        const result = qualityGateService.calculateComplexity(complexCode);
        expect(result).toBe(5);
    });

    it('should pass quality gate validation when within threshold limits', () => {
        const code = `
            function simple(x) {
                if (x > 0) return x;
                return 0;
            }
        `;

        const validation = qualityGateService.validateQuality(code, 3);
        expect(validation.passed).toBe(true);
        expect(validation.complexity).toBe(2);
    });

    it('should fail quality gate validation when exceeding threshold limits', () => {
        const code = `
            function complex(x) {
                if (x > 10) {
                    if (x < 20) {
                        return x;
                    }
                }
                return 0;
            }
        `;

        const validation = qualityGateService.validateQuality(code, 2);
        expect(validation.passed).toBe(false);
        expect(validation.complexity).toBe(3); // Baseline (1) + 2 (ifs)
    });
});
