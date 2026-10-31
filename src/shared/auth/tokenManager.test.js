import { describe, it, expect, beforeEach, vi } from 'vitest';
import { tokenManager } from './tokenManager';

describe('tokenManager', () => {
  beforeEach(() => {
    tokenManager.clearSession();
    window.sessionStorage.clear();
    window.localStorage.clear();
  });

  it('stores and retrieves access token in memory', () => {
    expect(tokenManager.getAccessToken()).toBeNull();
    tokenManager.setAccessToken('test-token-123');
    expect(tokenManager.getAccessToken()).toBe('test-token-123');
  });

  it('stores and retrieves refresh token', () => {
    expect(tokenManager.getRefreshToken()).toBeNull();
    tokenManager.setRefreshToken('test-refresh-456');
    expect(tokenManager.getRefreshToken()).toBe('test-refresh-456');
  });

  it('manages session state correctly', () => {
    const session = {
      role: 'crm',
      email: 'owner@gym.com',
      name: 'Owner',
      token: 'token-abc',
    };
    tokenManager.setSession(session, { refreshToken: 'refresh-xyz' });

    const current = tokenManager.getSession();
    expect(current).not.toBeNull();
    expect(current.email).toBe('owner@gym.com');
    expect(current.token).toBe('token-abc');
    expect(tokenManager.getRefreshToken()).toBe('refresh-xyz');
  });

  it('clears all session and token data on clearSession()', () => {
    tokenManager.setSession({ role: 'admin', token: 'token-123' }, { refreshToken: 'ref-123' });
    expect(tokenManager.getAccessToken()).toBe('token-123');

    tokenManager.clearSession();
    expect(tokenManager.getAccessToken()).toBeNull();
    expect(tokenManager.getRefreshToken()).toBeNull();
    expect(tokenManager.getSession()).toBeNull();
  });

  it('fires auth change listener on login and logout', () => {
    const listener = vi.fn();
    const unsubscribe = tokenManager.onAuthChange(listener);

    tokenManager.setSession({ role: 'crm', token: 'tok' });
    expect(listener).toHaveBeenCalledWith('login', expect.objectContaining({ role: 'crm' }));

    tokenManager.clearSession();
    expect(listener).toHaveBeenCalledWith('logout', null);

    unsubscribe();
  });
});

