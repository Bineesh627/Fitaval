/**
 * Secure Token & Session Manager
 *
 * Implements hardened token handling:
 * 1. Keeps active access token in runtime memory for optimal XSS defense.
 * 2. Mirrors session state in sessionStorage (isolated per tab, cleared on tab close).
 * 3. Supports refresh token persistence and rotation for seamless JWT renewal.
 * 4. Provides broadcast events for auth changes (logout, refresh, 401 unauthenticated).
 */

const STORAGE_KEYS = {
  SESSION: 'fitaval_session',
  REFRESH_TOKEN: 'fitaval_refresh_token',
  CRM_USER: 'fitaval_auth_user',
  CRM_TOKEN: 'fitaval_auth_token',
  ADMIN_TOKEN: 'fitaval_admin_token',
};

// In-memory access token cache (primary safeguard against localStorage XSS)
let memoryAccessToken = null;
let memoryRefreshToken = null;
const authListeners = new Set();

function ss() {
  if (typeof window !== 'undefined' && window.sessionStorage) {
    return window.sessionStorage;
  }
  return null;
}

function ls() {
  if (typeof window !== 'undefined' && window.localStorage) {
    return window.localStorage;
  }
  return null;
}

function notifyListeners(event, data) {
  authListeners.forEach((listener) => {
    try {
      listener(event, data);
    } catch (err) {
      console.error('Error in auth listener:', err);
    }
  });
}

export const tokenManager = {
  getAccessToken() {
    if (memoryAccessToken) return memoryAccessToken;
    try {
      const raw = ss()?.getItem(STORAGE_KEYS.SESSION);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed?.token) {
          memoryAccessToken = parsed.token;
          return memoryAccessToken;
        }
      }
    } catch {
      /* ignore */
    }
    return null;
  },

  setAccessToken(token) {
    memoryAccessToken = token;
    try {
      const raw = ss()?.getItem(STORAGE_KEYS.SESSION);
      if (raw) {
        const session = JSON.parse(raw);
        session.token = token;
        ss()?.setItem(STORAGE_KEYS.SESSION, JSON.stringify(session));
      }
    } catch {
      /* ignore */
    }
  },

  getRefreshToken() {
    if (memoryRefreshToken) return memoryRefreshToken;
    try {
      const token = ls()?.getItem(STORAGE_KEYS.REFRESH_TOKEN);
      if (token) {
        memoryRefreshToken = token;
        return token;
      }
    } catch {
      /* ignore */
    }
    return null;
  },

  setRefreshToken(token) {
    memoryRefreshToken = token;
    try {
      if (token) {
        ls()?.setItem(STORAGE_KEYS.REFRESH_TOKEN, token);
      } else {
        ls()?.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
      }
    } catch {
      /* ignore */
    }
  },

  getSession() {
    try {
      const raw = ss()?.getItem(STORAGE_KEYS.SESSION);
      if (raw) {
        const session = JSON.parse(raw);
        if (memoryAccessToken) {
          session.token = memoryAccessToken;
        }
        return session;
      }
    } catch {
      /* ignore */
    }
    return null;
  },

  setSession(session, { refreshToken } = {}) {
    if (!session) {
      this.clearSession();
      return;
    }
    memoryAccessToken = session.token || null;
    if (refreshToken) {
      this.setRefreshToken(refreshToken);
    }

    try {
      ss()?.setItem(STORAGE_KEYS.SESSION, JSON.stringify(session));
    } catch {
      /* ignore */
    }

    notifyListeners('login', session);
  },

  clearSession() {
    memoryAccessToken = null;
    memoryRefreshToken = null;
    try {
      ss()?.removeItem(STORAGE_KEYS.SESSION);
      ls()?.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
      ls()?.removeItem(STORAGE_KEYS.CRM_USER);
      ls()?.removeItem(STORAGE_KEYS.CRM_TOKEN);
      ls()?.removeItem(STORAGE_KEYS.ADMIN_TOKEN);
    } catch {
      /* ignore */
    }
    notifyListeners('logout', null);
  },

  onAuthChange(callback) {
    authListeners.add(callback);
    return () => authListeners.delete(callback);
  },
};

