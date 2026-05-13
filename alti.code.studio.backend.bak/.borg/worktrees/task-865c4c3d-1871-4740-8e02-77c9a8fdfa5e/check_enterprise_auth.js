
import mongoose from 'mongoose';
import config from './config/index.js';
import passport from 'passport';
import { logger } from './src/shared/logger.js';
import app from './index.js'; // Import the app to check middleware
import axios from 'axios';

async function checkEnterpriseAuth() {
    console.log('--- Checking Enterprise Auth Configuration ---');

    // 1. Check if Passport is initialized
    if (!passport._strategy('google')) {
        console.error('❌ Google Strategy not registered in Passport');
        process.exit(1);
    } else {
        console.log('✅ Google Strategy registered successfully');
    }

    // 2. Verified Config
    if (!config.google.clientId || !config.google.clientSecret) {
        console.error('❌ Google Client ID/Secret missing in config');
        process.exit(1);
    } else {
        console.log('✅ Google Config present');
    }

    console.log('--- Enterprise Auth Check Complete ---');
    process.exit(0);
}

checkEnterpriseAuth();
