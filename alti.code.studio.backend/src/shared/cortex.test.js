import { describe, it, expect, beforeEach } from 'vitest';
import { cortexService } from './cortex.service.js';

describe('Neural Context Synthesis (Phase 21 - The Cortex)', () => {

    beforeEach(() => {
        // Reset the singleton graph for fresh tests
        cortexService.graph.clear();
    });

    it('should mathematically calculate the transitive impact radius of a database schema change up to the UI layer', () => {

        // Setup an enterprise architecture scenario:
        // UserDB.js (Backend schema) <- UserService.js (Backend logic) <- UserAPI.js (Backend Route) <- UserProfile.tsx (Frontend Reat UI)

        // 1. Ingest the AST Deterministic Edges
        cortexService.addDeterministicEdge('/src/backend/UserService.js', '/src/backend/UserDB.js');
        cortexService.addDeterministicEdge('/src/backend/UserAPI.js', '/src/backend/UserService.js');
        cortexService.addDeterministicEdge('/src/frontend/UserProfile.tsx', '/src/backend/UserAPI.js');

        // And a disconnected component to prove it doesn't just return everything
        cortexService.addDeterministicEdge('/src/frontend/Settings.tsx', '/src/backend/SettingsAPI.js');

        // 2. The AI Surgeon (or human) proposes editing the database schema
        const targetFile = '/src/backend/UserDB.js';

        // 3. The Cortex calculates the impact radius
        const blastRadius = cortexService.calculateImpactRadius(targetFile);

        // ASSERTIONS
        // It should flag exactly 3 downstream dependent files
        expect(blastRadius).toHaveLength(3);

        // It should explicitly identify that the React frontend breaks if the DB schema changes
        expect(blastRadius).toContain('/src/backend/UserService.js');
        expect(blastRadius).toContain('/src/backend/UserAPI.js');
        expect(blastRadius).toContain('/src/frontend/UserProfile.tsx');

        // It should NOT flag the disconnected Settings layer
        expect(blastRadius).not.toContain('/src/frontend/Settings.tsx');
        expect(blastRadius).not.toContain('/src/backend/SettingsAPI.js');
    });

    it('should return an empty array if querying a node with no dependents', () => {
        cortexService.addDeterministicEdge('/a.js', '/b.js');

        // Modifying 'a.js' impacts nothing above it
        const blastRadius = cortexService.calculateImpactRadius('/a.js');

        expect(blastRadius).toHaveLength(0);
    });

});
