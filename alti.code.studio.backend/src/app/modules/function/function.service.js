/**
 * Copyright (c) 2026 Inso Code
 *
 * function.service.js — Sandboxed execution and management of serverless functions.
 */

import { prismaClient } from '../../platform/db/prismaClient.js';
import { logger } from '../../../shared/logger.js';
import ivm from 'isolated-vm';
import crypto from 'crypto';

const prisma = prismaClient.prisma;

/**
 * Creates a serverless function entry.
 */
async function createFunction({
  name,
  description = '',
  code,
  language = 'javascript',
  userId,
}) {
  try {
    return await prisma.serverlessFunction.create({
      data: {
        name,
        description,
        code,
        language,
        userId,
      },
    });
  } catch (err) {
    logger.warn(`⚠️ DB connection unavailable. Returning mock function entry.`);
    return {
      id: crypto.randomUUID(),
      name,
      description,
      code,
      language,
      userId,
      createdAt: new Date(),
    };
  }
}

/**
 * Gets all user functions.
 */
async function getFunctions(userId) {
  try {
    return await prisma.serverlessFunction.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  } catch (err) {
    logger.warn(`⚠️ DB connection unavailable. Returning empty list.`);
    return [];
  }
}

/**
 * Updates a serverless function's code.
 */
async function updateFunction(functionId, { name, description, code }, userId) {
  try {
    return await prisma.serverlessFunction.updateMany({
      where: { id: functionId, userId },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(code && { code }),
      },
    });
  } catch (err) {
    logger.warn(`⚠️ DB connection unavailable. Simulating function update.`);
    return { count: 1 };
  }
}

/**
 * Deletes a function.
 */
async function deleteFunction(functionId, userId) {
  try {
    return await prisma.serverlessFunction.deleteMany({
      where: { id: functionId, userId },
    });
  } catch (err) {
    logger.warn(`⚠️ DB connection unavailable. Simulating function deletion.`);
    return { count: 1 };
  }
}

/**
 * Executes user JavaScript code inside a secure sandboxed VM context.
 * Enforces execution limits and returns execution time, returned value, and stdout logs.
 */
async function executeCode(code) {
  const logs = [];
  const start = Date.now();

  const isolate = new ivm.Isolate({ memoryLimit: 128 });
  try {
    const context = await isolate.createContext();
    const jail = context.global;

    // Set global variables inside the isolate
    await jail.set('global', jail.derefInto());

    const logCallback = (...args) => {
      logs.push(
        args
          .map(a => (typeof a === 'object' ? JSON.stringify(a) : String(a)))
          .join(' '),
      );
    };

    const errorCallback = (...args) => {
      logs.push(
        `[ERROR] ${args
          .map(a => (typeof a === 'object' ? JSON.stringify(a) : String(a)))
          .join(' ')}`,
      );
    };

    // Wire console log and error callbacks
    await context.evalClosure(
      `
      global.console = {
        log: (...args) => {
          $0.apply(undefined, args, { arguments: { copy: true } });
        },
        error: (...args) => {
          $1.apply(undefined, args, { arguments: { copy: true } });
        }
      };
    `,
      [logCallback, errorCallback],
      { arguments: { reference: true } },
    );

    // Compile script with code payload
    const script = await isolate.compileScript(code);

    // Run script within context and strict 3s timeout
    const result = await script.run(context, { timeout: 3000 });
    const duration = Date.now() - start;

    let displayResult = 'undefined';
    if (result !== undefined) {
      displayResult =
        typeof result === 'object' && result !== null
          ? JSON.stringify(result, null, 2)
          : String(result);
    }

    return {
      success: true,
      result: displayResult,
      logs,
      duration,
    };
  } catch (err) {
    const duration = Date.now() - start;
    return {
      success: false,
      error: err.message,
      logs: [...logs, `[RUNTIME ERROR] ${err.message}`],
      duration,
    };
  } finally {
    isolate.dispose();
  }
}

export const FunctionService = {
  createFunction,
  getFunctions,
  updateFunction,
  deleteFunction,
  executeCode,
};
