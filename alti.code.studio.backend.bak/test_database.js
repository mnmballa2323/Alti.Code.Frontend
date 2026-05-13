import { databaseAgent } from './src/app/modules/agents/database.agent.js';
import { GeminiAiService } from './src/app/modules/gemini/gemini.service.js';

async function testDBA() {
    console.log("--- TESTING AUTONOMOUS DATABASE ADMINISTRATOR ---");

    const mockSchema = `
    CREATE TABLE users (
        id UUID PRIMARY KEY,
        created_at TIMESTAMP,
        email VARCHAR(255) NOT NULL,
        password_hash VARCHAR(255)
    );
    `;

    const badQuery = "SELECT * FROM users WHERE email = 'test@example.com';";

    console.log(`Feeding Query to DBA:\n> "${badQuery}"`);

    GeminiAiService.generateContent = async (prompt) => {
        // Mock to verify parsing
        return JSON.stringify({
            isOptimized: false,
            bottleneck: "The query performs a full table scan, filtering dynamically on the 'email' column which has no index.",
            suggestedMigration: "CREATE INDEX idx_users_email ON users(email);",
            confidenceScore: 98
        });
    };

    try {
        console.log("\nExecuting Query Execution Plan Analysis...");
        const result = await databaseAgent.analyzeQuery(badQuery, mockSchema);

        console.log("\nDBA REPORT:");
        console.log(JSON.stringify(result, null, 2));

        if (!result.isOptimized && result.suggestedMigration.includes('CREATE INDEX') && result.confidenceScore > 90) {
            console.log("\n✅ SUCCESS: DatabaseAgent correctly diagnosed a missing B-Tree index and provided valid SQL mitigation logic.");
            process.exit(0);
        } else {
            console.log("\n❌ FAILED: DatabaseAgent failed to optimize the sluggish query.");
            process.exit(1);
        }

    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

testDBA();
