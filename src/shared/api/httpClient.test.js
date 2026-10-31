import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { httpClient, ApiError, onApiError } from './httpClient';
import { tokenManager } from '../auth/tokenManager';

describe('httpClient', () => {
  beforeEach(() => {
    tokenManager.clearSession();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('automatically attaches Bearer token when present', async () => {
    tokenManager.setAccessToken('my-secret-access-token');

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ success: true }),
    });
    vi.stubGlobal('fetch', fetchMock);

    const res = await httpClient('/crm/members');
    expect(res).toEqual({ success: true });

    expect(fetchMock).toHaveBeenCalled();
    const callHeaders = fetchMock.mock.calls[0][1].headers;
    expect(callHeaders.get('Authorization')).toBe('Bearer my-secret-access-token');
  });

  it('skips token attachment when skipAuth is true', async () => {
    tokenManager.setAccessToken('my-secret-access-token');

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ success: true }),
    });
    vi.stubGlobal('fetch', fetchMock);

    await httpClient('/auth/login', { skipAuth: true });
    const callHeaders = fetchMock.mock.calls[0][1].headers;
    expect(callHeaders.get('Authorization')).toBeNull();
  });

  it('normalizes HTTP error responses into ApiError instances', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({ detail: 'Invalid parameters provided' }),
    });
    vi.stubGlobal('fetch', fetchMock);

    await expect(httpClient('/crm/plans')).rejects.toThrow('Invalid parameters provided');
  });

  it('returns null on 204 No Content', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 204,
    });
    vi.stubGlobal('fetch', fetchMock);

    const res = await httpClient.delete('/crm/members/123');
    expect(res).toBeNull();
  });

  it('attempts token refresh on 401 and replays the original request', async () => {
    tokenManager.setAccessToken('expired-token');
    tokenManager.setRefreshToken('valid-refresh-token');

    let callCount = 0;
    const fetchMock = vi.fn().mockImplementation((url) => {
      callCount++;
      if (url.includes('/auth/token/refresh/')) {
        return Promise.resolve({
          ok: true,
          status: 200,
          json: async () => ({ access: 'new-fresh-token' }),
        });
      }

      if (callCount === 1) {
        // First call to the endpoint fails with 401
        return Promise.resolve({
          ok: false,
          status: 401,
          json: async () => ({ detail: 'Token expired' }),
        });
      }

      // Replayed call succeeds
      return Promise.resolve({
        ok: true,
        status: 200,
        json: async () => ({ members: [] }),
      });
    });

    vi.stubGlobal('fetch', fetchMock);

    const res = await httpClient('/crm/members');
    expect(res).toEqual({ members: [] });
    expect(tokenManager.getAccessToken()).toBe('new-fresh-token');
  });

  it('broadcasts errors to onApiError subscribers', async () => {
    const errorListener = vi.fn();
    const unsubscribe = onApiError(errorListener);

    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => ({ detail: 'Internal Server Error' }),
    });
    vi.stubGlobal('fetch', fetchMock);

    await expect(httpClient('/crm/error-endpoint')).rejects.toThrow('Internal Server Error');
    expect(errorListener).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 500,
        message: 'Internal Server Error',
      })
    );

    unsubscribe();
  });
});

