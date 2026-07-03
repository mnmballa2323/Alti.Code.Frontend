import express from 'express';
import crypto from 'crypto';
import { routePlatformCompletion } from '../../platform/gateway/modelGateway.js';
import { logger } from '../../../shared/logger.js';

const router = express.Router();

/**
 * 🛡️ Security Middleware: Restricts proxy access strictly to localhost.
 * This prevents remote entities from utilizing our server's sovereign AI endpoints.
 */
const localhostOnly = (req, res, next) => {
  const remoteAddress = req.connection.remoteAddress;
  const isLocal =
    remoteAddress === '127.0.0.1' ||
    remoteAddress === '::1' ||
    remoteAddress === '::ffff:127.0.0.1' ||
    req.hostname === 'localhost' ||
    req.hostname === '127.0.0.1';

  if (!isLocal) {
    logger.warn(`🚫 [OpenWiki Proxy] Blocked unauthorized request from ${remoteAddress}`);
    return res.status(403).json({ error: 'Access Denied: Localhost access only.' });
  }
  next();
};

/**
 * Helper to convert chat messages array into a single structured string prompt
 */
const formatMessagesToPrompt = (messages) => {
  if (!Array.isArray(messages)) return '';
  return messages
    .map((msg) => {
      const role = String(msg.role || '').toUpperCase();
      const content = String(msg.content || '');
      return `[${role}]: ${content}`;
    })
    .join('\n\n');
};

/**
 * POST /chat/completions
 * Main proxy handler. Translates standard OpenAI requests to our platform's
 * sovereign GCP/Azure inference gateway.
 */
export const handleChatCompletions = async (req, res) => {
  const { messages, temperature, stream } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'Invalid payload: messages array is required.' });
  }

  // Determine provider and model based on environment config
  let provider = 'gcp';
  let model = 'gemini-3.5-flash';

  if (process.env.OPENWIKI_PROVIDER === 'azure') {
    provider = 'azure';
    model = process.env.OPENWIKI_MODEL || 'azure/gpt-5.4';
  } else if (process.env.OPENWIKI_PROVIDER === 'gcp') {
    provider = 'gcp';
    model = process.env.OPENWIKI_MODEL || 'gemini-3.5-flash';
  }

  logger.info(`🔀 [OpenWiki Proxy] Intercepted request | Provider: ${provider} | Model: ${model}`);
  logger.info(`📥 [OpenWiki Proxy] req.body: ${JSON.stringify(req.body)}`);

  const formattedPrompt = formatMessagesToPrompt(messages);

  try {
    const responseText = await routePlatformCompletion({
      provider,
      model,
      prompt: formattedPrompt,
      temperature: temperature ?? 0.2,
    });

    const responseId = `chatcmpl-${crypto.randomUUID()}`;
    const createdTime = Math.floor(Date.now() / 1000);
    const modelName = req.body.model || model;

    // Emulate streaming if requested by the client
    if (stream) {
      res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      });

      const chunkSize = 8;
      let index = 0;

      while (index < responseText.length) {
        const chunkText = responseText.substring(index, index + chunkSize);
        const chunkData = {
          id: responseId,
          object: 'chat.completion.chunk',
          created: createdTime,
          model: modelName,
          choices: [
            {
              index: 0,
              delta: {
                content: chunkText,
              },
              finish_reason: null,
            },
          ],
        };

        res.write(`data: ${JSON.stringify(chunkData)}\n\n`);
        index += chunkSize;
        await new Promise((resolve) => setTimeout(resolve, 15));
      }

      const finalChunkData = {
        id: responseId,
        object: 'chat.completion.chunk',
        created: createdTime,
        model: modelName,
        choices: [
          {
            index: 0,
            delta: {},
            finish_reason: 'stop',
          },
        ],
      };

      res.write(`data: ${JSON.stringify(finalChunkData)}\n\n`);
      res.write('data: [DONE]\n\n');
      return res.end();
    }

    // Standard non-streaming JSON response
    const estimatedPromptTokens = Math.max(1, Math.ceil(formattedPrompt.length / 4));
    const estimatedCompletionTokens = Math.max(1, Math.ceil(responseText.length / 4));

    return res.json({
      id: responseId,
      object: 'chat.completion',
      created: createdTime,
      model: modelName,
      choices: [
        {
          index: 0,
          message: {
            role: 'assistant',
            content: responseText,
          },
          finish_reason: 'stop',
        },
      ],
      usage: {
        prompt_tokens: estimatedPromptTokens,
        completion_tokens: estimatedCompletionTokens,
        total_tokens: estimatedPromptTokens + estimatedCompletionTokens,
      },
    });
  } catch (error) {
    logger.error(`❌ [OpenWiki Proxy] Forwarding failed: ${error.message}`);
    return res.status(500).json({ error: `Proxy Forwarding Failure: ${error.message}` });
  }
};

router.post('/chat/completions', localhostOnly, handleChatCompletions);

export const openWikiProxyRouter = router;
