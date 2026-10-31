import { seedMembers } from './members';

// Today's starting occupancy (people inside) and check-in counts per branch.
export const OCCUPANCY0 = { kochi: 52, tvm: 26 };
export const SCANS_TODAY0 = { kochi: 131, tvm: 83 };

// Recent turnstile activity shown in the Live Front-Desk Feed.
const FEED_PATTERN = [
  [0, 'IN'],
  [3, 'IN'],
  [2, 'IN'],
  [5, 'OUT'],
  [1, 'IN'],
  [9, 'IN'],
  [4, 'IN'],
  [6, 'IN'],
  [7, 'IN'],
  [10, 'OUT'],
];

export function seedFeed() {
  const now = Date.now();
  const ms = seedMembers();
  return FEED_PATTERN.map(([i, dir], k) => {
    const m = ms[i];
    return {
      id: 'f' + k,
      name: m.name,
      branch: m.branch,
      dir,
      status: m.status === 'Active' ? 'ACTIVE' : m.status === 'Frozen' ? 'DENIED - FROZEN' : 'DENIED - EXPIRED',
      at: new Date(now - (k * 3 + 1) * 60000),
    };
  });
}
