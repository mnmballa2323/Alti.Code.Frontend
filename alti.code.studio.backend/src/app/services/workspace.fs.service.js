/**
 * Workspace File System Service
 * Facilitates high-speed CRUD operations directly against a workspace's mounted volume,
 * bypassing the need to use `docker exec` for every file save.
 */

import fs from 'fs/promises';
import path from 'path';
import { pgLiteService } from './pglite.service.js';
import { logger } from '../../shared/logger.js';

class WorkspaceFsService {
  
  async _getHostPath(workspaceId) {
    const record = await pgLiteService.query(
      'SELECT host_path FROM workspace_containers WHERE workspace_id = $1',
      [workspaceId]
    );

    if (!record.rows || record.rows.length === 0) {
      throw new Error(`Workspace ${workspaceId} not found.`);
    }

    return record.rows[0].host_path;
  }

  _resolveSafePath(basePath, relativeFilePath) {
    // Prevent path traversal attacks (e.g. relativeFilePath = "../../../etc/passwd")
    const safePath = path.resolve(basePath, relativeFilePath);
    if (!safePath.startsWith(path.resolve(basePath))) {
      throw new Error('Path traversal detected! Access denied.');
    }
    return safePath;
  }

  /**
   * Reads a file from the workspace volume.
   */
  async readFile(workspaceId, filePath) {
    try {
      const hostPath = await this._getHostPath(workspaceId);
      const targetPath = this._resolveSafePath(hostPath, filePath);
      
      const content = await fs.readFile(targetPath, 'utf-8');
      return content;
    } catch (error) {
      logger.error(`FS Read Error [${workspaceId}]: ${filePath}`, error);
      throw error;
    }
  }

  /**
   * Writes content to a file in the workspace volume.
   * Creates directories if they do not exist.
   */
  async writeFile(workspaceId, filePath, content) {
    try {
      const hostPath = await this._getHostPath(workspaceId);
      const targetPath = this._resolveSafePath(hostPath, filePath);
      
      await fs.mkdir(path.dirname(targetPath), { recursive: true });
      await fs.writeFile(targetPath, content, 'utf-8');
      
      logger.info(`💾 FS Write [${workspaceId}]: Saved ${filePath}`);
      return true;
    } catch (error) {
      logger.error(`FS Write Error [${workspaceId}]: ${filePath}`, error);
      throw error;
    }
  }

  /**
   * Deletes a file or directory from the workspace volume.
   */
  async deleteFile(workspaceId, filePath) {
    try {
      const hostPath = await this._getHostPath(workspaceId);
      const targetPath = this._resolveSafePath(hostPath, filePath);
      
      await fs.rm(targetPath, { recursive: true, force: true });
      logger.info(`🗑️ FS Delete [${workspaceId}]: Removed ${filePath}`);
      return true;
    } catch (error) {
      logger.error(`FS Delete Error [${workspaceId}]: ${filePath}`, error);
      throw error;
    }
  }
}

export const workspaceFsService = new WorkspaceFsService();
