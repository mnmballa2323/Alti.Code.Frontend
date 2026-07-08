import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { validateEnvironment, getEnvSchema } from './envValidator.js';

// Silence logger output during tests
vi.mock('../shared/logger.js', () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

describe('Environment Validator', () => {
  const originalEnv = { ...process.env };

  /**
   * Set the minimum required env vars for a clean pass.
   */
  function setRequiredVars() {
    process.env.NODE_ENV = 'test';
    process.env.DATABASE_LOCAL = 'postgresql://test:test@localhost:5432/test';
    process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';
    process.env.JWT_ACCESS_TOKEN = 'test-secret-key-at-least-32-chars!';
    process.env.GCP_PROJECT_ID = 'test-project-id';
  }

  beforeEach(() => {
    // Start each test with a clean slate + required vars
    process.env = { ...originalEnv };
    setRequiredVars();
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  // ── Happy Path ──────────────────────────────────────────────────────

  it('should pass with all required vars set', () => {
    const result = validateEnvironment();
    expect(result).toBeDefined();
    expect(typeof result).toBe('object');
  });

  it('should return a validated config object with keys', () => {
    const result = validateEnvironment();
    // Required vars should be present
    expect(result.DATABASE_LOCAL).toBe(process.env.DATABASE_LOCAL);
    expect(result.DATABASE_URL).toBe(process.env.DATABASE_URL);
    expect(result.JWT_ACCESS_TOKEN).toBe(process.env.JWT_ACCESS_TOKEN);
    expect(result.GCP_PROJECT_ID).toBe(process.env.GCP_PROJECT_ID);
  });

  // ── Defaults ────────────────────────────────────────────────────────

  it('should apply defaults for optional vars', () => {
    delete process.env.GCP_REGION;
    delete process.env.REDIS_URL;
    delete process.env.PORT;
    const result = validateEnvironment();
    expect(result.GCP_REGION).toBe('us-central1');
    expect(result.REDIS_URL).toBe('redis://localhost:6379');
    expect(result.PORT).toBe(4000);
  });

  it('should apply boolean defaults correctly', () => {
    delete process.env.PRIVATE_CLOUD_MODE;
    delete process.env.VERTEX_ENABLE_GROUNDING;
    const result = validateEnvironment();
    expect(result.PRIVATE_CLOUD_MODE).toBe(false);
    expect(result.VERTEX_ENABLE_GROUNDING).toBe(false);
  });

  it('should apply enum defaults correctly', () => {
    delete process.env.APPLE_ENVIRONMENT;
    const result = validateEnvironment();
    expect(result.APPLE_ENVIRONMENT).toBe('sandbox');
  });

  // ── Required Var Validation ─────────────────────────────────────────

  it('should report missing DATABASE_URL without crashing in test mode', () => {
    delete process.env.DATABASE_URL;
    // In test mode, should not process.exit but still return a result
    const result = validateEnvironment();
    expect(result).toBeDefined();
    // DATABASE_URL should NOT be in validated since it's missing and required
    expect(result.DATABASE_URL).toBeUndefined();
  });

  it('should report missing DATABASE_LOCAL without crashing in test mode', () => {
    delete process.env.DATABASE_LOCAL;
    const result = validateEnvironment();
    expect(result).toBeDefined();
    expect(result.DATABASE_LOCAL).toBeUndefined();
  });

  it('should report missing JWT_ACCESS_TOKEN without crashing in test mode', () => {
    delete process.env.JWT_ACCESS_TOKEN;
    const result = validateEnvironment();
    expect(result).toBeDefined();
    expect(result.JWT_ACCESS_TOKEN).toBeUndefined();
  });

  it('should report missing GCP_PROJECT_ID without crashing in test mode', () => {
    delete process.env.GCP_PROJECT_ID;
    const result = validateEnvironment();
    expect(result).toBeDefined();
    expect(result.GCP_PROJECT_ID).toBeUndefined();
  });

  it('should report all missing required vars at once', async () => {
    delete process.env.DATABASE_LOCAL;
    delete process.env.DATABASE_URL;
    delete process.env.JWT_ACCESS_TOKEN;
    delete process.env.GCP_PROJECT_ID;
    const { logger } = await import('../shared/logger.js');
    logger.error.mockClear();
    validateEnvironment();
    // Should have logged 4 error lines (one per missing var) plus the banner
    const errorCalls = logger.error.mock.calls.map(c => c[0]);
    const missingErrors = errorCalls.filter(msg => typeof msg === 'string' && msg.startsWith('❌ Missing'));
    expect(missingErrors.length).toBe(4);
  });

  // ── Enum Validation ─────────────────────────────────────────────────

  it('should reject invalid NODE_ENV values', () => {
    process.env.NODE_ENV = 'invalid-env';
    const result = validateEnvironment();
    expect(result).toBeDefined();
    // Invalid enum value should not be in validated output
    expect(result.NODE_ENV).toBeUndefined();
  });

  it('should accept valid NODE_ENV values', () => {
    process.env.NODE_ENV = 'production';
    const result = validateEnvironment();
    expect(result.NODE_ENV).toBe('production');
  });

  it('should reject invalid APPLE_ENVIRONMENT values', () => {
    process.env.APPLE_ENVIRONMENT = 'beta';
    const result = validateEnvironment();
    expect(result.APPLE_ENVIRONMENT).toBeUndefined();
  });

  // ── Number Validation ───────────────────────────────────────────────

  it('should parse valid PORT numbers', () => {
    process.env.PORT = '8080';
    const result = validateEnvironment();
    expect(result.PORT).toBe(8080);
  });

  it('should reject non-numeric PORT values', () => {
    process.env.PORT = 'not-a-number';
    const result = validateEnvironment();
    expect(result.PORT).toBeUndefined();
  });

  it('should parse VERTEX_MAX_OUTPUT_TOKENS correctly', () => {
    process.env.VERTEX_MAX_OUTPUT_TOKENS = '16384';
    const result = validateEnvironment();
    expect(result.VERTEX_MAX_OUTPUT_TOKENS).toBe(16384);
  });

  // ── Boolean Validation ──────────────────────────────────────────────

  it('should parse boolean true values', () => {
    process.env.PRIVATE_CLOUD_MODE = 'true';
    const result = validateEnvironment();
    expect(result.PRIVATE_CLOUD_MODE).toBe(true);
  });

  it('should parse "1" as boolean true', () => {
    process.env.VERTEX_ENABLE_GROUNDING = '1';
    const result = validateEnvironment();
    expect(result.VERTEX_ENABLE_GROUNDING).toBe(true);
  });

  it('should parse "false" as boolean false', () => {
    process.env.VERTEX_ENABLE_STREAMING = 'false';
    const result = validateEnvironment();
    expect(result.VERTEX_ENABLE_STREAMING).toBe(false);
  });

  // ── Schema Introspection ────────────────────────────────────────────

  it('should expose the schema via getEnvSchema()', () => {
    const schema = getEnvSchema();
    expect(Array.isArray(schema)).toBe(true);
    expect(schema.length).toBeGreaterThan(0);
  });

  it('should return a frozen schema array', () => {
    const schema = getEnvSchema();
    expect(() => schema.push({ key: 'FAKE' })).toThrow();
  });

  it('schema should contain all required vars', () => {
    const schema = getEnvSchema();
    const requiredKeys = schema
      .filter(e => e.level === 'required')
      .map(e => e.key);
    expect(requiredKeys).toContain('DATABASE_LOCAL');
    expect(requiredKeys).toContain('DATABASE_URL');
    expect(requiredKeys).toContain('JWT_ACCESS_TOKEN');
    expect(requiredKeys).toContain('GCP_PROJECT_ID');
  });
});
