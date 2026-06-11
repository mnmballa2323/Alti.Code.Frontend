/**
 * Copyright (c) 2024 Inso Code
 * 
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import winston, { format } from 'winston';
import { EventBusTransport, LokiTransport } from './winstonTransport.js';
import { LoggingWinston } from '@google-cloud/logging-winston';
import { errorReportingService } from '../app/modules/googleCloud/error_reporting.service.js';

const { combine, timestamp, label, prettyPrint, printf } = format;

// Custom log format
const myFormat = printf(({ level, message, label, timestamp }) => {
  return `${timestamp} [${label}] ${level}: ${message}`;
});

// Base log format
const baseFormat = combine(
  label({ label: 'INSO Code Service' }),
  timestamp(), // always produces ISO timestamp
  myFormat,
  prettyPrint(),
);

const transports = [
  new winston.transports.Console(),
  new EventBusTransport(),
];

const errorTransports = [
  new winston.transports.Console(),
  new EventBusTransport(),
];

// Mount Grafana Loki private cloud transport if URL is provided
if (process.env.LOKI_URL) {
  const loki = new LokiTransport();
  transports.push(loki);
  errorTransports.push(loki);
  console.log('✅ Local Grafana Loki (Winston Transport) activated.');
}

// 🌐 Deep Google Integration: Google Cloud Logging (Winston Transport)
if (process.env.NODE_ENV === 'production' && process.env.PRIVATE_CLOUD_MODE !== 'true') {
  try {
    // If we are in production, completely override standard logging with Google Cloud Native Logging
    const loggingWinston = new LoggingWinston({
      logName: 'alti-winston-global',
      // Google API implicitly finds the credentials via GOOGLE_APPLICATION_CREDENTIALS
    });
    
    transports.push(loggingWinston);
    errorTransports.push(loggingWinston);
    console.log('✅ Google Cloud Logging (Winston Transport) activated.');
  } catch (error) {
    console.warn('⚠️ Google Cloud Logging transport could not be initialized:', error.message);
  }
} else {
  console.log('⚠️ Skipping Google Cloud Logging transport (local dev or private cloud mode).');
}

// Success logger
export const logger = winston.createLogger({
  level: 'info',
  format: baseFormat,
  transports: transports,
});

logger.on('error', (err) => {
  console.error('Winston Logger Error:', err.message);
});

// Error logger
export const errorlogger = winston.createLogger({
  level: 'error',
  format: baseFormat,
  transports: errorTransports,
});

errorlogger.on('error', (err) => {
  console.error('Winston ErrorLogger Error:', err.message);
});

// 🚨 Override errorlogger to stream natively to GCP Error Reporting
const originalErrorLogger = errorlogger.error.bind(errorlogger);
errorlogger.error = (message, meta) => {
    errorReportingService.reportException(meta || message);
    originalErrorLogger(message, meta);
};
