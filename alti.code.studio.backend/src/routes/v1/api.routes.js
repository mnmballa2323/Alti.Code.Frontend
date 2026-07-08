import express from 'express';
import { database } from '../../shared/database.js';
import { modelRouter } from '../../shared/modelRouter.js';
import { apiGateway } from '../../shared/apiGateway.js';
import { logger } from '../../shared/logger.js';

export const apiRoutes = express.Router();

// Apply global API Gateway middleware to this router
apiRoutes.use(apiGateway.requestId());
apiRoutes.use(apiGateway.requestLogger());

/**
 * @route GET /v1/health
 * @desc Public health check endpoint
 */
apiRoutes.get('/health', async (req, res) => {
  const dbHealth = await database.healthCheck();
  res.json(apiGateway.successEnvelope({
    status: 'operational',
    database: dbHealth,
    timestamp: new Date().toISOString()
  }));
});

// -----------------------------------------------------------------------------
// Protected Routes below this line (Requires API Key)
// -----------------------------------------------------------------------------
apiRoutes.use(apiGateway.apiKeyAuth());
apiRoutes.use(apiGateway.rateLimitAuth());

/**
 * @route GET /v1/users/me
 * @desc Get current user details from Database
 */
apiRoutes.get('/users/me', async (req, res) => {
  try {
    const prisma = database.getClient();
    if (!prisma) {
      return res.json(apiGateway.successEnvelope({ 
        message: 'Database operating in degraded/simulation mode (no connection)',
        tenantId: req.tenantId
      }));
    }

    // In a real flow, we'd look up by the authenticated token's user ID.
    // For now, we just get the first user in the tenant to prove DB connection works.
    const user = await prisma.user.findFirst({
      where: { tenantId: req.tenantId },
      select: { id: true, email: true, role: true, tenantRole: true }
    });
    
    res.json(apiGateway.successEnvelope({ user }));
  } catch (err) {
    logger.error('Error fetching user', err);
    res.status(500).json(apiGateway.errorEnvelope('Failed to fetch user', 'DB_ERROR', req.requestId));
  }
});

/**
 * @route POST /v1/ai/prompt
 * @desc Submit a prompt to the Google Vertex AI models
 */
apiRoutes.post('/ai/prompt', async (req, res) => {
  try {
    const { prompt, complexity } = req.body;
    
    if (!prompt) {
      return res.status(400).json(apiGateway.errorEnvelope('Prompt is required', 'VALIDATION_ERROR', req.requestId));
    }

    // Dispatch to Vertex AI via ModelRouter
    const response = await modelRouter.executePrompt({
      prompt,
      complexity: complexity || 'medium',
      tenantId: req.tenantId,
      tenantTier: req.apiKeyData?.tier || 'cloud'
    });

    res.json(apiGateway.successEnvelope({
      response: response.content,
      model: response.model,
      tokens: response.tokens
    }));
  } catch (err) {
    logger.error('Error executing prompt', err);
    res.status(500).json(apiGateway.errorEnvelope('AI Execution Failed', 'AI_ERROR', req.requestId));
  }
});
