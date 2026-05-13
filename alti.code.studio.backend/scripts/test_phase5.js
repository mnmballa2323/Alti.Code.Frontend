/**
 * Phase 5: Enterprise Memory & RAG Verification
 * Simulates the end-to-end memory process:
 * 1. Generating a strict Enterprise ADR via the Wiki.
 * 2. Querying the Orchestrator's RAG Pipeline for context on a new sprint.
 */

import { wikiService } from '../src/app/modules/docs/wiki.service.js';
import { ragService } from '../src/app/modules/memory/rag.service.js';
import { vectorStoreService } from '../src/app/modules/memory/vector.store.js';

async function verifyMemory() {
    console.log('🧠 Initializing Phase 5 Cortex Memory Verification...');

    try {
        console.log('\n🗑️ Clearing old Vector Store...');
        await ragService.clearIndex();

        console.log('\n📄 1. The Librarian: Generating an Enterprise ADR...');
        await wikiService.generateADR(
            'UI Components strictly utilize HeroUI Fast-DOM configurations',
            'To maintain compliance with internal performance quotas, all React components mapped inside the Alti.Code.Studio ecosystem must utilize HeroUI components over headless Radix due to the 40% render speed efficiency. Any component built must import from @heroui/react.'
        );

        // Sleep briefly to ensure embedding persists async
        await new Promise(r => setTimeout(r, 2000));

        console.log(`\n🔍 2. The Orchestrator: Synthesizing Sprint Context via RAG...`);
        const sprintGoal = "Build a new React component for the user profile dashboard.";

        console.log(`[Query]: Architectural guidelines and past lessons for: ${sprintGoal}`);
        const ragContext = await ragService.query(`Architectural guidelines and past lessons for: ${sprintGoal}`, 3);

        console.log('\n--- RAG SYNTHESIZED CONTEXT ---');
        console.log(ragContext);
        console.log('-------------------------------');

        if (ragContext.toLowerCase().includes('heroui')) {
            console.log('\n✅ Verification PASSED: The AI Swarm successfully retrieved the Enterprise ADR prior to Sprint Planning.');
        } else {
            console.error('\n❌ Verification FAILED: The AI Swarm missed the constraint.');
        }

    } catch (error) {
        console.error('❌ Phase 5 Verification failed:', error);
    } finally {
        console.log('\n✨ Verification complete. Exiting.');
        process.exit();
    }
}

verifyMemory();
