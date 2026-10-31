/**
 * ==============================================================================
 * Fitaval CRM — Standalone API Client
 * ==============================================================================
 * Supports two operational modes:
 *
 * 1. MOCK MODE (VITE_ENABLE_MOCK_API !== 'false')
 *    Uses local seed generators and localStorage for persistent client-side state.
 *    Ideal for UI testing, demos, and offline development.
 *
 * 2. LIVE DJANGO REST API MODE (VITE_ENABLE_MOCK_API === 'false')
 *    Issues authenticated HTTP requests (JWT Bearer tokens) to your Django
 *    REST Framework backend configured via VITE_API_BASE_URL.
 *    Target DRF endpoints: /api/v1/crm/... and /api/v1/auth/...
 * ==============================================================================
 */

import {
  MOCK_PLANS,
  MOCK_MEMBERS,
  MOCK_TRANSACTIONS,
  MOCK_TRAINERS,
  MOCK_GYM_PROFILE,
  MOCK_WALLET_TRANSACTIONS,
  MOCK_ATTENDANCE,
  MOCK_SUBSCRIPTION,
  MOCK_MEMBER_CHECKINS,
} from '@/data';
import { clearSession, getSession, startSession } from '../../portal/session';
import { API_BASE, USE_MOCK } from '../../config/env';
import { httpClient } from '../../shared/api/httpClient';
import { tokenManager } from '../../shared/auth/tokenManager';

export { API_BASE, USE_MOCK };

const STORAGE_KEYS = {
  MEMBERS: 'fitaval_members',
  PLANS: 'fitaval_plans',
  TRANSACTIONS: 'fitaval_transactions',
  TRAINERS: 'fitaval_trainers',
  GYM_PROFILE: 'fitaval_gym_profile',
  WALLET_TRANSACTIONS: 'fitaval_wallet_transactions',
  ATTENDANCE: 'fitaval_attendance',
  SUBSCRIPTION: 'fitaval_subscription',
  MEMBER_CHECKINS: 'fitaval_member_checkins',
};

// Helper for authenticated HTTP requests to Django REST Framework backend
async function apiRequest(endpoint, options = {}) {
  return httpClient(endpoint, options);
}

// Seed initial gym CRM data if not already present (mock mode)
function seedIfMissing(key, data) {
  if (!localStorage.getItem(key)) {
    localStorage.setItem(key, JSON.stringify(data));
  }
}

function initStorage() {
  if (typeof window === 'undefined') return;

  // Migrate local asset paths to clean backend image URLs
  const storedTrainers = localStorage.getItem(STORAGE_KEYS.TRAINERS);
  if (storedTrainers && storedTrainers.includes('/assets/images/')) {
    localStorage.removeItem(STORAGE_KEYS.TRAINERS);
  }
  const storedGym = localStorage.getItem(STORAGE_KEYS.GYM_PROFILE);
  if (storedGym && storedGym.includes('/assets/images/')) {
    localStorage.removeItem(STORAGE_KEYS.GYM_PROFILE);
  }

  if (storedTrainers && !localStorage.getItem('fitaval_staff_seeded')) {
    try {
      const list = JSON.parse(storedTrainers);
      if (Array.isArray(list) && !list.some((t) => t.role === 'staff')) {
        const demoStaff = MOCK_TRAINERS.filter((t) => t.role === 'staff');
        localStorage.setItem(STORAGE_KEYS.TRAINERS, JSON.stringify([...list, ...demoStaff]));
      }
    } catch {
      // ignore
    }
    localStorage.setItem('fitaval_staff_seeded', '1');
  }

  const storedMembers = localStorage.getItem(STORAGE_KEYS.MEMBERS);
  if (storedMembers && !localStorage.getItem('fitaval_members_fields_cleaned_v1')) {
    try {
      const list = JSON.parse(storedMembers);
      if (Array.isArray(list)) {
        const cleaned = list.map(({ emergency_contact, fitness_goals, medical_notes, notes, ...rest }) => rest);
        localStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify(cleaned));
      }
    } catch {
      // ignore
    }
    localStorage.setItem('fitaval_members_fields_cleaned_v1', '1');
  }

  const storedPlans = localStorage.getItem(STORAGE_KEYS.PLANS);
  if (storedPlans && !localStorage.getItem('fitaval_plans_desc_cleaned_v1')) {
    try {
      const list = JSON.parse(storedPlans);
      if (Array.isArray(list)) {
        const cleaned = list.map(({ description, ...rest }) => rest);
        localStorage.setItem(STORAGE_KEYS.PLANS, JSON.stringify(cleaned));
      }
    } catch {
      // ignore
    }
    localStorage.setItem('fitaval_plans_desc_cleaned_v1', '1');
  }

  seedIfMissing(STORAGE_KEYS.PLANS, MOCK_PLANS);
  seedIfMissing(STORAGE_KEYS.MEMBERS, MOCK_MEMBERS);
  seedIfMissing(STORAGE_KEYS.TRANSACTIONS, MOCK_TRANSACTIONS);
  seedIfMissing(STORAGE_KEYS.TRAINERS, MOCK_TRAINERS);
  seedIfMissing(STORAGE_KEYS.GYM_PROFILE, [MOCK_GYM_PROFILE]);
  seedIfMissing(STORAGE_KEYS.WALLET_TRANSACTIONS, MOCK_WALLET_TRANSACTIONS);
  seedIfMissing(STORAGE_KEYS.ATTENDANCE, MOCK_ATTENDANCE);
  seedIfMissing(STORAGE_KEYS.SUBSCRIPTION, [MOCK_SUBSCRIPTION]);
  seedIfMissing(STORAGE_KEYS.MEMBER_CHECKINS, MOCK_MEMBER_CHECKINS);
}

// Dual-mode Entity Store: talks to Django REST API in production, localStorage in mock
function createEntityStore(endpoint, storageKey) {
  const getItems = () => {
    try {
      const data = localStorage.getItem(storageKey);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  };

  const saveItems = (items) => {
    localStorage.setItem(storageKey, JSON.stringify(items));
  };

  return {
    listSync(sortField, limit = 100) {
      if (!USE_MOCK) return [];
      initStorage();
      let items = [...getItems()];
      if (sortField) {
        const isDesc = sortField.startsWith('-');
        const field = isDesc ? sortField.substring(1) : sortField;
        items.sort((a, b) => {
          const valA = a[field] ?? '';
          const valB = b[field] ?? '';
          if (valA < valB) return isDesc ? 1 : -1;
          if (valA > valB) return isDesc ? -1 : 1;
          return 0;
        });
      }
      return items.slice(0, limit);
    },

    getSync(id) {
      if (!USE_MOCK) return null;
      initStorage();
      const items = getItems();
      return items.find((i) => i.id === id) || null;
    },

    async list(sortField, limit = 100) {
      if (!USE_MOCK) {
        const params = new URLSearchParams();
        if (sortField) params.set('ordering', sortField);
        if (limit) params.set('page_size', String(limit));
        const res = await apiRequest(`/crm/${endpoint}/?${params.toString()}`);
        if (Array.isArray(res)) return res;
        if (res && Array.isArray(res.results)) return res.results;
        if (res && Array.isArray(res.data)) return res.data;
        // If single object returned (e.g. /crm/profile/ or /crm/subscription/)
        if (res && typeof res === 'object') return [res];
        return [];
      }

      initStorage();
      let items = [...getItems()];
      if (sortField) {
        const isDesc = sortField.startsWith('-');
        const field = isDesc ? sortField.substring(1) : sortField;
        items.sort((a, b) => {
          const valA = a[field] ?? '';
          const valB = b[field] ?? '';
          if (valA < valB) return isDesc ? 1 : -1;
          if (valA > valB) return isDesc ? -1 : 1;
          return 0;
        });
      }
      return items.slice(0, limit);
    },

    async get(id) {
      if (!USE_MOCK) {
        return await apiRequest(`/crm/${endpoint}/${id}/`);
      }

      initStorage();
      const items = getItems();
      return items.find((i) => i.id === id) || null;
    },

    async create(data) {
      if (!USE_MOCK) {
        return await apiRequest(`/crm/${endpoint}/`, {
          method: 'POST',
          body: JSON.stringify(data),
        });
      }

      initStorage();
      const items = getItems();
      const newItem = {
        id: 'id_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
        created_date: new Date().toISOString().split('T')[0],
        ...data,
      };
      items.unshift(newItem);
      saveItems(items);
      return newItem;
    },

    async update(id, patch) {
      if (!USE_MOCK) {
        return await apiRequest(`/crm/${endpoint}/${id}/`, {
          method: 'PATCH',
          body: JSON.stringify(patch),
        });
      }

      initStorage();
      const items = getItems();
      const index = items.findIndex((i) => i.id === id);
      if (index === -1) {
        throw new Error('Item not found');
      }
      items[index] = { ...items[index], ...patch };
      saveItems(items);
      return items[index];
    },

    async delete(id) {
      if (!USE_MOCK) {
        await apiRequest(`/crm/${endpoint}/${id}/`, {
          method: 'DELETE',
        });
        return { success: true };
      }

      initStorage();
      const items = getItems();
      const filtered = items.filter((i) => i.id !== id);
      saveItems(filtered);
      return { success: true };
    },
  };
}

// Initialise storage on load in mock mode
if (typeof window !== 'undefined' && USE_MOCK) {
  initStorage();
}

// CRM Client API matching exact surface expected by pages
export const client = {
  isMock: USE_MOCK,
  apiBase: API_BASE,

  entities: {
    Member: createEntityStore('members', STORAGE_KEYS.MEMBERS),
    MembershipPlan: createEntityStore('plans', STORAGE_KEYS.PLANS),
    Transaction: createEntityStore('transactions', STORAGE_KEYS.TRANSACTIONS),
    Trainer: createEntityStore('trainers', STORAGE_KEYS.TRAINERS),
    GymProfile: createEntityStore('profile', STORAGE_KEYS.GYM_PROFILE),
    WalletTransaction: createEntityStore('wallet/transactions', STORAGE_KEYS.WALLET_TRANSACTIONS),
    Attendance: createEntityStore('attendance', STORAGE_KEYS.ATTENDANCE),
    Subscription: createEntityStore('subscription', STORAGE_KEYS.SUBSCRIPTION),
    MemberCheckin: createEntityStore('checkins', STORAGE_KEYS.MEMBER_CHECKINS),
  },

  auth: {
    async me() {
      const session = getSession();
      if (!session) {
        throw new Error('Not authenticated');
      }

      if (!USE_MOCK) {
        try {
          const user = await apiRequest('/auth/me/');
          startSession({ ...session, user });
          return user;
        } catch (e) {
          if (session?.user) return session.user;
          throw e;
        }
      }

      return session?.user || { id: 'usr_admin', name: session.name || 'Gym Owner', email: session.email || 'owner@fitaval.com', role: 'owner' };
    },

    setToken(token) {
      tokenManager.setAccessToken(token);
    },

    getAuthToken() {
      return tokenManager.getAccessToken();
    },

    logout(redirectUrl) {
      if (!USE_MOCK) {
        apiRequest('/auth/logout/', { method: 'POST' }).catch(() => {});
      }
      clearSession();
      if (redirectUrl && typeof window !== 'undefined') {
        window.location.href = redirectUrl;
      }
    },

    redirectToLogin(returnUrl) {
      const target = returnUrl ? `/login?returnTo=${encodeURIComponent(returnUrl)}` : '/login';
      if (typeof window !== 'undefined') {
        window.location.href = target;
      }
    },

    isAuthenticated() {
      return Boolean(tokenManager.getAccessToken() || getSession()?.token);
    },
  },

  app: {
    async getPublicSettings() {
      if (!USE_MOCK) {
        return await apiRequest('/settings/public/');
      }
      return {
        id: 'fitaval-crm',
        public_settings: {
          app_name: 'Fitaval Gym Manager',
          auth_mode: 'public',
        },
      };
    },
  },

  integrations: {
    Core: {
      async UploadPublicFile({ file }) {
        if (!file) throw new Error('No file provided');

        if (!USE_MOCK) {
          const formData = new FormData();
          formData.append('file', file);
          const data = await httpClient.post('/crm/upload/', formData);
          return { file_url: data?.file_url || data?.url };
        }

        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (e) => {
            resolve({ file_url: e.target?.result });
          };
          reader.onerror = () => {
            reject(new Error('Failed to read file'));
          };
          reader.readAsDataURL(file);
        });
      },
    },
  },
};

export default client;
