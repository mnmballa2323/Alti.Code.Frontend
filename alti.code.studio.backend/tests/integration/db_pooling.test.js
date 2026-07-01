import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { getSchemaConnectionUrl } from '../../src/app/platform/db/prismaClient.js';

describe('Database Connection Pooling (PgBouncer) Tests', () => {
  let originalPgBouncerVal = null;

  beforeEach(() => {
    originalPgBouncerVal = process.env.PG_BOUNCER;
  });

  afterEach(() => {
    if (originalPgBouncerVal !== undefined) {
      process.env.PG_BOUNCER = originalPgBouncerVal;
    } else {
      delete process.env.PG_BOUNCER;
    }
  });

  it('should format URL with schema name only when pgbouncer is disabled', () => {
    process.env.PG_BOUNCER = 'false';
    const baseUrl = 'postgresql://user:pass@localhost:5432/mydb?sslmode=require';
    const finalUrl = getSchemaConnectionUrl(baseUrl, 'tenant-123', null);
    
    expect(finalUrl).toContain('schema=tenant_tenant123');
    expect(finalUrl).not.toContain('pgbouncer=true');
  });

  it('should append pgbouncer=true to connection params when PG_BOUNCER env is enabled', () => {
    process.env.PG_BOUNCER = 'true';
    const baseUrl = 'postgresql://user:pass@localhost:5432/mydb?sslmode=require';
    const finalUrl = getSchemaConnectionUrl(baseUrl, 'tenant-123', 'product-abc');

    expect(finalUrl).toContain('schema=tenant_tenant123_product_productabc');
    expect(finalUrl).toContain('pgbouncer=true');
  });

  it('should handle malformed URLs gracefully and still append schema and pgbouncer params', () => {
    process.env.PG_BOUNCER = 'true';
    const baseUrl = 'invalid_url_protocol:user:pass@host:123';
    const finalUrl = getSchemaConnectionUrl(baseUrl, 'tenant-123', null);

    expect(finalUrl).toContain('schema=tenant_tenant123');
    expect(finalUrl).toContain('pgbouncer=true');
  });
});
