/**
 * Code Browser Controller — v6.7.0
 *
 * Routes (all mounted at /api/v1/code-browser):
 *   GET  /sprint/:id/files          → list files written in a sprint
 *   GET  /file?path=...             → read file content + language
 *   GET  /diff?path=...             → git diff for a file
 *   POST /patch                     → apply Guardian-gated human patch + commit
 *   POST /suggest                   → inline Gemini LLM suggestion for selected code
 *   GET  /exec (re-exports code-editor exec for Terminal.tsx compatibility)
 */

import express from 'express';
import { execFile } from 'child_process';
import { promisify } from 'util';
import { codeBrowserService } from './codeBrowser.service.js';
import { GeminiAiService } from '../gemini/gemini.service.js';
import { logger } from '../../../shared/logger.js';

const execFileAsync = promisify(execFile);
const CWD = process.cwd();

export const codeBrowserRoutes = express.Router();

// ─── Terminal command allowlist ────────────────────────────────────────────
const CMD_ALLOWLIST = [
  /^npm (test|run lint|run build|run dev|install --frozen-lockfile)$/,
  /^git (status|log --oneline -10|diff --stat)$/,
  /^node --version$/,
  /^npx vitest( run)?$/,
  /^ls( -la)?$/,
  /^pwd$/,
  /^cat package\.json$/,
];

function isAllowedCommand(cmd) {
  return CMD_ALLOWLIST.some(re => re.test(cmd.trim()));
}

// ─── GET /sprint/:id/files ─────────────────────────────────────────────────
codeBrowserRoutes.get('/sprint/:id/files', async (req, res) => {
  try {
    const files = await codeBrowserService.getSprintFiles(req.params.id);
    return res.json({ success: true, data: files });
  } catch (e) {
    return res.status(500).json({ success: false, message: e.message });
  }
});

// ─── GET /file?path=... ────────────────────────────────────────────────────
codeBrowserRoutes.get('/file', async (req, res) => {
  const filePath = req.query.path;
  if (!filePath)
    return res
      .status(400)
      .json({ success: false, message: 'path query param required.' });
  try {
    const result = await codeBrowserService.readFile(filePath);
    return res.json({ success: true, data: result });
  } catch (e) {
    logger.warn(`CodeBrowser /file: ${e.message}`);
    return res
      .status(e.message.includes('traversal') ? 403 : 404)
      .json({ success: false, message: e.message });
  }
});

// ─── GET /diff?path=... ────────────────────────────────────────────────────
codeBrowserRoutes.get('/diff', async (req, res) => {
  const filePath = req.query.path;
  if (!filePath)
    return res
      .status(400)
      .json({ success: false, message: 'path query param required.' });
  try {
    const diff = await codeBrowserService.getDiff(filePath);
    return res.json({ success: true, data: diff });
  } catch (e) {
    return res.status(500).json({ success: false, message: e.message });
  }
});

// ─── POST /patch ───────────────────────────────────────────────────────────
// Body: { filePath: string, content: string }
codeBrowserRoutes.post('/patch', async (req, res) => {
  const { filePath, content } = req.body;
  if (!filePath || typeof content !== 'string') {
    return res
      .status(400)
      .json({ success: false, message: 'filePath and content required.' });
  }
  try {
    const result = await codeBrowserService.applyPatch(filePath, content);
    return res.json({ success: true, data: result });
  } catch (e) {
    logger.error(`CodeBrowser /patch: ${e.message}`);
    const status = e.message.includes('Guardian')
      ? 403
      : e.message.includes('traversal')
        ? 403
        : 500;
    return res.status(status).json({ success: false, message: e.message });
  }
});

// ─── POST /suggest ─────────────────────────────────────────────────────────
// Body: { code: string, instruction: string, language?: string }
// Inline Gemini LLM suggestion for Monaco selected code
codeBrowserRoutes.post('/suggest', async (req, res) => {
  const { code, instruction, language = 'javascript' } = req.body;
  if (!code || !instruction) {
    return res
      .status(400)
      .json({ success: false, message: 'code and instruction required.' });
  }

  const prompt =
    `You are an expert ${language} engineer providing a concise inline code suggestion.

Instruction: ${instruction}

Code to improve:
\`\`\`${language}
${code.substring(0, 4000)}
\`\`\`

Return ONLY the improved code. No explanation, no markdown fences. Must be a drop-in replacement.`.trim();

  try {
    const suggestion = await GeminiAiService.generateContent(prompt);
    const cleaned = suggestion
      .replace(/^```[a-z]*\n?/m, '')
      .replace(/\n?```$/m, '')
      .trim();
    return res.json({ success: true, data: { suggestion: cleaned } });
  } catch (e) {
    return res.status(500).json({ success: false, message: e.message });
  }
});

// ─── POST /exec ────────────────────────────────────────────────────────────
// Terminal.tsx calls POST /code-editor/exec — this is the upgraded secured version.
// Allowlisted commands only. Returns {stdout, stderr}.
codeBrowserRoutes.post('/exec', async (req, res) => {
  const { command } = req.body;
  if (!command)
    return res
      .status(400)
      .json({ success: false, message: 'command required.' });

  if (!isAllowedCommand(command)) {
    logger.warn(`CodeBrowser /exec: BLOCKED command — "${command}"`);
    return res.status(403).json({
      success: false,
      stdout: '',
      stderr: `Command blocked by security policy. Allowed: npm test, npm run lint, git status, npx vitest, ls, pwd, cat package.json`,
    });
  }

  try {
    const parts = command.trim().split(/\s+/);
    const { stdout, stderr } = await execFileAsync(parts[0], parts.slice(1), {
      cwd: CWD,
      timeout: 30_000,
      maxBuffer: 512 * 1024, // 512KB stdout limit
    });
    return res.json({
      success: true,
      stdout: stdout.substring(0, 10000),
      stderr: stderr.substring(0, 2000),
    });
  } catch (e) {
    return res.json({
      success: true,
      stdout: '',
      stderr: e.message.substring(0, 2000),
    });
  }
});
