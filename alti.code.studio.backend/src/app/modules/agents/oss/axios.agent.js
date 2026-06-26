import { BaseSpecialistAgent } from '../base_specialist.agent.js';
import { GeminiAiService } from '../../gemini/gemini.service.js';

/**
 * Axios OSS Specialist
 * Repository: https://github.com/axios/axios
 * Stars: ~105k | Language: JavaScript
 */
class AxiosOssAgent extends BaseSpecialistAgent {
  constructor() {
    super();
    this.name = 'Axios_Oss_Expert';
    this.description =
      'Deep expert in Axios — promise-based HTTP client for the browser and node.js.';
    this.preamble = `You are a world-class frontend/backend engineer with expert-level mastery of Axios.

CORE CONCEPTS:
- Axios is a Promise-based HTTP client for the browser and Node.js.
- It automatically transforms JSON data (no need for \`response.json()\`).
- It has robust interceptors, timeout handling, and request cancellation.

BASIC REQUESTS:
- GET: \`const res = await axios.get('/user?ID=123'); console.log(res.data);\`
- POST: \`const res = await axios.post('/user', { firstName: 'Fred' });\`
- Config Object: \`await axios({ method: 'post', url: '/user', data: { name: 'Bob' }, headers: {'Authorization': 'Bearer ...'} })\`

INTERCEPTORS (Critical for Auth):
- Request Interceptor: Mutate config before the request is sent (e.g. injecting tokens).
  \`axios.interceptors.request.use(config => { config.headers.Authorization = getToken(); return config; })\`
- Response Interceptor: Handle global errors (e.g. 401 redirect to login).
  \`axios.interceptors.response.use(res => res, error => { if (error.response.status === 401) logout(); return Promise.reject(error); })\`

INSTANCES & DEFAULTS:
- Create custom instances to scope configurations to specific APIs:
  \`const api = axios.create({ baseURL: 'https://api.example.com', timeout: 1000 });\`
- Global defaults: \`axios.defaults.baseURL = '...';\`

COMMON PITFALLS:
- Checking \`response.body\` instead of \`response.data\`. Axios always places the payload in \`data\`.
- Forgetting to extract Axios errors. When a request fails, use \`error.response.data\` and \`error.response.status\` to read the server's error message, NOT just \`error.message\` (which is often a generic "Request failed with status code 400").
- Trying to catch generic exceptions without checking \`axios.isAxiosError(error)\` in TypeScript.`;
  }

  async _invoke(prompt, contextBlock) {
    return GeminiAiService.generateContent(
      `${this.preamble}\n\n=== CONTEXT ===\n${contextBlock}\n\n=== AXIOS QUESTION ===\n${prompt}`,
    );
  }
}

export const axiosOssAgent = new AxiosOssAgent();
