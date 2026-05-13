/**
 * Copyright (c) 2024 Alti.Code.Studio
 * 
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { exec } from 'child_process';

const openFolder = (req, res) => {
  res.removeHeader('X-Frame-Options'); // allow iframe
  const folderPath = req.body.path;

  exec(
    `docker exec inso_code_editor code-server --reuse-window "${folderPath}"`,
    (error, stdout, stderr) => {
      if (error) {
        return res.status(500).send('Error opening folder');
      }
      res.send('Folder opened in VS Code');
    },
  );
};

const runCommand = (req, res) => {
  const { command, cwd } = req.body;
  // Security: In a real app, strict sanitization is needed. 
  // For this dev tool, we allow commands but should be careful.

  const options = cwd ? { cwd } : {};

  exec(command, options, (error, stdout, stderr) => {
    // We return 200 even on error, so the frontend can display the error output
    res.json({
      success: !error,
      stdout: stdout || '',
      stderr: stderr || (error ? error.message : ''),
      cwd: process.cwd() // return current cwd for prompt updates if we tracked it
    });
  });
};

export const CodeEditorController = {
  openFolder,
  runCommand
};
