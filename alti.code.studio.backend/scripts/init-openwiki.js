import { execa } from 'execa';
import { logger } from '../src/shared/logger.js';

async function run() {
  console.log('🚀 Initializing OpenWiki pointing to local Express proxy...');

  const env = {
    ...process.env,
    OPENWIKI_PROVIDER: 'openai',
    OPENWIKI_MODEL_ID: 'gemini-3.5-flash',
    OPENAI_API_KEY: 'mock-openwiki-key',
    OPENAI_BASE_URL: 'http://localhost:5001/api/v1/openwiki-proxy'
  };

  try {
    await execa('npx', [
      'openwiki',
      '--init'
    ], {
      env,
      stdio: 'inherit'
    });
    console.log('✅ OpenWiki initialized successfully!');
  } catch (error) {
    console.error('❌ Failed to initialize OpenWiki:', error.message);
    process.exit(1);
  }
}

run();
