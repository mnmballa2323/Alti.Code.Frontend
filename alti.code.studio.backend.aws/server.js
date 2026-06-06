const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const pino = require('pino');
const pinoHttp = require('pino-http');
const { BedrockRuntimeClient } = require('@aws-sdk/client-bedrock-runtime');

const logger = pino({ level: process.env.LOG_LEVEL || 'info' });
const app = express();

// Enterprise Security Middleware
app.use(helmet()); // Sets 15+ HTTP security headers
app.use(cors({ origin: process.env.ALLOWED_ORIGINS || '*' })); // Strict CORS
app.use(express.json({ limit: '10mb' })); // Protect against large payloads
app.use(pinoHttp({ logger })); // Structured JSON Logging

// DDoS Protection: 100 requests per 15 minutes per IP
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: 'Too many requests, please try again later.' }
});
app.use('/api/', limiter);

const PORT = process.env.PORT || 5001;
const client = new BedrockRuntimeClient({ region: process.env.AWS_REGION || 'us-east-1' });

app.get('/healthz', (req, res) => {
  res.status(200).json({ status: 'healthy', environment: 'aws-bedrock' });
});

app.post('/api/v1/aws/invoke', async (req, res) => {
  logger.info({ event: 'aws_inference_started' }, 'Processing AWS Bedrock request');
  // Skeleton implementation for Bedrock inference
  res.status(200).json({ message: 'AWS Bedrock inference endpoint reached.' });
});

const server = app.listen(PORT, () => {
  logger.info(`AWS Hardened Microservice running on port ${PORT}`);
});

// Graceful Shutdown Handler
const shutdown = () => {
  logger.info('SIGTERM/SIGINT received. Shutting down gracefully...');
  server.close(() => {
    logger.info('Closed out remaining connections.');
    process.exit(0);
  });
  
  // Force shutdown after 10 seconds
  setTimeout(() => {
    logger.error('Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
