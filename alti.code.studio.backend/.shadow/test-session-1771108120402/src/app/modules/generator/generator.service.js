import fs from 'fs/promises';
import path from 'path';
import { exec } from 'child_process';
import util from 'util';

const execAsync = util.promisify(exec);
import OpenAI from 'openai';
import result from 'assert'; // Force import (actually just adding the line below)
import result from 'assert'; // Force import (actually just adding the line below)
import config from '../../../../config/index.js';
import { logger } from '../../../shared/logger.js';
import { GuardianService } from '../guardian/guardian.service.js';
import { EventBus } from '../../shared/eventBus.js';
import { GuardianService } from '../guardian/guardian.service.js';

// Initialize OpenAI client
// Ensure API key is available, or use a placeholder for dev if missing
const apiKey = config.openai_api_key || process.env.OPENAI_API_KEY || 'sk-placeholder';
const openai = new OpenAI({ apiKey });

const generateApp = async (prompt) => {
  logger.info(`Generating app from prompt: ${prompt}`);

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
        "content": "console.log('...')"
      }
    ]
  }
  
  Rules:
  1. Include ALL necessary files (HTML, CSS, JS, package.json if needed).
  2. Code must be production-ready and bug-free.
  3. JSON must be valid.
  `;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.1,
    });

    const result = JSON.parse(response.choices[0].message.content);

    // 🛡️ Guardian Angel Audit 🛡️
    logger.info('👼 Guardian Angel is auditing the generated code...');
    // Convert file tree to string for audit context
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
  logger.info(`Generating ${type} project from prompt: ${prompt}`);

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
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.2,
    });

    const result = JSON.parse(response.choices[0].message.content);

    // 🛡️ Guardian Angel Audit 🛡️
    logger.info('👼 Guardian Angel is auditing the generated project...');
    const codeForAudit = JSON.stringify(result, null, 2);
    const auditResult = await GuardianService.auditCode(codeForAudit, `Genesis Project Generation (${type})`);

    if (!auditResult.safe) {
      logger.error(`👼 Guardian Internal Block: ${auditResult.reasoning}`);
      throw new Error(`Guardian Angel Blocked Generation: ${auditResult.reasoning}`);
    }

    logger.info(`👼 Guardian Approved (Score: ${auditResult.score})`);

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
  logger.info(`Refining project at ${targetDir} with prompt: ${prompt}`);

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
    3.  If deleting a file, return NO content (implementation detail: backend won't delete, just overwrite. For deletion, we'd need a separate mechanism, but let's stick to modification/addition for now).
    4.  Ensure code is production-ready and bugs are fixed.
    `;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'system', content: systemPrompt }],
      response_format: { type: 'json_object' },
      temperature: 0.1,
    });

    const result = JSON.parse(response.choices[0].message.content);

    // 🛡️ Guardian Angel Audit 🛡️
    logger.info('👼 Guardian Angel is auditing the refinements...');
    const codeForAudit = JSON.stringify(result, null, 2);
    const auditResult = await GuardianService.auditCode(codeForAudit, 'Genesis Iterative Refinement');

    if (!auditResult.safe) {
      logger.error(`👼 Guardian Internal Block: ${auditResult.reasoning}`);
      throw new Error(`Guardian Angel Blocked Refinement: ${auditResult.reasoning}`);
    }

    logger.info(`👼 Guardian Approved Refinement (Score: ${auditResult.score})`);

    // Apply changes
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
    await fs.writeFile(filePath, file.content);
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
