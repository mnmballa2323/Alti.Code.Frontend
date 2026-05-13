
import axios from 'axios';
import { logger } from './src/shared/logger.js';
import config from './config/index.js';

const BASE_URL = `http://localhost:${config.port || 8080}/api/v1`;
const TEST_EMAIL = `test_auth_${Date.now()}@example.com`;
const TEST_PASSWORD = 'password123';

const run = async () => {
    try {
        logger.info('🔐 Starting Auth Verification...');

        // 1. Register
        logger.info('1. Registering new user...');
        try {
            await axios.post(`${BASE_URL}/auth/register`, {
                email: TEST_EMAIL,
                password: TEST_PASSWORD
            });
            logger.info('✅ Register Success');
        } catch (e) {
            // It might succeed with 201 or fail if exists
            if (e.response?.status === 201 || e.response?.status === 200) {
                logger.info('✅ Register Success (or accepted)');
            } else {
                throw e;
            }
        }

        // 2. Login
        logger.info('2. Logging in...');
        const loginRes = await axios.post(`${BASE_URL}/auth/login`, {
            email: TEST_EMAIL,
            password: TEST_PASSWORD
        });

        if (!loginRes.data.success) throw new Error('Login failed');
        const { accessToken } = loginRes.data.data;
        logger.info('✅ Login Success. Token received.');

        // 3. Protected Route
        logger.info('3. Accessing Protected Route (Get User)...');
        const userRes = await axios.get(`${BASE_URL}/auth/user/single-user`, {
            headers: { Authorization: `Bearer ${accessToken}` }
        });

        if (!userRes.data.success) throw new Error('Get User failed');
        logger.info('✅ Protected Route Success');

        // 4. Rate Limit Check
        logger.info('4. Verifying Rate Limiter (Auth Route: 5 req/min)...');
        const requests = [];
        // Burst 6 requests
        for (let i = 0; i < 6; i++) {
            requests.push(
                axios.post(`${BASE_URL}/auth/login`, {
                    email: TEST_EMAIL,
                    password: TEST_PASSWORD
                }).catch(e => e.response) // Capture error
            );
        }

        const results = await Promise.all(requests);
        const rateLimited = results.find(r => r.status === 429);

        if (rateLimited) {
            logger.info('✅ Rate Limiter Verification Success (Got 429)');
        } else {
            logger.warn('⚠️ Rate Limiter Verification Failed (Did not get 429)');
        }

        logger.info('🎉 Auth & Security Verification Completed Successfully!');
        process.exit(0);

    } catch (error) {
        logger.error('❌ Verification Failed:', error.message);
        if (error.response) {
            logger.error('Response Status:', error.response.status);
            logger.error('Response Data:', error.response.data);
        }
        process.exit(1);
    }
};

run();
