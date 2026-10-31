// One session for the whole program. The role decides which app opens:
//   role "crm"   -> CRM (gym owner)   src/crm
//   role "admin" -> Admin Panel       src/admin  (Super Admin)
//
// The session uses tokenManager (with memory caching + sessionStorage isolation per tab).
// In production, mock login is completely disabled and authentication strictly verifies against the backend API.

import { ACCOUNTS } from './accounts';
import { API_BASE, USE_MOCK, IS_PROD } from '../config/env';
import { tokenManager } from '../shared/auth/tokenManager';
import { httpClient } from '../shared/api/httpClient';

export { API_BASE, USE_MOCK, IS_PROD };

const PENDING_KEY = 'fitaval_pending_signup';
const REGISTERED_ACCOUNTS_KEY = 'fitaval_registered_accounts';

const ss = () => (typeof window !== 'undefined' ? window.sessionStorage : null);
const ls = () => (typeof window !== 'undefined' ? window.localStorage : null);

export function getSession() {
  return tokenManager.getSession();
}

export function startSession(session, meta = {}) {
  tokenManager.setSession(session, meta);
}

/** Signs a gym owner into the CRM (also used after sign-up). */
export function startCrmSession(user, token, meta = {}) {
  const authToken = token || 'token_' + Date.now();
  startSession(
    {
      role: 'crm',
      email: user.email,
      name: user.name,
      token: authToken,
      user,
    },
    meta
  );
}

export function getRegisteredAccounts() {
  if (IS_PROD) return [];
  try {
    const raw = ls()?.getItem(REGISTERED_ACCOUNTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveRegisteredAccount(acc) {
  if (IS_PROD) return;
  try {
    const list = getRegisteredAccounts().filter((a) => a.email.toLowerCase() !== acc.email.toLowerCase());
    list.push(acc);
    ls()?.setItem(REGISTERED_ACCOUNTS_KEY, JSON.stringify(list));
  } catch {
    /* ignore */
  }
}

/**
 * Authenticates user via backend API (when USE_MOCK is false)
 * or via verified mock credentials (when USE_MOCK is true and in dev).
 * Strictly rejects any unauthenticated or unrecognized credentials.
 * Returns Promise<{ ok: true, role } | { ok: false, error }>.
 */
export async function login(email, password) {
  const e = (email || '').trim().toLowerCase();
  if (!e || !password) return { ok: false, error: 'Enter your email and password.' };

  // 1. LIVE BACKEND API MODE
  if (!USE_MOCK) {
    try {
      const data = await httpClient.post(
        '/auth/login/',
        { email: e, password },
        { skipAuth: true, retryOn401: false }
      );

      const token = data.access_token || data.access || data.token || data.key;
      const refreshToken = data.refresh_token || data.refresh;
      const user = data.user || { email: e, name: e.split('@')[0] };
      const rawRole = (user.role || data.role || '').toLowerCase();
      const role = rawRole.includes('admin') ? 'admin' : 'crm';

      if (!token) {
        return { ok: false, error: 'Authentication succeeded but no authorization token was received.' };
      }

      if (role === 'admin') {
        startSession(
          { role: 'admin', email: user.email || e, name: user.name, token, user },
          { refreshToken }
        );
        return { ok: true, role: 'admin' };
      }

      startCrmSession(
        { id: user.id, name: user.name || e.split('@')[0], email: user.email || e, ...user },
        token,
        { refreshToken }
      );
      return { ok: true, role: 'crm' };
    } catch (err) {
      return {
        ok: false,
        error:
          err.status === 401
            ? 'Invalid email or password.'
            : err.message || 'Unable to connect to the authentication server. Please check your backend connection.',
      };
    }
  }

  // 2. MOCK / DEMO MODE (Explicitly disabled in production)
  if (IS_PROD) {
    return { ok: false, error: 'Mock login is not permitted in production.' };
  }

  // Check predefined demo accounts (Super Admin & Demo Gym Owner)
  const known = ACCOUNTS.find((a) => a.email.toLowerCase() === e);
  if (known) {
    if (known.password !== password) {
      return { ok: false, error: 'Invalid email or password.' };
    }
    if (known.role === 'admin') {
      startSession({
        role: 'admin',
        email: known.email,
        name: known.name,
        token: 'token_admin_' + Date.now(),
      });
      return { ok: true, role: 'admin' };
    }
    startCrmSession({ id: 'usr_owner', name: known.name, email: known.email });
    return { ok: true, role: 'crm' };
  }

  // Check registered accounts
  const registered = getRegisteredAccounts().find((a) => a.email.toLowerCase() === e);
  if (registered) {
    if (registered.password !== password) {
      return { ok: false, error: 'Invalid email or password.' };
    }
    startCrmSession({
      id: registered.id || 'usr_' + Date.now(),
      name: registered.name || e.split('@')[0],
      email: registered.email,
      gymName: registered.gymName,
    });
    return { ok: true, role: 'crm' };
  }

  return {
    ok: false,
    error: 'Invalid email or password. Please verify your credentials or register a new gym account.',
  };
}

/** Ends the session without navigating */
export function clearSession() {
  tokenManager.clearSession();
}

export async function logout() {
  if (!USE_MOCK) {
    try {
      await httpClient.post('/auth/logout/', {}, { skipAuth: false, retryOn401: false }).catch(() => {});
    } catch {
      /* ignore */
    }
  }
  clearSession();
  if (typeof window !== 'undefined') {
    window.location.assign('/login');
  }
}

/* ---- sign-up (strictly for CRM gym owners) ---- */
export async function signUp(email, password, meta = {}) {
  const e = (email || '').trim().toLowerCase();
  if (!/^\S+@\S+\.\S+$/.test(e)) return { ok: false, error: 'Enter a valid email address.' };
  if ((password || '').length < 6) return { ok: false, error: 'Password must be at least 6 characters.' };

  if (USE_MOCK) {
    const existingKnown = ACCOUNTS.find((a) => a.email.toLowerCase() === e);
    if (existingKnown?.role === 'admin') {
      return { ok: false, error: 'Admin accounts cannot register here. Super Admins can only sign in via the login page.' };
    }
    if (existingKnown) {
      return { ok: false, error: 'This gym email is already registered. Please sign in.' };
    }

    const existingReg = getRegisteredAccounts().find((a) => a.email.toLowerCase() === e);
    if (existingReg) {
      return { ok: false, error: 'This gym email is already registered. Please sign in.' };
    }
  }

  // Backend API mode
  if (!USE_MOCK) {
    try {
      await httpClient.post(
        '/auth/register/',
        {
          email: e,
          password,
          gym_name: meta.gymName || 'Fitaval Club',
          full_name: meta.ownerName || e.split('@')[0],
          role: 'crm',
        },
        { skipAuth: true, retryOn401: false }
      );
      ss()?.setItem(PENDING_KEY, JSON.stringify({ email: e, password, name: meta.ownerName, gymName: meta.gymName }));
      return { ok: true, email: e };
    } catch (err) {
      return { ok: false, error: err.message || 'Unable to connect to registration server.' };
    }
  }

  // Mock mode
  ss()?.setItem(
    PENDING_KEY,
    JSON.stringify({
      email: e,
      password,
      name: meta.ownerName || e.split('@')[0],
      gymName: meta.gymName || 'Fitaval Club',
    })
  );
  return { ok: true, email: e };
}

/** Verifies sign-up OTP and registers user credentials. */
export async function verifySignUp(code) {
  if (!/^\d{6}$/.test(code || '')) return { ok: false, error: 'Enter the 6-digit code.' };
  let pending = {};
  try {
    pending = JSON.parse(ss()?.getItem(PENDING_KEY) || '{}');
  } catch {
    /* ignore */
  }
  if (!pending.email) return { ok: false, error: 'Your sign-up expired. Please start again.' };

  // Backend API mode
  if (!USE_MOCK) {
    try {
      const data = await httpClient.post(
        '/auth/verify-otp/',
        { email: pending.email, otp: code },
        { skipAuth: true, retryOn401: false }
      );
      const token = data.access_token || data.access || data.token;
      const refreshToken = data.refresh_token || data.refresh;
      const user = data.user || { name: pending.name, email: pending.email, gymName: pending.gymName };
      ss()?.removeItem(PENDING_KEY);
      startCrmSession(user, token, { refreshToken });
      return { ok: true };
    } catch (err) {
      return { ok: false, error: err.message || 'Verification failed. Please try again.' };
    }
  }

  // Mock mode: persist registered credentials
  ss()?.removeItem(PENDING_KEY);
  saveRegisteredAccount({
    id: 'usr_' + Date.now(),
    email: pending.email,
    password: pending.password,
    name: pending.name || pending.email.split('@')[0],
    gymName: pending.gymName,
    role: 'crm',
  });

  startCrmSession({
    id: 'usr_' + Date.now(),
    name: pending.name || pending.email.split('@')[0],
    email: pending.email,
    gymName: pending.gymName,
  });
  return { ok: true };
}

export const homePath = (role) => (role === 'admin' ? '/admin' : '/');
