/**
 * Copyright (c) 2024 Alti.Code.Studio
 * 
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import http from 'http';
import mongoose from 'mongoose';
import config from './config/index.js';
import app from './index.js'; // Make sure this exists and exports an Express app
import { logger } from './src/shared/logger.js';
import { agentRegistry } from './src/app/modules/agents/agent.registry.js';
// import { RedisClient } from './src/shared/redis.js';

process.on('uncaughtException', error => {
  logger.fatal('🚨 Uncaught Exception detected! Shutting down gracefully...', error);
  console.error('🚨 Uncaught Exception detected:', error);
  if (server) {
    server.close(() => {
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
});

let server;
mongoose.set('strictQuery', true);
mongoose.set('bufferCommands', false);
async function main() {
  try {
    // await RedisClient.connect();
    // logger.info('✅ Redis is connected successfully');
    // console.log('✅ Redis is connected successfully');

    try {
      console.log('--- Attempting Real MongoDB Connection ---');
      await mongoose.connect(config.database_local, { serverSelectionTimeoutMS: 2000 });
      logger.info('✅ MongoDB connected successfully');
      logger.info("Test log entry from INSOCODE");
    } catch (dbError) {
      console.log('--- Real MongoDB Failed. Entering Falback ---');
      logger.warn(`⚠️ Local MongoDB connection failed: ${dbError.message}`);
      logger.warn('⚠️ Switching to In-Memory MongoDB (Mock Mode)...');
      try {
        console.log('--- Importing MongoMemoryServer ---');
        // Dynamic import to avoid production dependency issues/size
        const { MongoMemoryServer } = await import('mongodb-memory-server');
        console.log('--- Creating MongoMemoryServer Instance ---');
        const mongoServer = await MongoMemoryServer.create();
        console.log('--- Getting URI ---');
        const uri = mongoServer.getUri();
        console.log(`--- Connecting Mongoose to ${uri} ---`);
        await mongoose.connect(uri);
        logger.info(`✅ Connected to In-Memory MongoDB at ${uri}`);
        // Set a global flag if needed for other services?
        global.MOCK_DB_MODE = true;
      } catch (memError) {
        console.error('--- In-Memory Setup Failed ---', memError);
        logger.error('❌ Failed to start In-Memory Mongo. Continuing without Database...', memError);
        // throw memError; // SWALLOWED to allow server start
      }
    }

    // Load Dynamic Marketplace Plugins Before Background Workers
    try {
      await agentRegistry.loadPlugins();
    } catch (e) {
      logger.error('❌ Failed to load dynamic marketplace plugins', e);
    }

    // Initialize Background Workers
    import('./src/app/modules/queue/worker.service.js').then(({ workerService }) => {
      workerService.init();
    }).catch(err => logger.error('❌ Failed to start WorkerService', err));

    // Initialize Phase 45 Genesis Protocol Dynamic Agent Loader
    import('./src/app/modules/agents/dynamic_agent_loader.service.js').then(({ dynamicAgentLoaderService }) => {
      dynamicAgentLoaderService.init();
    }).catch(err => logger.error('❌ Failed to start DynamicAgentLoaderService', err));

    // Initialize Phase 47 Enterprise Slack Arbiter
    import('./src/app/modules/agents/slack.bot.service.js').then(({ slackBotService }) => {
      slackBotService.init();
    }).catch(err => logger.error('❌ Failed to start SlackBotService', err));

    // Initialize Phase 50 Sentinel Crawler (Bug Bounty Hunter)
    import('./src/app/modules/agents/github.crawler.service.js').then(({ githubCrawlerService }) => {
      githubCrawlerService.init();
    }).catch(err => logger.error('❌ Failed to start GithubCrawlerService', err));

    // Initialize OpenClaw Deep Integration
    import('./src/app/modules/openclaw/index.js').then(async (openclaw) => {
      await openclaw.openClawCore.init();
      await openclaw.openClawSkills.loadSkills();
      await openclaw.sensoryIntegration.init();
      await openclaw.openClawBots.init();
      logger.info('✅ OpenClaw Deep Integration Active');
    }).catch(err => logger.error('❌ Failed to start OpenClaw Integration', err));

    // Initialize OSS Trending Agent System (v7.7.0)
    // Rehydrates all existing OSS agents into the CapabilityRouter and starts the daily cron
    import('./src/app/modules/ossAgents/oss.trending.scheduler.js').then(({ ossTrendingScheduler }) => {
      ossTrendingScheduler.start().catch(err => logger.error('❌ OssTrendingScheduler start error', err));
      logger.info('✅ OSS Trending Agent System Active');
    }).catch(err => logger.error('❌ Failed to start OssTrendingScheduler', err));

    // Initialize Daily Ledger Anchoring (IRS/Blockchain Compliance)
    import('./src/app/modules/audit/ledger.anchor.cron.js').catch(err => {
      logger.error('❌ Failed to initialize Ledger Anchor Cron', err);
    });

    server = http.createServer(app).listen(config.port, '0.0.0.0', () => {
      logger.info(`🚀 Server listening on port ${config.port}`);
      // Initialize Socket.io
      import('./src/app/services/socket.service.js').then(({ socketService }) => {
        socketService.init(server);
      });
      // Initialize Phase 48 Live Synchronization Engine (Yjs)
      import('./src/app/modules/agents/crdt.socket.service.js').then(({ crdtSocketService }) => {
        crdtSocketService.init(server);
      });
    });
  } catch (error) {
    logger.error(`❌ Failed to start server: ${error}`);
    // console.log(`❌ Failed to connect: ${error}`);
    process.exit(1);
  }

  process.on('unhandledRejection', (reason, promise) => {
    logger.fatal('🚨 Unhandled Rejection detected at promise:', promise, 'reason:', reason);
    console.error('🚨 Unhandled Rejection:', reason);
    if (server) {
      server.close(() => {
        process.exit(1);
      });
    } else {
      process.exit(1);
    }
  });

  main();

  process.on('SIGTERM', () => {
    // logger.info('Signal Termination is received');
    console.log('Signal Termination is received');
    if (server) {
      server.close();
    }
  });
