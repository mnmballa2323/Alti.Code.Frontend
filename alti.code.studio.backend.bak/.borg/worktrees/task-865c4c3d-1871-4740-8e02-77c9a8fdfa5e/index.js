/**
 * Copyright (c) 2024 Alti.Code.Studio
 * 
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import helmet from 'helmet';
import httpStatus from 'http-status';
import mongoose from 'mongoose';
import toobusy from 'toobusy-js';
// import config from './config';

import globalErrorHandler from './src/app/middlewares/globalErrorHandler/globalErrorHandler.js';
import router from './src/app/routes/index.js';
// // import { logger } from './src/shared/logger';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import config from './config/index.js';
// import './src/app/middlewares/resetUsage/resetUsage.js';
// import { logger } from './src/shared/logger.js';

// // Load environment variables
dotenv.config();

// import { SentinelService } from './src/app/modules/sentinel/sentinel.service.js';
// import passport from 'passport';
// import googleStrategy from './src/app/modules/auth/google.strategy.js';

// // Initialize Passport Strategies
// // passport.use(googleStrategy);

// // Initialize Sentinel
// // SentinelService.startWatch().catch(err => console.error('Failed to start Sentinel:', err));



const app = express();
app.use(express.json());

app.use((req, res, next) => {
    console.log(`[REQUEST] ${req.method} ${req.url}`);
    res.setHeader('X-Server', 'INSO-BACKEND');
    next();
});

app.use(
    cors({
        origin: [
            'https://www.insocode.com',
            'https://inso-code.netlify.app',
            'http://localhost:3000',
            'http://localhost:3100',
        ],
        credentials: true,
    }),
);

// ✅ Use body-parser raw() FIRST for Stripe webhook before any JSON parsing
app.use((req, res, next) => {
    console.log(`[EARLY LOG] ${req.method} ${req.url}`);
    next();
});
app.use(
    '/api/v1/subscription/webhook',
    express.raw({ type: 'application/json' }),
);

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.urlencoded({ extended: true }));
// app.use(passport.initialize()); // Restoring commented out just in case
app.disable('x-powered-by');

// Enable trust proxy (For Rate-Limit)
app.set('trust proxy', 'loopback');

import { RateLimitService } from './src/app/modules/security/rateLimit.service.js';
// Global Rate Limiter: 100 requests per minute
// app.use(RateLimitService.middleware(100, 60));

// Helmet middleware for security headers
app.use(helmet());

// Additional Helmet security configurations
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'", 'cdnjs.cloudflare.com'],
            styleSrc: ["'self'", "'unsafe-inline'", 'fonts.googleapis.com'],
            fontSrc: ["'self'", 'fonts.gstatic.com'],
            imgSrc: ["'self'", 'data:'],
            connectSrc: [
                "'self'",
                'https://inso-code.netlify.app',
                'https://www.insocode.com',
                'https://insocode.com',
                'https://www.insotechnology.com',
                'https://insotechnology.com',
                'http://localhost:3000',
                'http://localhost:3100',
            ],
            objectSrc: ["'none'"],
            upgradeInsecureRequests: [],
            blockAllMixedContent: [],
            frameAncestors: ["'self'", 'http://localhost:3000'], // allow iframe from frontend
        },
    }),
);
app.use(helmet.referrerPolicy({ policy: 'same-origin' }));
app.use(helmet.frameguard({ action: 'sameorigin' }));
app.use(helmet.noSniff());
app.use(helmet.xssFilter());
app.use(helmet.hidePoweredBy());
app.disable('etag');

// Prevent DOS attacks with toobusy
app.use((req, res, next) => {
    if (toobusy()) {
        res.status(503).send('Server too busy!');
    } else {
        next();
    }
});

// DLP Middleware
import { dlpMiddleware } from './src/app/middlewares/dlp.middleware.js';
app.use(dlpMiddleware);

// API routes
app.use('/api/v1', router);

// Root endpoint
app.get('/', (req, res) => {
    res.send('ASON is working! YaY!');
});

// Global error handler middleware
app.use(globalErrorHandler);

// Swagger Documentation
import swaggerUi from 'swagger-ui-express';
import { specs } from './src/config/swagger.js';
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(specs));

// 404 Handler
app.use((req, res) => {
    res.status(httpStatus.NOT_FOUND).json({
        success: false,
        message: 'Not found',
        errorMessages: [
            {
                path: req.originalUrl,
                message: 'Api not found',
            },
        ],
    });
});

export default app;
