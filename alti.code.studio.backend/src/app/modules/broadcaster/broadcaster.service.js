/**
 * Copyright (c) 2024 Inso Code
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { broadcasterAgent } from './broadcaster.agent.js';
import { logger } from '../../../shared/logger.js';

/** Validate that a message is a non-empty string. */
const validateMessage = (msg, field = 'message') => {
  if (!msg || typeof msg !== 'string' || msg.trim().length === 0) {
    throw new Error(`BroadcasterService: ${field} must be a non-empty string.`);
  }
};

const sendSlack = async message => {
  validateMessage(message);
  logger.info(
    `📢 BroadcasterService: Sending Slack message (${message.length} chars)`,
  );
  return await broadcasterAgent.sendSlack(message);
};

const sendDiscord = async message => {
  validateMessage(message);
  logger.info(
    `📢 BroadcasterService: Sending Discord message (${message.length} chars)`,
  );
  return await broadcasterAgent.sendDiscord(message);
};

const sendEmail = async (to, subject, body) => {
  if (!to || typeof to !== 'string')
    throw new Error('BroadcasterService: to must be a string.');
  if (!subject || typeof subject !== 'string')
    throw new Error('BroadcasterService: subject must be a string.');
  validateMessage(body, 'body');
  logger.info(`📧 BroadcasterService: Sending email to "${to}" — "${subject}"`);
  return await broadcasterAgent.sendEmail(to, subject, body);
};

const broadcastAlert = async alert => {
  if (!alert || typeof alert !== 'object') {
    throw new Error('BroadcasterService: alert must be a non-null object.');
  }
  logger.info(
    `🚨 BroadcasterService: Broadcasting alert — ${alert.title ?? alert.message ?? JSON.stringify(alert).slice(0, 80)}`,
  );
  return await broadcasterAgent.broadcastAlert(alert);
};

export const BroadcasterService = {
  sendSlack,
  sendDiscord,
  sendEmail,
  broadcastAlert,
};
