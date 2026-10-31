// Demo accounts for local development and offline mock mode.
// In production builds, this array is empty to prevent unauthorized demo access.
import { IS_PROD } from '../config/env';

export const ACCOUNTS = IS_PROD
  ? []
  : [
      {
        email: 'owner@fitaval.com',
        password: 'owner123',
        role: 'crm',
        name: 'Gym Owner',
        label: 'Gym Owner (CRM)',
        hint: 'Opens the CRM',
      },
      {
        email: 'admin@fitaval.com',
        password: 'admin123',
        role: 'admin',
        adminRole: 'super',
        name: 'Nikhil Warrier',
        label: 'Super Admin',
        hint: 'Opens the Admin Panel',
      },
    ];

export const ADMIN_EMAILS = ACCOUNTS.filter((a) => a.role === 'admin').map((a) => a.email);
