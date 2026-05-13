/**
 * Copyright (c) 2024 Alti.Code.Studio
 * 
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

// import { GoogleGenerativeAI } from '@google/generative-ai';
// import { InMemoryChatMessageHistory } from '@langchain/core/chat_history';
// import { AIMessage, HumanMessage } from '@langchain/core/messages';
// import httpStatus from 'http-status';
// import { BufferMemory } from 'langchain/memory';
//   let memory = sessionMemoryStore[sessionId];
//   if (!memory) {
//     memory = new BufferMemory({
//       returnMessages: true,
//       memoryKey: 'history',
//       chatHistory: new InMemoryChatMessageHistory(),
//     });
//     sessionMemoryStore[sessionId] = memory;
//   }

//   try {
//     await memory.chatHistory.addMessage(new HumanMessage(prompt));

//     // Call Gemini AI to generate a response
//     const result = await model.generateContent(prompt);
//     const reply =
//       result?.response?.candidates?.[0]?.content?.parts?.[0]?.text ||
//       'No reply generated';

//     try {
//       const paymentResult =
//         await paymentController.incrementPromptsUsed(userId);

//       if (!paymentResult.success) {
//         throw new ApiError(httpStatus.BAD_REQUEST, paymentResult.message);
//       }
//     } catch (error) {
//       logger.error('Error in incrementPromptsUsed:', error);
//       throw new ApiError(
//         httpStatus.INTERNAL_SERVER_ERROR,
//         error.message || 'An error occurred while updating prompt usage.',
//       );
//     }

//     await memory.chatHistory.addMessage(new AIMessage(reply));

//     const responseData = {
//       prompt,
//       model: 'gemini-1.5-flash',
//       reply,
//       total_time: result?.usage?.total_time || 0,
//     };

//     let geminiSession = await Llama.findOne({ user: userId, sessionId });

//     if (geminiSession) {
//       geminiSession.responses.push(responseData);
//       await geminiSession.save();
//     } else {
//       geminiSession = await Llama.create({
//         user: userId,
//         sessionId,
//         responses: [responseData],
//       });
//       await UserModel.findByIdAndUpdate(userId, {
//         $push: { llamaAiSessions: geminiSession._id },
//       });
//     }

//     const payload = { prompt, sessionId, reply };
//     // if (payload) {
//     //   await RedisClient.publish(
//     //     GEMINI_RESPONSE_SERVICE_POST,
//     //     JSON.stringify(payload),
//     //   );
//     // }
//     return payload;
//   } catch (err) {
//     logger.error('Gemini Service Error:', err);
//     throw new ApiError(
//       httpStatus.INTERNAL_SERVER_ERROR,
//       'Gemini Service failed',
//     );
//   }
// };

// export const GeminiAiService = {
//   geminiService,
// };

import { GoogleGenerativeAI } from '@google/generative-ai';
import { InMemoryChatMessageHistory } from '@langchain/core/chat_history';
import {
  AIMessage,
  HumanMessage,
  SystemMessage,
} from '@langchain/core/messages';
import httpStatus from 'http-status';
import { BufferMemory } from 'langchain/memory';

import config from '../../../../config/index.js';
import ApiError from '../../../errors/ApiError.js';
import { logger } from '../../../shared/logger.js';
import UserModel from '../auth/auth.model.js';
import Llama from '../dyad/dyad.model.js';
import { observabilityService } from '../monitoring/observability.service.js';
// import { paymentController } from '../payment/payment.controller.js';

const client = new GoogleGenerativeAI(config.gemini_secret_key);
const model = client.getGenerativeModel({ model: config.gcp.model_name || 'gemini-1.5-pro' });

const sessionMemoryStore = {};

// ---------- helpers ----------

const isCodingPrompt = (prompt = '') =>
  /code|api|function|class|program|script|backend|frontend|algorithm|sql|database/i.test(
    prompt,
  );

const buildSystemInstruction = ({ language, isCoding }) => {
  if (!isCoding) {
    return 'You are a helpful AI assistant.';
  }

  return `
You are a senior software engineer.

Rules:
- Respond ONLY with production-quality ${language} code
- Follow idiomatic ${language} best practices
- No explanations unless explicitly requested
- Assume real-world usage
`;
};

// ---------- service ----------

const geminiService = async (sessionId, prompt, userId, language = 'text') => {
  let memory = sessionMemoryStore[sessionId];

  if (!memory) {
    memory = new BufferMemory({
      returnMessages: true,
      memoryKey: 'history',
      chatHistory: new InMemoryChatMessageHistory(),
    });
    sessionMemoryStore[sessionId] = memory;
  }

  try {
    const coding = isCodingPrompt(prompt);
    const systemInstruction = buildSystemInstruction({
      language,
      isCoding: coding,
    });

    await memory.chatHistory.addMessage(new SystemMessage(systemInstruction));
    await memory.chatHistory.addMessage(new HumanMessage(prompt));

    // Race with 60s timeout for chat (longer generation)
    const result = await Promise.race([
      model.generateContent([systemInstruction, prompt]),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Gemini API Timeout')), 60000))
    ]);

    const reply =
      result?.response?.candidates?.[0]?.content?.parts?.[0]?.text ||
      'No reply generated';

    // ---- billing ----
    // const paymentResult = await paymentController.incrementPromptsUsed(userId);

    // if (!paymentResult?.success) {
    //   throw new ApiError(httpStatus.BAD_REQUEST, paymentResult.message);
    // }

    await memory.chatHistory.addMessage(new AIMessage(reply));

    const responseData = {
      prompt,
      language,
      model: config.gcp.model_name || 'gemini-1.5-pro',
      reply,
      createdAt: new Date(),
    };

    let session = await Llama.findOne({ user: userId, sessionId });

    if (!session) {
      session = await Llama.create({
        user: userId,
        sessionId,
        responses: [responseData],
      });

      await UserModel.findByIdAndUpdate(userId, {
        $push: { llamaAiSessions: session._id },
      });
    } else {
      session.responses.push(responseData);
      await session.save();
    }

    return {
      sessionId,
      reply,
      language,
      isCoding: coding,
    };
  } catch (err) {
    logger.error('Gemini Service Error:', err);
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      err.message || 'Gemini Service failed',
    );
  }
};

import { createCircuitBreaker } from '../../../shared/circuitBreaker.js';

// Internal function to call Gemini
const _generateContent = async (prompt) => {
  try {
    const result = await model.generateContent(prompt);
    const reply = result?.response?.candidates?.[0]?.content?.parts?.[0]?.text || 'No reply generated';
    return reply;
  } catch (error) {
    logger.error('Gemini generateContent error:', error);
    throw error;
  }
};

// Wrap with Circuit Breaker
const breaker = createCircuitBreaker(_generateContent, 'GeminiAPI');

const generateContent = async (prompt) => {
  return breaker.fire(prompt);
};

const getModel = (modelName = 'gemini-1.5-pro') => {
  return client.getGenerativeModel({ model: modelName });
};

const getEmbeddings = async (text) => {
  try {
    const embeddingModel = client.getGenerativeModel({ model: 'text-embedding-004' });
    const result = await embeddingModel.embedContent(text);
    return result.embedding.values;
  } catch (error) {
    logger.error('Gemini getEmbeddings error:', error);
    // Fallback?
    return new Array(768).fill(0).map(() => Math.random());
  }
};

export const GeminiAiService = {
  geminiService,
  generateContent,
  getModel,
  getEmbeddings,
};
