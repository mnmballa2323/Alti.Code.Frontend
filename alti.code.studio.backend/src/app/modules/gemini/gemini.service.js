/**
 * Copyright (c) 2024 Alti.Code.Studio
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { InMemoryChatMessageHistory } from '@langchain/core/chat_history';
import { AIMessage, HumanMessage, SystemMessage } from '@langchain/core/messages';
import httpStatus from 'http-status';
import { BufferMemory } from 'langchain/memory';

import config from '../../../../config/index.js';
import ApiError from '../../../errors/ApiError.js';
import { logger } from '../../../shared/logger.js';
import UserModel from '../auth/auth.model.js';
import Llama from '../dyad/dyad.model.js';
import { observabilityService } from '../monitoring/observability.service.js';
import { createCircuitBreaker } from '../../../shared/circuitBreaker.js';
import { creditTrackingService } from '../credits/credits.service.js';

const client = new GoogleGenerativeAI(config.gemini_secret_key);

/** Default model — gemini-3.1 does not exist; use latest stable release. */
const DEFAULT_MODEL = config.gcp.model_name || 'gemini-1.5-pro';
const model = client.getGenerativeModel({ model: DEFAULT_MODEL });

/**
 * In-memory session memory store.
 * Capped at MAX_SESSIONS entries with oldest-first eviction to prevent unbounded growth.
 */
const SESSION_MEMORY_MAX = 1000;
const sessionMemoryStore = new Map();

// ---------- helpers ----------

const isCodingPrompt = (prompt = '') =>
  /code|api|function|class|program|script|backend|frontend|algorithm|sql|database/i.test(prompt);

const buildSystemInstruction = ({ language, isCoding }) => {
  if (!isCoding) return 'You are a helpful AI assistant.';
  return `
You are a senior software engineer.

Rules:
- Respond ONLY with production-quality ${language} code
- Follow idiomatic ${language} best practices
- No explanations unless explicitly requested
- Assume real-world usage
`;
};

// ---------- chat service ----------

const geminiService = async (sessionId, prompt, userId, language = 'text') => {
  if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'GeminiService: prompt must be a non-empty string.');
  }

  let memory = sessionMemoryStore.get(sessionId);

  if (!memory) {
    memory = new BufferMemory({
      returnMessages: true,
      memoryKey: 'history',
      chatHistory: new InMemoryChatMessageHistory(),
    });
    // Evict oldest session when at capacity
    if (sessionMemoryStore.size >= SESSION_MEMORY_MAX) {
      sessionMemoryStore.delete(sessionMemoryStore.keys().next().value);
    }
    sessionMemoryStore.set(sessionId, memory);
  }

  try {
    const coding = isCodingPrompt(prompt);
    const systemInstruction = buildSystemInstruction({ language, isCoding: coding });

    await memory.chatHistory.addMessage(new SystemMessage(systemInstruction));
    await memory.chatHistory.addMessage(new HumanMessage(prompt));

    // Race with 60s timeout for chat (longer generation)
    const result = await Promise.race([
      model.generateContent([systemInstruction, prompt]),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Gemini API Timeout')), 60000)),
    ]);

    const reply =
      result?.response?.candidates?.[0]?.content?.parts?.[0]?.text || 'No reply generated';

    await memory.chatHistory.addMessage(new AIMessage(reply));

    const responseData = {
      prompt,
      language,
      model: DEFAULT_MODEL,
      reply,
      createdAt: new Date(),
    };

    let session = await Llama.findOne({ user: userId, sessionId });

    if (!session) {
      session = await Llama.create({ user: userId, sessionId, responses: [responseData] });
      await UserModel.findByIdAndUpdate(userId, { $push: { llamaAiSessions: session._id } });
    } else {
      session.responses.push(responseData);
      await session.save();
    }

    // Record token usage
    const usage = result?.response?.usageMetadata;
    if (usage) {
      creditTrackingService.record(sessionId, usage);
    } else {
      creditTrackingService.recordFromText(sessionId, prompt, reply);
    }

    return { sessionId, reply, language, isCoding: coding };
  } catch (err) {
    logger.error('Gemini Service Error:', err);
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, err.message || 'Gemini Service failed');
  }
};

// ---------- stateless content generation (circuit-breaker wrapped) ----------

const _generateContent = async (prompt) => {
  try {
    const result = await model.generateContent(prompt);
    const text = result?.response?.candidates?.[0]?.content?.parts?.[0]?.text || 'No reply generated';
    // Record usage (stateless calls use a shared session key)
    const usage = result?.response?.usageMetadata;
    if (usage) {
      creditTrackingService.record('_system', usage);
    } else {
      creditTrackingService.recordFromText('_system', typeof prompt === 'string' ? prompt : JSON.stringify(prompt), text);
    }
    return text;
  } catch (error) {
    logger.error('Gemini generateContent error:', error);
    throw error;
  }
};

const breaker = createCircuitBreaker(_generateContent, 'GeminiAPI');

const generateContent = async (prompt) => {
  if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'GeminiService: prompt must be a non-empty string.');
  }
  return breaker.fire(prompt);
};


// ---------- model factory ----------

const getModel = (modelName = DEFAULT_MODEL) =>
  client.getGenerativeModel({ model: modelName });


// ---------- multimodal (image + text) ----------

/**
 * Generate content from an image + optional text prompt.
 * @param {string} base64Image - Base64-encoded image (no data: prefix)
 * @param {string} mimeType - e.g. 'image/png', 'image/jpeg', 'image/webp'
 * @param {string} [textPrompt='Describe this image in detail.']
 * @param {string} [sessionId='_multimodal']
 * @returns {Promise<string>}
 */
const generateContentWithImage = async (base64Image, mimeType, textPrompt = 'Describe this image in detail.', sessionId = '_multimodal') => {
  try {
    const visionModel = client.getGenerativeModel({ model: 'gemini-1.5-pro' });
    const result = await visionModel.generateContent([
      { inlineData: { data: base64Image, mimeType } },
      textPrompt,
    ]);
    const text = result?.response?.candidates?.[0]?.content?.parts?.[0]?.text || 'No reply generated';
    const usage = result?.response?.usageMetadata;
    if (usage) {
      creditTrackingService.record(sessionId, usage);
    } else {
      creditTrackingService.recordFromText(sessionId, textPrompt, text);
    }
    return text;
  } catch (error) {
    logger.error('Gemini generateContentWithImage error:', error);
    throw error;
  }
};

// ---------- embeddings ----------

const getEmbeddings = async (text) => {
  try {
    const embeddingModel = client.getGenerativeModel({ model: 'text-embedding-004' });
    const result = await embeddingModel.embedContent(text);
    return result.embedding.values;
  } catch (error) {
    // DO NOT fall back to random vectors — they would silently corrupt every
    // vector similarity search that consumes this embedding.  Re-throw so the
    // caller can handle the failure explicitly (e.g. skip indexing, return a
    // graceful error to the user, or use the EmbeddingCache hit if available).
    logger.error('Gemini getEmbeddings error — re-throwing to preserve embedding integrity:', error);
    throw error;
  }
};

export const GeminiAiService = {
  geminiService,
  generateContent,
  generateContentWithImage,
  getModel,
  getEmbeddings,
};

