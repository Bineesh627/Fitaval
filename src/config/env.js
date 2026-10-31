/**
 * Centralized, hardened environment configuration for Fitaval.
 * Ensures fail-closed defaults, strict production guards, and validated API targets.
 */

const rawMode = import.meta.env.MODE || (import.meta.env.PROD ? 'production' : 'development');
export const IS_PROD = import.meta.env.PROD || rawMode === 'production';
export const IS_TEST = rawMode === 'test' || typeof process !== 'undefined' && process.env?.NODE_ENV === 'test';

// Fail-closed mock policy:
// Mock mode is strictly forbidden in production.
// In development/test, it requires explicit opt-in (VITE_ENABLE_MOCK_API === 'true').
export const USE_MOCK = !IS_PROD && import.meta.env.VITE_ENABLE_MOCK_API === 'true';

// Base API URL configuration
const DEFAULT_DEV_API = 'http://127.0.0.1:8000/api/v1';
const rawApiBase = import.meta.env.VITE_API_BASE_URL;

export const API_BASE = (function resolveApiBase() {
  if (rawApiBase && typeof rawApiBase === 'string') {
    return rawApiBase.trim().replace(/\/+$/, '');
  }
  return DEFAULT_DEV_API;
})();

export const IMAGE_BASE_URL = (import.meta.env.VITE_IMAGE_BASE_URL || '').replace(/\/+$/, '');
export const STRIPE_PUBLIC_KEY = import.meta.env.VITE_STRIPE_PUBLIC_KEY || '';

/**
 * Validates the runtime configuration.
 * Returns an object with validation results and logs critical issues.
 */
export function validateEnv() {
  const errors = [];
  const warnings = [];

  if (IS_PROD) {
    if (!rawApiBase) {
      errors.push('VITE_API_BASE_URL is not set in production. App will not function correctly.');
    } else if (rawApiBase.includes('127.0.0.1') || rawApiBase.includes('localhost')) {
      errors.push(`VITE_API_BASE_URL (${rawApiBase}) points to localhost in a production build.`);
    }

    if (import.meta.env.VITE_ENABLE_MOCK_API === 'true') {
      warnings.push('VITE_ENABLE_MOCK_API was set to true in production, but mock mode has been forcibly disabled for security.');
    }
  }

  if (errors.length > 0) {
    console.error('[Fitaval Config Error] Configuration validation failed:', errors);
  }
  if (warnings.length > 0) {
    console.warn('[Fitaval Config Warning]:', warnings);
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    isProd: IS_PROD,
    useMock: USE_MOCK,
    apiBase: API_BASE,
  };
}

// Auto-run validation check once on load
if (typeof window !== 'undefined') {
  validateEnv();
}

