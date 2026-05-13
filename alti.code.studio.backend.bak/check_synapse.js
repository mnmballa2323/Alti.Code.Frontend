import { SynapseService } from './src/app/modules/synapse/synapse.service.js';
import express from 'express';
import bodyParser from 'body-parser';

const startMockAgentServer = (port) => {
    const app = express();
    app.use(bodyParser.json());

    app.post('/', (req, res) => {
        console.log(`[MockServer:${port}] Received:`, req.body);
        res.json({ message: `Ack from MockAgent on ${port}`, received: req.body });
    });

    return new Promise((resolve) => {
        const server = app.listen(port, () => {
            console.log(`🤖 Mock Agent listening on ${port}`);
            resolve(server);
        });
    });
};

const runTest = async () => {
    console.log('🧪 Testing Synapse A2A Service (Distributed Mode)...');
    let server1, server2;

    try {
        // 0. Setup Mock Servers
        server1 = await startMockAgentServer(5001); // Security Agent
        server2 = await startMockAgentServer(5002); // Planner Agent

        // 1. Register Agents
        console.log('Step 1: Register Agents');
        await SynapseService.init();
        await SynapseService.registerAgent('security', ['scan', 'audit'], 'http://localhost:5001/');
        await SynapseService.registerAgent('planner', ['plan', 'breakdown'], 'http://localhost:5002/');

        // 2. Direct Message
        console.log('Step 2: Direct Message (HTTP)');
        const msgResult = await SynapseService.directMessage('planner', 'security', { task: 'audit_code' });

        console.log('📨 Message Result:', msgResult);
        if (msgResult.response.message.includes('Ack from MockAgent')) {
            console.log('✅ Direct message success');
        } else {
            throw new Error('Direct message response mismatch');
        }

        // 3. Broadcast
        console.log('Step 3: Broadcast (Redis Pub/Sub)');
        const bcResult = await SynapseService.broadcastMessage('planner', 'PLAN_UPDATE', { id: 123 });

        // Note: Recipients might be 0 if no *other* synapse instances are running to subscribe.
        // But we (the current process) are subscribed, so we might receive our own broadcast depending on logic?
        // Actually redis pub/sub echoes to all subscribers. We are subscribed in init().
        console.log('📢 Broadcast Result:', bcResult);

        // Wait a bit to see the log for received broadcast
        await new Promise(r => setTimeout(r, 1000));

        console.log('🎉 Synapse A2A Test Passed');

    } catch (error) {
        console.error('❌ Test Failed:', error);
        process.exitCode = 1;
    } finally {
        if (server1) server1.close();
        if (server2) server2.close();
        console.log('🛑 Cleanup done');
        process.exit(process.exitCode || 0);
    }
};

runTest();
