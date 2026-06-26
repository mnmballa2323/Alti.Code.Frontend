import { catchAsync } from '../../../shared/catchAsync.js';
import sendResponse from '../../../shared/sendResponse.js';
import { execFile } from 'child_process';
import path from 'path';
import util from 'util';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const execFilePromise = util.promisify(execFile);

export const runAudit = catchAsync(async (req, res) => {
  const { targetPath } = req.body;

  if (!targetPath || typeof targetPath !== 'string') {
    return sendResponse(res, {
      statusCode: 400,
      success: false,
      message: 'Target path is required and must be a string',
    });
  }

  // Harden: Validate targetPath to prevent command injection and path traversal
  const isGitUrl =
    /^https:\/\/(www\.)?github\.com\/[a-zA-Z0-9_-]+\/[a-zA-Z0-9_-]+(\.git)?$/.test(
      targetPath,
    );

  let isSafeLocalPath = false;
  if (!isGitUrl) {
    // Only allow absolute paths within the user's workspace
    // Resolve the path and ensure it does not break out
    const resolvedPath = path.resolve(targetPath);
    const workspaceRoot = path.resolve(__dirname, '../../../../../'); // alti.code.studio root

    if (resolvedPath.startsWith(workspaceRoot)) {
      try {
        const stats = await fs.promises.stat(resolvedPath);
        if (stats.isDirectory()) {
          isSafeLocalPath = true;
        }
      } catch (err) {
        // Path doesn't exist or isn't accessible
      }
    }
  }

  if (!isGitUrl && !isSafeLocalPath) {
    return sendResponse(res, {
      statusCode: 403,
      success: false,
      message:
        'Forbidden: Target must be a valid GitHub URL or a strictly contained workspace directory.',
    });
  }

  // The path to the sandyaa executable
  const sandyaaDir = path.resolve(__dirname, '../../../../submodules/sandyaa');
  const sandyaaScript = path.join(sandyaaDir, 'dist/index.js');

  try {
    // Harden: Use execFile to avoid shell interpolation and command injection vulnerabilities
    const { stdout, stderr } = await execFilePromise(
      process.execPath,
      [sandyaaScript, targetPath],
      {
        cwd: sandyaaDir,
        timeout: 600000, // 10 minutes timeout for safety
      },
    );

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Audit finished.',
      data: {
        stdout,
        stderr,
      },
    });
  } catch (error) {
    sendResponse(res, {
      statusCode: 500,
      success: false,
      message: 'Audit execution failed',
      data: {
        error: error.message,
        stdout: error.stdout,
        stderr: error.stderr,
      },
    });
  }
});
