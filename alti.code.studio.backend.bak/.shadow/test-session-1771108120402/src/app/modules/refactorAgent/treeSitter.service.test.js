import { describe, it, expect, beforeAll } from 'vitest';
import { treeSitterService } from './treeSitter.service.js';

describe('TreeSitterService', () => {
    beforeAll(async () => {
        // Ensure WASM is initialized before tests
        await treeSitterService.init();
    });

    it('should be initialized', () => {
        expect(treeSitterService.isInitialized).toBe(true);
        expect(treeSitterService.parser).toBeDefined();
    });

    it('should parse JavaScript code', async () => {
        const code = 'function hello() { return "world"; }';
        const tree = await treeSitterService.parse(code, 'javascript');

        expect(tree).toBeDefined();
        expect(tree.rootNode).toBeDefined();
        expect(tree.rootNode.type).toBe('program');

        // Check if it captured the function
        const funcNode = tree.rootNode.children.find(n => n.type === 'function_declaration');
        expect(funcNode).toBeDefined();
    });

    it('should query for function names', async () => {
        const code = 'class Test { method() {} }';
        const query = `(method_definition name: (property_identifier) @methodName)`;

        const matches = await treeSitterService.query(code, query, 'javascript');
        expect(matches.length).toBeGreaterThan(0);
        expect(matches[0].captures[0].node.text).toBe('method');
    });
});
