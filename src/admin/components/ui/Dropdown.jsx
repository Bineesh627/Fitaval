import { useState, useEffect, useRef } from 'react';
import { Icon } from '../Icon';
import { cx } from '../../lib/utils';

export function Dropdown({ value, options, onChange, icon, label }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const f = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', f);
    return () => document.removeEventListener('mousedown', f);
  }, []);
  const cur = options.find((o) => o.id === value) || options[0];
  return (
    <div ref={ref} className="relative min-w-0">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={label}
        onClick={() => setOpen(!open)}
        className="inline-flex h-9 max-w-full items-center gap-2 rounded-md border border-zinc-200 bg-white px-3 text-sm font-medium text-zinc-950 hover:bg-zinc-50"
      >
        <Icon n={icon} size={15} className="shrink-0 text-emerald-600" />
        <span className="truncate">{cur.name}</span>
        <Icon n="ChevronDown" size={14} className="shrink-0 text-zinc-400" />
      </button>
      {open && (
        <div
          role="listbox"
          className="fade-in absolute left-0 top-full z-50 mt-1.5 w-64 max-w-[calc(100vw-32px)] rounded-lg border border-zinc-200 bg-white p-1 shadow-xl"
        >
          {options.map((o) => (
            <button
              key={o.id}
              role="option"
              aria-selected={o.id === value}
              onClick={() => {
                onChange(o.id);
                setOpen(false);
              }}
              className={cx(
                'flex w-full items-center justify-between gap-2 rounded-md px-3 py-2 text-left text-sm',
                o.id === value ? 'bg-emerald-50 font-semibold text-emerald-700' : 'text-zinc-700 hover:bg-zinc-50'
              )}
            >
              <span className="truncate">{o.name}</span>
              {o.id === value && <Icon n="Check" size={14} />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
