/**
 * Copyright (c) 2024 Inso Code — TIER 8: MICRO-AGENTS
 *
 * Ultra-focused single-purpose agents.
 * Each does ONE thing extremely well.
 * Composable into multi-agent workflows via the Orchestrator.
 */
import { aiProvider } from '../ai/ai.provider.js';
import { logger } from '../../../shared/logger.js';

// ── LINTER ──
export const linterWorkerProcessor = async job => {
  const { code, language, rules } = job.data;
  logger.info(`🔎 Linter [${job.id}]: Linting ${language || 'code'}...`);
  const result = await aiProvider.reason(
    `Lint this ${language || ''} code for issues. Rules: ${rules || 'standard'}.\nCode:\n\`\`\`\n${code}\n\`\`\`\nRespond in JSON: { "errors": [], "warnings": [], "fixedCode": string }`,
  );
  return { lint: JSON.parse(result.match(/\{[\s\S]*\}/)?.[0] || '{}') };
};

// ── FORMATTER ──
export const formatterWorkerProcessor = async job => {
  const { code, language, style } = job.data;
  logger.info(`✨ Formatter [${job.id}]: Formatting ${language || 'code'}...`);
  const result = await aiProvider.generate(
    `Format this ${language || ''} code according to ${style || 'standard'} style.\nCode:\n\`\`\`\n${code}\n\`\`\`\nRespond in JSON: { "formatted": string, "changes": number }`,
  );
  return { format: JSON.parse(result.match(/\{[\s\S]*\}/)?.[0] || '{}') };
};

// ── ENV VALIDATOR ──
export const envValidatorWorkerProcessor = async job => {
  const { envFile, requiredVars, template } = job.data;
  logger.info(`🔐 EnvValidator [${job.id}]: Validating environment...`);
  const result = await aiProvider.reason(
    `Validate this .env configuration.\nCurrent env:\n${envFile}\nRequired vars: ${JSON.stringify(requiredVars || [])}\nTemplate: ${template || 'Not provided'}\n\nCheck for: missing required vars, exposed secrets, insecure defaults.\nRespond in JSON: { "valid": boolean, "missing": [], "insecure": [], "exposed": [] }`,
  );
  return { env: JSON.parse(result.match(/\{[\s\S]*\}/)?.[0] || '{}') };
};

// ── SECRET SCANNER ──
export const secretScannerWorkerProcessor = async job => {
  const { code, filePath } = job.data;
  logger.info(
    `🕵️ SecretScanner [${job.id}]: Scanning ${filePath || 'code'}...`,
  );
  const result = await aiProvider.reason(
    `Scan this code for exposed secrets, API keys, tokens, passwords, or credentials.\nFile: ${filePath || 'unknown'}\nCode:\n\`\`\`\n${code}\n\`\`\`\n\nRespond in JSON: { "secrets": [{ "type": string, "line": number, "severity": string }], "clean": boolean }`,
  );
  return { secrets: JSON.parse(result.match(/\{[\s\S]*\}/)?.[0] || '{}') };
};

// ── DEAD CODE DETECTOR ──
export const deadCodeWorkerProcessor = async job => {
  const { code, filePath, imports } = job.data;
  logger.info(`💀 DeadCode [${job.id}]: Scanning ${filePath || 'code'}...`);
  const result = await aiProvider.reason(
    `Find dead code — unused functions, variables, imports, and unreachable code.\nFile: ${filePath}\nCode:\n\`\`\`\n${code}\n\`\`\`\nImports: ${JSON.stringify(imports || [])}\n\nRespond in JSON: { "deadCode": [{ "name": string, "type": string, "line": number }], "unusedImports": [] }`,
  );
  return { deadCode: JSON.parse(result.match(/\{[\s\S]*\}/)?.[0] || '{}') };
};

// ── IMPORT SORTER ──
export const importSorterWorkerProcessor = async job => {
  const { code, language, style } = job.data;
  logger.info(`📋 ImportSorter [${job.id}]: Sorting imports...`);
  const result = await aiProvider.generate(
    `Sort and organize the imports in this ${language || ''} file.\nStyle: ${style || 'grouped by: builtin, external, internal, relative'}\nCode:\n\`\`\`\n${code}\n\`\`\`\n\nRespond in JSON: { "sortedCode": string, "changes": number }`,
  );
  return { imports: JSON.parse(result.match(/\{[\s\S]*\}/)?.[0] || '{}') };
};
