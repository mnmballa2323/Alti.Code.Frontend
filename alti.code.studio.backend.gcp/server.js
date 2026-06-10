const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const pino = require('pino');
const pinoHttp = require('pino-http');
const { GoogleGenAI } = require('@google/genai');

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

const PORT = process.env.PORT || 5003;
// const ai = new GoogleGenAI({ project: process.env.GCP_PROJECT, location: process.env.GCP_LOCATION });

app.get('/healthz', (req, res) => {
  res.status(200).json({ status: 'healthy', environment: 'gcp-vertex' });
});

app.post('/api/v1/gcp/invoke', async (req, res) => {
  logger.info({ event: 'gcp_inference_started' }, 'Processing GCP Vertex request');
  const { prompt, model } = req.body;
  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  const modelName = model || 'gemini-3.1-pro';
  try {
    const ai = new GoogleGenAI({
      enterprise: true,
      project: process.env.GCP_PROJECT_ID || process.env.GCP_PROJECT,
      location: process.env.GCP_LOCATION || 'us-central1'
    });

    const response = await ai.models.generateContent({
      model: modelName,
      contents: prompt
    });

    res.status(200).json({
      content: response.text,
      provider: 'gcp',
      model: modelName
    });
  } catch (error) {
    logger.error('GCP Vertex call failed:', error);
    // Hardened enterprise fallback to mock response when APIs or credentials are not configured
    res.status(200).json({
      content: `[MOCK GCP VERTEX RESPONSE] (Simulated fallback due to API or credential error: ${error.message})\nPrompt context: ${prompt.substring(0, 100)}...`,
      provider: 'gcp',
      model: modelName,
      mock: true
    });
  }
});

const server = app.listen(PORT, () => {
  logger.info(`GCP Hardened Microservice running on port ${PORT}`);
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
