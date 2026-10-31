// Demo accounts for the shared login page. Replace with a real backend call (POST /auth/login) later;
// the response should include the user's role: "crm" (gym owner) or "admin" (Fitaval platform staff).
export const ACCOUNTS = [
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
