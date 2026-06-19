/**
 * Copyright (c) 2026 Inso Code
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { astGrepService } from '../../services/astGrep.service.js';
import { recastService } from '../../services/recast.service.js';

/**
 * Handle AST structural search request using ast-grep.
 */
export const handleSearch = async (req, res) => {
  try {
    const { lang, source, pattern } = req.body;
    if (!source || typeof source !== 'string') {
      return res.status(400).json({ success: false, error: 'source code is required.' });
    }
    if (!pattern || typeof pattern !== 'string') {
      return res.status(400).json({ success: false, error: 'search pattern is required.' });
    }

    const matches = astGrepService.findAll(lang || 'javascript', source, pattern);
    res.status(200).json({ success: true, count: matches.length, matches });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Handle AST structural rewrite request.
 */
export const handleRewrite = async (req, res) => {
  try {
    const { type, lang, source, pattern, rewritePattern, oldName, newName } = req.body;
    if (!source || typeof source !== 'string') {
      return res.status(400).json({ success: false, error: 'source code is required.' });
    }

    let transformedCode = source;

    if (type === 'recast-rename') {
      if (!oldName || !newName) {
        return res.status(400).json({ success: false, error: 'oldName and newName are required for recast-rename.' });
      }
      transformedCode = recastService.renameFunction(source, oldName, newName);
    } else {
      // Default to ast-grep rewrite
      if (!pattern || !rewritePattern) {
        return res.status(400).json({ success: false, error: 'pattern and rewritePattern are required.' });
      }
      transformedCode = astGrepService.rewrite(lang || 'javascript', source, pattern, rewritePattern);
    }

    res.status(200).json({ success: true, code: transformedCode });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
