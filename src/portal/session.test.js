import { describe, it, expect, beforeEach, vi } from 'vitest';
import { login, logout, getSession } from './session';
import { tokenManager } from '../shared/auth/tokenManager';

describe('Portal Session & Auth Flow', () => {
  beforeEach(() => {
    tokenManager.clearSession();
    window.sessionStorage.clear();
    window.localStorage.clear();
    vi.restoreAllMocks();
  });

  it('rejects empty credentials', async () => {
    const res = await login('', '');
    expect(res.ok).toBe(false);
    expect(res.error).toBe('Enter your email and password.');
  });

  it('authenticates mock admin user correctly in test environment', async () => {
    const res = await login('admin@fitaval.com', 'admin123');
    expect(res.ok).toBe(true);
    expect(res.role).toBe('admin');
    const session = getSession();
    expect(session.role).toBe('admin');
  });

  it('authenticates mock gym owner correctly in test environment', async () => {
    const res = await login('owner@fitaval.com', 'owner123');
    expect(res.ok).toBe(true);
    expect(res.role).toBe('crm');
    const session = getSession();
    expect(session.role).toBe('crm');
  });

  it('rejects invalid password', async () => {
    const res = await login('admin@fitaval.com', 'wrongpassword');
    expect(res.ok).toBe(false);
    expect(res.error).toMatch(/Invalid email or password/i);
  });
});

