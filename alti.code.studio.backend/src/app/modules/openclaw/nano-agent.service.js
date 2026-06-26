/**
 * Copyright (c) 2024 Inso Code
 *
 * NANO-AGENT SERVICE — Minimal Autonomous Code Agent Pattern
 * Implements the core tool-call loop from shareAI-lab/learn-claude-code.
 * MIT License — https://github.com/shareAI-lab/learn-claude-code
 *
 * "Bash is all you need" — A nano agent built from 0 to 1.
 * This service implements the fundamental read/write/bash tool loop
 * that underpins all effective code agents.
 */

import { execFile, exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';
import { logger } from '../../../shared/logger.js';
import { GeminiAiService } from '../gemini/gemini.service.js';
import { socketService } from '../../services/socket.service.js';
import { AstGraphNavigator } from '../sandbox/ast_graph_navigator.js';

const execAsync = promisify(exec);
const execFileAsync = promisify(execFile);

/** Shell commands that are never permitted in the nano agent */
const BANNED_COMMANDS = [
  'rm -rf /',
  'dd if=',
  'mkfs',
  ':(){ :|:& };:',
  'curl.*|.*sh',
  'wget.*|.*sh',
];

const isBanned = cmd => BANNED_COMMANDS.some(b => new RegExp(b).test(cmd));

/** Tool: read a file */
async function toolReadFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    return { ok: true, content, path: filePath };
  } catch (e) {
    return { ok: false, error: e.message };
  }
}

/** Tool: write a file */
async function toolWriteFile(filePath, content) {
  try {
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, content, 'utf8');

    // Emit workspace update event over websockets
    socketService.broadcast('workspace', 'changed', {
      path: filePath,
      action: 'write_file',
    });
    // Sync symbol graph to Neo4j database asynchronously
    AstGraphNavigator.syncFileToNeo4j(filePath).catch(() => {});

    return {
      ok: true,
      path: filePath,
      bytesWritten: Buffer.byteLength(content),
    };
  } catch (e) {
    return { ok: false, error: e.message };
  }
}

/** Tool: run a shell command (allowlist-gated) */
async function toolBash(command, cwd = process.cwd()) {
  if (isBanned(command)) {
    return {
      ok: false,
      error: `Command blocked by safety policy: "${command}"`,
    };
  }
  try {
    const { stdout, stderr } = await execAsync(command, {
      cwd,
      timeout: 30000,
      maxBuffer: 1024 * 512,
    });
    return { ok: true, stdout: stdout.trim(), stderr: stderr.trim() };
  } catch (e) {
    return { ok: false, stdout: e.stdout, stderr: e.stderr, error: e.message };
  }
}

/** Tool: list directory contents */
async function toolListDir(dirPath) {
  try {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    return {
      ok: true,
      path: dirPath,
      entries: entries.map(e => ({
        name: e.name,
        type: e.isDirectory() ? 'dir' : 'file',
      })),
    };
  } catch (e) {
    return { ok: false, error: e.message };
  }
}

const TOOL_REGISTRY = {
  read_file: toolReadFile,
  write_file: toolWriteFile,
  bash: toolBash,
  list_dir: toolListDir,
};

class NanoAgentService {
  /**
   * Run the nano agent tool loop for a given task.
   * The agent iteratively calls Gemini with tool results until it signals completion.
   *
   * @param {string} task - The coding task to solve
   * @param {object} opts - { maxIterations, cwd, systemPrompt }
   * @returns {Promise<{ status: string, iterations: number, history: Array }>}
   */
  async run(task, opts = {}) {
    const maxIter = opts.maxIterations || 15;
    const cwd = opts.cwd || process.cwd();
    const history = [];

    const systemPrompt =
      opts.systemPrompt ||
      `You are a nano code agent. You have access to these tools:
- read_file(path): Read a file's content
- write_file(path, content): Write content to a file
- bash(command): Run a shell command
- list_dir(path): List directory contents

To use a tool, respond with exactly:
TOOL: <tool_name>
ARGS: <json arguments object>

When done, respond with:
DONE: <brief summary of what you accomplished>

Task: ${task}`;

    let messages = [systemPrompt];
    let iterations = 0;

    logger.info(
      `[nano-agent] Starting task: "${task.slice(0, 100)}" (max ${maxIter} iterations)`,
    );

    while (iterations < maxIter) {
      iterations++;
      const prompt = messages.join('\n\n');
      const response = await GeminiAiService.generateContent(prompt);

      history.push({
        iteration: iterations,
        response: response.slice(0, 2000),
      });
      logger.debug(
        `[nano-agent] Iteration ${iterations}: ${response.slice(0, 200)}`,
      );

      // Check if done
      const doneMatch = response.match(/^DONE:\s*(.+)/m);
      if (doneMatch) {
        logger.info(
          `[nano-agent] Completed in ${iterations} iterations: ${doneMatch[1]}`,
        );
        return { status: 'done', iterations, summary: doneMatch[1], history };
      }

      // Parse tool call
      const toolMatch = response.match(
        /^TOOL:\s*(\w+)\s*\nARGS:\s*({[\s\S]*?})(?:\n|$)/m,
      );
      if (!toolMatch) {
        messages.push(`Response: ${response}`);
        messages.push('Please use a TOOL or respond with DONE:');
        continue;
      }

      const toolName = toolMatch[1];
      let toolArgs;
      try {
        toolArgs = JSON.parse(toolMatch[2]);
      } catch {
        messages.push(
          `Error: could not parse ARGS JSON. Got:\n${toolMatch[2]}`,
        );
        continue;
      }

      const tool = TOOL_REGISTRY[toolName];
      if (!tool) {
        messages.push(
          `Error: Unknown tool "${toolName}". Available: ${Object.keys(TOOL_REGISTRY).join(', ')}`,
        );
        continue;
      }

      // Execute the tool
      let toolResult;
      try {
        if (toolName === 'bash') {
          toolResult = await tool(toolArgs.command, cwd);
        } else if (toolName === 'write_file') {
          toolResult = await tool(toolArgs.path, toolArgs.content);
        } else {
          toolResult = await tool(toolArgs.path || toolArgs.command);
        }
      } catch (e) {
        toolResult = { ok: false, error: e.message };
      }

      messages.push(`Response: ${response}`);
      messages.push(`Tool result: ${JSON.stringify(toolResult)}`);
    }

    logger.warn(
      `[nano-agent] Reached max iterations (${maxIter}) without completing.`,
    );
    return { status: 'max_iterations', iterations: maxIter, history };
  }

  /** List available tools */
  getTools() {
    return Object.keys(TOOL_REGISTRY).map(name => ({
      name,
      description:
        {
          read_file: 'Read file contents from disk',
          write_file: 'Write content to a file on disk',
          bash: 'Execute a shell command (safety-gated)',
          list_dir: 'List directory entries',
        }[name] || name,
    }));
  }
}

export const nanoAgentService = new NanoAgentService();
