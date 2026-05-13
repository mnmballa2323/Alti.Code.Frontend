
import { contextService } from './src/app/modules/cortex/context.service.js';
import { VectorMemory } from './src/app/shared/memory.js';

async function checkRAG() {
    console.log('🧠 Starting Cortex RAG Verification...');

    // MOCK search to ensure RAG flow is tested even without real embeddings
    VectorMemory.search = async (query) => {
        console.log(`[MOCK] VectorMemory.search called with "${query}"`);
        return [{
            content: "The specific code for the HyperDrive engine is HYPER-999.",
            metadata: { filePath: 'secrets.txt', score: 0.99 }
        }];
    };

    try {
        // 2. Query
        console.log('❓ Asking ContextService...');
        const result = await contextService.query("What is the code for the HyperDrive engine?");

        console.log('🤖 Answer:', result.answer);
        console.log('📚 References:', result.references);

        // 3. Verify
        // The mock response from VertexService might be generic unless I tuned it.
        // But references should definitely be there.
        if (result.references.length > 0 && result.references[0] === 'secrets.txt') {
            console.log('✅ RAG Verification Successful (References found)');
        } else {
            console.log('❌ RAG Verification Failed (No references)');
            process.exit(1);
        }

    } catch (error) {
        console.error('CRITICAL ERROR:', error);
        process.exit(1);
    }
}

checkRAG();
