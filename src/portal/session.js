// One session for the whole program. The role decides which app opens:
//   role "crm"   -> CRM (gym owner)   src/crm
//   role "admin" -> Admin Panel       src/admin  (Super Admin)
//
// The session lives in sessionStorage, so every fresh run / new tab starts on the login page.
// CRM keeps its own localStorage keys (fitaval_auth_*) which are only written while a CRM session exists.
import { ACCOUNTS } from './accounts';

const SESSION_KEY = 'fitaval_session';
const CRM_USER = 'fitaval_auth_user';
const CRM_TOKEN = 'fitaval_auth_token';
const PENDING_KEY = 'fitaval_pending_signup';
const REGISTERED_ACCOUNTS_KEY = 'fitaval_registered_accounts';

export const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api/v1';
export const USE_MOCK = import.meta.env.VITE_ENABLE_MOCK_API !== 'false';

const ss = () => window.sessionStorage;
const ls = () => window.localStorage;

function clearCrmKeys() {
  try {
    ls().removeItem(CRM_USER);
    ls().removeItem(CRM_TOKEN);
  } catch {
    /* storage unavailable */
  }
}

export function getSession() {
  try {
    const raw = ss().getItem(SESSION_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    /* ignore */
  }
  // No session: make sure no stale CRM sign-in from an older run can skip the login page.
  clearCrmKeys();
  return null;
}

function startSession(session) {
  clearCrmKeys();
  ss().setItem(SESSION_KEY, JSON.stringify(session));
}

/** Signs a gym owner into the CRM (also used after sign-up). */
export function startCrmSession(user, token) {
  const authToken = token || 'token_' + Date.now();
  startSession({ role: 'crm', email: user.email, name: user.name, token: authToken });
  ls().setItem(CRM_USER, JSON.stringify({ id: user.id || 'usr_' + Date.now(), role: 'admin', ...user }));
  ls().setItem(CRM_TOKEN, authToken);
}

export function getRegisteredAccounts() {
  try {
    const raw = ls().getItem(REGISTERED_ACCOUNTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveRegisteredAccount(acc) {
  try {
    const list = getRegisteredAccounts().filter((a) => a.email.toLowerCase() !== acc.email.toLowerCase());
    list.push(acc);
    ls().setItem(REGISTERED_ACCOUNTS_KEY, JSON.stringify(list));
  } catch {
    /* ignore */
  }
}

/**
 * Authenticates user via backend API (when USE_MOCK is false)
 * or via verified mock credentials (when USE_MOCK is true).
 * Strictly rejects any unauthenticated or unrecognized credentials.
 * Returns Promise<{ ok: true, role } | { ok: false, error }>.
 */
export async function login(email, password) {
  const e = (email || '').trim().toLowerCase();
  if (!e || !password) return { ok: false, error: 'Enter your email and password.' };

  // 1. LIVE BACKEND API MODE
  if (!USE_MOCK) {
    try {
      const cleanBase = API_BASE.replace(/\/+$/, '');
      const response = await fetch(`${cleanBase}/auth/login/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: e, password }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        const errorMsg =
          data.detail ||
          data.message ||
          data.error ||
          (response.status === 401 ? 'Invalid email or password.' : `Login failed with status ${response.status}`);
        return { ok: false, error: errorMsg };
      }

      const token = data.access_token || data.token || data.key || 'token_' + Date.now();
      const user = data.user || { email: e, name: e.split('@')[0] };
      const rawRole = (user.role || data.role || '').toLowerCase();
      const role = rawRole.includes('admin') ? 'admin' : 'crm';

      if (role === 'admin') {
        startSession({ role: 'admin', email: user.email || e, name: user.name, token });
        ls().setItem('fitaval_admin_token', token);
        return { ok: true, role: 'admin' };
      }

      startCrmSession({ id: user.id, name: user.name || e.split('@')[0], email: user.email || e, ...user }, token);
      return { ok: true, role: 'crm' };
    } catch (err) {
      return {
        ok: false,
        error: err.message || 'Unable to connect to the authentication server. Please check your backend connection.',
      };
    }
  }

  // 2. MOCK / DEMO MODE
  // Check predefined demo accounts (Super Admin & Demo Gym Owner)
  const known = ACCOUNTS.find((a) => a.email.toLowerCase() === e);
  if (known) {
    if (known.password !== password) {
      return { ok: false, error: 'Invalid email or password.' };
    }
    if (known.role === 'admin') {
      startSession({ role: 'admin', email: known.email, name: known.name, token: 'token_admin_' + Date.now() });
      ls().setItem('fitaval_admin_token', 'token_admin_' + Date.now());
      return { ok: true, role: 'admin' };
    }
    startCrmSession({ id: 'usr_owner', name: known.name, email: known.email });
    return { ok: true, role: 'crm' };
  }

  // Check registered accounts (gym owners who signed up through the registration form)
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

  // Strictly reject any unrecognized email/password!
  return {
    ok: false,
    error: 'Invalid email or password. Please verify your credentials or register a new gym account.',
  };
}

/** Ends the session without navigating (the CRM's own Log Out buttons redirect themselves). */
export function clearSession() {
  try {
    ss().removeItem(SESSION_KEY);
  } catch {
    /* ignore */
  }
  clearCrmKeys();
}

export function logout() {
  clearSession();
  window.location.assign('/login');
}

/* ---- sign-up (strictly for CRM gym owners) ---- */
export async function signUp(email, password, meta = {}) {
  const e = (email || '').trim().toLowerCase();
  if (!/^\S+@\S+\.\S+$/.test(e)) return { ok: false, error: 'Enter a valid email address.' };
  if ((password || '').length < 6) return { ok: false, error: 'Password must be at least 6 characters.' };

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

  // Backend API mode
  if (!USE_MOCK) {
    try {
      const cleanBase = API_BASE.replace(/\/+$/, '');
      const response = await fetch(`${cleanBase}/auth/register/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: e,
          password,
          gym_name: meta.gymName || 'Fitaval Club',
          full_name: meta.ownerName || e.split('@')[0],
          role: 'crm',
        }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        return {
          ok: false,
          error: data.detail || data.message || data.error || `Registration failed with status ${response.status}`,
        };
      }
      ss().setItem(PENDING_KEY, JSON.stringify({ email: e, password, name: meta.ownerName, gymName: meta.gymName }));
      return { ok: true, email: e };
    } catch (err) {
      return { ok: false, error: err.message || 'Unable to connect to registration server.' };
    }
  }

  // Mock mode
  ss().setItem(
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
    pending = JSON.parse(ss().getItem(PENDING_KEY) || '{}');
  } catch {
    /* ignore */
  }
  if (!pending.email) return { ok: false, error: 'Your sign-up expired. Please start again.' };

  // Backend API mode
  if (!USE_MOCK) {
    try {
      const cleanBase = API_BASE.replace(/\/+$/, '');
      const response = await fetch(`${cleanBase}/auth/verify-otp/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: pending.email, otp: code }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        return { ok: false, error: data.detail || data.message || 'Invalid verification code.' };
      }
      const token = data.access_token || data.token || 'token_' + Date.now();
      const user = data.user || { name: pending.name, email: pending.email, gymName: pending.gymName };
      ss().removeItem(PENDING_KEY);
      startCrmSession(user, token);
      return { ok: true };
    } catch (err) {
      return { ok: false, error: err.message || 'Verification failed. Please try again.' };
    }
  }

  // Mock mode: persist registered credentials so user can log in with this email and password
  ss().removeItem(PENDING_KEY);
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
