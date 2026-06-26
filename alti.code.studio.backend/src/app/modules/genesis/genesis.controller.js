/**
 * Copyright (c) 2024 Inso Code
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import httpStatus from 'http-status';
import { catchAsync } from '../../../shared/catchAsync.js';
import sendResponse from '../../../shared/sendResponse.js';
import { genesisService, genesisBus } from './genesis.service.js';

const launchGenesis = catchAsync(async (req, res) => {
  const { prompt, repoName, isPrivate } = req.body;

  if (!prompt || !repoName) {
    return sendResponse(res, {
      statusCode: httpStatus.BAD_REQUEST,
      success: false,
      message: 'prompt and repoName are universally required for Genesis.',
      data: null,
    });
  }

  // Launch in background to prevent HTTP timeout
  genesisService.igniteCreation(prompt, repoName, isPrivate).catch(err => {
    console.error('Genesis background failure:', err.message);
  });

  sendResponse(res, {
    statusCode: httpStatus.ACCEPTED,
    success: true,
    message: 'Genesis Engine ignited. Awaiting creation of the universe.',
    data: { target: repoName },
  });
});

const genesisStream = catchAsync(async (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  const onProgress = data => {
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  genesisBus.on('genesis:progress', onProgress);

  // Provide initial connection heartbeat
  res.write(
    'data: {"status": "CONNECTED", "message": "Listening for Genesis events"}\n\n',
  );

  req.on('close', () => {
    genesisBus.removeListener('genesis:progress', onProgress);
  });
});

export const GenesisController = {
  launchGenesis,
  genesisStream,
};
