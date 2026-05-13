
import { sandboxService } from '../src/app/modules/shadowWorkspace/sandbox.service.js';
import { contextService } from '../src/app/modules/cortex/context.service.js';
import { GeminiAiService } from '../src/app/modules/gemini/gemini.service.js';
import { VectorMemory } from '../src/app/shared/memory.js';

// MOCK VECTOR MEMORY
VectorMemory.search = async () => [{ metadata: { filePath: 'foo.js' }, content: 'Foo Code' }];

// MOCK GEMINI
GeminiAiService.generateContent = async (prompt) => {
    return "The Cortex analyzed the graph.";
};

async function verifyPhase8() {
    console.log("🚀 Testing Phase 8: The Foundation (Safety & Memory)...");

    try {
        // --- TEST 1: THE SANDBOX ---
        console.log("\n📦 Testing The Sandbox...");

        // A. Safe Code
        const safeResult = await sandboxService.execute('const a = 1; a + 1;', {});
        if (safeResult === 2) {
            console.log("✅ Sandbox executed safe code correctly.");
        } else {
            throw new Error("Sandbox failed safe execution.");
        }

        // B. Unsafe Code (Should Fail or be blocked)
        try {
            // We use a custom sandbox that doesn't include process, so this should throw "process is not defined"
            await sandboxService.execute('process.exit(1)', {});
            throw new Error("Sandbox leaked! Reached process.exit");
        } catch (e) {
            console.log("Sandbox error:", e.message);
            if (e.message.includes("process is not defined") || e.message.includes("Sandbox Error")) {
                console.log("✅ Sandbox successfully blocked 'process.exit'.");
            } else {
                throw e; // Unexpected error
            }
        }

        // --- TEST 2: THE CORTEX ---
        console.log("\n🧠 Testing The Cortex...");

        contextService.addDependency("src/main.js", "src/utils.js");
        const queryResult = await contextService.query("What depends on src/main.js?", {});

        if (queryResult.graphInfo === "Included") {
            console.log("✅ Cortex included Graph Info in analysis.");
        } else {
            throw new Error("Cortex failed to use Graph Info.");
        }

        console.log("\n✅ Phase 8 Verified Successfully!");

    } catch (error) {
        console.error("❌ Verification Failed:", error);
        process.exit(1);
    }
}

verifyPhase8();
