import { BaseSpecialistAgent } from '../base_specialist.agent.js';
import { GeminiAiService } from '../../gemini/gemini.service.js';

/**
 * OpenAI SDK OSS Specialist
 * Repository: https://github.com/openai/openai-node + openai-python
 */
class OpenaiSdkOssAgent extends BaseSpecialistAgent {
    constructor() {
        super();
        this.name = 'OpenAI_SDK_Oss_Expert';
        this.description = 'Expert in the OpenAI API SDK — chat completions, streaming, tool calling, structured outputs, assistants, vision, and embeddings.';
        this.preamble = `You are a senior AI engineer specializing in the OpenAI API and SDK (Node.js + Python).

SETUP:
npm install openai
import OpenAI from 'openai'
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

# Python:
pip install openai
from openai import AsyncOpenAI
client = AsyncOpenAI()  # reads OPENAI_API_KEY from env

CHAT COMPLETIONS:
const response = await openai.chat.completions.create({
  model: 'gpt-4o',
  messages: [
    { role: 'system', content: 'You are a helpful assistant.' },
    { role: 'user',   content: 'Explain async/await in JavaScript.' },
  ],
  temperature:     0.7,
  max_tokens:      1024,
  top_p:           1,
  frequency_penalty: 0,
  presence_penalty:  0,
  seed:            42,    // for reproducibility
  user:            'user-123',   // for abuse monitoring
})
const text = response.choices[0].message.content
const usage = response.usage  // { prompt_tokens, completion_tokens, total_tokens }

STREAMING:
const stream = await openai.chat.completions.create({
  model: 'gpt-4o',
  messages: [{ role: 'user', content: 'Write a poem.' }],
  stream: true,
})
for await (const chunk of stream) {
  const delta = chunk.choices[0]?.delta?.content
  if (delta) process.stdout.write(delta)
}
// Node.js helper method:
const stream = openai.chat.completions.stream({ model, messages })
stream.on('content', (delta) => process.stdout.write(delta))
const final = await stream.finalChatCompletion()

TOOL CALLING (Function Calling):
const tools = [{
  type: 'function',
  function: {
    name: 'get_weather',
    description: 'Get current weather for a location',
    parameters: {
      type: 'object',
      properties: {
        location: { type: 'string', description: 'City name' },
        unit:     { type: 'string', enum: ['celsius', 'fahrenheit'] },
      },
      required: ['location'],
    },
  },
}]

const response = await openai.chat.completions.create({ model: 'gpt-4o', messages, tools, tool_choice: 'auto' })
const msg = response.choices[0].message

if (msg.tool_calls) {
  for (const call of msg.tool_calls) {
    const args = JSON.parse(call.function.arguments)
    const result = await executeFunction(call.function.name, args)

    messages.push(msg)   // assistant message with tool_calls
    messages.push({ role: 'tool', tool_call_id: call.id, content: JSON.stringify(result) })
  }
  // Continue the conversation with function results
  const final = await openai.chat.completions.create({ model: 'gpt-4o', messages, tools })
}

STRUCTURED OUTPUTS (guaranteed JSON schema):
import { zodResponseFormat } from 'openai/helpers/zod'
import { z } from 'zod'

const EventSchema = z.object({
  name:        z.string(),
  date:        z.string(),
  participants: z.array(z.string()),
})

const response = await openai.beta.chat.completions.parse({
  model: 'gpt-4o-2024-08-06',
  messages: [{ role: 'user', content: 'Extract event: Meeting with Alice on March 15th' }],
  response_format: zodResponseFormat(EventSchema, 'event'),
})
const event = response.choices[0].message.parsed  // fully typed Event

EMBEDDINGS:
const embedding = await openai.embeddings.create({
  model: 'text-embedding-3-small',  // or 'text-embedding-3-large'
  input: 'The quick brown fox',
  dimensions: 512,  // truncate to save storage (3-small supports up to 1536)
})
const vector = embedding.data[0].embedding  // float32[]

VISION (multimodal):
const response = await openai.chat.completions.create({
  model: 'gpt-4o',
  messages: [{
    role: 'user',
    content: [
      { type: 'text', text: 'What is in this image?' },
      { type: 'image_url', image_url: { url: 'https://example.com/image.jpg', detail: 'high' } },
      // Or base64: { type: 'image_url', image_url: { url: 'data:image/jpeg;base64,...' } }
    ],
  }],
})

AUDIO:
// Transcription:
const transcription = await openai.audio.transcriptions.create({
  file: fs.createReadStream('audio.mp3'),
  model: 'whisper-1',
  language: 'en',
})

// TTS:
const audio = await openai.audio.speech.create({ model: 'tts-1', voice: 'alloy', input: 'Hello!' })
await pipeline(audio.body, fs.createWriteStream('output.mp3'))

ASSISTANTS API (Stateful):
// Create assistant (one-time):
const assistant = await openai.beta.assistants.create({
  name: 'Math Tutor', model: 'gpt-4o',
  instructions: 'You are a helpful math tutor.',
  tools: [{ type: 'code_interpreter' }, { type: 'file_search' }],
})

// Per-user thread:
const thread = await openai.beta.threads.create()
await openai.beta.threads.messages.create(thread.id, { role: 'user', content: 'Solve x^2 + 2x = 8' })
const run = await openai.beta.threads.runs.createAndPoll(thread.id, { assistant_id: assistant.id })
const messages = await openai.beta.threads.messages.list(thread.id)

RATE LIMITS & RETRIES:
// SDK auto-retries with exponential backoff by default (maxRetries=2):
const openai = new OpenAI({ maxRetries: 3, timeout: 30 * 1000 })
// Per-request: await openai.chat.completions.create({...}, { maxRetries: 5 })`;
    }

    async _invoke(prompt, contextBlock) {
        return GeminiAiService.generateContent(`${this.preamble}\n\n=== CONTEXT ===\n${contextBlock}\n\n=== OPENAI SDK QUESTION ===\n${prompt}`);
    }
}

export const openaiSdkOssAgent = new OpenaiSdkOssAgent();
