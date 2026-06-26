/**
 * Copyright (c) 2026 Inso Code
 *
 * Crabbox Controller
 * Handles incoming Express requests to execute remote sandbox actions.
 */

import { catchAsync } from '../../../shared/catchAsync.js';
import { crabboxService } from './crabbox.service.js';

const warmup = catchAsync(async (req, res) => {
  const result = await crabboxService.warmup(req.body);
  res.status(200).json({
    success: true,
    data: result,
  });
});

const run = catchAsync(async (req, res) => {
  const { command, options } = req.body;
  if (!command) {
    return res.status(400).json({
      success: false,
      message: 'Command is required for execution.',
    });
  }

  const result = await crabboxService.run(command, options);
  res.status(200).json({
    success: result.success,
    data: result,
  });
});

const stop = catchAsync(async (req, res) => {
  const leaseId = req.body.leaseId || req.params.leaseId;
  if (!leaseId) {
    return res.status(400).json({
      success: false,
      message: 'leaseId is required to stop the lease.',
    });
  }

  const result = await crabboxService.stop(leaseId);
  res.status(200).json({
    success: result.success,
    data: result,
  });
});

const status = catchAsync(async (req, res) => {
  const leaseId = req.query.leaseId || req.params.leaseId;
  if (!leaseId) {
    return res.status(400).json({
      success: false,
      message: 'leaseId is required to check status.',
    });
  }

  const result = await crabboxService.status(leaseId);
  res.status(200).json({
    success: result.success,
    data: result,
  });
});

const syncPlan = catchAsync(async (req, res) => {
  const result = await crabboxService.syncPlan(req.body);
  res.status(200).json({
    success: true,
    data: result,
  });
});

export const CrabboxController = {
  warmup,
  run,
  stop,
  status,
  syncPlan,
};
