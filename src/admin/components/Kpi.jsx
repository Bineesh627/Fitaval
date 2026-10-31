import { Icon } from './Icon';
import { Card } from './ui/Card';
import { cx } from '../lib/utils';

export function Kpi({ label, value, icon, trend, down, period, locked }) {
  return (
    <Card className="relative min-w-0 p-4">
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm text-zinc-600">{label}</p>
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-zinc-50 text-zinc-400">
          <Icon n={icon} size={17} />
        </span>
      </div>
      <p
        className={cx('mt-2 text-2xl font-semibold tabular-nums tracking-tight', locked && 'select-none blur-md')}
        aria-hidden={locked}
      >
        {value}
      </p>
      <div className="mt-2 flex items-center justify-between gap-2">
        <span
          className={cx(
            'inline-flex items-center gap-1 text-xs font-semibold tabular-nums',
            down ? 'text-zinc-950' : 'text-emerald-600'
          )}
        >
          <Icon n={down ? 'TrendingDown' : 'TrendingUp'} size={13} />
          {trend}
        </span>
        <span className="text-[11px] leading-tight text-zinc-400">
          vs last
          <br />
          {period}
        </span>
      </div>
      {locked && (
        <span className="absolute inset-0 flex items-center justify-center">
          <span className="flex items-center gap-1.5 rounded-full bg-zinc-950 px-2.5 py-1 text-[11px] font-semibold text-white">
            <Icon n="Lock" size={11} className="text-emerald-400" />
            Hidden for this role
          </span>
        </span>
      )}
    </Card>
  );
}
