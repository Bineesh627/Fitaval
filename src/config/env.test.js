import { describe, it, expect, vi } from 'vitest';
import { API_BASE, validateEnv, USE_MOCK } from './env';

describe('Environment Configuration', () => {
  it('should normalize API_BASE without trailing slashes', () => {
    expect(API_BASE).not.toMatch(/\/+$/);
  });

  it('should validate environment settings', () => {
    const result = validateEnv();
    expect(result).toHaveProperty('valid');
    expect(result).toHaveProperty('isProd');
    expect(result).toHaveProperty('useMock');
    expect(result).toHaveProperty('apiBase');
  });

  it('USE_MOCK should be a boolean', () => {
    expect(typeof USE_MOCK).toBe('boolean');
  });
});

