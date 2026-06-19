/**
 * Copyright (c) 2026 Inso Code
 *
 * copilot.route.js — CopilotKit backend synchronization controller.
 * Exposes endpoint for frontend Copilot assistant using GCP Vertex AI.
 */

import express from 'express';
import { CopilotBackend } from '@copilotkit/backend';
import { VertexAI } from '@google-cloud/vertexai';
import config from '../../../../config/index.js';
import { vertexService } from '../ai/vertex.service.js';
import { catchAsync } from '../../../shared/catchAsync.js';

class GcpVertexAIAdapter {
  constructor(options = {}) {
    this.modelName = options.model || config.gcp.model_name || 'gemini-1.5-pro';
  }

  async getResponse(forwardedProps) {
    // 1. If in mock mode (like in tests when Vertex AI is not configured), return a mock stream
    if (vertexService.isMockMode || process.env.NODE_ENV === 'test') {
      return this.getMockResponse(forwardedProps);
    }

    try {
      const vertexAI = new VertexAI({
        project: config.gcp.project_id || 'alti-code-studio',
        location: config.gcp.location || 'us-central1'
      });
      const model = vertexAI.getGenerativeModel({ model: this.modelName });

      const messages = forwardedProps.messages || [];
      const systemMessageObj = messages.find(m => m.role === 'system');
      const systemMessage = systemMessageObj ? systemMessageObj.content : '';
      const otherMessages = messages.filter(m => m.role !== 'system');

      // Transform messages to Vertex contents format
      const contents = otherMessages.map(m => {
        let role = 'user';
        if (m.role === 'assistant') {
          role = 'model';
        }
        
        let parts = [];
        if (m.content) {
          parts.push({ text: m.content });
        }
        
        if (m.function_call) {
          parts.push({
            functionCall: {
              name: m.function_call.name,
              args: typeof m.function_call.arguments === 'string' 
                ? JSON.parse(m.function_call.arguments)
                : m.function_call.arguments
            }
          });
        }
        
        if (m.role === 'function') {
          role = 'function';
          parts.push({
            functionResponse: {
              name: m.name,
              response: { name: m.name, content: m.content }
            }
          });
        }
        
        return { role, parts };
      });

      // Transform tools
      let tools = [];
      if (forwardedProps.tools && forwardedProps.tools.length > 0) {
        const functionDeclarations = forwardedProps.tools.map(t => {
          const parameters = JSON.parse(JSON.stringify(t.function.parameters || { type: 'object', properties: {} }));
          
          // Uppercase parameter types for Gemini compatibility
          const uppercaseTypes = (obj) => {
            if (obj.type && typeof obj.type === 'string') {
              obj.type = obj.type.toUpperCase();
            }
            if (obj.properties) {
              for (const k in obj.properties) {
                uppercaseTypes(obj.properties[k]);
              }
            }
          };
          uppercaseTypes(parameters);

          return {
            name: t.function.name,
            description: t.function.description || '',
            parameters
          };
        });
        tools = [{ functionDeclarations }];
      }

      // Start the stream
      const reqObj = { contents };
      if (tools.length > 0) {
        reqObj.tools = tools;
      }
      if (systemMessage) {
        reqObj.systemInstruction = {
          role: 'system',
          parts: [{ text: systemMessage }]
        };
      }

      const responseStream = await model.generateContentStream(reqObj);

      const stream = new ReadableStream({
        async start(controller) {
          try {
            for await (const chunk of responseStream.stream) {
              const chunkText = chunk.candidates?.[0]?.content?.parts?.[0]?.text || '';
              if (chunkText) {
                const ccChunk = {
                  choices: [{ delta: { role: 'assistant', content: chunkText } }]
                };
                const payload = new TextEncoder().encode("data: " + JSON.stringify(ccChunk) + "\n\n");
                controller.enqueue(payload);
              }
            }

            // Check for function calls
            const response = await responseStream.response;
            const functionCalls = response.candidates?.[0]?.content?.parts?.[0]?.functionCalls;
            if (functionCalls && functionCalls.length > 0) {
              const ccChunk = {
                choices: [
                  {
                    delta: {
                      role: 'assistant',
                      content: '',
                      tool_calls: functionCalls.map((call, ix) => ({
                        index: ix,
                        id: String(ix),
                        function: {
                          name: call.name,
                          arguments: JSON.stringify(call.args)
                        }
                      }))
                    }
                  }
                ]
              };
              const payload = new TextEncoder().encode("data: " + JSON.stringify(ccChunk) + "\n\n");
              controller.enqueue(payload);
            }

            const donePayload = new TextEncoder().encode("data: [DONE]\n\n");
            controller.enqueue(donePayload);
            controller.close();
          } catch (streamErr) {
            controller.error(streamErr);
          }
        }
      });

      return { stream };

    } catch (err) {
      console.error('Error in GcpVertexAIAdapter:', err);
      return this.getMockResponse(forwardedProps);
    }
  }

  getMockResponse(forwardedProps) {
    const messages = forwardedProps.messages || [];
    const lastUserMessage = [...messages].reverse().find(m => m.role === 'user');
    const userPrompt = lastUserMessage ? lastUserMessage.content : 'hello';

    // Mock stream response
    const stream = new ReadableStream({
      start(controller) {
        const replyText = `[MOCK GEMINI COPILOT] I received your request: "${userPrompt.substring(0, 40)}". Copilot integration is live and running under mock mode.`;
        
        const ccChunk = {
          choices: [{ delta: { role: 'assistant', content: replyText } }]
        };
        controller.enqueue(new TextEncoder().encode("data: " + JSON.stringify(ccChunk) + "\n\n"));
        
        controller.enqueue(new TextEncoder().encode("data: [DONE]\n\n"));
        controller.close();
      }
    });

    return { stream };
  }
}

const router = express.Router();
const copilotBackend = new CopilotBackend();
const adapter = new GcpVertexAIAdapter();

router.post('/', catchAsync(async (req, res) => {
  await copilotBackend.streamHttpServerResponse(req, res, adapter);
}));

export const copilotRoutes = router;
