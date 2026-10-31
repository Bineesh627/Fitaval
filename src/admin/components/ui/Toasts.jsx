import { Icon } from '../Icon';

export function Toasts({ toasts, dismiss }) {
  return (
    <div
      className="gutter pointer-events-none fixed bottom-0 right-0 z-[80] flex w-full max-w-sm flex-col gap-2 pb-4"
      style={{ paddingBottom: 'calc(1rem + env(safe-area-inset-bottom,0px))' }}
      aria-live="polite"
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          className="feed-in pointer-events-auto overflow-hidden rounded-lg border border-zinc-800 bg-zinc-950 text-white shadow-2xl"
        >
          <div className="flex items-start gap-3 px-4 py-3">
            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-zinc-950">
              <Icon
                n={t.done === false ? 'Loader2' : 'Check'}
                size={12}
                strokeWidth={3}
                className={t.progress != null && t.progress < 100 ? 'animate-spin' : ''}
              />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold">{t.title}</p>
              {t.desc && <p className="mt-0.5 text-xs text-zinc-400">{t.desc}</p>}
            </div>
            <button className="text-zinc-500 hover:text-white" aria-label="Dismiss" onClick={() => dismiss(t.id)}>
              <Icon n="X" size={14} />
            </button>
          </div>
          {t.progress != null && (
            <div className="h-1 bg-zinc-800">
              <div
                className="h-full bg-emerald-500 transition-all duration-300"
                style={{ width: t.progress + '%' }}
              ></div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
