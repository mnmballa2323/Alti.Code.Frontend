import { describe, it, expect } from 'vitest';
import { codeGraphService } from '../../src/app/modules/graphify/codegraph.service.js';

describe('CodeGraph Backend Service Integration', () => {
    it('should successfully initialize the service', () => {
        expect(codeGraphService).toBeDefined();
        expect(codeGraphService.workspaceRoot).toBeDefined();
        expect(codeGraphService.bundledNodePath).toBeDefined();
    });

    it('should query files and return a valid ForceGraph 3D schema structure', async () => {
        // Query the graphify module itself
        const graph = await codeGraphService.getGraphForPath('src/app/modules/graphify', 50);
        
        expect(graph).toBeDefined();
        expect(graph.nodes).toBeInstanceOf(Array);
        expect(graph.links).toBeInstanceOf(Array);
        
        if (graph.nodes.length > 0) {
            const firstNode = graph.nodes[0];
            expect(firstNode).toHaveProperty('id');
            expect(firstNode).toHaveProperty('name');
            expect(firstNode).toHaveProperty('group');
            expect(firstNode).toHaveProperty('val');
            expect(firstNode).toHaveProperty('kind');
            expect(firstNode).toHaveProperty('filePath');
        }

        if (graph.links.length > 0) {
            const firstLink = graph.links[0];
            expect(firstLink).toHaveProperty('source');
            expect(firstLink).toHaveProperty('target');
            expect(firstLink).toHaveProperty('value');
            expect(firstLink).toHaveProperty('kind');
        }
    });
});
