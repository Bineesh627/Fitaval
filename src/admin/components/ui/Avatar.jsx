import { cx } from '../../lib/utils';

export function Avatar({ name, size = 36, className = '' }) {
  const tones = [
    'bg-zinc-950 text-emerald-400',
    'bg-emerald-500 text-white',
    'bg-zinc-800 text-white',
    'bg-emerald-50 text-emerald-700 border border-emerald-200',
  ];
  const parts = name.split(' ');
  const ini = (parts[0][0] + (parts[1] ? parts[1][0] : '')).toUpperCase();
  const i = (name.charCodeAt(0) + name.length) % 4;
  return (
    <span
      className={cx('inline-flex shrink-0 items-center justify-center rounded-full font-semibold', tones[i], className)}
      style={{ width: size, height: size, fontSize: Math.round(size * 0.36) }}
    >
      {ini}
    </span>
  );
}
