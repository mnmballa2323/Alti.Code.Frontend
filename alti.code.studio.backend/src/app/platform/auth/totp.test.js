import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { generateSecret, getTotpCode, verifyTotp, getOtpauthUri } from './totp.js';

describe('TOTP Auth Engine (RFC 6238)', () => {
  it('should generate a 32-character base32 secret key', () => {
    const secret = generateSecret();
    expect(secret).toBeDefined();
    expect(secret.length).toBe(32);
    // Base32 check
    expect(/^[A-Z2-7]+$/.test(secret)).toBe(true);
  });

  it('should generate a correct 6-digit TOTP code and verify it', () => {
    const secret = generateSecret();
    const currentTimeStep = Math.floor(Date.now() / 1000 / 30);
    const code = getTotpCode(secret, currentTimeStep);
    
    expect(code.length).toBe(6);
    expect(/^\d{6}$/.test(code)).toBe(true);

    const isValid = verifyTotp(secret, code);
    expect(isValid).toBe(true);
  });

  it('should verify codes within clock drift window step', () => {
    const secret = generateSecret();
    const currentTimeStep = Math.floor(Date.now() / 1000 / 30);
    
    // Generate code for 1 step back (-30 seconds)
    const prevCode = getTotpCode(secret, currentTimeStep - 1);
    expect(verifyTotp(secret, prevCode, 1)).toBe(true);

    // Generate code for 1 step forward (+30 seconds)
    const nextCode = getTotpCode(secret, currentTimeStep + 1);
    expect(verifyTotp(secret, nextCode, 1)).toBe(true);

    // Fail if drift exceeds window (e.g. 2 steps back)
    const farCode = getTotpCode(secret, currentTimeStep - 2);
    expect(verifyTotp(secret, farCode, 1)).toBe(false);
  });

  it('should reject invalid or malformed tokens', () => {
    const secret = generateSecret();
    expect(verifyTotp(secret, '12345')).toBe(false); // short
    expect(verifyTotp(secret, '1234567')).toBe(false); // long
    expect(verifyTotp(secret, 'abcdef')).toBe(false); // letters
  });

  it('should produce standard URI for authenticator applications', () => {
    const secret = 'JBSWY3DPEHPK3PXP';
    const email = 'user@example.com';
    const uri = getOtpauthUri(secret, email, 'Inso Code');
    expect(uri).toBe('otpauth://totp/Inso%20Code:user%40example.com?secret=JBSWY3DPEHPK3PXP&issuer=Inso%20Code');
  });
});
