import { exec } from 'child_process';
import util from 'util';
import httpStatus from 'http-status';
import ApiError from '../../../errors/ApiError.js';

const execPromise = util.promisify(exec);

const listExtensions = async () => {
  try {
    const { stdout } = await execPromise('gemini extensions list --json');
    return JSON.parse(stdout);
  } catch (error) {
    console.warn('Gemini CLI extensions list failed:', error.message);
    return [];
  }
};

const invokeExtension = async (extensionName, inputArgs) => {
  try {
    const sanitized = extensionName.replace(/[^a-zA-Z0-9_\-]/g, '');
    const argStr = (inputArgs || [])
      .map(a => `"${String(a).replace(/"/g, '\\"')}"`)
      .join(' ');
    const command = `gemini ${sanitized} ${argStr}`.trim();
    const { stdout } = await execPromise(command);
    return stdout;
  } catch (error) {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      `Failed to invoke Gemini extension [${extensionName}]: ${error.message}`,
    );
  }
};

const installExtension = async githubUrl => {
  try {
    const { stdout } = await execPromise(
      `gemini extensions install ${githubUrl}`,
    );
    return stdout;
  } catch (error) {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      `Failed to install Gemini extension from ${githubUrl}: ${error.message}`,
    );
  }
};

const uninstallExtension = async extensionName => {
  try {
    const sanitized = extensionName.replace(/[^a-zA-Z0-9_\-]/g, '');
    const { stdout } = await execPromise(
      `gemini extensions uninstall ${sanitized}`,
    );
    return stdout;
  } catch (error) {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      `Failed to uninstall Gemini extension [${extensionName}]: ${error.message}`,
    );
  }
};

export const GeminiExtensionService = {
  listExtensions,
  invokeExtension,
  installExtension,
  uninstallExtension,
};
