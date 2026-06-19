import { describe, it, expect } from 'vitest';
import { dryScannerService } from './dry_scanner.service.js';

describe('DryScannerService Tests', () => {
    it('should find exact duplicate function declarations in different files', () => {
        const filesData = [
            {
                path: 'fileA.js',
                content: `
                    function calculateTotal(price, tax) {
                        const subtotal = price * 1.15;
                        const grandTotal = subtotal + tax;
                        return grandTotal;
                    }
                `
            },
            {
                path: 'fileB.js',
                content: `
                    function computeSum(price, tax) {
                        const subtotal = price * 1.15;
                        const grandTotal = subtotal + tax;
                        return grandTotal;
                    }
                `
            }
        ];

        const result = dryScannerService.scanDuplicates(filesData, 2);
        expect(result).toHaveLength(1);
        expect(result[0].similarity).toBeGreaterThanOrEqual(0.9);
        expect(result[0].functionA.filePath).toBe('fileA.js');
        expect(result[0].functionB.filePath).toBe('fileB.js');
    });

    it('should ignore functions below the minLines threshold', () => {
        const filesData = [
            {
                path: 'fileA.js',
                content: `
                    function shortFn() {
                        return 1;
                    }
                `
            },
            {
                path: 'fileB.js',
                content: `
                    function shortFn() {
                        return 1;
                    }
                `
            }
        ];

        const result = dryScannerService.scanDuplicates(filesData, 5);
        expect(result).toHaveLength(0);
    });

    it('should calculate low similarity for different function behaviors', () => {
        const filesData = [
            {
                path: 'fileA.js',
                content: `
                    function formatString(input) {
                        const trimmed = input.trim();
                        const result = trimmed.toUpperCase();
                        return result;
                    }
                `
            },
            {
                path: 'fileB.js',
                content: `
                    function performDivision(a, b) {
                        if (b === 0) return 0;
                        const divVal = a / b;
                        return divVal;
                    }
                `
            }
        ];

        const result = dryScannerService.scanDuplicates(filesData, 2);
        expect(result).toHaveLength(0);
    });
});
