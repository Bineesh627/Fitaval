import { Icon } from '../Icon';
import { cx } from '../../lib/utils';

export function Badge({ tone = 'muted', className = '', children }) {
  const t = {
    green: 'border border-emerald-200 bg-emerald-50 text-emerald-700',
    solid: 'bg-emerald-500 text-white',
    black: 'bg-zinc-950 text-white',
    outline: 'border-2 border-zinc-950 bg-white text-zinc-950',
    muted: 'border border-zinc-200 bg-zinc-100 text-zinc-600',
  };
  return (
    <span
      className={cx(
        'inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2 py-0.5 text-[11px] font-semibold',
        t[tone],
        className
      )}
    >
      {children}
    </span>
  );
}

export function StatusBadge({ s }) {
  if (s === 'Active')
    return (
      <Badge tone="green">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>Active
      </Badge>
    );
  if (s === 'Frozen')
    return (
      <Badge tone="black">
        <Icon n="Snowflake" size={11} />
        Frozen
      </Badge>
    );
  return <Badge tone="muted">Expired</Badge>;
}
