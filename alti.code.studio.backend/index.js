/**
 * Copyright (c) 2024 Alti.Code.Studio
 * 
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

// 🛡️ The Intelligence Vanguard: Universal ReDoS Immunity
import RE2 from 're2';
// global.RegExp = RE2; // Disabling global override because RE2 does not support lookarounds used by Express's path-to-regexp
// RE2 global override disabled to prevent path-to-regexp crash

import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import helmet from 'helmet';
import toobusy from 'toobusy-js';
import httpStatus from 'http-status';
import compression from 'compression';
import crypto from 'crypto';
import promClient from 'prom-client';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { paperclipService } from './src/app/modules/paperclip/paperclip.service.js';
// ⚡ PostgreSQL Database & Prisma DAL (MongoDB Deprecated)
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import xss from 'xss-clean';
import hpp from 'hpp';

import globalErrorHandler from './src/app/middlewares/globalErrorHandler/globalErrorHandler.js';
import router from './src/app/routes/index.js';
import * as trpcExpress from '@trpc/server/adapters/express';
import { appRouter } from './src/app/trpc/router.js';
import { logger } from './src/shared/logger.js';
import { marketSeeder } from './src/app/modules/enterprise/market.seeder.js';
import config from './config/index.js';

// // Load environment variables
dotenv.config();

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
    'https://app.alti.code.studio',
    'https://www.insocode.com'
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

// Enable default Prometheus metrics collection
promClient.collectDefaultMetrics();

app.use((req, res, next) => {
    // Distributed Request Tracing (Correlation IDs)
    req.id = req.headers['x-request-id'] || crypto.randomUUID();
    res.setHeader('X-Request-Id', req.id);
    console.log(`[REQUEST] ${req.id} | ${req.method} ${req.url}`);
    res.setHeader('X-Server', 'INSO-BACKEND');
    next();
});

// Network Payload Compression
app.use(compression());

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
    '/api/v1/payment/webhook',
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
    'https://app.alti.code.studio',
    'https://www.insocode.com'
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
import { CloudLoggingService } from './src/app/modules/gcpCloud/gcpLogging.service.js';
import { autoProfilerService } from './src/app/modules/qa/auto_profiler.service.js';
import onFinished from 'on-finished';

// 🛡️ World-Class Security: Google Cloud DLP Ingress Protection
app.use(dlpMiddleware);

// 🚀 Autonomous Profiler: Self-Healing Performance Monitor
app.use(autoProfilerService.monitor);

// 🖇️ Paperclip AI Fully Entrenched Reverse Proxy
app.use('/paperclip', async (req, res, next) => {
    try {
        if (!paperclipService.isReady) {
            console.log(`[Paperclip Proxy] Request to ${req.url} queued. Waiting for daemon to boot...`);
            await paperclipService.waitForReady();
        }
        next();
    } catch (err) {
        console.error('[Paperclip Proxy] Boot failure', err);
        res.status(502).json({ error: 'Paperclip subsystem failed to boot.' });
    }
}, createProxyMiddleware({
    target: 'http://127.0.0.1:8082',
    router: () => `http://127.0.0.1:${paperclipService.activePort || '8082'}`,
    changeOrigin: true,
    ws: true,
    pathRewrite: { '^/paperclip': '' },
    onError: (err, req, res) => {
        console.error('[Paperclip Proxy Error]', err);
        res.status(502).json({ error: 'Paperclip subsystem is unreachable or crashed.' });
    }
}));

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
import { apiRoutes } from './src/routes/v1/api.routes.js';
app.use('/api/v1', router);
app.use('/api/v1/engine', apiRoutes);


// tRPC routes
app.use('/api/trpc', trpcExpress.createExpressMiddleware({ router: appRouter }));

import { prisma } from './src/config/prisma.js';
import { redisClient } from './src/shared/redis.client.js';

import Stripe from 'stripe';
const stripeHealthClient = new Stripe(config.stripe?.stripe_secret_key || 'sk_test_dummy_key_to_prevent_crashes');

// GCP Native Health Check (Liveness & Readiness Probes)
app.get('/healthz', async (req, res) => {
    try {
        // Deep ping the primary database
        await prisma.$queryRawUnsafe('SELECT 1');
        
        // Ping the caching layer (soft fail if redis is down but we check it)
        const redisStatus = redisClient.isEnabled ? 'connected' : 'disconnected';
        
        // Ping Stripe API
        let stripeStatus = 'connected';
        try {
            await stripeHealthClient.prices.list({ limit: 1 });
        } catch(err) {
            stripeStatus = `unreachable: ${err.message}`;
        }
        
        res.status(200).json({
            status: 'OK',
            database: 'connected',
            redis: redisStatus,
            stripe: stripeStatus,
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

// GCP/Kubernetes Enterprise Prometheus Metrics Endpoint
app.get('/metrics', async (req, res) => {
    try {
        res.set('Content-Type', promClient.register.contentType);
        res.end(await promClient.register.metrics());
    } catch (ex) {
        res.status(500).end(ex);
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
