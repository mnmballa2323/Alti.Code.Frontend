
async function testImports() {
    console.log("Testing imports...");
    try {
        console.log("Importing logger...");
        await import('../src/shared/logger.js');
        console.log("✅ Logger imported.");

        console.log("Importing langfuse package...");
        await import('langfuse');
        console.log("✅ Langfuse package imported.");

        console.log("Importing ObservabilityService...");
        await import('../src/app/modules/monitoring/observability.service.js');
        console.log("✅ ObservabilityService imported.");

        console.log("Importing UserModel...");
        await import('../src/app/modules/auth/auth.model.js');
        console.log("✅ UserModel imported.");

        console.log("Importing DyadModel...");
        await import('../src/app/modules/dyad/dyad.model.js');
        console.log("✅ DyadModel imported.");

        console.log("Importing GeminiAiService...");
        await import('../src/app/modules/gemini/gemini.service.js');
        console.log("✅ GeminiAiService imported.");

    } catch (e) {
        console.error("❌ Import failed:", e);
    }
}

testImports();
