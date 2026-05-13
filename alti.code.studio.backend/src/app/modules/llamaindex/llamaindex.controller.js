/**
 * Copyright (c) 2024 Alti.Code.Studio
 * 
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import fs from 'node:fs/promises';
<<<<<<< HEAD
import { ragService } from './llamaindex.service.js';
=======
import { llamaIndexService } from './llamaindex.service.js';
>>>>>>> ec1fead (feat(omni-cloud): integrate and visualize multi-cloud sovereign architecture)

export const uploadAndIndexDocument = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0)
      return res.status(400).json({ error: 'No files uploaded' });

    const filePaths = req.files.map(f => f.path);
<<<<<<< HEAD
    const result = await ragService.uploadAndIndexDocumentService(filePaths);
=======
    const result = await llamaIndexService.uploadAndIndexDocument(filePaths[0]);
>>>>>>> ec1fead (feat(omni-cloud): integrate and visualize multi-cloud sovereign architecture)

    // Optional: delete files after indexing
    await Promise.all(filePaths.map(p => fs.unlink(p)));

    res.status(200).json({ message: result.message, result });
  } catch (error) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res
        .status(413)
        .json({
          error: 'One or more files are too large. Max size is 1MB each.',
        });
    }
    res.status(500).json({ error: error.message });
  }
};

export const queryIndex = async (req, res) => {
  try {
    const { query } = req.body;
<<<<<<< HEAD
    const answer = await ragService.queryDocument(query);
=======
    const answer = await llamaIndexService.queryDocument(query);
>>>>>>> ec1fead (feat(omni-cloud): integrate and visualize multi-cloud sovereign architecture)
    res.status(200).json({ answer });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
