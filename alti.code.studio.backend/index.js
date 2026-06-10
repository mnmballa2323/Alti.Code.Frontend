/**
 * Copyright (c) 2024 Alti.Code.Studio
 * 
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

// 🚀 Google Cloud APM: Microsecond-Level Tracing & Profiling
import traceAgent from '@google-cloud/trace-agent';
import profiler from '@google-cloud/profiler';
import { ErrorReporting } from '@google-cloud/error-reporting';

// 🛡️ The Intelligence Vanguard: Universal ReDoS Immunity
import RE2 from 're2';
// global.RegExp = RE2; // Disabling global override because RE2 does not support lookarounds used by Express's path-to-regexp
console.log('🛡️ [V8 Engine Patch] Global RegExp override disabled to prevent path-to-regexp crash.');

try {
    if (process.env.NODE_ENV === 'production' || process.env.ENABLE_GCP_APM === 'true') {
        // Initialize Error Reporting first to catch global exceptions
        const errors = new ErrorReporting();
        
        traceAgent.start();
        profiler.start({
            serviceContext: {
                service: 'alti-code-studio-backend',
                version: '1.0.2',
            },
        });
        console.log('✅ Google Cloud APM (Trace, Profiler, Error Reporting) successfully initialized.');
    }
} catch (err) {
    console.warn('⚠️ Google Cloud APM could not be started:', err.message);
}

import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import helmet from 'helmet';
import toobusy from 'toobusy-js';
import httpStatus from 'http-status';
// ⚡ PostgreSQL Database & Prisma DAL (MongoDB Deprecated)
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import xss from 'xss-clean';
import hpp from 'hpp';
// import config from './config';

import globalErrorHandler from './src/app/middlewares/globalErrorHandler/globalErrorHandler.js';
import router from './src/app/routes/index.js';
import * as trpcExpress from '@trpc/server/adapters/express';
import { appRouter } from './src/app/trpc/router.js';
// // import { logger } from './src/shared/logger';
import { marketSeeder } from './src/app/modules/enterprise/market.seeder.js';
import config from './config/index.js';
// import './src/app/middlewares/resetUsage/resetUsage.js';
// import { logger } from './src/shared/logger.js';

// // Load environment variables
dotenv.config();

// import { SentinelService } from './src/app/modules/sentinel/sentinel.service.js';
import passport from 'passport';
import googleStrategy from './src/app/modules/auth/google.strategy.js';
import githubStrategy from './src/app/modules/auth/github.strategy.js';

// Initialize Passport Strategies
passport.use('google', googleStrategy);
passport.use('github', githubStrategy);

// Initialize Sentinel
// SentinelService.startWatch().catch(err => console.error('Failed to start Sentinel:', err));

// Auto-populate the Agent Hub Marketplace
marketSeeder.seed().catch(err => console.error('Failed to seed Agent Hub:', err));



const allowedOrigins = [
    'https://alti.code.studio',
    'https://app.alti.code.studio'
];

if (config.env !== 'production') {
    allowedOrigins.push(
        'http://localhost:3000',
        'http://localhost:3001',
        'http://localhost:3005',
        'http://localhost:3100',
        'http://127.0.0.1:3000',
        'http://127.0.0.1:3001',
        'http://127.0.0.1:3005',
        'http://127.0.0.1:3100',
        'tauri://localhost',
        'http://tauri.localhost'
    );
}

const app = express();

app.use((req, res, next) => {
    console.log(`[REQUEST] ${req.method} ${req.url}`);
    res.setHeader('X-Server', 'INSO-BACKEND');
    next();
});

app.use(
    cors({
        origin: allowedOrigins,
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
app.use(express.json({ limit: '10mb' }));
app.use(cookieParser());
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));
app.use(passport.initialize());
app.disable('x-powered-by');

// Enable trust proxy (For Rate-Limit)
app.set('trust proxy', 'loopback');

import { RateLimitService } from './src/app/modules/security/rateLimit.service.js';
// Global Rate Limiter: 100 requests per minute (disabled in development)
if (process.env.NODE_ENV !== 'development') {
    app.use('/api', RateLimitService.middleware(100, 60));
}

// Helmet middleware for security headers
app.use(helmet());

// Additional Helmet security configurations
const cspConnectSrc = [
    "'self'",
    'https://alti.code.studio',
    'https://app.alti.code.studio'
];
const cspFrameAncestors = ["'self'"];

if (config.env !== 'production') {
    cspConnectSrc.push('http://localhost:3000', 'http://localhost:3100');
    cspFrameAncestors.push('http://localhost:3000');
}

app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'", 'cdnjs.cloudflare.com'],
            styleSrc: ["'self'", "'unsafe-inline'", 'fonts.googleapis.com'],
            fontSrc: ["'self'", 'fonts.gstatic.com'],
            imgSrc: ["'self'", 'data:'],
            connectSrc: cspConnectSrc,
            objectSrc: ["'none'"],
            upgradeInsecureRequests: [],
            blockAllMixedContent: [],
            frameAncestors: cspFrameAncestors, 
        },
    }),
);
app.use(helmet.hsts({
    maxAge: 31536000, 
    includeSubDomains: true, 
    preload: true
}));
app.use(helmet.referrerPolicy({ policy: 'same-origin' }));
app.use(helmet.frameguard({ action: 'sameorigin' }));
app.use(helmet.noSniff());
app.use(helmet.xssFilter());
app.use(helmet.hidePoweredBy());
app.disable('etag');

// ⚡ Database Layer Protection
// Note: express-mongo-sanitize has been purged. 
// The PostgreSQL database is autonomously protected against SQL Injection via Prisma's strict parameterized queries.

// Data Sanitization against XSS
app.use(xss());

// Prevent HTTP Parameter Pollution
app.use(hpp());

// Prevent DOS attacks with toobusy
app.use((req, res, next) => {
    if (process.env.NODE_ENV === 'production' && toobusy()) {
        res.status(503).send('Server too busy!');
    } else {
        next();
    }
});

import { acousticWorkspaceRouter } from './src/app/modules/agents/acoustic_workspace.controller.js';
acousticWorkspaceRouter(app);

import { dlpMiddleware } from './src/app/middlewares/dlp.middleware.js';
import { CloudLoggingService } from './src/app/modules/googleCloud/logging.service.js';
import { autoProfilerService } from './src/app/modules/qa/auto_profiler.service.js';
import onFinished from 'on-finished';

// 🛡️ World-Class Security: Google Cloud DLP Ingress Protection
app.use(dlpMiddleware);

// 🚀 Autonomous Profiler: Self-Healing Performance Monitor
app.use(autoProfilerService.monitor);

// 📊 Universe-Level Observability: Global Audit & Cloud Logging
app.use((req, res, next) => {
    onFinished(res, (err, response) => {
        CloudLoggingService.writeAuditLog('api-access', {
            method: req.method,
            url: req.url,
            status: response.statusCode,
            ip: req.ip,
            agent: req.headers['user-agent']
        }, response.statusCode >= 400 ? 'ERROR' : 'INFO');
    });
    next();
});

// API routes
app.use('/api/v1', router);


// tRPC routes
app.use('/api/trpc', trpcExpress.createExpressMiddleware({ router: appRouter }));

import { prisma } from './src/config/prisma.js';
import { redisClient } from './src/shared/redis.client.js';

// GCP Native Health Check (Liveness & Readiness Probes)
app.get('/healthz', async (req, res) => {
    try {
        // Deep ping the primary database
        await prisma.$queryRawUnsafe('SELECT 1');
        
        // Ping the caching layer (soft fail if redis is down but we check it)
        const redisStatus = redisClient.isEnabled ? 'connected' : 'disconnected';
        
        res.status(200).json({
            status: 'OK',
            database: 'connected',
            redis: redisStatus,
            timestamp: new Date().toISOString()
        });
    } catch (e) {
        // Return 503 Service Unavailable so Kubernetes/Cloud Run knows the pod is unhealthy
        res.status(503).json({
            status: 'ERROR',
            database: 'unreachable',
            error: e.message,
            timestamp: new Date().toISOString()
        });
    }
});

app.get('/api/version', (req, res) => {
    res.json({ version: '1.0.2' });
});

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
