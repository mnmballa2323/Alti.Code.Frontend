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

  // Configure transporter using standard Google Workspace / Gmail SMTP
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465, // SSL
    secure: true,
    auth: {
      user: config.smtp?.user || process.env.SMTP_USER,
      pass: config.smtp?.pass || process.env.SMTP_PASS,
    },
  });

  const mailOptions = {
    from: `"Inso Code" <${config.smtp?.user || process.env.SMTP_USER}>`,
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
