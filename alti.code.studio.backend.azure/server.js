const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const pino = require('pino');
const pinoHttp = require('pino-http');
const { OpenAIClient, AzureKeyCredential } = require('@azure/openai');

const logger = pino({ level: process.env.LOG_LEVEL || 'info' });
const app = express();

// Enterprise Security Middleware
app.use(helmet()); 
app.use(cors({ origin: process.env.ALLOWED_ORIGINS || '*' }));
app.use(express.json({ limit: '10mb' })); 
app.use(pinoHttp({ logger })); 

// DDoS Protection
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: 'Too many requests, please try again later.' }
});
app.use('/api/', limiter);

const PORT = process.env.PORT || 5002;
// const client = new OpenAIClient(process.env.AZURE_ENDPOINT, new AzureKeyCredential(process.env.AZURE_API_KEY));

app.get('/healthz', (req, res) => {
  res.status(200).json({ status: 'healthy', environment: 'azure-foundry' });
});

app.post('/api/v1/azure/invoke', async (req, res) => {
  logger.info({ event: 'azure_inference_started' }, 'Processing Azure Foundry request');
  // Skeleton implementation for Azure OpenAI inference
  res.status(200).json({ message: 'Azure Foundry inference endpoint reached.' });
});

const server = app.listen(PORT, () => {
  logger.info(`Azure Hardened Microservice running on port ${PORT}`);
});

// Graceful Shutdown Handler
const shutdown = () => {
  logger.info('SIGTERM/SIGINT received. Shutting down gracefully...');
  server.close(() => {
    logger.info('Closed out remaining connections.');
    process.exit(0);
  });
  
  setTimeout(() => {
    logger.error('Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
