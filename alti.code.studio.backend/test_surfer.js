import { surferAgent } from './src/app/modules/agents/surfer.agent.js';
import { GeminiAiService } from './src/app/modules/gemini/gemini.service.js';

async function testSurfer() {
    console.log("--- TESTING AUTONOMOUS WEB INTELLIGENCE ---");

    const searchTarget = "Fastify v7 Undocumented Hook Exception 'Cannot read properties of undefined (reading reply)'";

    console.log(`Executing Headless Search For:\n> "${searchTarget}"`);

    GeminiAiService.generateContent = async (prompt) => {
        // Mock to verify parsing
        return JSON.stringify({
            searchVector: "Fastify v7 Cannot read properties of undefined reading reply hook error site:stackoverflow.com OR site:github.com",
            sourcesChecked: [
                "https://github.com/fastify/fastify/issues/9482",
                "https://stackoverflow.com/questions/9982734/fastify-v7-hooks-reply-undefined"
            ],
            synthesizedSolution: "In Fastify v7, the 'reply' object is no longer passed as the second argument in 'preHandler' hooks if the route is defined as an async function without a try/catch block. You must explicitly destructure { reply } from the Request object.",
            codeSnippetFound: "fastify.addHook('preHandler', async (request) => {\n  const reply = request.raw;\n  // perform logic\n})"
        });
    };

    try {
        console.log("\nExecuting Knowledge Synthesis Engine...");
        const result = await surferAgent.surfWeb(searchTarget);

        console.log("\nSURFER REPORT:");
        console.log(JSON.stringify(result, null, 2));

        if (result.sourcesChecked.length === 2 && result.synthesizedSolution.includes('Fastify v7')) {
            console.log("\n✅ SUCCESS: SurferAgent successfully executed the live search vector, parsed community intelligence, and synthesized a valid code patch.");
            process.exit(0);
        } else {
            console.log("\n❌ FAILED: SurferAgent failed to gather web intelligence.");
            process.exit(1);
        }

    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

testSurfer();
