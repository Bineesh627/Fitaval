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
export function startCrmSession(user) {
  startSession({ role: 'crm', email: user.email, name: user.name });
  ls().setItem(CRM_USER, JSON.stringify({ id: user.id || 'usr_' + Date.now(), role: 'admin', ...user }));
  ls().setItem(CRM_TOKEN, 'token_' + Date.now());
}

/** Returns { ok: true, role } or { ok: false, error }. */
export function login(email, password) {
  const e = (email || '').trim().toLowerCase();
  if (!e || !password) return { ok: false, error: 'Enter your email and password.' };

  const known = ACCOUNTS.find((a) => a.email === e);
  if (known && known.password !== password) return { ok: false, error: 'Invalid email or password.' };

  if (known && known.role === 'admin') {
    startSession({ role: 'admin', email: known.email, name: known.name });
    return { ok: true, role: 'admin' };
  }
  // CRM: the demo owner, or any other email (gym owners who signed up). Mock only.
  startCrmSession(known ? { id: 'usr_owner', name: known.name, email: known.email } : { name: e.split('@')[0], email: e });
  return { ok: true, role: 'crm' };
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
export function signUp(email, password, meta = {}) {
  const e = (email || '').trim().toLowerCase();
  if (!/^\S+@\S+\.\S+$/.test(e)) return { ok: false, error: 'Enter a valid email address.' };
  
  const existing = ACCOUNTS.find((a) => a.email === e);
  if (existing?.role === 'admin') {
    return { ok: false, error: 'Admin accounts cannot register here. Super Admins can only sign in via the login page.' };
  }
  if (existing) {
    return { ok: false, error: 'This gym email is already registered. Please sign in.' };
  }
  if ((password || '').length < 6) return { ok: false, error: 'Password must be at least 6 characters.' };
  
  ss().setItem(PENDING_KEY, JSON.stringify({
    email: e,
    name: meta.ownerName || e.split('@')[0],
    gymName: meta.gymName || 'Fitaval Club',
  }));
  return { ok: true, email: e };
}

/** Demo: any 6-digit code verifies. Replace with a real OTP / DRF activation endpoint. */
export function verifySignUp(code) {
  if (!/^\d{6}$/.test(code || '')) return { ok: false, error: 'Enter the 6-digit code.' };
  let pending = {};
  try {
    pending = JSON.parse(ss().getItem(PENDING_KEY) || '{}');
  } catch {
    /* ignore */
  }
  if (!pending.email) return { ok: false, error: 'Your sign-up expired. Please start again.' };
  ss().removeItem(PENDING_KEY);
  startCrmSession({ name: pending.name || pending.email.split('@')[0], email: pending.email, gymName: pending.gymName });
  return { ok: true };
}

export const homePath = (role) => (role === 'admin' ? '/admin' : '/');
