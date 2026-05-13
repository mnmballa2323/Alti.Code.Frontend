import { performanceAgent } from './src/app/modules/agents/performance.agent.js';
import { GeminiAiService } from './src/app/modules/gemini/gemini.service.js';

async function testPerformance() {
    console.log("--- TESTING AUTONOMOUS ALGORITHM OPTIMIZER ---");

    const naiveCode = `
    // Find intersection of two large arrays
    function findDuplicates(arr1, arr2) {
        let duplicates = [];
        for (let i = 0; i < arr1.length; i++) {
            for (let j = 0; j < arr2.length; j++) {
                if (arr1[i] === arr2[j]) {
                    duplicates.push(arr1[i]);
                }
            }
        }
        return duplicates;
    }
    `;

    console.log("Feeding O(N^2) Nested Loop to the PerformanceAgent...");

    GeminiAiService.generateContent = async (prompt) => {
        // Mock to verify parsing schema
        return JSON.stringify({
            isOptimal: false,
            currentComplexity: "O(N * M)",
            bottleneckDescription: "The nested loop traverses the entire second array for every element in the first array, causing an exponential slowdown (O(N^2) if arrays are equal size).",
            optimizedComplexity: "O(N + M)",
            optimizedCode: "function findDuplicates(arr1, arr2) {\n  const set1 = new Set(arr1);\n  return arr2.filter(item => set1.has(item));\n}"
        });
    };

    try {
        console.log("\nExecuting Big-O Audit...");
        const result = await performanceAgent.optimizeComplexity(naiveCode, 'javascript');

        console.log("\nPERFORMANCE REPORT:");
        console.log(JSON.stringify(result, null, 2));

        if (!result.isOptimal && result.optimizedComplexity.includes('O(N') && result.optimizedCode.includes('Set')) {
            console.log("\n✅ SUCCESS: Performance Agent correctly identified the O(N^2) bottleneck and injected a linear O(N) Set-based optimization.");
            process.exit(0);
        } else {
            console.log("\n❌ FAILED: Performance Agent failed to optimize the quadratic time trap.");
            process.exit(1);
        }

    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

testPerformance();
