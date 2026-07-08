import { config } from 'dotenv';
import path from 'path';
import { SecretManagerServiceClient } from '@google-cloud/secret-manager';

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
    callbackUrl:
      process.env.GOOGLE_CALLBACK_URL ||
      'http://localhost:5000/api/v1/auth/google/callback',
    searchApiKey: process.env.GOOGLE_SEARCH_API_KEY,
    searchCx: process.env.GOOGLE_SEARCH_CX,
  },
  github: {
    clientId: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackUrl:
      process.env.GITHUB_CALLBACK_URL ||
      'http://localhost:5000/api/v1/auth/github/callback',
    webhook_secret: process.env.GITHUB_WEBHOOK_SECRET,
  },
  github_token:
    process.env.GITHUB_TOKEN || process.env.GITHUB_PERSONAL_ACCESS_TOKEN,
  gitlab_token:
    process.env.GITLAB_TOKEN || process.env.GITLAB_PERSONAL_ACCESS_TOKEN,
  gitlab_url: process.env.GITLAB_URL || 'https://gitlab.com/api/v4',

  mailgun: {
    mailgun_domain: process.env.MAILGUN_DOMAIN,
    mailgun_key: process.env.MAILGUN_KEY,
    mailgun_from: process.env.MAILGUN_FROM,
  },
  tavily_api_key: process.env.TAVILY_API_KEY,
  serper_api_key: process.env.SERPER_API_KEY,
  // Sovereign inference requires only GCP or local models. Other providers are blocked.
  cyberdesk_api_key: process.env.CYBERDESK_API_KEY,
  stripe: {
    stripe_secret_key: process.env.STRIPE_SECRET_KEY,
    stripe_webhook_secret_key: process.env.STRIPE_WEBHOOK_SECRET,
  },
  social_login_secret: process.env.SOCIAL_LOGIN_SECRET,
  browser_use_url: process.env.BROWSER_USE_URL || 'http://localhost:3018',
  agent_s_python_path:
    process.env.AGENT_S_PYTHON_PATH ||
    path.join(process.cwd(), '.venv-agent-s/bin/python'),
  private_cloud_mode: process.env.PRIVATE_CLOUD_MODE === 'true',
  gcp: {
    subscription_id: process.env.GCP_PROJECT_ID,
    tenant_id: process.env.GCP_TENANT_ID,
    client_id: process.env.GCP_CLIENT_ID,
    model_name: process.env.GCP_MODEL_NAME || 'gemini-3.5-pro',
  },
  vertexAi: {
    region: process.env.GCP_REGION || 'us-central1',
    embeddingModel: process.env.VERTEX_EMBEDDING_MODEL || 'text-embedding-005',
    embeddingDimension: parseInt(process.env.VERTEX_EMBEDDING_DIMENSION || '768', 10),
    vectorSearchEndpoint: process.env.VERTEX_VECTOR_SEARCH_ENDPOINT || '',
    vectorSearchIndexId: process.env.VERTEX_VECTOR_SEARCH_INDEX_ID || '',
    contextCacheTtlSeconds: parseInt(process.env.VERTEX_CONTEXT_CACHE_TTL || '3600', 10),
    enableGrounding: process.env.VERTEX_ENABLE_GROUNDING === 'true',
    enableStreaming: process.env.VERTEX_ENABLE_STREAMING !== 'false',
    maxOutputTokens: parseInt(process.env.VERTEX_MAX_OUTPUT_TOKENS || '8192', 10),
  },
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
    configPath:
      process.env.PKL_CONFIG_PATH || path.join(process.cwd(), 'config.pkl'),
  },
  stirlingPdfUrl: process.env.STIRLING_PDF_URL || 'http://localhost:8082',
};

export const loadEnterpriseSecrets = async () => {
  if (process.env.NODE_ENV === 'test') {
    return; // Prevent network dependencies during unit tests
  }

  const secretsMap = {
    DATABASE_LOCAL: val => {
      configObject.database_local = val;
    },
    DATABASE_URL: val => {
      process.env.DATABASE_URL = val;
    },
    REDIS_URL: val => {
      configObject.redis.url = val;
      process.env.REDIS_URL = val;
    },
    JWT_ACCESS_TOKEN: val => {
      configObject.jwt.access_token = val;
      process.env.JWT_ACCESS_TOKEN = val;
    },
    GITHUB_CLIENT_SECRET: val => {
      configObject.github.clientSecret = val;
    },

    STRIPE_SECRET_KEY: val => {
      configObject.stripe.stripe_secret_key = val;
      process.env.STRIPE_SECRET_KEY = val;
    },
    STRIPE_WEBHOOK_SECRET: val => {
      configObject.stripe.stripe_webhook_secret_key = val;
      process.env.STRIPE_WEBHOOK_SECRET = val;
    },
  };

  // Load from Environment first (for local dev or CI)
  for (const [key, updater] of Object.entries(secretsMap)) {
    if (process.env[key]) {
      updater(process.env[key]);
    }
  }

  // Google Secret Manager integration
  const projectId = process.env.GCP_PROJECT_ID;
  if (projectId) {
    console.log(
      `[GCP Secret Manager] Initializing secret loader for project: ${projectId}`,
    );
    try {
      const client = new SecretManagerServiceClient();

      // Fetch each secret dynamically
      for (const [key, updater] of Object.entries(secretsMap)) {
        const secretId = `alti-sec-${process.env.CUSTOMER_ID || 'enterprise-tenant'}-${process.env.NODE_ENV || 'prod'}-${key.toLowerCase().replace(/_/g, '-')}`;
        const name = `projects/${projectId}/secrets/${secretId}/versions/latest`;
        try {
          const [version] = await client.accessSecretVersion({ name });
          const secretValue = version.payload.data.toString().trim();
          if (secretValue) {
            updater(secretValue);
            console.log(`[GCP Secret Manager] Loaded secret: ${key}`);
          }
        } catch (secretErr) {
          // Fallback to existing env value if not found in Secret Manager
          console.warn(
            `⚠️ [GCP Secret Manager] Failed to load ${key} from Secret Manager: ${secretErr.message}. Using environment default.`,
          );
        }
      }
    } catch (err) {
      console.error(
        '❌ [GCP Secret Manager] Failed to initialize SecretManagerServiceClient:',
        err.message,
      );
    }
  }


};

export default configObject;
