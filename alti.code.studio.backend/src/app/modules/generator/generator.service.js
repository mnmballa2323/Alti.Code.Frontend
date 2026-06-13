/**
 * Copyright (c) 2024 Inso Code
 * 
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import fs from 'fs/promises';
import path from 'path';
import { exec } from 'child_process';
import util from 'util';

const execAsync = util.promisify(exec);
import { GoogleGenAiService } from '../googleGenAi/googleGenAi.service.js';
import config from '../../../../config/index.js';
import { logger } from '../../../shared/logger.js';
import { GuardianService } from '../guardian/guardian.service.js';
import { closureService } from './closure.service.js';
import { patchService } from './patch.service.js';
import { wireitService } from './wireit.service.js';
import { driveBackupService } from '../googleCloud/drive.service.js';
import { gkeService } from '../googleCloud/gke.service.js';
import { sentinelService } from '../security/sentinel.service.js';
import { EventBus } from '../../shared/eventBus.js';
import { discoveryEngineService } from '../googleCloud/discovery.service.js';
import { spannerGraphService } from '../googleCloud/spanner_graph.service.js';
import { GeminiCliService } from '../geminiCli/geminiCli.service.js';
import { modelGateway } from '../../platform/gateway/modelGateway.js';

const generateApp = async (prompt) => {
  if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
    throw new Error('GeneratorService: prompt must be a non-empty string.');
  }
  logger.info(`💻 Generator: Generating app from prompt: ${prompt}`);

  const systemPrompt = `
  You are an expert full-stack developer.
  Your goal is to generate a complete, working application based on the user's prompt.
  
  Output MUST be a valid JSON object representing the file structure.
  Format:
  {
    "files": [
      {
        "path": "index.html",
        "content": "<!DOCTYPE html>..."
      },
      {
        "path": "style.css",
        "content": "body { ... }"
      },
      {
        "path": "script.js",
        "content": "logger.info('...')"
      }
    ]
  }
  
  Rules:
  1. Include ALL necessary files (HTML, CSS, JS, package.json if needed).
  2. Code must be production-ready and bug-free.
  3. JSON must be valid.
  `;

  try {
    const responseText = await modelGateway.routePlatformCompletion({
      provider: 'azure',
      model: 'azure/gpt-5.5-pro',
      prompt: `${systemPrompt}\n\n${prompt}`,
      temperature: 0.1
    });

    const result = JSON.parse(responseText);

    // 🛡️ Guardian Angel Audit 🛡️
    logger.info('👼 Guardian Angel is auditing the generated code...');
    const codeForAudit = JSON.stringify(result, null, 2);
    const auditResult = await GuardianService.auditCode(codeForAudit, 'Genesis App Generation');

    if (!auditResult.safe) {
      logger.error(`👼 Guardian Internal Block: ${auditResult.reasoning}`);
      throw new Error(`Guardian Angel Blocked Generation: ${auditResult.reasoning}`);
    }

    logger.info(`👼 Guardian Approved (Score: ${auditResult.score})`);

    return result;
  } catch (error) {
    logger.error('App generation failed', error);
    // Fallback for testing/dev without valid API key
    if (error.code === 'invalid_api_key' || !apiKey || apiKey === 'sk-placeholder') {
      logger.warn('Using fallback generator due to missing API key');
      return {
        files: [
          { path: 'index.html', content: '<h1>Generated App (Fallback)</h1><p>API Key missing</p>' },
          { path: 'style.css', content: 'body { font-family: sans-serif; }' }
        ]
      };
    }
    throw error;
  }
};

const generateProject = async (prompt, type = 'react') => {
  if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
    throw new Error('GeneratorService: prompt must be a non-empty string.');
  }
  logger.info(`💻 Generator: Generating ${type} project from prompt: ${prompt}`);

  const systemPrompt = `
    You are an elite software architect and full-stack developer.
    Your goal is to generate a COMPLETE, PRODUCTION-READY project structure based on the user's prompt.

    Project Type: ${type} (e.g., React+Vite, Node.js, etc.)

    Output MUST be a valid JSON object representing the file structure.
    
    Structure Format:
    {
      "files": [
        { "path": "package.json", "content": "..." },
        { "path": "README.md", "content": "..." },
        { "path": ".gitignore", "content": "..." },
        { "path": "src/App.jsx", "content": "..." },
        { "path": "src/main.jsx", "content": "..." },
        { "path": "public/index.html", "content": "..." },
        { "path": "vite.config.js", "content": "..." }
      ]
    }

    Rules:
    1.  **Completeness**: Do not leave "TODO" or placeholders. Write functional code.
    2.  **Standards**: Use modern best practices (ESM, Hooks, Tailwind if requested).
    3.  **Dependencies**: valid package.json with correctly versioned dependencies.
    4.  **Config**: Include necessary config files (vite.config.js, tailwind.config.js).
    5.  **Safety**: No malicious code or hardcoded secrets.
    `;

  try {
    // 🧠 The Ultimate Google RAG: Vertex AI Discovery Engine + Spanner Graph
    logger.info(`🔍 [RAG] Querying Google Vertex AI Discovery Engine...`);
    const discoveryResults = await discoveryEngineService.searchCodebase(prompt);
    
    logger.info(`🕸️ [RAG] Querying Google Cloud Spanner Graph for architectural topology...`);
    const graphResults = await spannerGraphService.queryArchitectureDependencies(type);

    let ragContext = '';
    if (discoveryResults.length > 0) {
        ragContext += `\n\n### Google Discovery Engine Context (Highly Relevant Proprietary Code):\n`;
        discoveryResults.slice(0, 3).forEach((res) => {
           const snippet = res.document?.derivedStructData?.snippets?.[0]?.snippet || '';
           if (snippet) ragContext += `\n${snippet}\n`;
        });
    }

    if (graphResults.length > 0) {
        ragContext += `\n\n### Google Spanner Graph Context (Architectural Topology):\n`;
        ragContext += JSON.stringify(graphResults, null, 2);
    }

    logger.info(`💻 [RAG] Querying Google Gemini CLI for best practices...`);
    try {
        const cliQuery = `What are the absolute universe-best practices for architecting this system: ${prompt}`;
        const cliResult = await GeminiCliService.runGeminiCLI('ask', [`"${cliQuery}"`]);
        if (cliResult) {
            ragContext += `\n\n### Google Gemini CLI Context (Autonomous Best Practices):\n${cliResult}`;
        }
    } catch (cliErr) {
        logger.warn(`⚠️ [RAG] Gemini CLI query failed (is the CLI installed?): ${cliErr.message}`);
    }

    // Inject the Ultimate Google RAG context into the prompt
    let finalPrompt = prompt;
    if (ragContext) {
        finalPrompt = `${prompt}\n\nUSE THE FOLLOWING RAG CONTEXT STRICTLY TO IMPLEMENT BEST PRACTICES:\n${ragContext}`;
    }

    // Execute the generation using Google Vertex AI (Gemini) instead of OpenAI
    const geminiPrompt = `${systemPrompt}\n\n${finalPrompt}\n\nOUTPUT ONLY VALID JSON.`;
    const response = await GoogleGenAiService.generateContent(geminiPrompt, 'gemini-3.1-pro', 0.2);

    let contentToParse = response.content;
    
    // Clean up markdown formatting if Gemini returns it
    if (contentToParse.startsWith('\`\`\`json')) {
        contentToParse = contentToParse.replace(/^\`\`\`json/, '').replace(/\`\`\`$/, '');
    }

    const result = JSON.parse(contentToParse);

    // 🛡️ Guardian Angel Audit 🛡️
    logger.info('👼 Guardian Angel is auditing the generated project...');
    const codeForAudit = JSON.stringify(result, null, 2);
    const auditResult = await GuardianService.auditCode(codeForAudit, `Genesis Project Generation (${type})`);

    if (!auditResult.safe) {
      logger.error(`👼 Guardian Internal Block: ${auditResult.reasoning}`);
      throw new Error(`Guardian Angel Blocked Generation: ${auditResult.reasoning}`);
    }

    logger.info(`👼 Guardian Approved (Score: ${auditResult.score})`);

    // ⚡ Google Wireit: Auto-Inject Caching Engine into Generated package.json
    for (const file of result.files) {
        if (file.path === 'package.json') {
            file.content = wireitService.injectWireitConfig(file.content);
        }
    }

    await EventBus.publish('generator.project.created', {
      type,
      prompt,
      fileCount: result.files.length
    });

    return result;

  } catch (error) {
    logger.error('Project generation failed', error);
    throw error;
  }
};

const readProjectFiles = async (dir, fileList = [], rootDir = dir) => {
  const files = await fs.readdir(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = await fs.stat(filePath);
    if (stat.isDirectory()) {
      if (file !== 'node_modules' && file !== '.git' && file !== 'dist') {
        await readProjectFiles(filePath, fileList, rootDir);
      }
    } else {
      // Only read text files
      if (/\.(js|jsx|ts|tsx|json|css|html|md|txt|yml)$/.test(file)) {
        const content = await fs.readFile(filePath, 'utf-8');
        const relativePath = path.relative(rootDir, filePath).replace(/\\/g, '/');
        fileList.push({ path: relativePath, content });
      }
    }
  }
  return fileList;
};

const refineProject = async (targetDir, prompt) => {
  if (!targetDir || typeof targetDir !== 'string') {
    throw new Error('GeneratorService: targetDir must be a non-empty string.');
  }
  if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
    throw new Error('GeneratorService: prompt must be a non-empty string.');
  }
  logger.info(`💻 Generator: Refining project at ${targetDir} with prompt: ${prompt}`);

  // 1. Read current project state
  const currentFiles = await readProjectFiles(targetDir);
  const context = JSON.stringify(currentFiles, null, 2);

  const systemPrompt = `
    You are an expert software engineer.
    Your goal is to MODIFY an existing project based on the user's request.

    Current Project State (JSON):
    ${context}

    User Request: "${prompt}"

    Output MUST be a valid JSON object containing ONLY the files that need to change.
    
    Format:
    {
      "files": [
        { "path": "src/App.jsx", "content": "..." } // Only include modified files
      ]
    }

    Rules:
    1.  Return the FULL content of the modified files (no diffs).
    2.  If adding a new file, include it.
    3.  Ensure code is production-ready and bugs are fixed.
    `;

  try {
    const responseText = await modelGateway.routePlatformCompletion({
      provider: 'azure',
      model: 'azure/gpt-5.5-pro',
      prompt: systemPrompt,
      temperature: 0.1
    });

    const result = JSON.parse(responseText);

    // 🛡️ Guardian Angel Audit 🛡️
    logger.info('👼 Guardian Angel is auditing the refinements...');
    const codeForAudit = JSON.stringify(result, null, 2);
    const auditResult = await GuardianService.auditCode(codeForAudit, 'Genesis Iterative Refinement');

    if (!auditResult.safe) {
      logger.error(`👼 Guardian Internal Block: ${auditResult.reasoning}`);
      throw new Error(`Guardian Angel Blocked Refinement: ${auditResult.reasoning}`);
    }

    logger.info(`👼 Guardian Approved Refinement (Score: ${auditResult.score})`);

    // 🔍 Google Diff-Match-Patch: Granular Audit Trailing
    for (const newFile of result.files) {
      const oldFile = currentFiles.find(f => f.path === newFile.path);
      if (oldFile) {
        const diffPatch = patchService.computePatch(oldFile.content, newFile.content);
        if (diffPatch) {
          logger.info(`🔍 [DiffMatchPatch] Computed semantic patch for ${newFile.path}. Logging to Sentinel.`);
          sentinelService.reportEvent('SWARM_CODE_MUTATION', 'LOW', {
            file: newFile.path,
            patchLength: diffPatch.length,
            patchContent: diffPatch
          });
        }
      }
    }

    // Apply changes (will invoke Closure Compiler downstream via writeApp)
    await writeApp(result, targetDir);

    return result;

  } catch (error) {
    logger.error('Project refinement failed', error);
    throw error;
  }
};

const writeApp = async (fileTree, targetDir) => {
  logger.info(`Writing generated app to ${targetDir}`);

  await fs.mkdir(targetDir, { recursive: true });

  for (const file of fileTree.files) {
    const filePath = path.join(targetDir, file.path);
    const dir = path.dirname(filePath);

    await fs.mkdir(dir, { recursive: true });

    // ⚙️ Google Closure Compiler AI Code Optimization
    let finalContent = file.content;
    if (file.path.endsWith('.js')) {
      finalContent = await closureService.optimizeCode(file.content);
    }

    await fs.writeFile(filePath, finalContent);
    logger.info(`Wrote ${file.path}`);
  }

  return { status: 'written', count: fileTree.files.length, path: targetDir };
};

const installDependencies = async (targetDir) => {
  logger.info(`Installing dependencies in ${targetDir}...`);
  try {
    // limit timeout to 5 minutes to prevent hanging
    const { stdout, stderr } = await execAsync('npm install', { cwd: targetDir, timeout: 300000 });
    logger.info('npm install completed');
    return { success: true, output: stdout };
  } catch (error) {
    logger.error('npm install failed', error);
    return { success: false, error: error.message };
  }
};

export const GeneratorService = {
  generateApp,
  generateProject,
  refineProject,
  writeApp,
  installDependencies,
};
