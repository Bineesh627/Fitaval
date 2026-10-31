import { describe, it, expect } from 'vitest';
import { API_BASE, validateEnv, enforceEnv, USE_MOCK, IS_PROD } from './env';

describe('Environment Configuration & Production Guard', () => {
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

  it('enforceEnv should return validation status without throwing in valid non-prod environments', () => {
    if (!IS_PROD) {
      const result = enforceEnv();
      expect(result).toHaveProperty('valid');
    }
  });

  it('mock mode should be disabled in production', () => {
    if (IS_PROD) {
      expect(USE_MOCK).toBe(false);
    }
  });
});
