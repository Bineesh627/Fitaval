import { Icon } from '../Icon';
import { cx } from '../../lib/utils';

export function Tabs({ tabs, value, onChange, dark }) {
  return (
    <div className="no-scrollbar -mx-1 flex gap-1 overflow-x-auto border-b border-zinc-200 px-1" role="tablist">
      {tabs.map((t) => (
        <button
          key={t.id}
          role="tab"
          aria-selected={value === t.id}
          onClick={() => onChange(t.id)}
          className={cx(
            'relative inline-flex shrink-0 items-center gap-2 px-3 py-2.5 text-sm font-medium transition-colors',
            value === t.id ? 'text-zinc-950' : 'text-zinc-500 hover:text-zinc-950'
          )}
        >
          {t.icon && <Icon n={t.icon} size={15} />}
          {t.label}
          {t.lock && <Icon n="Lock" size={12} className="text-zinc-400" />}
          {value === t.id && <span className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-emerald-500"></span>}
        </button>
      ))}
    </div>
  );
}
