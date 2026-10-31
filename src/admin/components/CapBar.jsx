import { cx } from '../lib/utils';

export function CapBar({ label, v, max }) {
  const p = Math.min(100, Math.round((v / max) * 100));
  return (
    <div>
      <div className="mb-1 flex justify-between text-xs">
        <span className="font-medium text-zinc-700">{label}</span>
        <span className="tabular-nums text-zinc-500">
          {v} / {max}
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-zinc-100">
        <div
          className={cx('h-full rounded-full transition-all duration-500', p > 90 ? 'bg-zinc-950' : 'bg-emerald-500')}
          style={{ width: p + '%' }}
        ></div>
      </div>
    </div>
  );
}
