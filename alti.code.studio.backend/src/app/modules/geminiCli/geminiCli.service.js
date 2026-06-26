/**
 * Copyright (c) 2024 Inso Code
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { spawn } from 'child_process';
import { logger } from '../../../shared/logger.js';
import crypto from 'crypto';

// In-memory session command history (bounded to 200 entries)
const _history = [];
const MAX_HISTORY = 200;

/**
 * Run a Gemini CLI command as a child process.
 * @param {string} command
 * @param {string[]} args
 * @returns {Promise<string>}
 */
const runGeminiCLI = (command, args = []) => {
  if (!command || typeof command !== 'string') {
    return Promise.reject(
      new Error('GeminiCliService: command must be a non-empty string.'),
    );
  }
  return new Promise((resolve, reject) => {
    let finalOutput = '';
    const uniqueId = crypto.randomUUID().slice(0, 8);
    const fullCmd = `gemini ${command} ${args.join(' ')}`.trim();
    logger.info(`[GeminiCLI:${uniqueId}] Executing: ${fullCmd}`);

    _history.push({
      id: uniqueId,
      command: fullCmd,
      timestamp: new Date().toISOString(),
      output: null,
    });
    if (_history.length > MAX_HISTORY) _history.shift();

    const proc = spawn('gemini', [command, ...args]);

    proc.stdout.on('data', data => {
      finalOutput += data.toString();
    });

    proc.stderr.on('data', data => {
      logger.warn(`[GeminiCLI:${uniqueId}] stderr: ${data.toString().trim()}`);
    });

    proc.on('close', code => {
      logger.info(`[GeminiCLI:${uniqueId}] Exited with code ${code}`);
      const entry = _history.find(h => h.id === uniqueId);
      if (entry) entry.output = finalOutput.trim();
      resolve(finalOutput.trim());
    });

    proc.on('error', err => {
      logger.error(`[GeminiCLI:${uniqueId}] Spawn Failed: ${err.message}`);
      reject(err);
    });
  });
};

/**
 * Stream a Gemini CLI command's stdout to an SSE response.
 * @param {string} command
 * @param {string[]} args
 * @param {import('express').Response} res
 */
const streamGeminiCLI = (command, args = [], res) => {
  const uniqueId = crypto.randomUUID().slice(0, 8);
  const fullCmd = `gemini ${command} ${args.join(' ')}`.trim();
  logger.info(`[GeminiCLI:${uniqueId}] Streaming: ${fullCmd}`);

  _history.push({
    id: uniqueId,
    command: fullCmd,
    timestamp: new Date().toISOString(),
    output: '[streamed]',
  });
  if (_history.length > MAX_HISTORY) _history.shift();

  const proc = spawn('gemini', [command, ...args]);

  proc.stdout.on('data', data => {
    res.write(
      `data: ${JSON.stringify({ type: 'stdout', text: data.toString() })}\n\n`,
    );
  });

  proc.stderr.on('data', data => {
    res.write(
      `data: ${JSON.stringify({ type: 'stderr', text: data.toString() })}\n\n`,
    );
  });

  proc.on('close', code => {
    res.write(`data: ${JSON.stringify({ type: 'close', code })}\n\n`);
    res.end();
  });

  proc.on('error', err => {
    res.write(
      `data: ${JSON.stringify({ type: 'error', text: err.message })}\n\n`,
    );
    res.end();
  });

  // Clean up on client disconnect
  res.on('close', () => {
    proc.kill('SIGTERM');
  });
};

const getHistory = () => [..._history];

const clearHistory = () => {
  _history.length = 0;
};

export const GeminiCliService = {
  runGeminiCLI,
  streamGeminiCLI,
  getHistory,
  clearHistory,
};
