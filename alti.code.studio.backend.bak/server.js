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
// import { RedisClient } from './src/shared/redis.js';

process.on('uncaughtException', error => {
  console.error('Uncaught Exception detected:', error);
  console.log('UNCAUGHT EXCEPTION CAUGHT BUT IGNORING EXIT');
  // errorlogger.error('Uncaught Exception detected:', error);
  // process.exit(1);
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
        global.DB_CONNECTION_FAILED = true;
      }

    }
  }
    // console.log('✅ MongoDB connected successfully');

    // Initialize Background Workers
    import('./src/app/modules/queue/worker.service.js').then(({ workerService }) => {
    workerService.init();
  }).catch(err => logger.error('❌ Failed to start WorkerService', err));

  server = http.createServer(app).listen(config.port, '0.0.0.0', () => {
    logger.info(`🚀 Server listening on port ${config.port}`);
    // Initialize Socket.io
    import('./src/app/services/socket.service.js').then(({ socketService }) => {
      socketService.init(server);
    });
  });
} catch (error) {
  logger.error(`❌ Failed to start server: ${error}`);
  // console.log(`❌ Failed to connect: ${error}`);
  process.exit(1);
}

process.on('unhandledRejection', error => {
  console.error('❗ Unhandled Rejection:', error);
  // errorlogger.error('❗ Unhandled Rejection:', error);
  if (server) server.close(() => process.exit(1));
  else process.exit(1);
});
}

main();

process.on('SIGTERM', () => {
  // logger.info('Signal Termination is received');
  console.log('Signal Termination is received');
  if (server) {
    server.close();
  }
});
