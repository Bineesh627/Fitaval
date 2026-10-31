import { DAYS } from './utils';

export const hrsText = (h) => {
  const o = h.map((x, i) => (x.open ? i : -1)).filter((i) => i >= 0);
  if (!o.length) return 'Closed';
  const x = h[o[0]];
  const d =
    o.length === 1
      ? DAYS[o[0]]
      : o[o.length - 1] - o[0] === o.length - 1
        ? DAYS[o[0]] + '-' + DAYS[o[o.length - 1]]
        : o.map((i) => DAYS[i]).join(', ');
  return d + ' · ' + x.from + ' to ' + x.to;
};

export const avgRating = (rv) =>
  rv.length ? Number((rv.reduce((a, x) => a + x.rating, 0) / rv.length).toFixed(1)) : 0;
