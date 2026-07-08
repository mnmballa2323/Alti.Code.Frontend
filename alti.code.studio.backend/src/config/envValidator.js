import { logger } from '../shared/logger.js';

/**
 * Environment Variable Schema & Validation
 *
 * Derived from: alti.code.studio.backend/config/index.js
 * Validates all required environment variables at startup.
 * Fails fast with clear error messages for missing/invalid values.
 *
 * @module envValidator
 */

const REQUIRED = 'required';
const OPTIONAL = 'optional';

/**
 * Schema entries derived from every `process.env.*` reference in config/index.js.
 * Each entry captures: key, requirement level, type, default, and description.
 */
const envSchema = [
  // ── Core Application ──────────────────────────────────────────────────
  { key: 'NODE_ENV', level: OPTIONAL, type: 'enum', values: ['development', 'production', 'test', 'staging'], default: 'development', description: 'Runtime environment' },
  { key: 'PORT', level: OPTIONAL, type: 'number', default: 4000, description: 'HTTP listen port' },

  // ── Database ──────────────────────────────────────────────────────────
  { key: 'DATABASE_LOCAL', level: REQUIRED, type: 'string', description: 'Local PostgreSQL connection URL (used by configObject.database_local)' },
  { key: 'DATABASE_URL', level: REQUIRED, type: 'string', description: 'PostgreSQL connection URL (set by Secret Manager or .env)' },

  // ── Authentication / JWT ──────────────────────────────────────────────
  { key: 'JWT_ACCESS_TOKEN', level: REQUIRED, type: 'string', description: 'JWT access-token signing secret' },
  { key: 'JWT_ACCESS_EXPIRES_IN', level: OPTIONAL, type: 'string', default: '15m', description: 'JWT access-token expiry' },
  { key: 'JWT_REFRESH_REFRESH_TOKEN', level: OPTIONAL, type: 'string', description: 'JWT refresh-token signing secret' },
  { key: 'JWT_REFRESH_EXPIRES_IN', level: OPTIONAL, type: 'string', default: '7d', description: 'JWT refresh-token expiry' },
  { key: 'SOCIAL_LOGIN_SECRET', level: OPTIONAL, type: 'string', description: 'Secret for social login token signing' },

  // ── Email / SMTP ──────────────────────────────────────────────────────
  { key: 'email', level: OPTIONAL, type: 'string', description: 'Legacy email credential (also used as SMTP_USER fallback)' },
  { key: 'password', level: OPTIONAL, type: 'string', description: 'Legacy password credential (also used as SMTP_PASS fallback)' },
  { key: 'SENDER_MAIL', level: OPTIONAL, type: 'string', description: 'Outbound sender email address' },
  { key: 'CONFIRM_REG_EMAIL', level: OPTIONAL, type: 'string', description: 'Registration confirmation email address' },
  { key: 'SMTP_HOST', level: OPTIONAL, type: 'string', description: 'SMTP server host' },
  { key: 'SMTP_PORT', level: OPTIONAL, type: 'number', description: 'SMTP server port' },
  { key: 'SMTP_SECURE', level: OPTIONAL, type: 'boolean', description: 'Use TLS for SMTP' },
  { key: 'SMTP_USER', level: OPTIONAL, type: 'string', description: 'SMTP username (falls back to email)' },
  { key: 'SMTP_PASS', level: OPTIONAL, type: 'string', description: 'SMTP password (falls back to password)' },

  // ── OAuth Providers ───────────────────────────────────────────────────
  { key: 'CLIENT_ID', level: OPTIONAL, type: 'string', description: 'Generic OAuth client ID' },
  { key: 'CLIENT_SECRET', level: OPTIONAL, type: 'string', description: 'Generic OAuth client secret' },
  { key: 'CLIENT_URL', level: OPTIONAL, type: 'string', description: 'Frontend client URL' },
  { key: 'REFRESH_TOKEN', level: OPTIONAL, type: 'string', description: 'OAuth refresh token' },
  { key: 'ACCESS_TOKEN', level: OPTIONAL, type: 'string', description: 'OAuth access token' },

  // ── Google OAuth ──────────────────────────────────────────────────────
  { key: 'GOOGLE_CLIENT_ID', level: OPTIONAL, type: 'string', description: 'Google OAuth client ID' },
  { key: 'GOOGLE_CLIENT_SECRET', level: OPTIONAL, type: 'string', description: 'Google OAuth client secret' },
  { key: 'GOOGLE_CALLBACK_URL', level: OPTIONAL, type: 'string', default: 'http://localhost:5000/api/v1/auth/google/callback', description: 'Google OAuth callback URL' },
  { key: 'GOOGLE_SEARCH_API_KEY', level: OPTIONAL, type: 'string', description: 'Google Custom Search API key' },
  { key: 'GOOGLE_SEARCH_CX', level: OPTIONAL, type: 'string', description: 'Google Custom Search engine ID' },

  // ── GitHub ────────────────────────────────────────────────────────────
  { key: 'GITHUB_CLIENT_ID', level: OPTIONAL, type: 'string', description: 'GitHub OAuth client ID' },
  { key: 'GITHUB_CLIENT_SECRET', level: OPTIONAL, type: 'string', description: 'GitHub OAuth client secret' },
  { key: 'GITHUB_CALLBACK_URL', level: OPTIONAL, type: 'string', default: 'http://localhost:5000/api/v1/auth/github/callback', description: 'GitHub OAuth callback URL' },
  { key: 'GITHUB_WEBHOOK_SECRET', level: OPTIONAL, type: 'string', description: 'GitHub webhook signing secret' },
  { key: 'GITHUB_TOKEN', level: OPTIONAL, type: 'string', description: 'GitHub personal access token' },
  { key: 'GITHUB_PERSONAL_ACCESS_TOKEN', level: OPTIONAL, type: 'string', description: 'GitHub PAT (fallback for GITHUB_TOKEN)' },

  // ── GitLab ────────────────────────────────────────────────────────────
  { key: 'GITLAB_TOKEN', level: OPTIONAL, type: 'string', description: 'GitLab personal access token' },
  { key: 'GITLAB_PERSONAL_ACCESS_TOKEN', level: OPTIONAL, type: 'string', description: 'GitLab PAT (fallback for GITLAB_TOKEN)' },
  { key: 'GITLAB_URL', level: OPTIONAL, type: 'string', default: 'https://gitlab.com/api/v4', description: 'GitLab API base URL' },

  // ── Cloud Storage ─────────────────────────────────────────────────────
  { key: 'CLOUD_STORAGE_SECRET_KEY', level: OPTIONAL, type: 'string', description: 'Cloud storage secret key' },
  { key: 'CLOUD_STORAGE_ACCESS_KEY', level: OPTIONAL, type: 'string', description: 'Cloud storage access key' },
  { key: 'CLOUD_STORAGE_BUCKET', level: OPTIONAL, type: 'string', description: 'Cloud storage bucket name' },

  // ── Redis / Memorystore ───────────────────────────────────────────────
  { key: 'REDIS_URL', level: OPTIONAL, type: 'string', default: 'redis://localhost:6379', description: 'Redis connection URL' },
  { key: 'REDIS_TOKEN_EXPIRES_IN', level: OPTIONAL, type: 'string', description: 'Redis token TTL' },

  // ── GCP Core ──────────────────────────────────────────────────────────
  { key: 'GCP_PROJECT_ID', level: REQUIRED, type: 'string', description: 'Google Cloud project ID (also used for Secret Manager)' },
  { key: 'GCP_TENANT_ID', level: OPTIONAL, type: 'string', description: 'GCP tenant ID' },
  { key: 'GCP_CLIENT_ID', level: OPTIONAL, type: 'string', description: 'GCP client ID' },
  { key: 'GCP_MODEL_NAME', level: OPTIONAL, type: 'string', default: 'gemini-3.5-pro', description: 'Default GCP model name' },
  { key: 'GCP_REGION', level: OPTIONAL, type: 'string', default: 'us-central1', description: 'GCP region for Vertex AI' },
  { key: 'GOOGLE_APPLICATION_CREDENTIALS', level: OPTIONAL, type: 'string', description: 'Path to service account key (not needed on GCE/Cloud Run)' },
  { key: 'CUSTOMER_ID', level: OPTIONAL, type: 'string', default: 'enterprise-tenant', description: 'Customer ID for Secret Manager key naming' },
  { key: 'PRIVATE_CLOUD_MODE', level: OPTIONAL, type: 'boolean', default: false, description: 'Enable private cloud / air-gapped mode' },

  // ── Vertex AI ─────────────────────────────────────────────────────────
  { key: 'VERTEX_EMBEDDING_MODEL', level: OPTIONAL, type: 'string', default: 'text-embedding-005', description: 'Vertex AI embedding model' },
  { key: 'VERTEX_EMBEDDING_DIMENSION', level: OPTIONAL, type: 'number', default: 768, description: 'Vertex AI embedding dimension' },
  { key: 'VERTEX_VECTOR_SEARCH_ENDPOINT', level: OPTIONAL, type: 'string', default: '', description: 'Vertex AI Vector Search endpoint' },
  { key: 'VERTEX_VECTOR_SEARCH_INDEX_ID', level: OPTIONAL, type: 'string', default: '', description: 'Vertex AI Vector Search index ID' },
  { key: 'VERTEX_CONTEXT_CACHE_TTL', level: OPTIONAL, type: 'number', default: 3600, description: 'Vertex AI context cache TTL in seconds' },
  { key: 'VERTEX_ENABLE_GROUNDING', level: OPTIONAL, type: 'boolean', default: false, description: 'Enable Vertex AI grounding' },
  { key: 'VERTEX_ENABLE_STREAMING', level: OPTIONAL, type: 'boolean', default: true, description: 'Enable Vertex AI streaming (default true)' },
  { key: 'VERTEX_MAX_OUTPUT_TOKENS', level: OPTIONAL, type: 'number', default: 8192, description: 'Vertex AI max output tokens' },

  // ── Mailgun ───────────────────────────────────────────────────────────
  { key: 'MAILGUN_DOMAIN', level: OPTIONAL, type: 'string', description: 'Mailgun domain' },
  { key: 'MAILGUN_KEY', level: OPTIONAL, type: 'string', description: 'Mailgun API key' },
  { key: 'MAILGUN_FROM', level: OPTIONAL, type: 'string', description: 'Mailgun sender address' },

  // ── External API Keys ─────────────────────────────────────────────────
  { key: 'TAVILY_API_KEY', level: OPTIONAL, type: 'string', description: 'Tavily search API key' },
  { key: 'SERPER_API_KEY', level: OPTIONAL, type: 'string', description: 'Serper search API key' },
  { key: 'CYBERDESK_API_KEY', level: OPTIONAL, type: 'string', description: 'CyberDesk API key' },

  // ── Stripe ────────────────────────────────────────────────────────────
  { key: 'STRIPE_SECRET_KEY', level: OPTIONAL, type: 'string', description: 'Stripe secret key' },
  { key: 'STRIPE_WEBHOOK_SECRET', level: OPTIONAL, type: 'string', description: 'Stripe webhook signing secret' },

  // ── Browser Use / Agent S ─────────────────────────────────────────────
  { key: 'BROWSER_USE_URL', level: OPTIONAL, type: 'string', default: 'http://localhost:3018', description: 'Browser Use service URL' },
  { key: 'AGENT_S_PYTHON_PATH', level: OPTIONAL, type: 'string', description: 'Path to Agent-S Python interpreter' },

  // ── Apple IAP ─────────────────────────────────────────────────────────
  { key: 'APPLE_BUNDLE_ID', level: OPTIONAL, type: 'string', default: 'com.insocode.alti', description: 'Apple app bundle ID' },
  { key: 'APPLE_KEY_ID', level: OPTIONAL, type: 'string', default: '', description: 'Apple API key ID' },
  { key: 'APPLE_ISSUER_ID', level: OPTIONAL, type: 'string', default: '', description: 'Apple API issuer ID' },
  { key: 'APPLE_ENCODED_KEY', level: OPTIONAL, type: 'string', default: '', description: 'Apple API encoded key' },
  { key: 'APPLE_ENVIRONMENT', level: OPTIONAL, type: 'enum', values: ['sandbox', 'production'], default: 'sandbox', description: 'Apple IAP environment' },

  // ── PKL Config ────────────────────────────────────────────────────────
  { key: 'PKL_CONFIG_PATH', level: OPTIONAL, type: 'string', description: 'Path to PKL configuration file' },

  // ── Stirling PDF ──────────────────────────────────────────────────────
  { key: 'STIRLING_PDF_URL', level: OPTIONAL, type: 'string', default: 'http://localhost:8082', description: 'Stirling PDF service URL' },

  // ── Observability ─────────────────────────────────────────────────────
  { key: 'LOKI_URL', level: OPTIONAL, type: 'string', description: 'Grafana Loki push URL (activates Loki transport)' },
];

/**
 * Parse a raw string env value into the correct JS type.
 *
 * @param {string|undefined} value - Raw value from process.env
 * @param {string} type - Target type: 'string' | 'number' | 'boolean' | 'enum'
 * @returns {*} Parsed value or undefined
 */
function parseEnvValue(value, type) {
  if (value === undefined || value === null) return undefined;
  switch (type) {
    case 'number': {
      const parsed = Number(value);
      return isNaN(parsed) ? value : parsed; // keep raw for error reporting
    }
    case 'boolean':
      return value === 'true' || value === '1';
    case 'enum':
      return value;
    default:
      return String(value);
  }
}

/**
 * Validate all environment variables against the schema.
 * Logs a clear error banner and exits (unless NODE_ENV=test) when required vars are missing.
 *
 * @returns {{ [key: string]: * }} Map of validated env var key → parsed value
 */
export function validateEnvironment() {
  const errors = [];
  const warnings = [];
  const validated = {};

  for (const entry of envSchema) {
    const raw = process.env[entry.key];
    const value = parseEnvValue(raw, entry.type);

    // ── Check required ──────────────────────────────────────────────
    if (entry.level === REQUIRED && (raw === undefined || raw === '')) {
      errors.push(
        `❌ Missing required env var: ${entry.key}${entry.description ? ` — ${entry.description}` : ''}`,
      );
      continue;
    }

    // ── Apply defaults when env var is absent ───────────────────────
    if (raw === undefined && entry.default !== undefined) {
      validated[entry.key] = entry.default;
      continue;
    }

    // ── Validate enum values ────────────────────────────────────────
    if (entry.type === 'enum' && entry.values && raw && !entry.values.includes(raw)) {
      errors.push(
        `❌ Invalid value for ${entry.key}: "${raw}". Must be one of: ${entry.values.join(', ')}`,
      );
      continue;
    }

    // ── Validate number values ──────────────────────────────────────
    if (entry.type === 'number' && raw !== undefined && isNaN(Number(raw))) {
      errors.push(`❌ Invalid number for ${entry.key}: "${raw}"`);
      continue;
    }

    // ── Warn about known-sensitive keys that are optional but empty ─
    if (
      entry.level === OPTIONAL &&
      raw === '' &&
      entry.key.match(/SECRET|TOKEN|KEY|PASSWORD/i)
    ) {
      warnings.push(
        `⚠️  ${entry.key} is set but empty — this may cause auth failures`,
      );
    }

    validated[entry.key] = value ?? entry.default;
  }

  // ── Report ──────────────────────────────────────────────────────────
  if (errors.length > 0) {
    logger.error(
      '╔══════════════════════════════════════════════════════════════╗',
    );
    logger.error(
      '║  ENVIRONMENT VALIDATION FAILED — SERVER CANNOT START        ║',
    );
    logger.error(
      '╚══════════════════════════════════════════════════════════════╝',
    );
    for (const err of errors) logger.error(err);
    logger.error('');
    logger.error(
      'Fix the above errors in your .env file or environment config.',
    );
    if (process.env.NODE_ENV !== 'test') {
      process.exit(1);
    }
  }

  if (warnings.length > 0) {
    for (const w of warnings) logger.warn(w);
  }

  logger.info(
    `✅ Environment validated: ${envSchema.length} vars checked, ${errors.length} errors, ${warnings.length} warnings`,
  );
  return validated;
}

/**
 * Read-only access to the schema for introspection / docs.
 * @returns {ReadonlyArray<object>}
 */
export function getEnvSchema() {
  return Object.freeze([...envSchema]);
}
