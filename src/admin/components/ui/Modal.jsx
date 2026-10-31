import { useEffect } from 'react';
import { Icon } from '../Icon';
import { Btn } from './Button';
import { cx } from '../../lib/utils';

export function Modal({ open, onClose, title, sub, children, footer, size = 'md' }) {
  useEffect(() => {
    if (!open) return;
    const f = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', f);
    return () => document.removeEventListener('keydown', f);
  }, [open, onClose]);

  if (!open) return null;

  const w = { sm: 'max-w-md', md: 'max-w-xl', lg: 'max-w-3xl', xl: 'max-w-5xl' }[size];

  return (
    <div
      className="gutter fade-in fixed inset-0 z-[60] flex items-end justify-center bg-black/60 py-4 sm:items-center"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={cx(
          'modal-in flex max-h-[calc(100vh-2rem)] w-full flex-col overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-2xl',
          w
        )}
      >
        <div className="flex items-start justify-between gap-4 border-b border-zinc-200 px-5 py-4">
          <div className="min-w-0">
            <h2 className="text-base font-semibold text-zinc-950">{title}</h2>
            {sub && <p className="mt-0.5 text-xs text-zinc-500">{sub}</p>}
          </div>
          <Btn v="ghost" size="icon" onClick={onClose} aria-label="Close">
            <Icon n="X" />
          </Btn>
        </div>
        <div className="thin-scroll min-h-0 flex-1 overflow-y-auto px-5 py-4">{children}</div>
        {footer && (
          <div className="flex flex-wrap items-center justify-end gap-2 border-t border-zinc-200 bg-zinc-50 px-5 py-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
