/**
 * Copyright (c) 2024 Inso Code
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { exec } from 'child_process';
import path from 'path';
import fs from 'fs/promises';
import httpStatus from 'http-status';
import ApiError from '../../../errors/ApiError.js';
import { logger } from '../../../shared/logger.js';

/**
 * Clones the ai-website-cloner-template repository into a project directory,
 * runs npm install, and prepares it for website cloning via Chrome DevTools.
 *
 * @param {string} targetUrl The target website URL to clone
 * @param {string} projectName The name of the new folder inside website-clones/
 * @param {string} [workspacePath] Workspace root path override
 * @returns {Promise<object>} Status report of the setup and next steps
 */
const prepareClonerTemplate = async (targetUrl, projectName, workspacePath) => {
  if (!targetUrl) throw new ApiError(httpStatus.BAD_REQUEST, 'targetUrl is required.');
  if (!projectName) throw new ApiError(httpStatus.BAD_REQUEST, 'projectName is required.');

  const rootPath = workspacePath || process.cwd();
  // Ensure we output to a directory inside the user's active workspace
  const parentClonesDir = path.join(rootPath, 'website-clones');
  const targetDir = path.join(parentClonesDir, projectName);

  try {
    // 1. Create parent clones directory if not exists
    await fs.mkdir(parentClonesDir, { recursive: true });
    
    // Check if target directory already exists
    try {
      await fs.access(targetDir);
      throw new ApiError(httpStatus.CONFLICT, `Directory website-clones/${projectName} already exists.`);
    } catch (err) {
      if (err.statusCode === httpStatus.CONFLICT) throw err;
      // Otherwise it does not exist, safe to clone
    }

    logger.info(`🌐 Cloner: Cloning JCodesMore/ai-website-cloner-template to website-clones/${projectName}...`);
    
    // 2. Clone the template repository
    await new Promise((resolve, reject) => {
      exec(`git clone https://github.com/JCodesMore/ai-website-cloner-template.git "${targetDir}"`, (err, stdout, stderr) => {
        if (err) {
          logger.error(`❌ Cloner: git clone failed: ${err.message}`);
          return reject(new ApiError(httpStatus.INTERNAL_SERVER_ERROR, `Failed to clone cloner template repository: ${stderr || err.message}`));
        }
        resolve();
      });
    });

    logger.info(`📦 Cloner: Running npm install in website-clones/${projectName}...`);
    
    // 3. Install packages inside the cloned project
    await new Promise((resolve, reject) => {
      exec(`npm install`, { cwd: targetDir }, (err, stdout, stderr) => {
        if (err) {
          logger.error(`❌ Cloner: npm install failed: ${err.message}`);
          return reject(new ApiError(httpStatus.INTERNAL_SERVER_ERROR, `Dependency installation failed: ${stderr || err.message}`));
        }
        resolve();
      });
    });

    logger.info(`🚀 Cloner: Template setup complete. Website cloner project ready at website-clones/${projectName}`);
    
    // 4. Return success status with setup details and instruct user how to start the agent cloning sweep
    return {
      success: true,
      message: 'AI Website Cloner project generated and initialized successfully.',
      details: {
        projectName,
        targetUrl,
        location: `website-clones/${projectName}`,
        nextSteps: [
          `Navigate to the cloner folder: cd website-clones/${projectName}`,
          `Launch your agentic cloner execution: npx openspec propose clone-task`,
          `Or execute the /clone-website command to copy ${targetUrl} pixel-perfect.`
        ]
      }
    };
  } catch (error) {
    logger.error(`❌ Cloner error: ${error.message}`);
    throw error;
  }
};

export const AiWebsiteClonerService = {
  prepareClonerTemplate,
};
