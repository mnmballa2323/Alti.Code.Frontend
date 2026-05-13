
import axios from 'axios';
import express from 'express';
import { dlpMiddleware } from './src/app/middlewares/dlp.middleware.js';
import request from 'supertest';

// Create a mock app to test the middleware in isolation
const app = express();
app.use(express.json());
app.use(dlpMiddleware);

app.get('/test-leak', (req, res) => {
    res.json({
        message: 'Here is your secret',
        apiKey: 'AKIAIOSFODNN7EXAMPLE', // Fake AWS Key
        creditCard: '4532 1234 5678 9012' // Fake CC
    });
});

app.get('/test-safe', (req, res) => {
    res.json({
        message: 'Hello World',
        data: 'Safe data'
    });
});

async function checkDLP() {
    console.log('--- Verifying Data Loss Prevention (DLP) ---');

    // Test 1: Leak Scenario
    console.log('\n1. Testing Sensitive Data Leak...');
    const leakRes = await request(app).get('/test-leak');

    if (leakRes.body.apiKey === '[REDACTED_AWS_KEY]' && leakRes.body.creditCard === '[REDACTED_CREDIT_CARD]') {
        console.log('✅ DLP Redacted Sensitive Data');
    } else {
        console.error('❌ DLP Failed to Redact:', leakRes.body);
        process.exit(1);
    }

    // Test 2: Safe Scenario
    console.log('\n2. Testing Safe Data...');
    const safeRes = await request(app).get('/test-safe');
    if (safeRes.body.message === 'Hello World') {
        console.log('✅ Safe Data integrity maintained');
    }

    console.log('\n--- DLP Verification Complete ---');
}

checkDLP();
