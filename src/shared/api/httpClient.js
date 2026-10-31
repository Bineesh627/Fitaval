/**
 * Centralized Hardened HTTP Client for Fitaval
 *
 * Features:
 * - Automatic Bearer token attachment via tokenManager
 * - Request timeout support (default: 15s)
 * - Automatic 401 Token Refresh rotation & request replay
 * - Concurrency queue for in-flight token refresh
 * - Standardized ApiError normalization
 * - Global error event broadcaster (for toast/notification systems)
 */

import { API_BASE } from '../../config/env';
import { tokenManager } from '../auth/tokenManager';

export class ApiError extends Error {
  constructor(message, status, data = null, code = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
    this.code = code || (data && (data.code || data.error_code)) || `HTTP_${status}`;
  }
}

// Global error listeners (e.g. for UI toasts)
const errorListeners = new Set();
export function onApiError(listener) {
  errorListeners.add(listener);
  return () => errorListeners.delete(listener);
}

function broadcastApiError(error) {
  errorListeners.forEach((listener) => {
    try {
      listener(error);
    } catch (err) {
      console.error('Error in ApiError listener:', err);
    }
  });
}

// Refresh queue variables
let isRefreshing = false;
let refreshSubscribers = [];

function subscribeTokenRefresh(cb) {
  refreshSubscribers.push(cb);
}

function onRefreshed(newToken) {
  refreshSubscribers.forEach((cb) => cb(newToken));
  refreshSubscribers = [];
}

function onRefreshFailed(error) {
  refreshSubscribers.forEach((cb) => cb(null, error));
  refreshSubscribers = [];
}

/**
 * Attempts to refresh the JWT access token using the stored refresh token.
 */
async function refreshAccessToken() {
  const refreshToken = tokenManager.getRefreshToken();
  if (!refreshToken) {
    throw new ApiError('No refresh token available', 401);
  }

  const cleanBase = API_BASE.replace(/\/+$/, '');
  const response = await fetch(`${cleanBase}/auth/token/refresh/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh: refreshToken }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new ApiError(
      errorData.detail || 'Session expired. Please sign in again.',
      response.status,
      errorData
    );
  }

  const data = await response.json();
  const newAccessToken = data.access || data.access_token || data.token;
  if (!newAccessToken) {
    throw new ApiError('Invalid refresh token response shape', 500, data);
  }

  tokenManager.setAccessToken(newAccessToken);
  if (data.refresh || data.refresh_token) {
    tokenManager.setRefreshToken(data.refresh || data.refresh_token);
  }

  return newAccessToken;
}

/**
 * Execute HTTP request with interceptors, timeouts, and 401 token refresh retry.
 */
export async function httpClient(endpoint, options = {}) {
  const {
    timeout = 15000,
    skipAuth = false,
    retryOn401 = true,
    ...fetchOptions
  } = options;

  const cleanBase = API_BASE.replace(/\/+$/, '');
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${cleanBase}${cleanEndpoint}`;

  // Build headers
  const headers = new Headers(fetchOptions.headers || {});
  if (!headers.has('Content-Type') && !(fetchOptions.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  if (!skipAuth) {
    const token = tokenManager.getAccessToken();
    if (token && !headers.has('Authorization')) {
      headers.set('Authorization', `Bearer ${token}`);
    }
  }

  // Setup abort controller for timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    controller.abort(new Error(`Request timeout after ${timeout}ms`));
  }, timeout);

  // Combine external signal if provided
  if (fetchOptions.signal) {
    fetchOptions.signal.addEventListener('abort', () => controller.abort());
  }

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      headers,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    // Handle 204 No Content
    if (response.status === 204) {
      return null;
    }

    // Handle 401 Unauthorized with token refresh & retry
    if (response.status === 401 && retryOn401 && !skipAuth) {
      if (isRefreshing) {
        // Wait for active refresh to finish
        return new Promise((resolve, reject) => {
          subscribeTokenRefresh((newToken, err) => {
            if (err) return reject(err);
            // Retry request with new token
            resolve(
              httpClient(endpoint, {
                ...options,
                retryOn401: false, // Don't infinite loop
                headers: {
                  ...options.headers,
                  Authorization: `Bearer ${newToken}`,
                },
              })
            );
          });
        });
      }

      isRefreshing = true;

      try {
        const newToken = await refreshAccessToken();
        isRefreshing = false;
        onRefreshed(newToken);

        return httpClient(endpoint, {
          ...options,
          retryOn401: false,
          headers: {
            ...options.headers,
            Authorization: `Bearer ${newToken}`,
          },
        });
      } catch (refreshErr) {
        isRefreshing = false;
        onRefreshFailed(refreshErr);
        tokenManager.clearSession();
        broadcastApiError(refreshErr);

        if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
          window.location.assign('/login?session_expired=1');
        }
        throw refreshErr;
      }
    }

    // Parse JSON or extract message on failure
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const message =
        errorData.detail ||
        errorData.message ||
        errorData.error ||
        (typeof errorData === 'string' ? errorData : `Request failed with status ${response.status}`);

      const error = new ApiError(message, response.status, errorData);
      broadcastApiError(error);
      throw error;
    }

    return await response.json();
  } catch (err) {
    clearTimeout(timeoutId);

    if (err.name === 'AbortError') {
      const timeoutError = new ApiError(`Request timeout to ${cleanEndpoint}`, 408);
      broadcastApiError(timeoutError);
      throw timeoutError;
    }

    if (err instanceof ApiError) {
      throw err;
    }

    const networkError = new ApiError(
      err.message || 'Unable to connect to server. Check your network connection.',
      0
    );
    broadcastApiError(networkError);
    throw networkError;
  }
}

// Helper methods
httpClient.get = (endpoint, options = {}) => httpClient(endpoint, { ...options, method: 'GET' });
httpClient.post = (endpoint, body, options = {}) =>
  httpClient(endpoint, {
    ...options,
    method: 'POST',
    body: body instanceof FormData ? body : JSON.stringify(body),
  });
httpClient.put = (endpoint, body, options = {}) =>
  httpClient(endpoint, {
    ...options,
    method: 'PUT',
    body: body instanceof FormData ? body : JSON.stringify(body),
  });
httpClient.patch = (endpoint, body, options = {}) =>
  httpClient(endpoint, {
    ...options,
    method: 'PATCH',
    body: body instanceof FormData ? body : JSON.stringify(body),
  });
httpClient.delete = (endpoint, options = {}) =>
  httpClient(endpoint, { ...options, method: 'DELETE' });

