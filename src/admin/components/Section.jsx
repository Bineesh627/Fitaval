import { Icon } from './Icon';
import { Card } from './ui/Card';
import { cx } from '../lib/utils';

export function Section({ icon, title, action, children }) {
  return (
    <Card className="p-5">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-zinc-950">
          <Icon n={icon} size={14} className="text-emerald-600" />
          {title}
        </h3>
        {action}
      </div>
      {children}
    </Card>
  );
}

export function Act({ onClick, children }) {
  return (
    <button onClick={onClick} className="text-xs font-semibold text-emerald-600 hover:text-emerald-700">
      {children}
    </button>
  );
}

export function ChipToggle({ on, label, onClick }) {
  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={onClick}
      className={cx(
        'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium',
        on ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-zinc-200 text-zinc-600 hover:bg-zinc-50'
      )}
    >
      {on && <Icon n="Check" size={12} />}
      {label}
    </button>
  );
}
