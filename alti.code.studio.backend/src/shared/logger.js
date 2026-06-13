/**
 * Copyright (c) 2024 Inso Code
 * 
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import winston, { format } from 'winston';
import { EventBusTransport, LokiTransport } from './winstonTransport.js';

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

// 🌐 Google Cloud Native Logging completely removed for pure air-gapped compliance.
console.log('⚠️ Running in pure air-gapped enterprise mode. External cloud logging is disabled.');

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

