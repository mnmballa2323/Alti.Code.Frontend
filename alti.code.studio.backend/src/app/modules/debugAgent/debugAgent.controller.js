/**
 * Copyright (c) 2024 Inso Code
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import httpStatus from 'http-status';
import { catchAsync } from '../../../shared/catchAsync.js';
import sendResponse from '../../../shared/sendResponse.js';
import { DebugAgentService } from './debugAgent.service.js';
import { observabilityService } from '../monitoring/observability.service.js';
import { logger } from '../../../shared/logger.js';
import crypto from 'crypto';

/**
 * Lightweight in-memory job store for async debug analysis tracking.
 * Bounded to 200 entries; oldest are evicted on overflow.
 * @type {Map<string, { status: string, result?: object, error?: string, createdAt: string }>}
 */
const jobStore = new Map();
const JOB_STORE_LIMIT = 200;

function _createJob() {
  const jobId = crypto.randomUUID();
  if (jobStore.size >= JOB_STORE_LIMIT) {
    // Evict the oldest entry
    jobStore.delete(jobStore.keys().next().value);
  }
  jobStore.set(jobId, {
    status: 'pending',
    createdAt: new Date().toISOString(),
  });
  return jobId;
}

function _completeJob(jobId, result) {
  const job = jobStore.get(jobId);
  if (job) {
    job.status = 'completed';
    job.result = result;
    job.completedAt = new Date().toISOString();
  }
}

function _failJob(jobId, error) {
  const job = jobStore.get(jobId);
  if (job) {
    job.status = 'failed';
    job.error = error;
    job.completedAt = new Date().toISOString();
  }
}

/**
 * POST /debug-agent/debug
 * Starts a debug analysis job. Returns a jobId immediately;
 * analysis runs in the background and can be polled via GET /debug/status/:jobId.
 */
const startDebug = catchAsync(async (req, res) => {
  const userId = req.user.id;
  const sessionId = req.body.sessionId || `debug-${Date.now()}`;
  const { errorLog, stackTrace } = req.body;

  if (
    !errorLog ||
    typeof errorLog !== 'string' ||
    errorLog.trim().length === 0
  ) {
    return sendResponse(res, {
      statusCode: httpStatus.BAD_REQUEST,
      success: false,
      message: 'Missing required field: errorLog (non-empty string)',
      data: null,
    });
  }

  const jobId = _createJob();

  // Run async — respond immediately with jobId
  DebugAgentService.analyzeError(errorLog, stackTrace ?? '', userId, sessionId)
    .then(result => _completeJob(jobId, result))
    .catch(err => {
      logger.error(`DebugAgent job ${jobId} failed: ${err.message}`);
      _failJob(jobId, err.message);
    });

  sendResponse(res, {
    statusCode: httpStatus.ACCEPTED,
    success: true,
    message: 'Debug analysis started.',
    data: { jobId },
  });
});

/**
 * GET /debug-agent/debug/status/:jobId
 * Returns the current status of a debug analysis job.
 */
const getJobStatus = catchAsync(async (req, res) => {
  const { jobId } = req.params;
  const job = jobStore.get(jobId);

  if (!job) {
    return sendResponse(res, {
      statusCode: httpStatus.NOT_FOUND,
      success: false,
      message: `Job ${jobId} not found. It may have expired or never existed.`,
      data: null,
    });
  }

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: `Job status: ${job.status}`,
    data: job,
  });
});

/**
 * POST /debug-agent/debug/webhook
 * Receives GCP Cloud Monitoring alerts and triggers autonomic debugging.
 */
const autonomicWebhook = catchAsync(async (req, res) => {
  logger.info('Received Autonomic Debugging Webhook from GCP Cloud Monitoring');

  const alertData = observabilityService.ingestCloudAlert(req.body);

  // Trigger async — do not block the webhook response
  DebugAgentService.analyzeError(
    alertData.errorLog,
    alertData.stackTrace,
    'system-gcp-alert',
    alertData.incidentId,
  ).catch(err => {
    logger.error(
      `Autonomic Debugging Pipeline failed for incident ${alertData.incidentId}`,
      err,
    );
  });

  sendResponse(res, {
    statusCode: httpStatus.ACCEPTED,
    success: true,
    message: 'Alert ingested. Autonomic debugging initiated.',
    data: { incidentId: alertData.incidentId },
  });
});

export const DebugAgentController = {
  startDebug,
  getJobStatus,
  autonomicWebhook,
};
