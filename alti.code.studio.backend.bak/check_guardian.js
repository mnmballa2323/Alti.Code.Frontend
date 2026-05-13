
const API_URL = 'http://localhost:5000/api/v1/guardian/audit';

const safeCode = \`
function calculateSum(a, b) {
    return a + b;
}
console.log(calculateSum(5, 10));
\`;

const unsafeCode = \`
const fs = require('fs');
fs.rmdirSync('/', { recursive: true });
process.exit(1);
\`;

const checkGuardian = async () => {
    console.log("🛡️ Testing Guardian Angel...");

    const audit = async (code, context) => {
        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code, context })
            });
            const data = await response.json();
            return data;
        } catch (error) {
            return { success: false, error: error.message };
        }
    };

    // Test 1: Safe Code
    console.log("\\n1. Auditing Safe Code...");
    const resSafe = await audit(safeCode, 'Test Safe');
    if (resSafe.success) {
        console.log("Verdict:", resSafe.data.safe ? "✅ APPROVED" : "❌ REJECTED");
        console.log("Reasoning:", resSafe.data.reasoning);
    } else {
        console.error("Request Failed:", resSafe.error);
    }

    // Test 2: Unsafe Code
    console.log("\\n2. Auditing Unsafe Code...");
    const resUnsafe = await audit(unsafeCode, 'Test Unsafe');
     if (resUnsafe.success) {
        console.log("Verdict:", resUnsafe.data.safe ? "✅ APPROVED" : "❌ REJECTED");
        console.log("Reasoning:", resUnsafe.data.reasoning);
    } else {
        console.error("Request Failed:", resUnsafe.error);
    }
};

checkGuardian();
