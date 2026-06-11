import { config } from 'dotenv';
import path from 'path';

config({ path: path.join(process.cwd(), '.env') });

const configObject = {
  env: process.env.NODE_ENV,
  database_local: process.env.DATABASE_LOCAL,
  port: process.env.PORT,
  client_url: process.env.CLIENT_URL,
  jwt: {
    access_token: process.env.JWT_ACCESS_TOKEN,
    access_expires_in: process.env.JWT_ACCESS_EXPIRES_IN,
    refresh_token: process.env.JWT_REFRESH_REFRESH_TOKEN,
    refresh_expires_in: process.env.JWT_REFRESH_EXPIRES_IN,
  },
  email: process.env.email,
  password: process.env.password,
  client_id: process.env.CLIENT_ID,
  client_secret: process.env.CLIENT_SECRET,
  sender_mail: process.env.SENDER_MAIL,
  refresh_token: process.env.REFRESH_TOKEN,
  access_token: process.env.ACCESS_TOKEN,
  confirm_reg_email: process.env.CONFIRM_REG_EMAIL,
  cloud_storage_secret_key: process.env.CLOUD_STORAGE_SECRET_KEY,
  cloud_storage_access_key: process.env.CLOUD_STORAGE_ACCESS_KEY,
  cloud_storage_bucket: process.env.CLOUD_STORAGE_BUCKET,
  redis: {
    url: process.env.REDIS_URL,
    expires_in: process.env.REDIS_TOKEN_EXPIRES_IN,
  },
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackUrl: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5000/api/v1/auth/google/callback',
    searchApiKey: process.env.GOOGLE_SEARCH_API_KEY,
    searchCx: process.env.GOOGLE_SEARCH_CX,
  },
  github: {
    clientId: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackUrl: process.env.GITHUB_CALLBACK_URL || 'http://localhost:5000/api/v1/auth/github/callback',
    webhook_secret: process.env.GITHUB_WEBHOOK_SECRET,
  },

  mailgun: {
    mailgun_domain: process.env.MAILGUN_DOMAIN,
    mailgun_key: process.env.MAILGUN_KEY,
    mailgun_from: process.env.MAILGUN_FROM,
  },
  groq_api_key: process.env.GROQ_API_KEY,
  tavily_api_key: process.env.TAVILY_API_KEY,
  serper_api_key: process.env.SERPER_API_KEY,
  together_secret_key: process.env.TOGETHER_API_KEY,
  gemini_secret_key: process.env.GEMINI_API_KEY,
  deepseek_secret_key: process.env.DEEPSEEK_API_KEY,
  openai_secret_key: process.env.OPENAI_API_KEY,
  cyberdesk_api_key: process.env.CYBERDESK_API_KEY,
  stripe: {
    stripe_secret_key: process.env.STRIPE_SECRET_KEY,
    stripe_webhook_secret_key: process.env.STRIPE_WEBHOOK_SECRET,
  },
  gcp: {
    project_id: process.env.GCP_PROJECT || 'alti-code-studio',
    location: process.env.GCP_LOCATION || 'us-central1',
    model_name: process.env.GEMINI_MODEL || 'gemini-experimental', // Hard Law: Always use the latest auto-updating Vertex model
    kms_key_ring: process.env.GCP_KMS_KEY_RING || 'audit-key-ring',
    kms_crypto_key: process.env.GCP_KMS_CRYPTO_KEY || 'audit-signer',
    audit_gcs_bucket: process.env.GCP_AUDIT_BUCKET || 'alti-code-studio-worm-audit',
    pubsub_audit_topic: process.env.GCP_PUBSUB_AUDIT_TOPIC || 'audit-alerts',
    dlp_inspect_template: process.env.GCP_DLP_INSPECT_TEMPLATE || null,
  },
  social_login_secret: process.env.SOCIAL_LOGIN_SECRET,
  browser_use_url: process.env.BROWSER_USE_URL || 'http://localhost:3018',
  agent_s_python_path: process.env.AGENT_S_PYTHON_PATH || path.join(process.cwd(), '.venv-agent-s/bin/python'),
  private_cloud_mode: process.env.PRIVATE_CLOUD_MODE === 'true',
  smtp: {
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: process.env.SMTP_SECURE,
    user: process.env.SMTP_USER || process.env.email,
    pass: process.env.SMTP_PASS || process.env.password,
  },
  apple: {
    bundleId: process.env.APPLE_BUNDLE_ID || 'com.insocode.alti',
    keyId: process.env.APPLE_KEY_ID || '',
    issuerId: process.env.APPLE_ISSUER_ID || '',
    encodedKey: process.env.APPLE_ENCODED_KEY || '',
    environment: process.env.APPLE_ENVIRONMENT || 'sandbox',
  },
  pkl: {
    configPath: process.env.PKL_CONFIG_PATH || path.join(process.cwd(), 'config.pkl'),
  },
};

export const loadEnterpriseSecrets = async () => {
  if (process.env.NODE_ENV === 'test') {
    return; // Prevent network dependencies during unit tests
  }
  try {
    const { SecretManagerServiceClient } = await import('@google-cloud/secret-manager');
    const client = new SecretManagerServiceClient();
    const project = configObject.gcp.project_id;

    const secretsMap = {
      'DATABASE_LOCAL': (val) => { configObject.database_local = val; },
      'REDIS_URL': (val) => { configObject.redis.url = val; },
      'JWT_ACCESS_TOKEN': (val) => { configObject.jwt.access_token = val; },
      'GOOGLE_CLIENT_SECRET': (val) => { configObject.google.clientSecret = val; },
      'GITHUB_CLIENT_SECRET': (val) => { configObject.github.clientSecret = val; },
      'GEMINI_API_KEY': (val) => { configObject.gemini_secret_key = val; }
    };

    for (const [secretName, updater] of Object.entries(secretsMap)) {
      try {
        const name = `projects/${project}/secrets/${secretName}/versions/latest`;
        const [version] = await client.accessSecretVersion({ name });
        const payload = version.payload.data.toString().trim();
        if (payload) {
          updater(payload);
          process.env[secretName] = payload;
        }
      } catch (err) {
        // Fallback: silently ignore and keep the local environment value
      }
    }
  } catch (err) {
    // Secret Manager Client could not be created or credentials absent - bypass and use env fallback
  }
};

export default configObject;

