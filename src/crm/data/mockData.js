/**
 * ==============================================================================
 * Fitaval CRM — Centralized Mock Data Directory
 * ==============================================================================
 * All CRM mock data is gathered here as direct static arrays and objects.
 * When integrating with your Django REST Framework (DRF) backend:
 * 1. Set `VITE_ENABLE_MOCK_API=false` in `.env`
 * 2. Point `VITE_API_BASE_URL` to http://127.0.0.1:8000/api/v1
 * ==============================================================================
 */

import { MOCK_ATTENDANCE } from "./attendance";
import { MOCK_MEMBERS, MOCK_MEMBER_CHECKINS } from "./members";
import { MOCK_PLANS } from "./plans";
import { MOCK_TRAINERS, MOCK_TRAINER_IMAGES } from "./staff";
import { MOCK_GYM_PROFILE, MOCK_GYM_IMAGES } from "./gymProfile";
import { MOCK_SUBSCRIPTION } from "./subscription";
import { MOCK_TRANSACTIONS, MOCK_WALLET_TRANSACTIONS } from "./finance";
import { MOCK_NOTIFICATIONS } from "./notifications";

export const MOCK_IMAGES = {
  gym: MOCK_GYM_IMAGES,
  trainers: MOCK_TRAINER_IMAGES,
};

export {
  MOCK_ATTENDANCE,
  MOCK_MEMBERS,
  MOCK_MEMBER_CHECKINS,
  MOCK_PLANS,
  MOCK_TRAINERS,
  MOCK_GYM_PROFILE,
  MOCK_SUBSCRIPTION,
  MOCK_TRANSACTIONS,
  MOCK_WALLET_TRANSACTIONS,
  MOCK_NOTIFICATIONS,
};

export const ALL_CRM_MOCK_DATA = {
  images: MOCK_IMAGES,
  gymProfile: MOCK_GYM_PROFILE,
  trainers: MOCK_TRAINERS,
  plans: MOCK_PLANS,
  members: MOCK_MEMBERS,
  attendance: MOCK_ATTENDANCE,
  transactions: MOCK_TRANSACTIONS,
  walletTransactions: MOCK_WALLET_TRANSACTIONS,
  subscription: MOCK_SUBSCRIPTION,
  memberCheckins: MOCK_MEMBER_CHECKINS,
  notifications: MOCK_NOTIFICATIONS,
};

export default ALL_CRM_MOCK_DATA;
