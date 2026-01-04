import { describe, it, expect, vi } from 'vitest';
import { hashString } from '../../ga4-tracking.js';

// byteToHex is now internal to ga4-tracking.js, so we only test hashString

describe('hashString', () => {
  it('should hash a known string to expected SHA-256 hash', async () => {
    const input = 'test@example.com';
    const expected = '973dfe463ec85785f5f95af5ba3906eedb2d931c24e69824a89ea65dba4e813b';
    const result = await hashString(input);
    expect(result).toBe(expected);
  });

  it('should return empty string for empty input', async () => {
    const result = await hashString('');
    expect(result).toBe('');
  });

  it('should return empty string for null input', async () => {
    const result = await hashString(null);
    expect(result).toBe('');
  });

  it('should return empty string for undefined input', async () => {
    const result = await hashString(undefined);
    expect(result).toBe('');
  });

  it('should produce same hash for same input', async () => {
    const input = '山田太郎';
    const hash1 = await hashString(input);
    const hash2 = await hashString(input);
    expect(hash1).toBe(hash2);
    expect(hash1.length).toBe(64); // SHA-256 produces 64 hex characters
  });

  it('should produce different hashes for different inputs', async () => {
    const hash1 = await hashString('田中太郎');
    const hash2 = await hashString('佐藤花子');
    expect(hash1).not.toBe(hash2);
    expect(hash1.length).toBe(64);
    expect(hash2.length).toBe(64);
  });

  it('should hash Japanese characters correctly', async () => {
    const input = 'タナカタロウ';
    const result = await hashString(input);
    expect(result).toMatch(/^[0-9a-f]{64}$/); // Valid hex string
    expect(result.length).toBe(64);
  });

  it('should hash phone numbers correctly', async () => {
    const input = '090-1234-5678';
    const result = await hashString(input);
    expect(result).toMatch(/^[0-9a-f]{64}$/);
    expect(result.length).toBe(64);
  });

  it('should hash whitespace-containing strings', async () => {
    const input = '田中 太郎';
    const result = await hashString(input);
    expect(result).toMatch(/^[0-9a-f]{64}$/);
    expect(result.length).toBe(64);
  });

  it('should produce different hashes for inputs with different whitespace', async () => {
    const hash1 = await hashString('田中太郎');
    const hash2 = await hashString('田中 太郎');
    expect(hash1).not.toBe(hash2);
  });

  it('should hash special characters correctly', async () => {
    const input = 'test+user@example.com';
    const result = await hashString(input);
    expect(result).toMatch(/^[0-9a-f]{64}$/);
    expect(result.length).toBe(64);
  });

  it('should hash long strings correctly', async () => {
    const input = 'a'.repeat(1000);
    const result = await hashString(input);
    expect(result).toMatch(/^[0-9a-f]{64}$/);
    expect(result.length).toBe(64);
  });

  it('should produce hash with leading zeros for certain inputs', async () => {
    // This input is known to produce a hash with leading zeros (tests padStart)
    const input = '\x00\x00\x00\x00'; // Null bytes
    const result = await hashString(input);
    expect(result).toMatch(/^[0-9a-f]{64}$/);
    expect(result.length).toBe(64);
    // Verify it contains valid hex including potential leading zeros
    expect(result).toBeTruthy();
  });

  it('should return empty string when crypto.subtle.digest throws error', async () => {
    // Save original crypto.subtle.digest
    const originalDigest = global.crypto.subtle.digest;
    
    // Mock crypto.subtle.digest to throw an error
    global.crypto.subtle.digest = vi.fn().mockRejectedValue(new Error('Hashing failed'));
    
    const result = await hashString('test');
    
    // Should return empty string on error
    expect(result).toBe('');
    
    // Restore original digest
    global.crypto.subtle.digest = originalDigest;
  });
});
