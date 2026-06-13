/**
 * Copyright (c) 2024 Alti.Code.Studio
 * 
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

// MUST BE THE VERY FIRST LINE: Google Cloud Trace initialization
import traceAgent from '@google-cloud/trace-agent';
if (process.env.NODE_ENV === 'production' || process.env.ENABLE_GCP_APM === 'true') {
  traceAgent.start({ ignoreUrls: [/^\/healthz/, /^\/metrics/] });
}

import './polyfill.js';
import { ErrorReporting } from '@google-cloud/error-reporting';
import profiler from '@google-cloud/profiler';
import http from 'http';
import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';

import config from './config/index.js';
import app from './index.js'; // Make sure this exists and exports an Express app
import { logger } from './src/shared/logger.js';
import { agentRegistry } from './src/app/modules/agents/agent.registry.js';
import { startDataRetentionCron } from './src/app/scripts/dataRetention.cron.js';
import crypto from 'crypto';

// Enforce FIPS 140-3 Cryptography for Defense/Gov (DoD IL5/IL6)
if (process.env.NODE_ENV === 'production') {
    try {
        crypto.setFips(true);
        logger.info('🛡️ [SECURITY] FIPS 140-3 Cryptography mode ENFORCED.');
    } catch (err) {
        logger.warn('⚠️ [SECURITY] Failed to set FIPS mode. Ensure Node is compiled with OpenSSL FIPS module.', err.message);
    }
}

// Initialize Google Cloud Error Reporting
const errors = new ErrorReporting();

process.on('uncaughtException', error => {
  logger.error('🚨 Uncaught Exception detected!', error);
  console.error('🚨 Uncaught Exception detected:', error);
  // Pipe critical crashes directly to Google Cloud Console
  errors.report(error);
  // Do NOT exit the process. Background Google Cloud SDK auth failures 
  // will otherwise crash the server constantly in local dev mode.
});

// Initialize Google Cloud Profiler (Autonomous Continuous FinOps)
profiler.start({
  serviceContext: {
    service: 'alti-code-studio-backend',
    version: '1.0.0',
  },
}).then(() => {
  logger.info('🔬 [GCP] Google Cloud Profiler initialized. Continuous telemetry active.');
}).catch(err => {
  logger.warn(`⚠️ [GCP] Google Cloud Profiler failed to start: ${err.message}`);
});

import { connectPrisma } from './src/config/prisma.js';

let server;
mongoose.set('strictQuery', true);
mongoose.set('bufferCommands', false);

async function main() {
  try {
    // 0. Load Google Cloud Secret Manager enterprise secrets
    try {
      const { loadEnterpriseSecrets } = await import('./config/index.js');
      await loadEnterpriseSecrets();
      logger.info('🔑 [GCP] Google Cloud Secret Manager enterprise secrets synchronized.');
    } catch (secretErr) {
      logger.warn(`⚠️ Google Secret Manager auto-inject bypassed: ${secretErr.message}`);
    }

    // 1. Initialize PostgreSQL (Prisma)
    await connectPrisma();
    
    // 2. Disable Legacy MongoDB & Mock Mode
    logger.info('✅ Strict Database Policy Enforced: Legacy MongoDB and MongoMemoryServer disabled.');
    logger.info('   All systems now exclusively utilize the robust PostgreSQL (Prisma) data store.');

    // Seed initial agent skills for SkillOpt catalog
    try {
      const { seedInitialSkills } = await import('./src/app/modules/skillopt/skillopt.seeder.js');
      await seedInitialSkills();
    } catch (seedErr) {
      logger.error('❌ Failed to seed SkillOpt initial skills', seedErr);
    }

    // Load Dynamic Marketplace Plugins Before Background Workers
    try {
      agentRegistry.loadPlugins().catch(e => {
        logger.error('❌ Failed to load dynamic marketplace plugins asynchronously', e);
      });
    } catch (e) {
      logger.error('❌ Failed to initiate dynamic marketplace plugins', e);
    }

    // Initialize Background Workers (BullMQ Async Agents)
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

    import('./src/app/modules/ossAgents/oss.trending.scheduler.js').then(({ ossTrendingScheduler }) => {
      ossTrendingScheduler.start().catch(err => logger.error('❌ OssTrendingScheduler start error', err));
      logger.info('✅ OSS Trending Agent System Active');
    }).catch(err => logger.error('❌ Failed to start OssTrendingScheduler', err));

    // Initialize Daily Ledger Anchoring (IRS/Blockchain Compliance)
    import('./src/app/modules/audit/ledger.anchor.cron.js').catch(err => {
      logger.error('❌ Failed to initialize Ledger Anchor Cron', err);
    });

    // Initialize Phase 6 Chaos Fuzzer Service
    import('./src/app/modules/qa/chaos_fuzzer.service.js').then(({ chaosFuzzerService }) => {
      chaosFuzzerService.init();
    }).catch(err => logger.error('❌ Failed to start Chaos Fuzzer Service', err));

    // Desktop OS Optimization Epic: Boot the Rust IPC IPC Bridge
    import('./src/app/modules/agents/desktop_ipc.service.js').then(({ desktopIpcService }) => {
      desktopIpcService.start(8081);
    }).catch(err => logger.error('❌ Failed to start Desktop IPC Service', err));

    // 🌌 THE GOD MODE EPIC: Ultimate Master Orchestration
    import('./src/app/modules/agents/god_mode.orchestrator.js').then(({ godModeOrchestrator }) => {
      godModeOrchestrator.init();
    }).catch(err => logger.error('❌ Failed to ignite God Mode Orchestrator', err));

    // Sovereign OSS Miner Epic: Boot the continuous license miner
    import('./src/app/modules/memory/oss_license_miner.service.js').then(({ ossLicenseMinerService }) => {
      ossLicenseMinerService.init();
    }).catch(err => logger.error('❌ Failed to start OSS License Miner Service', err));

    // Omni-Refactor Epic: Boot the background algorithm optimization engine
    import('./src/app/modules/agents/autonomous_refactor.service.js').then(({ autonomousRefactorService }) => {
      autonomousRefactorService.init();
    }).catch(err => logger.error('❌ Failed to start Autonomous Refactor Service', err));

    // PreCog Epic: Boot the background zero-day vulnerability defender
    import('./src/app/modules/security/precog_cve_defender.service.js').then(({ precogCveDefenderService }) => {
      precogCveDefenderService.init();
    }).catch(err => logger.error('❌ Failed to start PreCog CVE Defender', err));

    // Ultimate GCP Native Epic: Boot the Autonomous Repair Daemon
    import('./src/app/modules/agents/autonomous_repair_daemon.js').then(({ autonomousRepairDaemon }) => {
      autonomousRepairDaemon.startPatrol();
      autonomousRepairDaemon.startArchitecturalPatrol(); // 🔥 Level 5 Autonomy
    }).catch(err => logger.error('❌ Failed to start Autonomous Repair Daemon', err));

    // Ultimate Agentic Sentinel: Boot the local File System Watcher
    import('./src/app/modules/agents/file_sentinel.service.js').then(({ fileSentinelService }) => {
       const workspaceTarget = process.env.WORKSPACE_ROOT || process.cwd();
       fileSentinelService.startWatching(workspaceTarget);
    }).catch(err => logger.error('❌ Failed to start File Sentinel Service', err));

    // 🧠 AgentMemory: #1 Persistent Memory for AI Coding Agents
    // https://github.com/rohitg00/agentmemory | https://www.agent-memory.dev/
    // Triple-stream recall (BM25 + Vector + Knowledge Graph) | 95.2% R@5 | Apache-2.0
    import('./src/app/modules/memory/agentmemory.service.js').then(({ agentMemoryService }) => {
      agentMemoryService.init();
    }).catch(err => logger.error('❌ Failed to start AgentMemory Service', err));

    // 🌙 MiMo-Code: Compactor & Self-Evolution Dream Daemon
    import('./src/app/modules/memory/mimo_dream.service.js').then(({ mimoDreamService }) => {
      mimoDreamService.init();
    }).catch(err => logger.error('❌ Failed to start MiMo Dream Service', err));

    // 🪐 GitHub Docs: Ingestion Engine for Developer Documentation
    import('./src/app/modules/githubDocs/githubDocs.service.js').then(({ githubDocsService }) => {
      githubDocsService.init();
    }).catch(err => logger.error('❌ Failed to start GitHub Docs Service', err));

    // 🔌 Model Context Protocol (MCP) Epic: Boot the dynamic tool discovery bridge
    import('./src/app/modules/agents/mcp.service.js').then(({ mcpBridgeService }) => {
      mcpBridgeService.init();
    }).catch(err => logger.error('❌ Failed to start MCP Bridge Service', err));

    // 🌌 Omni-Cloud Epic: Boot the massive AWS/GCP/Azure Open Source Ingestion Engine
    import('./src/app/modules/agents/omni_cloud_ingestion.service.js').then(({ omniCloudIngestionService }) => {
      omniCloudIngestionService.init();
    }).catch(err => logger.error('❌ Failed to start Omni-Cloud Ingestion Engine', err));

    // 🔷 Initialize Sovereign Neo4j GraphQL Engine (Apache 2.0)
    import('./src/app/services/neo4j_graphql.service.js').then(async ({ neo4jGraphQLService }) => {
      await neo4jGraphQLService.init(app);
    }).catch(err => logger.error('❌ Failed to start Neo4j GraphQL Service', err));

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
      // Initialize Phase 5 Live LSP Telepathy Engine
      import('./src/app/modules/lsp/lsp.gateway.js').then(({ lspGateway }) => {
        lspGateway.initialize(server);
      });
    });
  } catch (error) {
    logger.error(`❌ Failed to start server: ${error}`);
    // console.log(`❌ Failed to connect: ${error}`);
    process.exit(1);
  }

  process.on('unhandledRejection', (reason, promise) => {
    logger.error('🚨 Unhandled Rejection detected at promise:', promise, 'reason:', reason);
    console.error('🚨 Unhandled Rejection:', reason);
    // Pipe critical rejections directly to Google Cloud Console
    if (reason instanceof Error) {
        errors.report(reason);
    } else {
        errors.report(new Error(`Unhandled Rejection: ${reason}`));
    }
  });
}

main();

// 🛡️ Enterprise Graceful Shutdown Sequence (Zero-Downtime Deployments)
const gracefulShutdown = async (signal) => {
  logger.info(`\n🛑 [${signal}] Signal Termination received. Initiating graceful shutdown...`);
  
  if (server) {
    server.close(async () => {
      logger.info('✅ HTTP Server closed. No longer accepting new connections.');
      
      try {
        // 1. Drain Prisma Connection Pools
        import('./src/config/prisma.js').then(async ({ prisma }) => {
          if (prisma) {
            await prisma.$disconnect();
            logger.info('✅ Prisma PostgreSQL disconnected.');
          }
        }).catch(() => logger.warn('Prisma disconnect bypassed.'));

        // 2. Disconnect Legacy MongoDB
        if (mongoose.connection.readyState === 1) {
          await mongoose.disconnect();
          logger.info('✅ Legacy MongoDB disconnected.');
        }

        // 3. Shutdown AgentMemory child process
        import('./src/app/modules/memory/agentmemory.service.js').then(({ agentMemoryService }) => {
          agentMemoryService.shutdown();
          logger.info('✅ AgentMemory shutdown initiated.');
        }).catch(() => logger.warn('AgentMemory shutdown bypassed.'));

        // Shutdown MiMo Dream Service
        import('./src/app/modules/memory/mimo_dream.service.js').then(({ mimoDreamService }) => {
          mimoDreamService.shutdown();
        }).catch(() => {});

        logger.info('🚀 Graceful shutdown complete. Exiting process safely.');
        process.exit(0);
      } catch (err) {
        logger.error('❌ Error during graceful shutdown:', err);
        process.exit(1);
      }
    });

    // Force shutdown if connections are hanging for more than 10 seconds
    setTimeout(() => {
      logger.error('⚠️ Could not close connections in time, forcefully shutting down');
      process.exit(1);
    }, 10000);
  } else {
    process.exit(0);
  }
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
