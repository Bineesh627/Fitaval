// The admin panel has one role: Super Admin.
export const ROLES = [{ id: 'super', label: 'Super Admin', user: 'Nikhil Warrier', group: 'GYM_SUPER_ADMIN' }];

export const permsFor = () => ({
  revenue: true,
  editGym: true,
  exportMembers: true,
  members: true,
  freeze: true,
  audit: true,
  staff: true,
  broadcast: true,
});
