// Gym verification ("blue tick"). Set by the Super Admin, shown in the CRM.
// Mock storage: one localStorage map {gymId: true}. Replace with a `verified` flag on the gym record from the API.
import { useEffect, useState } from 'react';

const KEY = 'fitaval_verified_gyms';
const EVT = 'fitaval-verified-change';

/** The admin gym that the demo CRM account (owner@fitaval.com) belongs to. */
export const CRM_GYM_ID = 'GYM001';

function read() {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '{}') || {};
  } catch {
    return {};
  }
}

export const isVerified = (id) => !!read()[id];

export function setVerified(id, on) {
  const m = read();
  if (on) m[id] = true;
  else delete m[id];
  try {
    localStorage.setItem(KEY, JSON.stringify(m));
  } catch {
    /* storage blocked: tick just won't persist */
  }
  window.dispatchEvent(new Event(EVT));
}

/** Live value; updates when changed here or in another tab. */
export function useVerified(id) {
  const [v, setV] = useState(() => isVerified(id));
  useEffect(() => {
    const sync = () => setV(isVerified(id));
    sync();
    window.addEventListener(EVT, sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener(EVT, sync);
      window.removeEventListener('storage', sync);
    };
  }, [id]);
  return v;
}
