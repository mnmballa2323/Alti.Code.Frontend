
import axios from 'axios';
import { io } from 'socket.io-client';

const API_URL = 'http://127.0.0.1:5001/api/v1';
const SOCKET_URL = 'http://127.0.0.1:5001';

const runChaosTest = async () => {
    console.log("🐵 Starting Chaos Monkey Test...");

    // 0. Health Check
    try {
        const root = await axios.get(`${SOCKET_URL}/`);
        console.log("✅ Root Health Check:", root.data);
    } catch (e) {
        console.error("❌ Root Health Check Failed:", e.message);
        if (e.response) {
            console.log("   Status:", e.response.status);
            console.log("   Headers:", e.response.headers);
            console.log("   Data:", e.response.data);
        }
    }

    try {
        const status = await axios.get(`${API_URL}/agents/status`);
        console.log("✅ Agent Status Check:", status.data);
    } catch (e) {
        console.error("❌ Agent Status Check Failed:", e.message);
    }

    // 1. Enable Chaos Mode
    try {
        await axios.post(`${API_URL}/agents/chaos`, { enabled: true }, {
            headers: { 'Content-Type': 'application/json' }
        });
        console.log("🔥 Chaos Mode ENABLED (30% failure rate per step)");
    } catch (e) {
        console.error("❌ Failed to enable Chaos Mode", e.message);
        process.exit(1);
    }

    // 2. Connect Socket to listen for healing events
    const socket = io(SOCKET_URL);
    let healingDetected = false;

    socket.on('connect', () => console.log("🔌 Connected to Event Stream"));

    socket.on('agent:thought', (data) => {
        console.log(`💭 Thought: ${data.message}`);
        if (data.message.includes("Self-healing")) {
            console.log("❤️‍🩹 SELF-HEALING EVENT DETECTED!");
            healingDetected = true;
        }
    });

    // 3. Launch a Mission (Needs multiple steps to trigger probability)
    console.log("🚀 Launching Mission: 'Research quantum computing and save summary'");

    try {
        const res = await axios.post(`${API_URL}/agents/mission`, {
            goal: "Research the current state of Quantum Computing and save a summary to memory."
        });

        // The response returns when the mission starts planning (or completes, depending on implementation)
        // Previous code suggested it waits for completion? 
        // GraphOrchestrator.run yields results. wrapper waits.
        // Let's assume it waits.

        if (res.data.success) {
            console.log("✅ Mission Completed Successfully!");
            if (healingDetected) {
                console.log("🏆 TEST PASSED: System recovered from failure!");
            } else {
                console.log("⚠️ TEST INCONCLUSIVE: No failures occurred (random chance). Try again.");
            }
        } else {
            console.log("❌ Mission Failed:", res.data.message);
        }

    } catch (e) {
        console.error("❌ Mission Request Failed:", e.message);
    } finally {
        // 4. Disable Chaos Mode
        await axios.post(`${API_URL}/agents/chaos`, { enabled: false });
        console.log("🧯 Chaos Mode DISABLED");
        socket.disconnect();
    }
};

runChaosTest();
