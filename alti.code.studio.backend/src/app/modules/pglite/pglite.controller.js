/**
 * Copyright (c) 2026 Inso Code
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { pgLiteService } from '../../services/pglite.service.js';

/**
 * Execute a secure sandboxed SQL query against the in-memory PGLite database.
 */
export const executeQuery = async (req, res) => {
  try {
    const { sql, params, tenantId } = req.body;
    if (!sql || typeof sql !== 'string') {
      return res.status(400).json({ error: 'SQL query string is required.' });
    }

    const result = await pgLiteService.query(sql, params || [], tenantId || 'default');
    res.status(200).json({
      success: true,
      rows: result.rows,
      affectedRows: result.affectedRows,
      fields: result.fields,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Reset or shutdown a PGLite instance for a tenant.
 */
export const resetDatabase = async (req, res) => {
  try {
    const { tenantId } = req.body;
    await pgLiteService.shutdown(tenantId || 'default');
    res.status(200).json({ success: true, message: `Database instance reset successfully for tenant: ${tenantId || 'default'}` });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
