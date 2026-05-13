/**
 * Copyright (c) 2024 Alti.Code.Studio
 * 
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

<<<<<<< HEAD
import { Client } from '@elastic/elasticsearch';
import path from 'path';
import winston, { format } from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import { ElasticsearchTransport } from 'winston-elasticsearch';
import { EventBusTransport } from './winstonTransport.js';
=======
import winston, { format } from 'winston';
import { EventBusTransport } from './winstonTransport.js';
import { LoggingWinston } from '@google-cloud/logging-winston';
import { errorReportingService } from '../app/modules/googleCloud/error_reporting.service.js';
>>>>>>> ec1fead (feat(omni-cloud): integrate and visualize multi-cloud sovereign architecture)

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
<<<<<<< HEAD
  new DailyRotateFile({
    filename: path.join(process.cwd(), 'logs', 'successes', 'RH-%DATE%-success.log'),
    datePattern: 'YYYY-MM-DD-HH',
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '14d',
  }),
=======
>>>>>>> ec1fead (feat(omni-cloud): integrate and visualize multi-cloud sovereign architecture)
  new EventBusTransport(),
];

const errorTransports = [
  new winston.transports.Console(),
<<<<<<< HEAD
  new DailyRotateFile({
    filename: path.join(process.cwd(), 'logs', 'errors', 'RH-%DATE%-error.log'),
    datePattern: 'YYYY-MM-DD-HH',
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '14d',
  }),
  new EventBusTransport(),
];

// Conditionally add ElasticSearch
if (process.env.ELASTIC_ENABLED === 'true') {
  const esClient = new Client({
    node: process.env.ELASTICSEARCH_URL || 'http://localhost:9200',
    compatibility: true,
  });

  esClient.ping({}, { requestTimeout: 1000 })
    .then(() => console.log('✅ Connected to Elasticsearch'))
    .catch(err => console.error('❌ Cannot connect to Elasticsearch:', err));

  const esTransport = new ElasticsearchTransport({
    level: 'info',
    clientOpts: { node: process.env.ELASTICSEARCH_URL || 'http://localhost:9200' },
    indexPrefix: 'inso-code-logs',
    indexSuffixPattern: 'YYYY-MM-DD',
  });

  esTransport.on('error', error => {
    console.error('❌ Elasticsearch Transport Error:', error);
  });

  transports.push(esTransport);
  errorTransports.push(esTransport);
=======
  new EventBusTransport(),
];

// 🌐 Deep Google Integration: Google Cloud Logging (Winston Transport)
if (process.env.NODE_ENV === 'production') {
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
  console.log('⚠️ Local Dev: Skipping Google Cloud Logging transport to avoid auth crash. Using standard Console output.');
>>>>>>> ec1fead (feat(omni-cloud): integrate and visualize multi-cloud sovereign architecture)
}

// Success logger
export const logger = winston.createLogger({
  level: 'info',
  format: baseFormat,
  transports: transports,
});

// Error logger
export const errorlogger = winston.createLogger({
  level: 'error',
  format: baseFormat,
  transports: errorTransports,
});
<<<<<<< HEAD
=======

// 🚨 Override errorlogger to stream natively to GCP Error Reporting
const originalErrorLogger = errorlogger.error.bind(errorlogger);
errorlogger.error = (message, meta) => {
    errorReportingService.reportException(meta || message);
    originalErrorLogger(message, meta);
};
>>>>>>> ec1fead (feat(omni-cloud): integrate and visualize multi-cloud sovereign architecture)
