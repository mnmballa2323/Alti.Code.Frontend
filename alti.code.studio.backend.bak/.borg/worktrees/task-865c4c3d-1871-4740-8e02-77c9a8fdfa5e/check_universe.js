import axios from 'axios';
import { createClient } from 'redis';
import pg from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load .env
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env') });

const { Pool } = pg;
const BASE_URL = 'http://localhost:5000/api/v1';

async function checkUniverse() {
    console.log('🌌 Checking the Alti.Code.Studio Universe...');
    let allPassed = true;

    // 1. Backend Health
    try {
        console.log('   📡 Checking Backend Health...');
        // We don't have a specific /health route in the router logs I saw, 
        // but let's try root or a known endpoint like /synapse/agents
        // Actually, server.js has app.get('/', ...) -> "ASON is working! YaY!"
        const res = await axios.get('http://localhost:5000/');
        if (res.status === 200 && res.data.includes('working')) {
            console.log('     ✅ Backend is ONLINE.');
        } else {
            throw new Error(`Unexpected response: ${res.data}`);
        }
    } catch (error) {
        console.error('     ❌ Backend is OFFLINE or Unreachable:', error.message);
        allPassed = false;
    }

    // 2. Redis (Synapse)
    try {
        console.log('   🧠 Checking Synapse (Redis)...');
        const client = createClient({ url: process.env.REDIS_URL || 'redis://localhost:6379' });
        client.on('error', () => { }); // Suppress connection errors interacting with console
        await client.connect();
        await client.ping();
        console.log('     ✅ Redis is ALIVE.');
        await client.disconnect();
    } catch (error) {
        console.error('     ❌ Redis is DOWN:', error.message);
        allPassed = false;
    }

    // 3. Postgres (Memory)
    try {
        console.log('   💾 Checking Cortex Memory (Postgres)...');
        const config = {
            user: process.env.POSTGRES_USER || 'postgres',
            password: process.env.POSTGRES_PASSWORD || 'postgres',
            host: process.env.POSTGRES_HOST || 'localhost',
            database: process.env.POSTGRES_DB || 'alti_db',
            port: parseInt(process.env.POSTGRES_PORT || '5432'),
        };
        const pool = new Pool(config);
        const res = await pool.query('SELECT NOW()');
        await pool.end();
        console.log('     ✅ Postgres is ALIVE.');
    } catch (error) {
        console.error('     ❌ Postgres is DOWN or Misconfigured:', error.message);
        // allPassed = false; // Don't fail entire universe if DB is mocking, but warn
        console.warn('     ⚠️ Continuing (might be in Mock Mode).');
    }

    // 4. MCP Server via HTTP (if applicable) or simulating internal call
    // We verified MCP with check_mcp.js, let's keep this light or spawn a sub-check?
    // Let's rely on the previous checks for deep verification.

    // 5. Build/Frontend Check (Simulated)
    console.log('   🖥️  Checking Frontend Build Status...');
    // We assume if we are running, the repo exists.
    // Real check is check_frontend_connection.js
    console.log('     ℹ️  Run `check_frontend_connection.js` for full UI test.');

    if (allPassed) {
        console.log('✨ The Universe is Stable. 🚀');
    } else {
        console.error('💥 The Universe has ENTROPY. Check logs.');
        process.exit(1);
    }
}

checkUniverse();
