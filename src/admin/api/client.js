/**
 * Standalone API Client for Fitaval Super Admin
 *
 * Implements all endpoints specified in docs/ADMIN_API.md:
 * - When VITE_ENABLE_MOCK_API is 'true' (default), serves and mutates in-memory/localStorage seed data.
 * - When VITE_ENABLE_MOCK_API is 'false', issues real HTTP fetch requests to VITE_API_BASE_URL with Bearer JWT tokens.
 */

import { APPROVALS0 } from '../data/approvals';
import { makeGym } from '../data/gyms';
import { seedMembers } from '../data/members';
import { AUDIT0 } from '../data/audit';
import { ALERTS0 } from '../data/alerts';
import { ROLES } from '../data/roles';
import { PLANS0 } from '../data/plans';
import { API_BASE, USE_MOCK } from '../../config/env';
import { httpClient } from '../../shared/api/httpClient';

export { API_BASE, USE_MOCK };

// Helper to execute authenticated requests to real backend
async function apiRequest(endpoint, options = {}) {
  return httpClient(endpoint, options);
}

// In-Memory / LocalStorage Mock Data Store
class MockAdminStore {
  constructor() {
    this.gyms = Object.fromEntries(APPROVALS0.map((a, i) => [a.id, makeGym(a, i)]));
    this.members = typeof seedMembers === 'function' ? seedMembers() : [...(seedMembers || [])];
    this.approvals = [...APPROVALS0];
    this.audit = [...AUDIT0];
    this.alerts = [...ALERTS0];
    this.broadcasts = [];
    this.roles = [...ROLES];
    this.plans = [...PLANS0];
  }
}

const store = new MockAdminStore();

export const adminClient = {
  isMock: USE_MOCK,

  // 1. Gym Management
  gyms: {
    async list(params = {}) {
      if (!USE_MOCK) return apiRequest('/admin/gyms?' + new URLSearchParams(params));
      let result = Object.values(store.gyms);
      if (params.status) result = result.filter((g) => g.status === params.status);
      if (params.verified) result = result.filter((g) => g.verified === (params.verified === 'true'));
      if (params.q) {
        const query = params.q.toLowerCase();
        result = result.filter((g) => g.name.toLowerCase().includes(query) || g.id.toLowerCase().includes(query));
      }
      return { total: result.length, data: result };
    },

    async get(id) {
      if (!USE_MOCK) return apiRequest(`/admin/gyms/${id}`);
      const gym = store.gyms[id];
      if (!gym) throw new Error(`Gym ${id} not found`);
      return gym;
    },

    async update(id, patch) {
      if (!USE_MOCK) {
        return apiRequest(`/admin/gyms/${id}`, {
          method: 'PATCH',
          body: JSON.stringify(patch),
        });
      }
      if (!store.gyms[id]) throw new Error(`Gym ${id} not found`);
      store.gyms[id] = { ...store.gyms[id], ...patch };
      return store.gyms[id];
    },

    async verify(id, verified) {
      if (!USE_MOCK) {
        return apiRequest(`/admin/gyms/${id}/verify`, {
          method: 'POST',
          body: JSON.stringify({ verified }),
        });
      }
      if (!store.gyms[id]) throw new Error(`Gym ${id} not found`);
      store.gyms[id].verified = verified;
      return { id, verified, message: `Gym ${id} verification updated.` };
    },

    async getPhotos(id) {
      if (!USE_MOCK) return apiRequest(`/admin/gyms/${id}/photos`);
      return { gym_id: id, photos: store.gyms[id]?.photos || [] };
    },
  },

  // 2. Gym Onboarding & Approvals
  approvals: {
    async list(params = {}) {
      if (!USE_MOCK) return apiRequest('/admin/approvals?' + new URLSearchParams(params));
      return {
        counts: {
          pending: store.approvals.filter((a) => a.status === 'Pending').length,
          under_review: store.approvals.filter((a) => a.status === 'Under Review').length,
          approved: store.approvals.filter((a) => a.status === 'Approved').length,
          rejected: store.approvals.filter((a) => a.status === 'Rejected').length,
        },
        data: store.approvals,
      };
    },

    async review(id, note) {
      if (!USE_MOCK) {
        return apiRequest(`/admin/approvals/${id}/review`, {
          method: 'POST',
          body: JSON.stringify({ note }),
        });
      }
      const item = store.approvals.find((a) => a.id === id);
      if (item) item.status = 'Under Review';
      return { id, status: 'Under Review' };
    },

    async approve(id, data = {}) {
      if (!USE_MOCK) {
        return apiRequest(`/admin/approvals/${id}/approve`, {
          method: 'POST',
          body: JSON.stringify(data),
        });
      }
      const item = store.approvals.find((a) => a.id === id);
      if (item) item.status = 'Approved';
      return { id, status: 'Approved' };
    },

    async reject(id, reason = '') {
      if (!USE_MOCK) {
        return apiRequest(`/admin/approvals/${id}/reject`, {
          method: 'POST',
          body: JSON.stringify({ reason }),
        });
      }
      const item = store.approvals.find((a) => a.id === id);
      if (item) item.status = 'Rejected';
      return { id, status: 'Rejected' };
    },
  },

  // 3. Cross-Gym Users (Members)
  users: {
    async list(params = {}) {
      if (!USE_MOCK) return apiRequest('/admin/users?' + new URLSearchParams(params));
      let result = [...store.members];
      if (params.branch && params.branch !== 'all') {
        result = result.filter((m) => m.branch === params.branch);
      }
      if (params.status) {
        result = result.filter((m) => m.status === params.status);
      }
      return { total: result.length, data: result };
    },

    async get(id) {
      if (!USE_MOCK) return apiRequest(`/admin/users/${id}`);
      const m = store.members.find((x) => x.id === id);
      if (!m) throw new Error(`Member ${id} not found`);
      return m;
    },

    async rotateQr(id) {
      if (!USE_MOCK) return apiRequest(`/admin/users/${id}/rotate-qr`, { method: 'POST' });
      const m = store.members.find((x) => x.id === id);
      if (!m) throw new Error(`Member ${id} not found`);
      const hex = Array.from({ length: 6 }, () => '0123456789ABCDEF'[Math.floor(Math.random() * 16)]).join('');
      m.hex = hex;
      return { member_id: id, new_hex: hex, rotated_at: new Date().toISOString() };
    },

    async export(params = {}) {
      if (!USE_MOCK) {
        return apiRequest('/admin/users/export', {
          method: 'POST',
          body: JSON.stringify(params),
        });
      }
      return { export_id: 'exp_mock_001', status: 'ready', url: '#' };
    },
  },

  // 4. Staff & Trainers per Gym
  staff: {
    async list(gymId) {
      if (!USE_MOCK) return apiRequest(`/admin/gyms/${gymId}/staff`);
      return { gym_id: gymId, data: store.gyms[gymId]?.staff || [] };
    },

    async create(gymId, data) {
      if (!USE_MOCK) {
        return apiRequest(`/admin/gyms/${gymId}/staff`, {
          method: 'POST',
          body: JSON.stringify(data),
        });
      }
      const newStaff = { id: 'stf_' + Date.now(), ...data };
      if (store.gyms[gymId]) store.gyms[gymId].staff.push(newStaff);
      return newStaff;
    },

    async update(gymId, id, patch) {
      if (!USE_MOCK) {
        return apiRequest(`/admin/gyms/${gymId}/staff/${id}`, {
          method: 'PATCH',
          body: JSON.stringify(patch),
        });
      }
      const list = store.gyms[gymId]?.staff || [];
      const item = list.find((s) => s.id === id);
      if (item) Object.assign(item, patch);
      return item;
    },

    async setRole(staffId, roleId) {
      if (!USE_MOCK) {
        return apiRequest(`/admin/staff/${staffId}/role`, {
          method: 'POST',
          body: JSON.stringify({ role_id: roleId }),
        });
      }
      return { staff_id: staffId, role_id: roleId, updated_at: new Date().toISOString() };
    },
  },

  trainers: {
    async list(gymId) {
      if (!USE_MOCK) return apiRequest(`/admin/gyms/${gymId}/trainers`);
      return { gym_id: gymId, data: store.gyms[gymId]?.trainers || [] };
    },
  },

  // 5. Finance & Revenue
  finance: {
    async getOverview(params = {}) {
      if (!USE_MOCK) return apiRequest('/admin/finance?' + new URLSearchParams(params));
      return {
        summary: {
          total_revenue: 10400000,
          total_expenses: 2800000,
          net: 7600000,
          period: '2026-10',
        },
        data: [],
      };
    },

    async getSummary(period = 'month') {
      if (!USE_MOCK) return apiRequest(`/admin/finance/summary?period=${period}`);
      return {
        total_revenue: { today: 85000, this_week: 560000, this_month: 10400000, all_time: 124800000 },
        active_gyms: Object.keys(store.gyms).length,
        total_members: store.members.length,
      };
    },
  },

  // 6. Gym Wallet & Settlements
  wallet: {
    async get(gymId) {
      if (!USE_MOCK) return apiRequest(`/admin/gyms/${gymId}/wallet`);
      return store.gyms[gymId]?.wallet || { status: 'Active', updated: '', txns: [] };
    },

    async getTransactions(gymId, params = {}) {
      if (!USE_MOCK) return apiRequest(`/admin/gyms/${gymId}/wallet/transactions?` + new URLSearchParams(params));
      return { gym_id: gymId, data: store.gyms[gymId]?.wallet?.txns || [] };
    },

    async settle(gymId, payload = {}) {
      if (!USE_MOCK) {
        return apiRequest(`/admin/gyms/${gymId}/wallet/settle`, {
          method: 'POST',
          body: JSON.stringify(payload),
        });
      }
      return {
        settlement_id: 'sett_' + Date.now(),
        gym_id: gymId,
        amount: payload.amount || 0,
        status: 'pending',
        initiated_at: new Date().toISOString(),
      };
    },
  },

  // 7. Platform Audit Log
  audit: {
    async list(params = {}) {
      if (!USE_MOCK) return apiRequest('/admin/audit?' + new URLSearchParams(params));
      return { total: store.audit.length, data: store.audit };
    },

    async log(action, model, obj, before, after) {
      const entry = {
        id: 'aud_' + Date.now(),
        action,
        model,
        obj,
        before,
        after,
        at: new Date(),
        actor: 'superadmin@fitaval.com',
      };
      if (!USE_MOCK) {
        return apiRequest('/admin/audit', {
          method: 'POST',
          body: JSON.stringify(entry),
        });
      }
      store.audit.unshift(entry);
      return entry;
    },
  },

  // 8. Roles & Permissions
  roles: {
    async list() {
      if (!USE_MOCK) return apiRequest('/admin/roles');
      return { data: store.roles };
    },
  },
};

export default adminClient;

