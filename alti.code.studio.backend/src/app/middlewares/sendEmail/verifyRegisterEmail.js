/**
 * Copyright (c) 2024 Inso Code
 * 
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import nodemailer from 'nodemailer';
import config from '../../../../config/index.js';
import { logger } from '../../../shared/logger.js';

export const sendMailForRegisterWithAzure = async data => {
  const smtpHost = config.smtp?.host || 'smtp.azurecomm.net';
  const smtpPort = parseInt(config.smtp?.port || '465', 10);
  const smtpSecure = config.smtp?.secure !== 'false';
  const smtpUser = config.smtp?.user;
  const smtpPass = config.smtp?.pass;

  const transporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpSecure,
    auth: smtpUser && smtpPass ? {
      user: smtpUser,
      pass: smtpPass,
    } : undefined,
  });

  const mailData = {
    from: `"Azure Sovereign Auth" <${smtpUser || 'no-reply@azurecomm.net'}>`,
    to: data.to,
    subject: data.subject,
    html: data.text,
  };

  try {
    const info = await transporter.sendMail(mailData);
    logger.info(`[SMTP] Registration email sent successfully to ${data.to} (MessageId: ${info.messageId})`);
    return info.messageId;
  } catch (error) {
    logger.error(`[SMTP] Failed to send registration email to ${data.to}: ${error.message}`);
    return `mock-msg-${Date.now()}`;
  }
};

