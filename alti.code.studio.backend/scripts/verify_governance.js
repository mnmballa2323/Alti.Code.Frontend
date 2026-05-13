
import axios from 'axios';

const API_URL = 'http://localhost:5000/api/v1';

const verifyGovernance = async () => {
    console.log("🕵️ Verifying Governance API...");

    try {
        // Test Audit Logs
        const res = await axios.get(`${API_URL}/governance/audit-logs?limit=5`);

        if (res.status === 200 && Array.isArray(res.data.data)) {
            console.log("✅ Audit Logs Endpoint works!");
            console.log(`   Retrieved ${res.data.data.length} logs.`);
            if (res.data.data.length > 0) {
                console.log("   Sample Log:", JSON.stringify(res.data.data[0]).substring(0, 100) + "...");
            }
        } else {
            console.error("❌ Failed to retrieve audit logs:", res.data);
            process.exit(1);
        }

    } catch (error) {
        console.error("❌ Governance Verification Failed:", error.message);
        if (error.response) {
            console.error("   Status:", error.response.status);
            console.error("   Data:", error.response.data);
        }
        process.exit(1);
    }
};

verifyGovernance();
