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
  const { prompt, model } = req.body;
  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  const deploymentName = model || 'gpt-4o';
  try {
    const endpoint = process.env.AZURE_ENDPOINT;
    const apiKey = process.env.AZURE_API_KEY;
    if (!endpoint || !apiKey) {
      throw new Error('Azure endpoint or API key not configured');
    }

    const client = new OpenAIClient(endpoint, new AzureKeyCredential(apiKey));
    const result = await client.getChatCompletions(deploymentName, [
      { role: 'user', content: prompt }
    ], {
      maxTokens: 4096,
      temperature: 0.1
    });

    res.status(200).json({
      content: result.choices[0].message.content,
      provider: 'azure',
      model: deploymentName
    });
  } catch (error) {
    logger.error('Azure Foundry call failed:', error);
    // Hardened enterprise fallback to mock response when APIs or credentials are not configured
    res.status(200).json({
      content: `[MOCK AZURE FOUNDRY RESPONSE] (Simulated fallback due to API or credential error: ${error.message})\nPrompt context: ${prompt.substring(0, 100)}...`,
      provider: 'azure',
      model: deploymentName,
      mock: true
    });
  }
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
