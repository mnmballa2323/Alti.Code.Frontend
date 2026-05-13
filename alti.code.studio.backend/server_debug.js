
import http from 'http';
console.log('1. http imported');
import mongoose from 'mongoose';
console.log('2. mongoose imported');
import config from './config/index.js';
console.log('3. config imported');
import { logger } from './src/shared/logger.js';
console.log('4. logger imported');
import app from './index.js';
console.log('5. app imported');
console.log('Done');
