/**
 * Copyright (c) 2024 Inso Code
 * 
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import nodemailer from 'nodemailer';
import config from '../../../../config/index.js';
import { logger } from '../../../shared/logger.js';

/**
 * Sends an email using Google Workspace SMTP / Nodemailer
 * @param {Object} mailData
 * @param {string} mailData.sub Subject
 * @param {string} mailData.message HTML content
 * @param {string} mailData.userEmail Recipient email
 */
export const sendMailWithGoogleWorkspace = async (mailData) => {
  const { sub, message, userEmail } = mailData;

  const smtpHost = config.smtp?.host || 'smtp.gmail.com';
  const smtpPort = parseInt(config.smtp?.port || '465', 10);
  const smtpSecure = config.smtp?.secure !== 'false'; // Defaults to secure true
  const smtpUser = config.smtp?.user;
  const smtpPass = config.smtp?.pass;

  // Configure transporter dynamically for local or public SMTP relays
  const transporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpSecure,
    auth: smtpUser && smtpPass ? {
      user: smtpUser,
      pass: smtpPass,
    } : undefined,
  });

  const mailOptions = {
    from: `"Inso Code" <${smtpUser || 'no-reply@insocode.com'}>`,
    to: userEmail,
    subject: sub,
    html: message,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    logger.info(`[SMTP] Transactional email sent successfully to ${userEmail} (MessageId: ${info.messageId})`);
    return info;
  } catch (error) {
    logger.error(`[SMTP] Failed to send transactional email to ${userEmail}: ${error.message}`);
    throw error;
  }
};
