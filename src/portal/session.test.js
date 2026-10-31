import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { login, logout, getSession, startSession } from './session';
import { tokenManager } from '../shared/auth/tokenManager';
import { httpClient, ApiError } from '../shared/api/httpClient';

describe('Portal Session & Auth Flow', () => {
  beforeEach(() => {
    tokenManager.clearSession();
    window.sessionStorage.clear();
    window.localStorage.clear();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('rejects empty credentials', async () => {
    const res = await login('', '');
    expect(res.ok).toBe(false);
    expect(res.error).toBe('Enter your email and password.');
  });

  it('authenticates admin user via API response', async () => {
    vi.spyOn(httpClient, 'post').mockResolvedValueOnce({
      access_token: 'admin-jwt-token-xyz',
      refresh_token: 'refresh-jwt-xyz',
      user: {
        id: 'adm_1',
        name: 'Super Admin',
        email: 'admin@fitaval.com',
        role: 'admin',
      },
    });

    const res = await login('admin@fitaval.com', 'admin123');
    expect(res.ok).toBe(true);
    expect(res.role).toBe('admin');

    const session = getSession();
    expect(session.role).toBe('admin');
    expect(session.email).toBe('admin@fitaval.com');
    expect(tokenManager.getAccessToken()).toBe('admin-jwt-token-xyz');
    expect(tokenManager.getRefreshToken()).toBe('refresh-jwt-xyz');
  });

  it('authenticates gym owner via API response', async () => {
    vi.spyOn(httpClient, 'post').mockResolvedValueOnce({
      access_token: 'crm-jwt-token-abc',
      user: {
        id: 'usr_gym_1',
        name: 'Gym Owner',
        email: 'owner@fitaval.com',
        role: 'crm',
      },
    });

    const res = await login('owner@fitaval.com', 'owner123');
    expect(res.ok).toBe(true);
    expect(res.role).toBe('crm');

    const session = getSession();
    expect(session.role).toBe('crm');
    expect(session.email).toBe('owner@fitaval.com');
    expect(tokenManager.getAccessToken()).toBe('crm-jwt-token-abc');
  });

  it('handles 401 invalid credentials correctly', async () => {
    vi.spyOn(httpClient, 'post').mockRejectedValueOnce(
      new ApiError('Invalid email or password.', 401)
    );

    const res = await login('admin@fitaval.com', 'wrongpassword');
    expect(res.ok).toBe(false);
    expect(res.error).toMatch(/Invalid email or password/i);
    expect(getSession()).toBeNull();
  });

  it('clears session on logout', async () => {
    startSession({ role: 'admin', email: 'admin@fitaval.com', token: 'tok-123' });
    expect(getSession()).not.toBeNull();

    vi.spyOn(httpClient, 'post').mockResolvedValueOnce({});
    await logout();

    expect(getSession()).toBeNull();
    expect(tokenManager.getAccessToken()).toBeNull();
  });
});
