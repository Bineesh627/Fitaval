import { Icon } from '../Icon';
import { Card } from './Card';

export function PageHead({ title, sub, children }) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
      <div className="min-w-0">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-950">{title}</h1>
        <p className="mt-1 text-sm text-zinc-500">{sub}</p>
      </div>
      <div className="flex flex-wrap items-center gap-2">{children}</div>
    </div>
  );
}

export function Locked({ title, text }) {
  return (
    <Card className="flex flex-col items-center gap-3 px-6 py-14 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-950 text-emerald-400">
        <Icon n="Lock" size={20} />
      </span>
      <h3 className="text-base font-semibold text-zinc-950">{title}</h3>
      <p className="max-w-md text-sm text-zinc-500">{text}</p>
    </Card>
  );
}
