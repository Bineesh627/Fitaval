import { useEffect } from 'react';
import { Icon } from '../Icon';
import { Btn } from './Button';
import { cx } from '../../lib/utils';

export function Sheet({ open, onClose, title, sub, children, width = 'max-w-xl', headRight }) {
  useEffect(() => {
    if (!open) return;
    const f = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', f);
    return () => document.removeEventListener('keydown', f);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fade-in fixed inset-0 z-50 flex justify-end bg-black/60"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <aside
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={cx(
          'sheet-in flex h-full w-full flex-col bg-white shadow-2xl border-l border-zinc-200',
          width
        )}
        style={{ paddingTop: 'env(safe-area-inset-top,0px)', paddingBottom: 'env(safe-area-inset-bottom,0px)' }}
      >
        <div className="gutter flex items-start justify-between gap-3 border-b border-zinc-200 bg-white py-4">
          <div className="min-w-0">
            <h2 className="text-base font-semibold text-zinc-950">{title}</h2>
            {sub && <p className="mt-0.5 truncate text-xs text-zinc-500">{sub}</p>}
          </div>
          <div className="flex items-center gap-2">
            {headRight}
            <Btn v="ghost" size="icon" onClick={onClose} aria-label="Close panel">
              <Icon n="X" />
            </Btn>
          </div>
        </div>
        <div className="thin-scroll gutter min-h-0 flex-1 overflow-y-auto py-4 bg-zinc-50">{children}</div>
      </aside>
    </div>
  );
}
