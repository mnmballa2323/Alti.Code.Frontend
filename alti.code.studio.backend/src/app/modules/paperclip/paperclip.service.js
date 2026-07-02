import { spawn } from 'child_process';
import path from 'path';
import { logger } from '../../../shared/logger.js';
import fs from 'fs';

export const paperclipService = {
  childProcess: null,
  activePort: '8082', // Default fallback
  isReady: false,
  _readyPromise: null,
  _resolveReady: null,

  init: function () {
    this._readyPromise = new Promise(resolve => {
      this._resolveReady = resolve;
    });

    return new Promise((resolve, reject) => {
      logger.info('🚀 Starting Paperclip Daemon Service...');

      const paperclipDir = path.resolve(
        process.cwd(),
        '../submodules/paperclip',
      );

      if (!fs.existsSync(paperclipDir)) {
        logger.error(`❌ Paperclip submodule not found at ${paperclipDir}`);
        return reject(new Error('Paperclip submodule missing'));
      }

      // Cleanup stale PID if we crashed previously
      try {
        const stalePidPath = path.resolve(
          process.env.HOME,
          '.paperclip/instances/default/db/postmaster.pid',
        );
        if (fs.existsSync(stalePidPath)) {
          fs.unlinkSync(stalePidPath);
          logger.info('🧹 Cleaned up stale Paperclip DB PID file');
        }
      } catch (e) {
        // ignore
      }

      // We run 'pnpm run dev:server' which runs only the backend
      // Provide custom env variables like port and embedded database usage
      const env = {
        ...process.env,
        PORT: '8082',
        PAPERCLIP_MIGRATION_AUTO_APPLY: 'true',
      };

      // Delete DATABASE_URL so paperclip uses its own embedded postgres
      // instead of trying to connect to Alti's database
      delete env.DATABASE_URL;

      // Paperclip (specifically better-auth) requires node:sqlite which is only in Node 22+
      // Since our backend runs Node 20.18.1, we must spawn it using pnpm with --use-node-version
      this.childProcess = spawn(
        'npx',
        ['pnpm', '--use-node-version=22.23.1', 'run', 'dev:server'],
        {
          cwd: paperclipDir,
          env,
          stdio: 'pipe',
        },
      );

      this.childProcess.stdout.on('data', data => {
        const msg = data.toString().trim();
        if (msg) logger.info(`[Paperclip] ${msg}`);

        // Parse the dynamic port handshake
        const portMatch = msg.match(
          /Server listening on (?:127\.0\.0\.1|0\.0\.0\.0|localhost):(\d+)/,
        );
        if (portMatch) {
          this.activePort = portMatch[1];
          logger.info(
            `✅ Paperclip Handshake: Bound to port ${this.activePort}`,
          );
        }

        // Resolve once we see it's ready, or we can just resolve immediately
        if (msg.includes('ready') || msg.includes('listening')) {
          if (!this.isReady) {
            logger.info('✅ Paperclip Daemon Service Active');
            this.isReady = true;
            if (this._resolveReady) this._resolveReady();
            resolve();
          }
        }
      });

      this.childProcess.stderr.on('data', data => {
        const msg = data.toString().trim();
        if (msg) logger.warn(`[Paperclip WARN/ERR] ${msg}`);
      });

      this.childProcess.on('error', err => {
        logger.error(`❌ Failed to start Paperclip daemon: ${err.message}`);
        reject(err);
      });

      this.childProcess.on('close', code => {
        logger.warn(`⚠️ Paperclip daemon exited with code ${code}`);
      });

      // Fallback resolve if it takes a while but doesn't error
      setTimeout(() => {
        if (!this.isReady) {
          logger.info('✅ Paperclip Daemon Service spawned (timeout fallback)');
          this.isReady = true;
          if (this._resolveReady) this._resolveReady();
          resolve();
        }
      }, 60000);
    });
  },

  shutdown: function () {
    if (this.childProcess) {
      logger.info('🛑 Shutting down Paperclip Daemon...');
      this.childProcess.kill('SIGTERM');
      this.childProcess = null;
      this.isReady = false;
    }
  },

  waitForReady: function () {
    return this._readyPromise || Promise.resolve();
  },
};
