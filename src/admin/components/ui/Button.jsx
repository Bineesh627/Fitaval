import { cx } from '../../lib/utils';

export function Btn({ v = 'outline', size = 'md', className = '', children, ...p }) {
  const base =
    'inline-flex shrink-0 items-center justify-center gap-2 rounded-md font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40 whitespace-nowrap';
  const vs = {
    primary: 'bg-emerald-500 text-white hover:bg-emerald-600',
    dark: 'bg-zinc-950 text-white hover:bg-zinc-800',
    outline: 'border border-zinc-200 bg-white text-zinc-950 hover:bg-zinc-50',
    ghost: 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950',
    soft: 'border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100',
    ghostDark: 'text-zinc-300 hover:bg-white/10 hover:text-white',
  };
  const ss = { sm: 'h-8 px-3 text-xs', md: 'h-9 px-4 text-sm', icon: 'h-8 w-8' };
  return (
    <button type="button" className={cx(base, vs[v], ss[size], className)} {...p}>
      {children}
    </button>
  );
}
