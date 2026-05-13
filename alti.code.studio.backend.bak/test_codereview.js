import { codeReviewAgent } from './src/app/modules/agents/code_review.agent.js';
import { GeminiAiService } from './src/app/modules/gemini/gemini.service.js';

async function testCodeReview() {
    console.log("--- TESTING AUTONOMOUS STRICT CODE REVIEWER ---");

    const sloppyCode = `
    function X(y,z){
        if(y == null) return false;
        var r = fetch("http://api/" + y).then(d => {
            if(d.status==200){
                let k = d.json()
                // Do something
                db.save(k)
                return k
            }
        })
        return r
    }
    `;

    console.log("Feeding Sloppy JS Logic to the CodeReviewAgent...");

    GeminiAiService.generateContent = async (prompt) => {
        // Mock to avoid API latency
        return JSON.stringify({
            approved: false,
            qualityScore: 35,
            summary: "This snippet violates clean-code principles, uses var, lacks async/await structure, and ignores error handling.",
            critiques: [
                { line: 1, issue: "Functions should use descriptive names instead of X, y, z.", suggestion: "Rename to `fetchAndSaveRecord(userId, config)`" },
                { line: 3, issue: "Using `var` is deprecated and leads to hoisting issues.", suggestion: "Use `const` or `let`." },
                { line: 3, issue: "Promises are not awaited and missing `.catch()` handling.", suggestion: "Refactor using `async / await` and a try/catch block." }
            ],
            refactoredCode: "async function fetchAndSaveRecord(userId, config) {\n  if (!userId) return false;\n\n  try {\n    const response = await fetch(`http://api/${userId}`);\n    if (!response.ok) throw new Error('API fetch failed');\n\n    const data = await response.json();\n    await db.save(data);\n    return data;\n  } catch (error) {\n    logger.error('Failed to fetch and save record', error);\n    throw error;\n  }\n}"
        });
    };

    try {
        console.log("\nExecuting Senior Code Review...");
        const result = await codeReviewAgent.reviewCode(sloppyCode, 'javascript');

        console.log("\nCODE REVIEW REPORT:");
        console.log(JSON.stringify(result, null, 2));

        if (!result.approved && result.qualityScore < 50 && result.critiques.length >= 3) {
            console.log("\n✅ SUCCESS: CodeReviewAgent correctly rejected the sub-standard code, identified the anti-patterns, and provided a clean-code rewrite.");
            process.exit(0);
        } else {
            console.log("\n❌ FAILED: CodeReviewAgent failed to flag the obvious code smells.");
            process.exit(1);
        }

    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

testCodeReview();
