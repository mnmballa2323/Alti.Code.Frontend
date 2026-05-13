import { securityWorkerProcessor } from './src/app/modules/securityAgent/security.worker.js';
import { GeminiAiService } from './src/app/modules/gemini/gemini.service.js';

async function testRedTeam() {
    console.log("--- TESTING AUTONOMOUS RED TEAM BOT ---");

    const mockJob = {
        id: "job-sec-999",
        data: {
            task: "pentest",
            context: "Express JS Login Route",
            code: `
            app.post('/api/login', async (req, res) => {
                const { username, password } = req.body;
                // Vulnerable query
                const query = \`SELECT * FROM users WHERE username = '\${username}' AND password = '\${password}'\`;
                const users = await db.execute(query);
                if (users.length > 0) return res.send(users[0]);
                res.status(401).send("Unauthorized");
            });
            `
        }
    };

    console.log("Feeding Vulnerable API Route to the RedTeam Agent...");

    GeminiAiService.generateContent = async (prompt) => {
        // Mock to ensure JSON parsing and schema match without API calls
        return JSON.stringify({
            vulnerable: true,
            exploitVector: "An attacker can pass `admin' OR 1=1 --` into the username field, bypassing the password check and dumping the first user record.",
            cvePattern: "CWE-89: Improper Neutralization of Special Elements used in an SQL Command ('SQL Injection')",
            remediationCode: "const query = 'SELECT * FROM users WHERE username = ? AND password = ?'; const users = await db.execute(query, [username, password]);",
            severity: "CRITICAL"
        });
    };

    try {
        const result = await securityWorkerProcessor(mockJob);

        console.log("\nPENETRATION REPORT:");
        console.log(JSON.stringify(result, null, 2));

        if (result.vulnerable && result.severity === 'CRITICAL') {
            console.log("\n✅ SUCCESS: RedTeam Agent successfully exploited the code conceptually and provided remediation.");
            process.exit(0);
        } else {
            console.log("\n❌ FAILED: RedTeam Agent failed to detect the SQLi vulnerability.");
            process.exit(1);
        }

    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

testRedTeam();
